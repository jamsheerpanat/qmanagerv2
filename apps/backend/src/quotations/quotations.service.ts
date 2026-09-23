import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuotationDto,
  QuotationItemDto,
  QuotationScopeDto,
  QuotationTermDto,
} from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { ItemType, DiscountType, QuotationStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { PdfService } from '../pdf/pdf.service';
import { parseLimit } from '../common/parse-limit';
import {
  PUBLIC_COMPANY_SELECT,
  USER_SUMMARY_SELECT,
} from '../common/select-presets';

/**
 * Migration baseline: production had 469 quotations before the QManager v2
 * launch. New quotations continue from QT-YYYY-0470+ and never collide with
 * legacy numbering. Safe to remove once the sequence naturally exceeds it.
 */
const QUOTATION_SEQ_BASELINE = 469;

/** Namespace for pg_advisory_xact_lock so quotation and invoice locks differ. */
const QUOTATION_LOCK_NAMESPACE = 1001;

/** Query params that may be forwarded into the Prisma `where` clause. */
const ALLOWED_LIST_FILTERS = [
  'status',
  'serviceTypeId',
  'customerId',
  'createdById',
  'branchId',
  'leadId',
] as const;

/**
 * Columns a client may supply on the array-body replace endpoints. Nest's
 * ValidationPipe skips top-level array bodies, so these payloads reach us
 * unfiltered and any stray field (e.g. a display-only `brand`) would make
 * Prisma reject the whole write. Pick instead of spread.
 */
const ALLOWED_ITEM_FIELDS = [
  'itemType',
  'productId',
  'serviceItemId',
  'sectionTitle',
  'description',
  'image',
  'quantity',
  'unit',
  'unitPrice',
  'discountType',
  'discountValue',
  'taxRate',
  'warranty',
  'deliveryTime',
  'remarks',
  'isOptional',
  'sortOrder',
] as const;

const ALLOWED_SCOPE_FIELDS = [
  'sectionTitle',
  'content',
  'isHidden',
  'sortOrder',
] as const;

const ALLOWED_TERM_FIELDS = ['categoryId', 'content', 'sortOrder'] as const;

/** Copies only the allowed keys that are actually present on `source`. */
function pick<T extends object, K extends keyof T>(
  source: T,
  fields: readonly K[],
): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const field of fields) {
    if (source[field] !== undefined) out[field] = source[field];
  }
  return out;
}

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  /** Pooled SMTP transports, one per company, tagged with the settings used. */
  private readonly mailTransporters = new Map<
    string,
    { settingsKey: string; transporter: nodemailer.Transporter }
  >();

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  /** Stable signed int32 derived from an id, for Postgres advisory locks. */
  private lockKeyFor(id: string): number {
    return crypto.createHash('sha1').update(id).digest().readInt32BE(0);
  }

  /**
   * Returns a pooled SMTP transporter for a company, creating it on first use.
   *
   * A fresh transport per send meant a new TCP connection, TLS handshake and
   * SMTP auth round trip on every email, inside the request. Pooling reuses the
   * connection; the cache is keyed on the settings themselves so changing them
   * in Settings takes effect without a restart.
   */
  private mailTransporterFor(company: {
    id: string;
    smtpHost: string | null;
    smtpPort: number | null;
    smtpUser: string | null;
    smtpPass: string | null;
  }): nodemailer.Transporter {
    const port = company.smtpPort || 587;
    const settingsKey = [
      company.smtpHost,
      port,
      company.smtpUser,
      company.smtpPass,
    ].join('\u0000');

    const cached = this.mailTransporters.get(company.id);
    if (cached) {
      if (cached.settingsKey === settingsKey) return cached.transporter;
      // Settings changed in the UI: release this company's pooled sockets and
      // rebuild. Other companies' transports are left alone.
      cached.transporter.close();
    }

    const transporter = nodemailer.createTransport({
      pool: true,
      host: company.smtpHost!,
      port,
      secure: port === 465,
      auth: { user: company.smtpUser!, pass: company.smtpPass! },
    });
    this.mailTransporters.set(company.id, { settingsKey, transporter });
    return transporter;
  }

  private async checkLock(id: string) {
    const q = await this.prisma.quotation.findUnique({ where: { id } });
    if (q?.isLocked)
      throw new BadRequestException(
        'Quotation is locked and cannot be modified',
      );
    return q;
  }

  async create(createQuotationDto: CreateQuotationDto, userId?: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: createQuotationDto.companyId },
    });
    const serviceType = await this.prisma.serviceType.findUnique({
      where: { id: createQuotationDto.serviceTypeId },
      include: { termsTemplates: true },
    });

    if (!company) throw new NotFoundException('Company not found');
    if (!serviceType) throw new NotFoundException('Service type not found');

    const prefix = company.quotationPrefix || 'QTN';
    const year = new Date().getFullYear();

    let validUntil = createQuotationDto.validUntil;
    if (!validUntil && company.defaultQuotationValidityDays) {
      const date = new Date();
      date.setDate(date.getDate() + company.defaultQuotationValidityDays);
      validUntil = date;
    }

    // Allocating the number and inserting the row must be atomic, otherwise two
    // concurrent creates read the same "last" number and collide on the
    // @@unique([quotationNumber, revisionNumber]) constraint. A transaction-
    // scoped advisory lock serialises allocation per company; it is released
    // automatically when the transaction commits or rolls back.
    const quotation = await this.prisma.$transaction(
      async (tx) => {
        // Selected via FROM so the statement yields a typed boolean column:
        // pg_advisory_xact_lock() returns void, which Prisma cannot deserialize.
        await tx.$queryRaw`SELECT true AS locked FROM pg_advisory_xact_lock(${QUOTATION_LOCK_NAMESPACE}::int, ${this.lockKeyFor(company.id)}::int)`;

        const lastQuotation = await tx.quotation.findFirst({
          where: {
            companyId: company.id,
            quotationNumber: { startsWith: `${prefix}-${year}-` },
          },
          orderBy: { quotationNumber: 'desc' },
          select: { quotationNumber: true },
        });

        let lastSeq = 0;
        if (lastQuotation?.quotationNumber) {
          // Format is PREFIX-YYYY-SEQ (e.g. QT-2026-0470). Read the trailing
          // segment so prefixes containing a dash still parse correctly.
          const tail = lastQuotation.quotationNumber.slice(
            lastQuotation.quotationNumber.lastIndexOf('-') + 1,
          );
          const parsedSeq = parseInt(tail, 10);
          if (!Number.isNaN(parsedSeq)) lastSeq = parsedSeq;
        }

        if (lastSeq < QUOTATION_SEQ_BASELINE) lastSeq = QUOTATION_SEQ_BASELINE;

        const seq = (lastSeq + 1).toString().padStart(4, '0');

        const created = await tx.quotation.create({
          data: {
            ...createQuotationDto,
            quotationNumber: `${prefix}-${year}-${seq}`,
            validUntil,
            status: QuotationStatus.DRAFT,
            createdById: userId,
          },
        });

        if (serviceType.termsTemplates.length > 0) {
          await tx.quotationTerm.createMany({
            data: serviceType.termsTemplates.map((t) => ({
              quotationId: created.id,
              categoryId: t.categoryId,
              content: t.content,
              sortOrder: t.sortOrder,
            })),
          });
        }

        return created;
      },
      { timeout: 15000 },
    );

    return this.findOne(quotation.id);
  }

  async findAll(companyId: string, filters: any = {}) {
    // Only forward known-safe filter keys. Spreading raw query params would let
    // a caller pass ?companyId=<other-tenant> and override the scope below.
    const where: any = {};
    for (const key of ALLOWED_LIST_FILTERS) {
      if (filters?.[key] !== undefined && filters[key] !== '') {
        where[key] = filters[key];
      }
    }
    where.companyId = companyId;

    // The dashboard only renders the few most recent quotations; without a cap
    // it was pulling the entire table (and its joins) on every page load.
    const take = parseLimit(filters?.limit);

    return this.prisma.quotation.findMany({
      where,
      include: {
        customer: true,
        serviceType: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
    });
  }

  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        contact: true,
        lead: true,
        serviceType: true,
        company: { select: PUBLIC_COMPANY_SELECT },
        branch: true,
        items: {
          orderBy: { sortOrder: 'asc' },
          include: { product: true, serviceItem: true },
        },
        scopes: { orderBy: { sortOrder: 'asc' } },
        terms: { orderBy: { sortOrder: 'asc' }, include: { category: true } },
        approvals: {
          orderBy: { requestedAt: 'desc' },
          include: {
            requestedBy: { select: USER_SUMMARY_SELECT },
            approver: { select: USER_SUMMARY_SELECT },
          },
        },
        shares: { orderBy: { sentAt: 'desc' } },
        childQuotations: {
          select: {
            id: true,
            revisionNumber: true,
            status: true,
            isLocked: true,
          },
        },
        parentQuotation: { select: { id: true, revisionNumber: true } },
      },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async update(id: string, updateDto: UpdateQuotationDto) {
    await this.checkLock(id);
    await this.prisma.quotation.update({
      where: { id },
      data: updateDto,
    });

    if (
      updateDto.discountType !== undefined ||
      updateDto.discountValue !== undefined
    ) {
      await this.recalculateTotals(id);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    // Unlink any child revisions to prevent foreign key constraint violations
    await this.prisma.quotation.updateMany({
      where: { parentQuotationId: id },
      data: { parentQuotationId: null },
    });

    return this.prisma.quotation.delete({ where: { id } });
  }

  async replaceItems(quotationId: string, itemsDto: QuotationItemDto[]) {
    await this.checkLock(quotationId);

    // Cost lookup for every linked product in one query rather than one round
    // trip per line — a 40-line quotation was issuing 40 sequential selects.
    const productIds = [
      ...new Set(itemsDto.map((i) => i.productId).filter(Boolean) as string[]),
    ];
    const costPriceByProductId = new Map<string, number>();
    if (productIds.length > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, costPrice: true },
      });
      for (const product of products) {
        costPriceByProductId.set(product.id, product.costPrice || 0);
      }
    }

    const itemsData = itemsDto.map((item, index) => {
      const unitCost = item.productId
        ? (costPriceByProductId.get(item.productId) ?? 0)
        : 0;

      let discountAmount = 0;
      const qty = item.quantity || 1;
      const price = item.unitPrice || 0;
      const taxRate = item.taxRate || 0;

      if (item.discountValue) {
        if (item.discountType === DiscountType.PERCENTAGE) {
          discountAmount = qty * price * (item.discountValue / 100);
        } else {
          discountAmount = item.discountValue;
        }
      }

      const beforeTax = qty * price - discountAmount;
      const taxAmount = beforeTax * (taxRate / 100);
      const lineTotal = beforeTax + taxAmount;
      const margin = beforeTax - qty * unitCost;

      return {
        ...pick(item, ALLOWED_ITEM_FIELDS),
        quotationId,
        sortOrder: item.sortOrder ?? index,
        discountAmount,
        taxAmount,
        lineTotal,
        unitCost,
        margin,
      };
    });

    // One transaction so a rejected insert cannot leave the quotation empty.
    await this.prisma.$transaction(async (tx) => {
      await tx.quotationItem.deleteMany({ where: { quotationId } });
      await tx.quotationItem.createMany({ data: itemsData });
    });

    await this.recalculateTotals(quotationId);
    return this.findOne(quotationId);
  }

  async replaceScopes(quotationId: string, scopesDto: QuotationScopeDto[]) {
    await this.checkLock(quotationId);
    const scopesData = scopesDto.map((s, idx) => ({
      ...pick(s, ALLOWED_SCOPE_FIELDS),
      quotationId,
      sortOrder: s.sortOrder ?? idx,
    }));
    await this.prisma.$transaction(async (tx) => {
      await tx.quotationScope.deleteMany({ where: { quotationId } });
      await tx.quotationScope.createMany({ data: scopesData });
    });
    return this.findOne(quotationId);
  }

  async replaceTerms(quotationId: string, termsDto: QuotationTermDto[]) {
    await this.checkLock(quotationId);
    const termsData = termsDto.map((t, idx) => ({
      ...pick(t, ALLOWED_TERM_FIELDS),
      quotationId,
      sortOrder: t.sortOrder ?? idx,
    }));
    await this.prisma.$transaction(async (tx) => {
      await tx.quotationTerm.deleteMany({ where: { quotationId } });
      await tx.quotationTerm.createMany({ data: termsData });
    });
    return this.findOne(quotationId);
  }

  private async recalculateTotals(quotationId: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true },
    });
    if (!quotation) return;

    let subtotal = 0;
    let taxAmount = 0;
    let totalCost = 0;

    quotation.items.forEach((item) => {
      if (item.isOptional || item.itemType === ItemType.SECTION_HEADING) return;
      const qty = item.quantity || 1;
      const price = item.unitPrice || 0;
      const cost = item.unitCost || 0;
      subtotal += qty * price - (item.discountAmount || 0);
      taxAmount += item.taxAmount || 0;
      totalCost += qty * cost;
    });

    let qDiscountAmount = 0;
    if (quotation.discountValue) {
      if (quotation.discountType === DiscountType.PERCENTAGE) {
        qDiscountAmount = subtotal * (quotation.discountValue / 100);
      } else {
        qDiscountAmount = quotation.discountValue;
      }
    }

    const grandTotal = subtotal - qDiscountAmount + taxAmount;
    const grossMargin = subtotal - qDiscountAmount - totalCost;

    await this.prisma.quotation.update({
      where: { id: quotationId },
      data: {
        subtotal,
        discountAmount: qDiscountAmount,
        taxAmount,
        grandTotal,
        totalCost,
        grossMargin,
      },
    });
  }

  // --- Lifecycle & Approvals ---

  async submitForApproval(id: string, userId: string) {
    const q = await this.findOne(id);
    if (
      q.status !== QuotationStatus.DRAFT &&
      q.status !== QuotationStatus.REVISED
    ) {
      throw new BadRequestException(
        'Only DRAFT or REVISED quotations can be submitted',
      );
    }

    // In reality, rule engine checks here. Let's just create approval record.
    await this.prisma.quotationApproval.create({
      data: {
        quotationId: id,
        revisionNumber: q.revisionNumber,
        requestedByUserId: userId,
        status: 'PENDING',
      },
    });

    await this.prisma.quotation.update({
      where: { id },
      data: { status: QuotationStatus.PENDING_APPROVAL },
    });
    return this.findOne(id);
  }

  async approve(id: string, userId: string, comments?: string) {
    const q = await this.prisma.quotation.findUnique({ where: { id } });
    if (!q || q.status !== QuotationStatus.PENDING_APPROVAL)
      throw new BadRequestException('Quotation not pending approval');

    // Update approval record
    const approval = await this.prisma.quotationApproval.findFirst({
      where: { quotationId: id, status: 'PENDING' },
      orderBy: { requestedAt: 'desc' },
    });

    if (approval) {
      await this.prisma.quotationApproval.update({
        where: { id: approval.id },
        data: {
          status: 'APPROVED',
          approverUserId: userId,
          comments,
          approvedAt: new Date(),
        },
      });
    }

    // Lock and approve
    await this.prisma.quotation.update({
      where: { id },
      data: { status: QuotationStatus.APPROVED, isLocked: true },
    });
    return this.findOne(id);
  }

  async reject(id: string, userId: string, comments?: string) {
    const q = await this.prisma.quotation.findUnique({ where: { id } });
    if (!q || q.status !== QuotationStatus.PENDING_APPROVAL)
      throw new BadRequestException('Quotation not pending approval');

    const approval = await this.prisma.quotationApproval.findFirst({
      where: { quotationId: id, status: 'PENDING' },
      orderBy: { requestedAt: 'desc' },
    });

    if (approval) {
      await this.prisma.quotationApproval.update({
        where: { id: approval.id },
        data: {
          status: 'REJECTED',
          approverUserId: userId,
          comments,
          rejectedAt: new Date(),
        },
      });
    }

    await this.prisma.quotation.update({
      where: { id },
      data: { status: QuotationStatus.REJECTED, rejectionReason: comments },
    });
    return this.findOne(id);
  }

  async createRevision(id: string, userId: string) {
    const q = await this.findOne(id);
    if (!q.isLocked)
      throw new BadRequestException(
        'Can only create revisions from locked quotations',
      );

    // Get latest revision number
    const siblings = await this.prisma.quotation.findMany({
      where: { quotationNumber: q.quotationNumber },
      orderBy: { revisionNumber: 'desc' },
    });
    const nextRev = siblings[0].revisionNumber + 1;

    // Create new quotation record
    const newQ = await this.prisma.quotation.create({
      data: {
        quotationNumber: q.quotationNumber,
        revisionNumber: nextRev,
        parentQuotationId: id,
        companyId: q.companyId,
        branchId: q.branchId,
        customerId: q.customerId,
        contactId: q.contactId,
        leadId: q.leadId,
        serviceTypeId: q.serviceTypeId,
        quotationTemplateId: q.quotationTemplateId,
        projectTitle: q.projectTitle,
        projectLocation: q.projectLocation,
        requirementSummary: q.requirementSummary,
        proposedSolution: q.proposedSolution,
        scopeSummary: q.scopeSummary,
        issueDate: new Date(),
        validUntil: q.validUntil,
        currency: q.currency,
        status: QuotationStatus.REVISED,
        subtotal: q.subtotal,
        discountType: q.discountType,
        discountValue: q.discountValue,
        discountAmount: q.discountAmount,
        profitPercent: q.profitPercent,
        taxAmount: q.taxAmount,
        grandTotal: q.grandTotal,
        amountInWords: q.amountInWords,
        internalNotes: q.internalNotes,
        createdById: userId,
      },
    });

    // Copy items
    if (q.items.length > 0) {
      await this.prisma.quotationItem.createMany({
        data: q.items.map((i) => ({
          quotationId: newQ.id,
          itemType: i.itemType,
          productId: i.productId,
          serviceItemId: i.serviceItemId,
          sectionTitle: i.sectionTitle,
          description: i.description,
          image: i.image,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
          discountType: i.discountType,
          discountValue: i.discountValue,
          discountAmount: i.discountAmount,
          taxRate: i.taxRate,
          taxAmount: i.taxAmount,
          lineTotal: i.lineTotal,
          warranty: i.warranty,
          deliveryTime: i.deliveryTime,
          remarks: i.remarks,
          isOptional: i.isOptional,
          sortOrder: i.sortOrder,
        })),
      });
    }

    // Copy scopes
    if (q.scopes.length > 0) {
      await this.prisma.quotationScope.createMany({
        data: q.scopes.map((s) => ({
          quotationId: newQ.id,
          sectionTitle: s.sectionTitle,
          content: s.content,
          isHidden: s.isHidden,
          sortOrder: s.sortOrder,
        })),
      });
    }

    // Copy terms
    if (q.terms.length > 0) {
      await this.prisma.quotationTerm.createMany({
        data: q.terms.map((t) => ({
          quotationId: newQ.id,
          categoryId: t.categoryId,
          content: t.content,
          sortOrder: t.sortOrder,
        })),
      });
    }

    return this.findOne(newQ.id);
  }

  async compareRevisions(fromId: string, toId: string) {
    const fromQ = await this.findOne(fromId);
    const toQ = await this.findOne(toId);

    // Provide a detailed diff structure
    const addedItems = toQ.items.filter(
      (toItem) =>
        !fromQ.items.find(
          (f) =>
            f.productId === toItem.productId &&
            f.serviceItemId === toItem.serviceItemId &&
            f.description === toItem.description,
        ),
    );
    const removedItems = fromQ.items.filter(
      (fromItem) =>
        !toQ.items.find(
          (t) =>
            t.productId === fromItem.productId &&
            t.serviceItemId === fromItem.serviceItemId &&
            t.description === fromItem.description,
        ),
    );

    return {
      fromRevision: fromQ.revisionNumber,
      toRevision: toQ.revisionNumber,
      totalChanges: {
        from: fromQ.grandTotal,
        to: toQ.grandTotal,
        diff: toQ.grandTotal - fromQ.grandTotal,
      },
      itemCountChanges: {
        from: fromQ.items.length,
        to: toQ.items.length,
      },
      addedItems,
      removedItems,
    };
  }

  async sendQuotation(id: string, recipientEmail: string) {
    const q = await this.findOne(id);
    const token = crypto.randomBytes(32).toString('hex');

    await this.prisma.quotationShare.create({
      data: {
        quotationId: id,
        token,
        recipientEmail,
      },
    });

    await this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.SENT_TO_CUSTOMER,
        sentAt: new Date(),
        isLocked: true,
      },
    });

    const company = await this.prisma.company.findUnique({
      where: { id: q.companyId },
    });

    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/quotation/${token}`;

    if (company && company.smtpHost && company.smtpUser && company.smtpPass) {
      try {
        const transporter = this.mailTransporterFor(company);

        await transporter.sendMail({
          from: `"${company.name}" <${company.smtpUser}>`,
          to: recipientEmail,
          subject: `Quotation ${q.quotationNumber} from ${company.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: ${company.brandColor || '#3B82F6'};">New Quotation Available</h2>
              <p>Dear ${q.customer?.displayName || 'Customer'},</p>
              <p>A new quotation (<strong>${q.quotationNumber}</strong>) has been generated for you regarding <strong>${q.projectTitle || 'our services'}</strong>.</p>
              <p>Grand Total: <strong>${q.grandTotal?.toLocaleString()} ${q.currency}</strong></p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalLink}" style="background-color: ${company.brandColor || '#3B82F6'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View & Sign Quotation</a>
              </div>
              <p style="color: #666; font-size: 12px;">If the button above does not work, copy and paste the following link into your browser:</p>
              <p style="color: #666; font-size: 12px; word-break: break-all;"><a href="${portalLink}">${portalLink}</a></p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 11px; text-align: center;">${company.footerText || `Thank you for choosing ${company.name}`}</p>
            </div>
          `,
        });
        this.logger.log(`Quotation email sent to ${recipientEmail}`);
      } catch (err) {
        this.logger.error(
          `Failed to send SMTP email to ${recipientEmail}`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    } else {
      this.logger.warn(
        `SMTP not configured — share link generated for ${recipientEmail}: ${portalLink}`,
      );
    }

    return { success: true, token };
  }

  async generateShareLink(id: string) {
    const q = await this.findOne(id);
    const token = crypto.randomBytes(32).toString('hex');

    await this.prisma.quotationShare.create({
      data: {
        quotationId: id,
        token,
        recipientEmail: 'share-link',
      },
    });

    // Lock and mark as sent — same lifecycle as sendQuotation
    if (
      q.status === 'APPROVED' ||
      q.status === 'SENT_TO_CUSTOMER' ||
      q.status === 'ACCEPTED'
    ) {
      await this.prisma.quotation.update({
        where: { id },
        data: {
          status: QuotationStatus.SENT_TO_CUSTOMER,
          sentAt: q.sentAt || new Date(),
          isLocked: true,
        },
      });
    }

    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/quotation/${token}`;
    return { success: true, token, portalLink };
  }

  async generatePdf(id: string): Promise<Buffer> {
    const q = await this.findOne(id);

    // Call the synchronous PDF generation
    const pdfBuffer = await this.pdfService.generatePdfSync(
      q.serviceType?.slug || 'smart-home',
      q.id,
      'quotationId',
    );

    return pdfBuffer;
  }

  async getSharedQuotation(token: string) {
    const share = await this.prisma.quotationShare.findUnique({
      where: { token },
      include: {
        quotation: {
          include: {
            customer: true,
            items: true,
            serviceType: true,
          },
        },
      },
    });

    if (!share) return null;

    // Update viewed date
    if (!share.viewedAt) {
      await this.prisma.quotationShare.update({
        where: { id: share.id },
        data: { viewedAt: new Date() },
      });
    }

    return share.quotation;
  }

  async checkReadiness(id: string) {
    const q = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        items: { include: { product: true, serviceItem: true } },
        terms: true,
      },
    });

    if (!q) throw new NotFoundException('Quotation not found');

    const warnings: string[] = [];

    if (!q.terms || q.terms.length === 0) {
      warnings.push('Missing terms and conditions.');
    }

    if (!q.validUntil) {
      warnings.push('Quotation validity date is missing.');
    }

    if (!q.scopeSummary || q.scopeSummary.trim() === '') {
      warnings.push('Scope of work section is empty.');
    }

    // Check MSP and excessive discounts
    let totalDiscount = 0;
    for (const item of q.items) {
      totalDiscount += item.discountAmount;
      const msp = item.product?.minimumSellingPrice || 0;
      if (msp > 0 && item.unitPrice < msp) {
        warnings.push(
          `Item "${item.sectionTitle || item.description || 'Unknown'}" is below minimum selling price.`,
        );
      }
    }

    if (totalDiscount > q.subtotal * 0.2) {
      // Example hardcoded threshold
      warnings.push(
        'Total discount exceeds 20% of subtotal. Approval may be required.',
      );
    }

    // Readiness score calculation
    const maxScore = 5;
    let score = maxScore - warnings.length;
    if (score < 0) score = 0;

    return {
      isReady: warnings.length === 0,
      score: (score / maxScore) * 100,
      warnings,
    };
  }

  async aiSummarize(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: { items: true, serviceType: true, customer: true },
    });

    if (!quotation) throw new NotFoundException('Quotation not found');

    const itemNames = quotation.items.map((i) => i.description).join(', ');

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const generatedScope = `Based on the selected service (${quotation.serviceType?.name || 'General'}), this proposal encompasses the following key deliverables for ${quotation.customer.displayName}:
    
We will provide and integrate: ${itemNames}. 
Our team will ensure seamless installation, configuration, and testing of all systems to meet the highest industry standards. 
This solution is designed to be highly scalable and future-proof, providing maximum value and operational efficiency.`;

    await this.prisma.quotation.update({
      where: { id },
      data: { scopeSummary: generatedScope },
    });

    return { scopeSummary: generatedScope };
  }
}
