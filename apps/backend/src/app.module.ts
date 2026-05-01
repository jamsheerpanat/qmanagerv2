import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';
import { MinioModule } from './minio/minio.module';
import { PdfModule } from './pdf/pdf.module';
import { DocumentsModule } from './documents/documents.module';
import { BullModule } from '@nestjs/bullmq';
import { CustomersModule } from './customers/customers.module';
import { ContactsModule } from './contacts/contacts.module';
import { LeadsModule } from './leads/leads.module';
import { FollowUpsModule } from './followups/followups.module';
import { TimelineModule } from './timeline/timeline.module';
import { CatalogModule } from './catalog/catalog.module';
import { TermsModule } from './terms/terms.module';
import { SettingsModule } from './settings/settings.module';
import { QuotationsModule } from './quotations/quotations.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PortalModule } from './portal/portal.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { AutomationModule } from './automation/automation.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AuditModule,
    MinioModule,
    PdfModule,
    DocumentsModule,
    TimelineModule,
    CustomersModule,
    ContactsModule,
    LeadsModule,
    FollowUpsModule,
    CatalogModule,
    TermsModule,
    SettingsModule,
    QuotationsModule,
    InvoicesModule,
    PortalModule,
    NotificationsModule,
    ReportsModule,
    AutomationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
