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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardKpis(companyId) {
        const [customers, leads, quotationsTotal, quotationsPending, quotationsAccepted, quotationsTotalValue, invoicesTotalValue, invoicesPaid, invoicesOverdue,] = await Promise.all([
            this.prisma.customer.count({ where: { companyId } }),
            this.prisma.lead.count({ where: { customer: { companyId } } }),
            this.prisma.quotation.count({ where: { companyId } }),
            this.prisma.quotation.count({ where: { companyId, status: 'PENDING_APPROVAL' } }),
            this.prisma.quotation.count({ where: { companyId, status: 'ACCEPTED' } }),
            this.prisma.quotation.aggregate({
                where: { companyId, status: { notIn: ['DRAFT', 'REJECTED', 'EXPIRED'] } },
                _sum: { grandTotal: true },
            }),
            this.prisma.invoice.aggregate({
                where: { companyId, invoiceStatus: { not: 'DRAFT' } },
                _sum: { grandTotal: true },
            }),
            this.prisma.invoice.aggregate({
                where: { companyId, invoiceStatus: { not: 'DRAFT' } },
                _sum: { paidAmount: true },
            }),
            this.prisma.invoice.aggregate({
                where: { companyId, paymentStatus: 'OVERDUE' },
                _sum: { balanceAmount: true },
            }),
        ]);
        return {
            customers,
            leads,
            quotations: {
                total: quotationsTotal,
                pending: quotationsPending,
                accepted: quotationsAccepted,
                value: quotationsTotalValue._sum.grandTotal || 0,
            },
            invoices: {
                totalValue: invoicesTotalValue._sum.grandTotal || 0,
                paid: invoicesPaid._sum.paidAmount || 0,
                outstanding: (invoicesTotalValue._sum.grandTotal || 0) - (invoicesPaid._sum.paidAmount || 0),
                overdue: invoicesOverdue._sum.balanceAmount || 0,
            }
        };
    }
    async getDashboardCharts(companyId) {
        const leadsBySource = await this.prisma.lead.groupBy({
            by: ['source'],
            where: { customer: { companyId } },
            _count: { id: true },
        });
        const leadSourceChart = leadsBySource.map(l => ({
            name: l.source || 'Unknown',
            value: l._count.id
        }));
        const leads = await this.prisma.lead.count({ where: { customer: { companyId } } });
        const quotes = await this.prisma.quotation.count({ where: { companyId } });
        const invoices = await this.prisma.invoice.count({ where: { companyId } });
        const funnel = [
            { name: 'Leads/Enquiries', value: leads },
            { name: 'Quotations', value: quotes },
            { name: 'Invoices', value: invoices },
        ];
        const qStatuses = await this.prisma.quotation.groupBy({
            by: ['status'],
            where: { companyId },
            _count: { id: true }
        });
        return {
            leadSourceChart,
            funnel,
            quotationStatusChart: qStatuses.map(q => ({ name: q.status, value: q._count.id }))
        };
    }
    async getReportData(companyId, type, filters) {
        const dateFilter = {};
        if (filters.startDate)
            dateFilter.gte = new Date(filters.startDate);
        if (filters.endDate)
            dateFilter.lte = new Date(filters.endDate);
        switch (type) {
            case 'customers':
                return this.prisma.customer.findMany({
                    where: { companyId, ...(Object.keys(dateFilter).length && { createdAt: dateFilter }) },
                    select: { displayName: true, email: true, phone: true, customerType: true }
                });
            case 'quotations':
                return this.prisma.quotation.findMany({
                    where: {
                        companyId,
                        ...(Object.keys(dateFilter).length && { issueDate: dateFilter }),
                        ...(filters.status && { status: filters.status }),
                    },
                    select: {
                        quotationNumber: true, revisionNumber: true, status: true,
                        grandTotal: true, issueDate: true, validUntil: true,
                        customer: { select: { displayName: true } }
                    }
                });
            case 'invoices':
                return this.prisma.invoice.findMany({
                    where: {
                        companyId,
                        ...(Object.keys(dateFilter).length && { invoiceDate: dateFilter }),
                        ...(filters.status && { paymentStatus: filters.status })
                    },
                    select: {
                        invoiceNumber: true, invoiceType: true, paymentStatus: true,
                        grandTotal: true, paidAmount: true, balanceAmount: true,
                        invoiceDate: true, dueDate: true,
                        customer: { select: { displayName: true } }
                    }
                });
            default:
                throw new Error(`Report type ${type} not implemented`);
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map