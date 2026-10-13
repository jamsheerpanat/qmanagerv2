import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyExpirations() {
    this.logger.log('Running daily quotation expiration job...');
    const now = new Date();

    // Find quotations that have a validUntil date strictly before now and are still in a pre-accepted state
    const expiredQuotations = await this.prisma.quotation.findMany({
      where: {
        validUntil: { lt: now },
        status: {
          in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_CUSTOMER'],
        },
      },
    });

    for (const q of expiredQuotations) {
      await this.prisma.quotation.update({
        where: { id: q.id },
        data: { status: 'EXPIRED' },
      });

      await this.notificationsService.createNotification({
        companyId: q.companyId,
        title: 'Quotation Expired',
        message: `Quotation ${q.quotationNumber} has passed its validity date and is now expired.`,
        type: NotificationType.QUOTATION,
        referenceId: q.id,
      });
    }

    this.logger.log(`Expired ${expiredQuotations.length} quotations.`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyOverdueInvoices() {
    this.logger.log('Running daily overdue invoices job...');
    const now = new Date();

    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        dueDate: { lt: now },
        invoiceStatus: { in: ['ISSUED', 'SENT', 'PARTIALLY_PAID'] },
        balanceAmount: { gt: 0 },
      },
    });

    for (const inv of overdueInvoices) {
      await this.prisma.invoice.update({
        where: { id: inv.id },
        data: {
          invoiceStatus: 'OVERDUE',
          paymentStatus: 'OVERDUE',
        },
      });

      await this.notificationsService.createNotification({
        companyId: inv.companyId,
        title: 'Invoice Overdue ⚠️',
        message: `Invoice ${inv.invoiceNumber} is now overdue. Balance: ${inv.balanceAmount} ${inv.currency}.`,
        type: NotificationType.INVOICE,
        referenceId: inv.id,
      });
    }

    this.logger.log(`Marked ${overdueInvoices.length} invoices as overdue.`);
  }
}
