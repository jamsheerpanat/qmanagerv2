import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardKpis(req: any): Promise<{
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
    getDashboardCharts(req: any): Promise<{
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
    getReport(req: any, type: string, filters: any, res: any): Promise<any>;
}
