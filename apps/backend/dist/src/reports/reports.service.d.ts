import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardKpis(companyId: string): Promise<{
        customers: number;
        leads: number;
        quotations: {
            total: number;
            pending: number;
            accepted: number;
            value: number;
        };
        invoices: {
            totalValue: number;
            paid: number;
            outstanding: number;
            overdue: number;
        };
    }>;
    getDashboardCharts(companyId: string): Promise<{
        leadSourceChart: {
            name: import("@prisma/client").$Enums.LeadSource;
            value: number;
        }[];
        funnel: {
            name: string;
            value: number;
        }[];
        quotationStatusChart: {
            name: import("@prisma/client").$Enums.QuotationStatus;
            value: number;
        }[];
    }>;
    getReportData(companyId: string, type: string, filters: any): Promise<{
        phone: string | null;
        email: string | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        displayName: string;
    }[] | {
        status: import("@prisma/client").$Enums.QuotationStatus;
        customer: {
            displayName: string;
        };
        validUntil: Date | null;
        quotationNumber: string;
        revisionNumber: number;
        issueDate: Date;
        grandTotal: number;
    }[] | {
        customer: {
            displayName: string;
        };
        grandTotal: number;
        invoiceType: import("@prisma/client").$Enums.InvoiceType;
        dueDate: Date | null;
        invoiceNumber: string | null;
        invoiceDate: Date;
        paidAmount: number;
        balanceAmount: number;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
    }[]>;
}
