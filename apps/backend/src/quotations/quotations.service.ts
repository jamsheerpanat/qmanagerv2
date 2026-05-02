import {
  Injectable,
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

@Injectable()
export class QuotationsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

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
    
    // Find the latest quotation to determine the next sequence number safely
    const lastQuotation = await this.prisma.quotation.findFirst({
      where: {
        companyId: company.id,
        issueDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
        revisionNumber: 0, // Count only base quotations
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let lastSeq = 0;
    if (lastQuotation && lastQuotation.quotationNumber) {
      // Assuming format PREFIX-YYYY-SEQ (e.g., QTN-2026-0001)
      const parts = lastQuotation.quotationNumber.split('-');
      if (parts.length >= 3) {
        const parsedSeq = parseInt(parts[2], 10);
        if (!isNaN(parsedSeq)) {
          lastSeq = parsedSeq;
        }
      }
    }

    // Ensure the sequence starts from at least 469 so the next one is 470+
    if (lastSeq < 469) {
      lastSeq = 469;
    }

    const seq = (lastSeq + 1).toString().padStart(4, '0');
    const quotationNumber = `${prefix}-${year}-${seq}`;

    let validUntil = createQuotationDto.validUntil;
    if (!validUntil && company.defaultQuotationValidityDays) {
      const date = new Date();
      date.setDate(date.getDate() + company.defaultQuotationValidityDays);
      validUntil = date;
    }

    const quotation = await this.prisma.quotation.create({
      data: {
        ...createQuotationDto,
        quotationNumber,
        validUntil,
        status: QuotationStatus.DRAFT,
        createdById: userId,
      },
    });

    if (serviceType.termsTemplates.length > 0) {
      const termsData = serviceType.termsTemplates.map((t) => ({
        quotationId: quotation.id,
        categoryId: t.categoryId,
        content: t.content,
        sortOrder: t.sortOrder,
      }));
      await this.prisma.quotationTerm.createMany({ data: termsData });
    }

    return this.findOne(quotation.id);
  }

  async findAll(companyId: string, filters: any = {}) {
    return this.prisma.quotation.findMany({
      where: { companyId, ...filters },
      include: {
        customer: true,
        serviceType: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
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
        company: true,
        branch: true,
        items: { 
          orderBy: { sortOrder: 'asc' },
          include: { product: true, serviceItem: true }
        },
        scopes: { orderBy: { sortOrder: 'asc' } },
        terms: { orderBy: { sortOrder: 'asc' }, include: { category: true } },
        approvals: {
          orderBy: { requestedAt: 'desc' },
          include: { requestedBy: true, approver: true },
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
    await this.prisma.quotationItem.deleteMany({ where: { quotationId } });

    const itemsData = await Promise.all(
      itemsDto.map(async (item, index) => {
        let unitCost = 0;
        if (item.productId) {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (product) unitCost = product.costPrice || 0;
        }

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
          ...item,
          quotationId,
          sortOrder: item.sortOrder ?? index,
          discountAmount,
          taxAmount,
          lineTotal,
          unitCost,
          margin,
        };
      }),
    );

    await this.prisma.quotationItem.createMany({ data: itemsData });
    await this.recalculateTotals(quotationId);
    return this.findOne(quotationId);
  }

  async replaceScopes(quotationId: string, scopesDto: QuotationScopeDto[]) {
    await this.checkLock(quotationId);
    await this.prisma.quotationScope.deleteMany({ where: { quotationId } });
    const scopesData = scopesDto.map((s, idx) => ({
      ...s,
      quotationId,
      sortOrder: s.sortOrder ?? idx,
    }));
    await this.prisma.quotationScope.createMany({ data: scopesData });
    return this.findOne(quotationId);
  }

  async replaceTerms(quotationId: string, termsDto: QuotationTermDto[]) {
    await this.checkLock(quotationId);
    await this.prisma.quotationTerm.deleteMany({ where: { quotationId } });
    const termsData = termsDto.map((t, idx) => ({
      ...t,
      quotationId,
      sortOrder: t.sortOrder ?? idx,
    }));
    await this.prisma.quotationTerm.createMany({ data: termsData });
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

  async sendQuotation(id: string, recipientEmail: string, userId: string) {
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
        const transporter = nodemailer.createTransport({
          host: company.smtpHost,
          port: company.smtpPort || 587,
          secure: company.smtpPort === 465,
          auth: {
            user: company.smtpUser,
            pass: company.smtpPass,
          },
        });

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
        console.log(`Email successfully sent to ${recipientEmail}`);
      } catch (err) {
        console.error('Failed to send SMTP email:', err);
      }
    } else {
      console.log(
        `[SMTP Not Configured] Sending quotation link to ${recipientEmail}: ${portalLink}`,
      );
    }

    return { success: true, token };
  }

  async generateShareLink(id: string, userId: string) {
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

  async generatePdf(id: string, userId: string): Promise<Buffer> {
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
