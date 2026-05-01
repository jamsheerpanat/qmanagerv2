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
} from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
  ) {}

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
      include: { items: true, terms: true },
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
        description: i.description || 'Item',
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
    return this.prisma.invoice.findMany({
      where: { companyId, ...filters },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        contact: true,
        quotation: { select: { quotationNumber: true } },
        items: { orderBy: { sortOrder: 'asc' } },
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

    const { items, ...updateData } = dto;
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
    const count = await this.prisma.invoice.count({
      where: {
        companyId: inv.companyId,
        invoiceDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
        invoiceStatus: { not: InvoiceStatus.DRAFT },
      },
    });

    const seq = (count + 1).toString().padStart(4, '0');
    const invoiceNumber = `${prefix}-${year}-${seq}`;

    await this.prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber,
        invoiceStatus: InvoiceStatus.ISSUED,
        invoiceDate: new Date(),
      },
    });

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

  async generatePdf(id: string, userId: string) {
    const inv = await this.findOne(id);

    const document = await this.prisma.document.create({
      data: {
        type: 'INVOICE',
        referenceId: inv.invoiceNumber || `DRAFT-${inv.id.slice(0, 6)}`,
        status: 'PROCESSING',
        generatedById: userId,
        metadata: { invoiceId: inv.id },
      },
    });

    await this.pdfQueue.add('generate-pdf', {
      documentId: document.id,
      templateId: 'invoice-standard',
      userId: userId,
      invoiceId: inv.id,
    });

    return { success: true, documentId: document.id };
  }
}
