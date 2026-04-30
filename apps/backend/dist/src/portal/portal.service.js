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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
let PortalService = class PortalService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getQuotationByToken(token, ipAddress, userAgent) {
        const share = await this.prisma.quotationShare.findUnique({
            where: { token },
            include: {
                quotation: {
                    include: { items: true, company: true, customer: true, terms: true }
                }
            }
        });
        if (!share)
            throw new common_1.NotFoundException('Invalid or expired link');
        if (share.expiresAt && share.expiresAt < new Date()) {
            throw new common_1.ForbiddenException('This link has expired');
        }
        const updateData = { viewedAt: new Date(), lastViewedAt: new Date() };
        if (!share.firstViewedAt) {
            updateData.firstViewedAt = new Date();
            await this.notificationsService.createNotification({
                companyId: share.quotation.companyId,
                title: 'Quotation Viewed',
                message: `Customer viewed quotation ${share.quotation.quotationNumber} for the first time.`,
                type: client_1.NotificationType.QUOTATION,
                referenceId: share.quotation.id
            });
        }
        if (ipAddress)
            updateData.ipAddress = ipAddress;
        if (userAgent)
            updateData.userAgent = userAgent;
        await this.prisma.quotationShare.update({
            where: { id: share.id },
            data: updateData
        });
        return share;
    }
    async acceptQuotation(token, dto, ipAddress, userAgent) {
        const share = await this.getQuotationByToken(token);
        const q = share.quotation;
        if (q.status !== 'APPROVED' && q.status !== 'SENT_TO_CUSTOMER') {
            throw new common_1.BadRequestException('Quotation cannot be accepted in its current state');
        }
        const acceptance = await this.prisma.quotationAcceptance.create({
            data: {
                quotationId: q.id,
                revisionNumber: q.revisionNumber,
                acceptedByName: dto.acceptedByName,
                designation: dto.designation,
                email: dto.email,
                phone: dto.phone,
                digitalSignatureData: dto.digitalSignatureData,
                acceptanceNote: dto.acceptanceNote,
                ipAddress,
                userAgent,
            }
        });
        await this.prisma.quotation.update({
            where: { id: q.id },
            data: { status: 'ACCEPTED' }
        });
        await this.notificationsService.createNotification({
            companyId: q.companyId,
            title: 'Quotation Accepted 🎉',
            message: `${dto.acceptedByName} accepted quotation ${q.quotationNumber} Rev ${q.revisionNumber}.`,
            type: client_1.NotificationType.QUOTATION,
            referenceId: q.id
        });
        return acceptance;
    }
    async rejectQuotation(token, dto, ipAddress, userAgent) {
        const share = await this.getQuotationByToken(token);
        const q = share.quotation;
        if (q.status !== 'APPROVED' && q.status !== 'SENT_TO_CUSTOMER') {
            throw new common_1.BadRequestException('Quotation cannot be rejected in its current state');
        }
        const rejection = await this.prisma.quotationRejection.create({
            data: {
                quotationId: q.id,
                revisionNumber: q.revisionNumber,
                rejectedByName: dto.rejectedByName,
                reason: dto.reason,
                note: dto.note,
                ipAddress,
                userAgent,
            }
        });
        await this.prisma.quotation.update({
            where: { id: q.id },
            data: { status: 'REJECTED' }
        });
        await this.notificationsService.createNotification({
            companyId: q.companyId,
            title: 'Quotation Rejected ❌',
            message: `${dto.rejectedByName} rejected quotation ${q.quotationNumber}. Reason: ${dto.reason}`,
            type: client_1.NotificationType.QUOTATION,
            referenceId: q.id
        });
        return rejection;
    }
    async getInvoiceByToken(token, ipAddress, userAgent) {
        const share = await this.prisma.invoiceShare.findUnique({
            where: { token },
            include: {
                invoice: {
                    include: { items: true, company: true, customer: true, payments: { orderBy: { paymentDate: 'desc' } } }
                }
            }
        });
        if (!share)
            throw new common_1.NotFoundException('Invalid or expired link');
        const updateData = { viewedAt: new Date(), lastViewedAt: new Date() };
        if (!share.firstViewedAt)
            updateData.firstViewedAt = new Date();
        if (ipAddress)
            updateData.ipAddress = ipAddress;
        if (userAgent)
            updateData.userAgent = userAgent;
        await this.prisma.invoiceShare.update({
            where: { id: share.id },
            data: updateData
        });
        return share;
    }
    async uploadPaymentProof(token, dto) {
        const share = await this.getInvoiceByToken(token);
        const invoice = share.invoice;
        const payment = await this.prisma.payment.create({
            data: {
                invoiceId: invoice.id,
                amount: dto.amount,
                paymentMethod: dto.paymentMethod,
                referenceNumber: dto.referenceNumber,
                notes: dto.notes,
                attachmentUrl: dto.attachmentUrl,
                isVerified: false,
            }
        });
        await this.notificationsService.createNotification({
            companyId: invoice.companyId,
            title: 'Payment Proof Uploaded 💰',
            message: `A payment proof of ${dto.amount} was uploaded for invoice ${invoice.invoiceNumber}. Please verify it.`,
            type: client_1.NotificationType.PAYMENT,
            referenceId: invoice.id
        });
        return payment;
    }
    async verifyDocument(token) {
        const doc = await this.prisma.document.findFirst({
            where: {
                OR: [
                    { id: token },
                    { fileHash: token }
                ]
            }
        });
        if (!doc)
            throw new common_1.NotFoundException('Invalid Verification Token');
        return {
            documentType: doc.type,
            referenceId: doc.referenceId,
            generatedAt: doc.createdAt,
            fileHash: doc.fileHash,
            metadata: doc.metadata,
            status: 'Valid'
        };
    }
};
exports.PortalService = PortalService;
exports.PortalService = PortalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], PortalService);
//# sourceMappingURL=portal.service.js.map