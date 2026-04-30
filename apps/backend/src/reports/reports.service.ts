import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardKpis(companyId: string) {
    const [
      customers,
      leads,
      quotationsTotal,
      quotationsPending,
      quotationsAccepted,
      quotationsTotalValue,
      invoicesTotalValue,
      invoicesPaid,
      invoicesOverdue,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.lead.count({ where: { customer: { companyId } } }), // lead has no companyId, it's via customer
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

  async getDashboardCharts(companyId: string) {
    // Lead Source Performance
    const leadsBySource = await this.prisma.lead.groupBy({
      by: ['source'],
      where: { customer: { companyId } },
      _count: { id: true },
    });

    const leadSourceChart = leadsBySource.map(l => ({
      name: l.source || 'Unknown',
      value: l._count.id
    }));

    // Funnel
    const leads = await this.prisma.lead.count({ where: { customer: { companyId } } });
    const quotes = await this.prisma.quotation.count({ where: { companyId } });
    const invoices = await this.prisma.invoice.count({ where: { companyId } });

    const funnel = [
      { name: 'Leads/Enquiries', value: leads },
      { name: 'Quotations', value: quotes },
      { name: 'Invoices', value: invoices },
    ];

    // Quotation Status Distribution
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

  async getReportData(companyId: string, type: string, filters: any) {
    const dateFilter: any = {};
    if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.lte = new Date(filters.endDate);

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
}
