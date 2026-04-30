"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const audit_module_1 = require("./audit/audit.module");
const minio_module_1 = require("./minio/minio.module");
const pdf_module_1 = require("./pdf/pdf.module");
const documents_module_1 = require("./documents/documents.module");
const bullmq_1 = require("@nestjs/bullmq");
const customers_module_1 = require("./customers/customers.module");
const contacts_module_1 = require("./contacts/contacts.module");
const leads_module_1 = require("./leads/leads.module");
const followups_module_1 = require("./followups/followups.module");
const timeline_module_1 = require("./timeline/timeline.module");
const catalog_module_1 = require("./catalog/catalog.module");
const terms_module_1 = require("./terms/terms.module");
const settings_module_1 = require("./settings/settings.module");
const quotations_module_1 = require("./quotations/quotations.module");
const invoices_module_1 = require("./invoices/invoices.module");
const portal_module_1 = require("./portal/portal.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reports_module_1 = require("./reports/reports.module");
const automation_module_1 = require("./automation/automation.module");
const schedule_1 = require("@nestjs/schedule");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: 'localhost',
                    port: 6402,
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            audit_module_1.AuditModule,
            minio_module_1.MinioModule,
            pdf_module_1.PdfModule,
            documents_module_1.DocumentsModule,
            timeline_module_1.TimelineModule,
            customers_module_1.CustomersModule,
            contacts_module_1.ContactsModule,
            leads_module_1.LeadsModule,
            followups_module_1.FollowUpsModule,
            catalog_module_1.CatalogModule,
            terms_module_1.TermsModule,
            settings_module_1.SettingsModule,
            quotations_module_1.QuotationsModule,
            invoices_module_1.InvoicesModule,
            portal_module_1.PortalModule,
            notifications_module_1.NotificationsModule,
            reports_module_1.ReportsModule,
            automation_module_1.AutomationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map