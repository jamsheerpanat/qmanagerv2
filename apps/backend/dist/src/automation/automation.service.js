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
var AutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
let AutomationService = AutomationService_1 = class AutomationService {
    prisma;
    notificationsService;
    logger = new common_1.Logger(AutomationService_1.name);
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async handleDailyExpirations() {
        this.logger.log('Running daily quotation expiration job...');
        const now = new Date();
        const expiredQuotations = await this.prisma.quotation.findMany({
            where: {
                validUntil: { lt: now },
                status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_CUSTOMER'] }
            }
        });
        for (const q of expiredQuotations) {
            await this.prisma.quotation.update({
                where: { id: q.id },
                data: { status: 'EXPIRED' }
            });
            await this.notificationsService.createNotification({
                companyId: q.companyId,
                title: 'Quotation Expired',
                message: `Quotation ${q.quotationNumber} has passed its validity date and is now expired.`,
                type: client_1.NotificationType.QUOTATION,
                referenceId: q.id,
            });
        }
        this.logger.log(`Expired ${expiredQuotations.length} quotations.`);
    }
    async handleDailyOverdueInvoices() {
        this.logger.log('Running daily overdue invoices job...');
        const now = new Date();
        const overdueInvoices = await this.prisma.invoice.findMany({
            where: {
                dueDate: { lt: now },
                invoiceStatus: { in: ['ISSUED', 'SENT', 'PARTIALLY_PAID'] },
                balanceAmount: { gt: 0 }
            }
        });
        for (const inv of overdueInvoices) {
            await this.prisma.invoice.update({
                where: { id: inv.id },
                data: {
                    invoiceStatus: 'OVERDUE',
                    paymentStatus: 'OVERDUE'
                }
            });
            await this.notificationsService.createNotification({
                companyId: inv.companyId,
                title: 'Invoice Overdue ⚠️',
                message: `Invoice ${inv.invoiceNumber} is now overdue. Balance: ${inv.balanceAmount} ${inv.currency}.`,
                type: client_1.NotificationType.INVOICE,
                referenceId: inv.id,
            });
        }
        this.logger.log(`Marked ${overdueInvoices.length} invoices as overdue.`);
    }
};
exports.AutomationService = AutomationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationService.prototype, "handleDailyExpirations", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationService.prototype, "handleDailyOverdueInvoices", null);
exports.AutomationService = AutomationService = AutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map