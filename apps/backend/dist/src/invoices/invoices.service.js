"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let InvoicesService = class InvoicesService {
    prisma;
    pdfQueue;
    constructor(prisma, pdfQueue) {
        this.prisma = prisma;
        this.pdfQueue = pdfQueue;
    }
    async create(dto, userId) {
        const { items, ...invoiceData } = dto;
        const invoice = await this.prisma.invoice.create({
            data: {
                ...invoiceData,
                items: items ? {
                    create: items.map((item, idx) => ({ ...item, sortOrder: item.sortOrder ?? idx }))
                } : undefined,
                createdById: userId,
            }
        });
        if (items && items.length > 0) {
            await this.recalculateTotals(invoice.id);
        }
        return this.findOne(invoice.id);
    }
    async createFromQuotation(quotationId, type, userId) {
        const q = await this.prisma.quotation.findUnique({
            where: { id: quotationId },
            include: { items: true, terms: true }
        });
        if (!q)
            throw new common_1.NotFoundException('Quotation not found');
        if (!['APPROVED', 'ACCEPTED', 'SENT_TO_CUSTOMER'].includes(q.status)) {
            throw new common_1.BadRequestException('Quotation must be approved or accepted to convert to invoice');
        }
        const termText = q.terms.map(t => t.content).join('\n\n');
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
            }
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
            await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    subtotal: q.subtotal,
                    discountType: q.discountType,
                    discountValue: q.discountValue,
                    discountAmount: q.discountAmount,
                    taxAmount: q.taxAmount,
                    grandTotal: q.grandTotal,
                    balanceAmount: q.grandTotal
                }
            });
        }
        return this.findOne(invoice.id);
    }
    async findAll(companyId, filters = {}) {
        return this.prisma.invoice.findMany({
            where: { companyId, ...filters },
            include: { customer: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                customer: true,
                contact: true,
                quotation: { select: { quotationNumber: true } },
                items: { orderBy: { sortOrder: 'asc' } },
                payments: { include: { receipt: true }, orderBy: { paymentDate: 'desc' } }
            }
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async update(id, dto) {
        const inv = await this.prisma.invoice.findUnique({ where: { id } });
        if (!inv)
            throw new common_1.NotFoundException();
        if (inv.invoiceStatus !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException('Only DRAFT invoices can be freely modified');
        }
        const { items, ...updateData } = dto;
        await this.prisma.invoice.update({
            where: { id },
            data: updateData
        });
        return this.findOne(id);
    }
    async replaceItems(id, itemsDto) {
        const inv = await this.prisma.invoice.findUnique({ where: { id } });
        if (!inv || inv.invoiceStatus !== client_1.InvoiceStatus.DRAFT)
            throw new common_1.BadRequestException('Invoice not draft');
        await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
        const itemsData = itemsDto.map((item, index) => {
            let discountAmount = 0;
            const qty = item.quantity || 1;
            const price = item.unitPrice || 0;
            const taxRate = item.taxRate || 0;
            if (item.discountValue) {
                if (item.discountType === client_1.DiscountType.PERCENTAGE)
                    discountAmount = (qty * price) * (item.discountValue / 100);
                else
                    discountAmount = item.discountValue;
            }
            const beforeTax = (qty * price) - discountAmount;
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
    async recalculateTotals(id) {
        const inv = await this.prisma.invoice.findUnique({ where: { id }, include: { items: true } });
        if (!inv)
            return;
        let subtotal = 0, taxAmount = 0;
        inv.items.forEach(item => {
            const qty = item.quantity || 1;
            const price = item.unitPrice || 0;
            subtotal += (qty * price) - (item.discountAmount || 0);
            taxAmount += item.taxAmount || 0;
        });
        let qDiscountAmount = 0;
        if (inv.discountValue) {
            if (inv.discountType === client_1.DiscountType.PERCENTAGE)
                qDiscountAmount = subtotal * (inv.discountValue / 100);
            else
                qDiscountAmount = inv.discountValue;
        }
        const grandTotal = subtotal - qDiscountAmount + taxAmount;
        const balanceAmount = grandTotal - inv.paidAmount;
        await this.prisma.invoice.update({
            where: { id },
            data: { subtotal, discountAmount: qDiscountAmount, taxAmount, grandTotal, balanceAmount }
        });
    }
    async issue(id) {
        const inv = await this.prisma.invoice.findUnique({ where: { id }, include: { company: true } });
        if (!inv || inv.invoiceStatus !== client_1.InvoiceStatus.DRAFT)
            throw new common_1.BadRequestException('Not in DRAFT state');
        const prefix = inv.company.invoicePrefix || 'INV';
        const year = new Date().getFullYear();
        const count = await this.prisma.invoice.count({
            where: { companyId: inv.companyId, invoiceDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) }, invoiceStatus: { not: client_1.InvoiceStatus.DRAFT } }
        });
        const seq = (count + 1).toString().padStart(4, '0');
        const invoiceNumber = `${prefix}-${year}-${seq}`;
        await this.prisma.invoice.update({
            where: { id },
            data: { invoiceNumber, invoiceStatus: client_1.InvoiceStatus.ISSUED, invoiceDate: new Date() }
        });
        return this.findOne(id);
    }
    async recordPayment(id, dto, userId) {
        const inv = await this.findOne(id);
        if (!inv || inv.invoiceStatus === client_1.InvoiceStatus.DRAFT || inv.invoiceStatus === client_1.InvoiceStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot pay Draft or Cancelled invoice');
        }
        if (dto.amount <= 0 || dto.amount > inv.balanceAmount + 0.01) {
            throw new common_1.BadRequestException(`Payment amount ${dto.amount} is invalid or exceeds balance ${inv.balanceAmount}`);
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
            }
        });
        const year = new Date().getFullYear();
        const receiptCount = await this.prisma.paymentReceipt.count();
        const receiptNumber = `REC-${year}-${(receiptCount + 1).toString().padStart(5, '0')}`;
        await this.prisma.paymentReceipt.create({
            data: { paymentId: payment.id, receiptNumber }
        });
        const newPaidAmount = inv.paidAmount + dto.amount;
        const newBalanceAmount = inv.grandTotal - newPaidAmount;
        let paymentStatus = client_1.PaymentStatus.PARTIALLY_PAID;
        if (newBalanceAmount <= 0.01)
            paymentStatus = client_1.PaymentStatus.PAID;
        let invoiceStatus = inv.invoiceStatus;
        if (paymentStatus === client_1.PaymentStatus.PAID)
            invoiceStatus = client_1.InvoiceStatus.PAID;
        else if (paymentStatus === client_1.PaymentStatus.PARTIALLY_PAID)
            invoiceStatus = client_1.InvoiceStatus.PARTIALLY_PAID;
        await this.prisma.invoice.update({
            where: { id },
            data: { paidAmount: newPaidAmount, balanceAmount: newBalanceAmount, paymentStatus, invoiceStatus }
        });
        return this.findOne(id);
    }
    async generatePdf(id, userId) {
        const inv = await this.findOne(id);
        const document = await this.prisma.document.create({
            data: {
                type: 'INVOICE',
                referenceId: inv.invoiceNumber || `DRAFT-${inv.id.slice(0, 6)}`,
                status: 'PROCESSING',
                generatedById: userId,
                metadata: { invoiceId: inv.id }
            }
        });
        await this.pdfQueue.add('generate-pdf', {
            documentId: document.id,
            templateId: 'invoice-standard',
            userId: userId,
            invoiceId: inv.id
        });
        return { success: true, documentId: document.id };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('pdf-generation')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map