import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvoiceDto,
  RecordPaymentDto,
  InvoiceItemDto,
} from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  InvoiceStatus,
  PaymentStatus,
  InvoiceType,
  DiscountType,
  ItemType,
} from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';
import * as crypto from 'crypto';

/**
 * Migration baseline: production had 450 invoices before the QManager v2
 * launch, so issued numbers start at INV-YYYY-0451.
 */
const INVOICE_SEQ_BASELINE = 450;

/** Namespace for pg_advisory_xact_lock so invoice and quotation locks differ. */
const INVOICE_LOCK_NAMESPACE = 1002;

/** Query params that may be forwarded into the Prisma `where` clause. */
const ALLOWED_LIST_FILTERS = [
  'invoiceStatus',
  'paymentStatus',
  'invoiceType',
  'customerId',
  'createdById',
  'branchId',
  'quotationId',
] as const;

import { parseLimit } from '../common/parse-limit';
@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  /** Stable signed int32 derived from an id, for Postgres advisory locks. */
  private lockKeyFor(id: string): number {
    return crypto.createHash('sha1').update(id).digest().readInt32BE(0);
  }

  async create(dto: CreateInvoiceDto, userId?: string) {
    const { items, ...invoiceData } = dto;
    const invoice = await this.prisma.invoice.create({
      data: {
        ...invoiceData,
        items: items
          ? {
              create: items.map((item, idx) => ({
                ...item,
                sortOrder: item.sortOrder ?? idx,
              })),
            }
          : undefined,
        createdById: userId,
      },
    });

    if (items && items.length > 0) {
      await this.recalculateTotals(invoice.id);
    }
    return this.findOne(invoice.id);
  }

  async createFromQuotation(
    quotationId: string,
    type: InvoiceType,
    userId?: string,
  ) {
    const q = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        items: { include: { product: true, serviceItem: true } },
        terms: true,
      },
    });

    if (!q) throw new NotFoundException('Quotation not found');
    if (!['APPROVED', 'ACCEPTED', 'SENT_TO_CUSTOMER'].includes(q.status)) {
      throw new BadRequestException(
        'Quotation must be approved or accepted to convert to invoice',
      );
    }

    const termText = q.terms.map((t) => t.content).join('\n\n');

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceType: type,
        companyId: q.companyId,
        branchId: q.branchId,
        customerId: q.customerId,
        contactId: q.contactId,
        quotationId: q.id,
        quotationRevision: q.revisionNumber,
        serviceTypeId: q.serviceTypeId,
        currency: q.currency,
        notes: q.internalNotes,
        terms: termText,
        createdById: userId,
      },
    });

    if (q.items.length > 0) {
      const itemsData = q.items.map((i, idx) => ({
        invoiceId: invoice.id,
        itemType: i.itemType,
        productId: i.productId,
        serviceItemId: i.serviceItemId,
        sectionTitle: i.sectionTitle,
        description:
          i.itemType === 'SECTION_HEADING'
            ? i.sectionTitle || 'Section'
            : i.description ||
              i.product?.productName ||
              i.serviceItem?.serviceName ||
              i.sectionTitle ||
              'Item',
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
        discountType: i.discountType,
        discountValue: i.discountValue,
        discountAmount: i.discountAmount,
        taxRate: i.taxRate,
        taxAmount: i.taxAmount,
        lineTotal: i.lineTotal,
        sortOrder: i.sortOrder ?? idx,
      }));
      await this.prisma.invoiceItem.createMany({ data: itemsData });

      // Update invoice totals based on quotation
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          subtotal: q.subtotal,
          discountType: q.discountType,
          discountValue: q.discountValue,
          discountAmount: q.discountAmount,
          taxAmount: q.taxAmount,
          grandTotal: q.grandTotal,
          balanceAmount: q.grandTotal,
        },
      });
    }

    return this.findOne(invoice.id);
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

    const take = parseLimit(filters?.limit);

    return this.prisma.invoice.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            bankAccounts: true,
          },
        },
        customer: true,
        contact: true,
        quotation: { select: { quotationNumber: true, projectTitle: true } },
        serviceType: true,
        items: {
          orderBy: { sortOrder: 'asc' },
          include: { product: true, serviceItem: true },
        },
        payments: {
          include: { receipt: true },
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException();
    if (inv.invoiceStatus !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Only DRAFT invoices can be freely modified',
      );
    }

    const { ...updateData } = dto;
    await this.prisma.invoice.update({
      where: { id },
      data: updateData as any,
    });
    return this.findOne(id);
  }

  async replaceItems(id: string, itemsDto: InvoiceItemDto[]) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv || inv.invoiceStatus !== InvoiceStatus.DRAFT)
      throw new BadRequestException('Invoice not draft');

    await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

    const itemsData = itemsDto.map((item, index) => {
      // Section headings are layout only — they must never carry money, or the
      // rollup below double-counts whatever stray qty/price they were sent with.
      if (item.itemType === ItemType.SECTION_HEADING) {
        return {
          ...item,
          invoiceId: id,
          sortOrder: item.sortOrder ?? index,
          quantity: 0,
          unitPrice: 0,
          discountAmount: 0,
          taxAmount: 0,
          lineTotal: 0,
        };
      }

      let discountAmount = 0;
      const qty = item.quantity || 1;
      const price = item.unitPrice || 0;
      const taxRate = item.taxRate || 0;

      if (item.discountValue) {
        if (item.discountType === DiscountType.PERCENTAGE)
          discountAmount = qty * price * (item.discountValue / 100);
        else discountAmount = item.discountValue;
      }
      const beforeTax = qty * price - discountAmount;
      const taxAmount = beforeTax * (taxRate / 100);
      return {
        ...item,
        invoiceId: id,
        sortOrder: item.sortOrder ?? index,
        discountAmount,
        taxAmount,
        lineTotal: beforeTax + taxAmount,
      };
    });

    await this.prisma.invoiceItem.createMany({ data: itemsData });
    await this.recalculateTotals(id);
    return this.findOne(id);
  }

  private async recalculateTotals(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!inv) return;

    let subtotal = 0,
      taxAmount = 0;
    inv.items.forEach((item) => {
      // Mirrors QuotationsService.recalculateTotals — headings are not money.
      if (item.itemType === ItemType.SECTION_HEADING) return;
      const qty = item.quantity || 1;
      const price = item.unitPrice || 0;
      subtotal += qty * price - (item.discountAmount || 0);
      taxAmount += item.taxAmount || 0;
    });

    let qDiscountAmount = 0;
    if (inv.discountValue) {
      if (inv.discountType === DiscountType.PERCENTAGE)
        qDiscountAmount = subtotal * (inv.discountValue / 100);
      else qDiscountAmount = inv.discountValue;
    }

    const grandTotal = subtotal - qDiscountAmount + taxAmount;
    const balanceAmount = grandTotal - inv.paidAmount;

    await this.prisma.invoice.update({
      where: { id },
      data: {
        subtotal,
        discountAmount: qDiscountAmount,
        taxAmount,
        grandTotal,
        balanceAmount,
      },
    });
  }

  async issue(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!inv || inv.invoiceStatus !== InvoiceStatus.DRAFT)
      throw new BadRequestException('Not in DRAFT state');

    const prefix = inv.company.invoicePrefix || 'INV';
    const year = new Date().getFullYear();

    // Previously this counted non-DRAFT invoices and added a fixed offset, so
    // cancelling or deleting any invoice made the next issue() reuse a number
    // that already existed — a hard failure on the unique invoiceNumber column.
    // Derive from the highest number actually issued instead, under a
    // transaction-scoped advisory lock so concurrent issues cannot collide.
    await this.prisma.$transaction(
      async (tx) => {
        // Selected via FROM so the statement yields a typed boolean column:
        // pg_advisory_xact_lock() returns void, which Prisma cannot deserialize.
        await tx.$queryRaw`SELECT true AS locked FROM pg_advisory_xact_lock(${INVOICE_LOCK_NAMESPACE}::int, ${this.lockKeyFor(inv.companyId)}::int)`;

        const lastInvoice = await tx.invoice.findFirst({
          where: {
            companyId: inv.companyId,
            invoiceNumber: { startsWith: `${prefix}-${year}-` },
          },
          orderBy: { invoiceNumber: 'desc' },
          select: { invoiceNumber: true },
        });

        let lastSeq = 0;
        if (lastInvoice?.invoiceNumber) {
          const tail = lastInvoice.invoiceNumber.slice(
            lastInvoice.invoiceNumber.lastIndexOf('-') + 1,
          );
          const parsedSeq = parseInt(tail, 10);
          if (!Number.isNaN(parsedSeq)) lastSeq = parsedSeq;
        }

        if (lastSeq < INVOICE_SEQ_BASELINE) lastSeq = INVOICE_SEQ_BASELINE;

        const seq = (lastSeq + 1).toString().padStart(4, '0');

        await tx.invoice.update({
          where: { id },
          data: {
            invoiceNumber: `${prefix}-${year}-${seq}`,
            invoiceStatus: InvoiceStatus.ISSUED,
            invoiceDate: new Date(),
          },
        });
      },
      { timeout: 15000 },
    );

    return this.findOne(id);
  }

  async recordPayment(id: string, dto: RecordPaymentDto, userId?: string) {
    const inv = await this.findOne(id);
    if (
      !inv ||
      inv.invoiceStatus === InvoiceStatus.DRAFT ||
      inv.invoiceStatus === InvoiceStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot pay Draft or Cancelled invoice');
    }

    if (dto.amount <= 0 || dto.amount > inv.balanceAmount + 0.01) {
      throw new BadRequestException(
        `Payment amount ${dto.amount} is invalid or exceeds balance ${inv.balanceAmount}`,
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: id,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes,
        attachmentUrl: dto.attachmentUrl,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        receivedByUserId: userId,
      },
    });

    // Generate receipt
    const year = new Date().getFullYear();
    const receiptCount = await this.prisma.paymentReceipt.count();
    const receiptNumber = `REC-${year}-${(receiptCount + 1).toString().padStart(5, '0')}`;

    await this.prisma.paymentReceipt.create({
      data: { paymentId: payment.id, receiptNumber },
    });

    const newPaidAmount = inv.paidAmount + dto.amount;
    const newBalanceAmount = inv.grandTotal - newPaidAmount;

    let paymentStatus: PaymentStatus = PaymentStatus.PARTIALLY_PAID;
    if (newBalanceAmount <= 0.01) paymentStatus = PaymentStatus.PAID;

    let invoiceStatus: InvoiceStatus = inv.invoiceStatus;
    if (paymentStatus === PaymentStatus.PAID)
      invoiceStatus = InvoiceStatus.PAID;
    else if (paymentStatus === PaymentStatus.PARTIALLY_PAID)
      invoiceStatus = InvoiceStatus.PARTIALLY_PAID;

    await this.prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus,
        invoiceStatus,
      },
    });

    return this.findOne(id);
  }

  async generatePdf(id: string): Promise<Buffer> {
    const inv = await this.findOne(id);

    const pdfBuffer = await this.pdfService.generatePdfSync(
      'invoice-standard',
      inv.id,
      'invoiceId',
    );

    return pdfBuffer;
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return this.prisma.invoice.delete({ where: { id } });
  }
}
