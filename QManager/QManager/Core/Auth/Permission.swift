import Foundation

/// Permission strings the API enforces, mirrored from
/// `apps/backend/prisma/permissions.ts`.
///
/// Used to hide actions the signed-in user would only get a 403 from.
nonisolated enum Permission: String, Sendable {
    case customersView = "customers.view"
    case customersCreate = "customers.create"
    case customersUpdate = "customers.update"

    case leadsView = "leads.view"
    case leadsCreate = "leads.create"
    case leadsUpdate = "leads.update"

    case productsView = "products.view"

    case quotationsView = "quotations.view"
    case quotationsViewAll = "quotations.view_all"
    case quotationsCreate = "quotations.create"
    case quotationsUpdate = "quotations.update"
    case quotationsApprove = "quotations.approve"
    case quotationsGeneratePDF = "quotations.generate_pdf"
    case quotationsSend = "quotations.send"
    case quotationsRevise = "quotations.revise"

    case invoicesView = "invoices.view"
    case invoicesCreate = "invoices.create"
    case invoicesUpdate = "invoices.update"
    case invoicesRecordPayment = "invoices.record_payment"
    case invoicesGeneratePDF = "invoices.generate_pdf"

    case reportsView = "reports.view"
    case settingsManage = "settings.manage"
    case usersManage = "users.manage"
    case auditView = "audit.view"
}
