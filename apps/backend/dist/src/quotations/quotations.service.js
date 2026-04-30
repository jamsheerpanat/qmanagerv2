"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const nodemailer = __importStar(require("nodemailer"));
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let QuotationsService = class QuotationsService {
    prisma;
    pdfQueue;
    constructor(prisma, pdfQueue) {
        this.prisma = prisma;
        this.pdfQueue = pdfQueue;
    }
    async checkLock(id) {
        const q = await this.prisma.quotation.findUnique({ where: { id } });
        if (q?.isLocked)
            throw new common_1.BadRequestException('Quotation is locked and cannot be modified');
        return q;
    }
    async create(createQuotationDto, userId) {
        const company = await this.prisma.company.findUnique({ where: { id: createQuotationDto.companyId } });
        const serviceType = await this.prisma.serviceType.findUnique({
            where: { id: createQuotationDto.serviceTypeId },
            include: { termsTemplates: true }
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        if (!serviceType)
            throw new common_1.NotFoundException('Service type not found');
        const prefix = company.quotationPrefix || 'QTN';
        const year = new Date().getFullYear();
        const count = await this.prisma.quotation.count({
            where: {
                companyId: company.id,
                issueDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
                revisionNumber: 0
            }
        });
        const seq = (count + 1).toString().padStart(4, '0');
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
                status: client_1.QuotationStatus.DRAFT,
                createdById: userId,
            }
        });
        if (serviceType.termsTemplates.length > 0) {
            const termsData = serviceType.termsTemplates.map(t => ({
                quotationId: quotation.id,
                categoryId: t.categoryId,
                content: t.content,
                sortOrder: t.sortOrder,
            }));
            await this.prisma.quotationTerm.createMany({ data: termsData });
        }
        return this.findOne(quotation.id);
    }
    async findAll(companyId, filters = {}) {
        return this.prisma.quotation.findMany({
            where: { companyId, ...filters },
            include: {
                customer: true,
                serviceType: true,
                createdBy: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const quotation = await this.prisma.quotation.findUnique({
            where: { id },
            include: {
                customer: true,
                contact: true,
                lead: true,
                serviceType: true,
                company: true,
                branch: true,
                items: { orderBy: { sortOrder: 'asc' } },
                scopes: { orderBy: { sortOrder: 'asc' } },
                terms: { orderBy: { sortOrder: 'asc' }, include: { category: true } },
                approvals: { orderBy: { requestedAt: 'desc' }, include: { requestedBy: true, approver: true } },
                shares: { orderBy: { sentAt: 'desc' } },
                childQuotations: { select: { id: true, revisionNumber: true, status: true, isLocked: true } },
                parentQuotation: { select: { id: true, revisionNumber: true } }
            }
        });
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        return quotation;
    }
    async update(id, updateDto) {
        await this.checkLock(id);
        await this.prisma.quotation.update({
            where: { id },
            data: updateDto,
        });
        if (updateDto.discountType !== undefined || updateDto.discountValue !== undefined) {
            await this.recalculateTotals(id);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const quotation = await this.checkLock(id);
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        if (quotation.status !== client_1.QuotationStatus.DRAFT) {
            throw new common_1.BadRequestException('Only DRAFT quotations can be deleted');
        }
        return this.prisma.quotation.delete({ where: { id } });
    }
    async replaceItems(quotationId, itemsDto) {
        await this.checkLock(quotationId);
        await this.prisma.quotationItem.deleteMany({ where: { quotationId } });
        const itemsData = await Promise.all(itemsDto.map(async (item, index) => {
            let unitCost = 0;
            if (item.productId) {
                const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
                if (product)
                    unitCost = product.costPrice || 0;
            }
            let discountAmount = 0;
            const qty = item.quantity || 1;
            const price = item.unitPrice || 0;
            const taxRate = item.taxRate || 0;
            if (item.discountValue) {
                if (item.discountType === client_1.DiscountType.PERCENTAGE) {
                    discountAmount = (qty * price) * (item.discountValue / 100);
                }
                else {
                    discountAmount = item.discountValue;
                }
            }
            const beforeTax = (qty * price) - discountAmount;
            const taxAmount = beforeTax * (taxRate / 100);
            const lineTotal = beforeTax + taxAmount;
            const margin = beforeTax - (qty * unitCost);
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
        }));
        await this.prisma.quotationItem.createMany({ data: itemsData });
        await this.recalculateTotals(quotationId);
        return this.findOne(quotationId);
    }
    async replaceScopes(quotationId, scopesDto) {
        await this.checkLock(quotationId);
        await this.prisma.quotationScope.deleteMany({ where: { quotationId } });
        const scopesData = scopesDto.map((s, idx) => ({ ...s, quotationId, sortOrder: s.sortOrder ?? idx }));
        await this.prisma.quotationScope.createMany({ data: scopesData });
        return this.findOne(quotationId);
    }
    async replaceTerms(quotationId, termsDto) {
        await this.checkLock(quotationId);
        await this.prisma.quotationTerm.deleteMany({ where: { quotationId } });
        const termsData = termsDto.map((t, idx) => ({ ...t, quotationId, sortOrder: t.sortOrder ?? idx }));
        await this.prisma.quotationTerm.createMany({ data: termsData });
        return this.findOne(quotationId);
    }
    async recalculateTotals(quotationId) {
        const quotation = await this.prisma.quotation.findUnique({
            where: { id: quotationId },
            include: { items: true }
        });
        if (!quotation)
            return;
        let subtotal = 0;
        let taxAmount = 0;
        let totalCost = 0;
        quotation.items.forEach(item => {
            if (item.isOptional || item.itemType === client_1.ItemType.SECTION_HEADING)
                return;
            const qty = item.quantity || 1;
            const price = item.unitPrice || 0;
            const cost = item.unitCost || 0;
            subtotal += (qty * price) - (item.discountAmount || 0);
            taxAmount += item.taxAmount || 0;
            totalCost += (qty * cost);
        });
        let qDiscountAmount = 0;
        if (quotation.discountValue) {
            if (quotation.discountType === client_1.DiscountType.PERCENTAGE) {
                qDiscountAmount = subtotal * (quotation.discountValue / 100);
            }
            else {
                qDiscountAmount = quotation.discountValue;
            }
        }
        const grandTotal = subtotal - qDiscountAmount + taxAmount;
        const grossMargin = (subtotal - qDiscountAmount) - totalCost;
        await this.prisma.quotation.update({
            where: { id: quotationId },
            data: { subtotal, discountAmount: qDiscountAmount, taxAmount, grandTotal, totalCost, grossMargin }
        });
    }
    async submitForApproval(id, userId) {
        const q = await this.findOne(id);
        if (q.status !== client_1.QuotationStatus.DRAFT && q.status !== client_1.QuotationStatus.REVISED) {
            throw new common_1.BadRequestException('Only DRAFT or REVISED quotations can be submitted');
        }
        await this.prisma.quotationApproval.create({
            data: {
                quotationId: id,
                revisionNumber: q.revisionNumber,
                requestedByUserId: userId,
                status: 'PENDING'
            }
        });
        await this.prisma.quotation.update({
            where: { id },
            data: { status: client_1.QuotationStatus.PENDING_APPROVAL }
        });
        return this.findOne(id);
    }
    async approve(id, userId, comments) {
        const q = await this.prisma.quotation.findUnique({ where: { id } });
        if (!q || q.status !== client_1.QuotationStatus.PENDING_APPROVAL)
            throw new common_1.BadRequestException('Quotation not pending approval');
        const approval = await this.prisma.quotationApproval.findFirst({
            where: { quotationId: id, status: 'PENDING' },
            orderBy: { requestedAt: 'desc' }
        });
        if (approval) {
            await this.prisma.quotationApproval.update({
                where: { id: approval.id },
                data: { status: 'APPROVED', approverUserId: userId, comments, approvedAt: new Date() }
            });
        }
        await this.prisma.quotation.update({
            where: { id },
            data: { status: client_1.QuotationStatus.APPROVED, isLocked: true }
        });
        return this.findOne(id);
    }
    async reject(id, userId, comments) {
        const q = await this.prisma.quotation.findUnique({ where: { id } });
        if (!q || q.status !== client_1.QuotationStatus.PENDING_APPROVAL)
            throw new common_1.BadRequestException('Quotation not pending approval');
        const approval = await this.prisma.quotationApproval.findFirst({
            where: { quotationId: id, status: 'PENDING' },
            orderBy: { requestedAt: 'desc' }
        });
        if (approval) {
            await this.prisma.quotationApproval.update({
                where: { id: approval.id },
                data: { status: 'REJECTED', approverUserId: userId, comments, rejectedAt: new Date() }
            });
        }
        await this.prisma.quotation.update({
            where: { id },
            data: { status: client_1.QuotationStatus.REJECTED, rejectionReason: comments }
        });
        return this.findOne(id);
    }
    async createRevision(id, userId) {
        const q = await this.findOne(id);
        if (!q.isLocked)
            throw new common_1.BadRequestException('Can only create revisions from locked quotations');
        const siblings = await this.prisma.quotation.findMany({
            where: { quotationNumber: q.quotationNumber },
            orderBy: { revisionNumber: 'desc' }
        });
        const nextRev = siblings[0].revisionNumber + 1;
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
                status: client_1.QuotationStatus.REVISED,
                subtotal: q.subtotal,
                discountType: q.discountType,
                discountValue: q.discountValue,
                discountAmount: q.discountAmount,
                taxAmount: q.taxAmount,
                grandTotal: q.grandTotal,
                amountInWords: q.amountInWords,
                internalNotes: q.internalNotes,
                createdById: userId,
            }
        });
        if (q.items.length > 0) {
            await this.prisma.quotationItem.createMany({
                data: q.items.map(i => ({
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
                }))
            });
        }
        if (q.scopes.length > 0) {
            await this.prisma.quotationScope.createMany({
                data: q.scopes.map(s => ({
                    quotationId: newQ.id,
                    sectionTitle: s.sectionTitle,
                    content: s.content,
                    isHidden: s.isHidden,
                    sortOrder: s.sortOrder,
                }))
            });
        }
        if (q.terms.length > 0) {
            await this.prisma.quotationTerm.createMany({
                data: q.terms.map(t => ({
                    quotationId: newQ.id,
                    categoryId: t.categoryId,
                    content: t.content,
                    sortOrder: t.sortOrder,
                }))
            });
        }
        return this.findOne(newQ.id);
    }
    async compareRevisions(fromId, toId) {
        const fromQ = await this.findOne(fromId);
        const toQ = await this.findOne(toId);
        const addedItems = toQ.items.filter(toItem => !fromQ.items.find(f => f.productId === toItem.productId && f.serviceItemId === toItem.serviceItemId && f.description === toItem.description));
        const removedItems = fromQ.items.filter(fromItem => !toQ.items.find(t => t.productId === fromItem.productId && t.serviceItemId === fromItem.serviceItemId && t.description === fromItem.description));
        return {
            fromRevision: fromQ.revisionNumber,
            toRevision: toQ.revisionNumber,
            totalChanges: {
                from: fromQ.grandTotal,
                to: toQ.grandTotal,
                diff: toQ.grandTotal - fromQ.grandTotal
            },
            itemCountChanges: {
                from: fromQ.items.length,
                to: toQ.items.length
            },
            addedItems,
            removedItems
        };
    }
    async sendQuotation(id, recipientEmail, userId) {
        const q = await this.findOne(id);
        const token = crypto.randomBytes(32).toString('hex');
        await this.prisma.quotationShare.create({
            data: {
                quotationId: id,
                token,
                recipientEmail,
            }
        });
        await this.prisma.quotation.update({
            where: { id },
            data: { status: client_1.QuotationStatus.SENT_TO_CUSTOMER, sentAt: new Date(), isLocked: true }
        });
        const company = await this.prisma.company.findUnique({ where: { id: q.companyId } });
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
            }
            catch (err) {
                console.error("Failed to send SMTP email:", err);
            }
        }
        else {
            console.log(`[SMTP Not Configured] Sending quotation link to ${recipientEmail}: ${portalLink}`);
        }
        return { success: true, token };
    }
    async generatePdf(id, userId) {
        const q = await this.findOne(id);
        if (![client_1.QuotationStatus.DRAFT, client_1.QuotationStatus.APPROVED, client_1.QuotationStatus.PENDING_REVIEW].includes(q.status)) {
        }
        const document = await this.prisma.document.create({
            data: {
                type: 'QUOTATION',
                referenceId: q.quotationNumber,
                status: 'PROCESSING',
                generatedById: userId,
                metadata: {
                    quotationId: q.id,
                    revision: q.revisionNumber,
                    customerName: q.customer?.displayName,
                    totalAmount: q.grandTotal
                }
            }
        });
        await this.pdfQueue.add('generate-pdf', {
            documentId: document.id,
            templateId: q.serviceType?.slug || 'smart-home',
            userId: userId,
            quotationId: q.id
        });
        return { success: true, documentId: document.id };
    }
    async getSharedQuotation(token) {
        const share = await this.prisma.quotationShare.findUnique({
            where: { token },
            include: {
                quotation: {
                    include: {
                        customer: true,
                        items: true,
                        serviceType: true
                    }
                }
            }
        });
        if (!share)
            return null;
        if (!share.viewedAt) {
            await this.prisma.quotationShare.update({
                where: { id: share.id },
                data: { viewedAt: new Date() }
            });
        }
        return share.quotation;
    }
    async checkReadiness(id) {
        const q = await this.prisma.quotation.findUnique({
            where: { id },
            include: {
                items: { include: { product: true, serviceItem: true } },
                terms: true,
            }
        });
        if (!q)
            throw new common_1.NotFoundException('Quotation not found');
        const warnings = [];
        if (!q.terms || q.terms.length === 0) {
            warnings.push('Missing terms and conditions.');
        }
        if (!q.validUntil) {
            warnings.push('Quotation validity date is missing.');
        }
        if (!q.scopeSummary || q.scopeSummary.trim() === '') {
            warnings.push('Scope of work section is empty.');
        }
        let totalDiscount = 0;
        for (const item of q.items) {
            totalDiscount += item.discountAmount;
            const msp = item.product?.minimumSellingPrice || 0;
            if (msp > 0 && item.unitPrice < msp) {
                warnings.push(`Item "${item.sectionTitle || item.description || 'Unknown'}" is below minimum selling price.`);
            }
        }
        if (totalDiscount > (q.subtotal * 0.2)) {
            warnings.push('Total discount exceeds 20% of subtotal. Approval may be required.');
        }
        const maxScore = 5;
        let score = maxScore - warnings.length;
        if (score < 0)
            score = 0;
        return {
            isReady: warnings.length === 0,
            score: (score / maxScore) * 100,
            warnings
        };
    }
    async aiSummarize(id) {
        const quotation = await this.prisma.quotation.findUnique({
            where: { id },
            include: { items: true, serviceType: true, customer: true }
        });
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        const itemNames = quotation.items.map(i => i.description).join(', ');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const generatedScope = `Based on the selected service (${quotation.serviceType?.name || 'General'}), this proposal encompasses the following key deliverables for ${quotation.customer.displayName}:
    
We will provide and integrate: ${itemNames}. 
Our team will ensure seamless installation, configuration, and testing of all systems to meet the highest industry standards. 
This solution is designed to be highly scalable and future-proof, providing maximum value and operational efficiency.`;
        await this.prisma.quotation.update({
            where: { id },
            data: { scopeSummary: generatedScope }
        });
        return { scopeSummary: generatedScope };
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('pdf-generation')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map