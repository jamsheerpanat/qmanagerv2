import Foundation

// MARK: - Session

/// Shape returned by `GET /auth/me`.
nonisolated struct CurrentUser: Decodable, Sendable, Identifiable {
    let id: String
    let name: String
    let email: String
    let phone: String?
    let companyId: String
    let branchId: String?
    let roles: [String]
    let permissions: [String]

    var isSuperAdmin: Bool { roles.contains("Super Admin") }

    /// Super Admin bypasses every check on the backend, so mirror that here
    /// rather than hiding UI they are actually allowed to use.
    func can(_ permission: Permission) -> Bool {
        isSuperAdmin || permissions.contains(permission.rawValue)
    }

    var initials: String {
        let parts = name.split(separator: " ").prefix(2)
        let letters = parts.compactMap(\.first).map(String.init).joined()
        return letters.isEmpty ? "U" : letters.uppercased()
    }
}

// MARK: - Dashboard

nonisolated struct DashboardKPIs: Decodable, Sendable {
    let customers: Int
    let leads: Int
    let quotations: QuotationTotals
    let invoices: InvoiceTotals

    struct QuotationTotals: Decodable, Sendable {
        let total: Int
        let pending: Int
        let accepted: Int
        let value: Double
    }

    struct InvoiceTotals: Decodable, Sendable {
        let totalValue: Double
        let paid: Double
        let outstanding: Double
        let overdue: Double
    }
}

nonisolated struct DashboardCharts: Decodable, Sendable {
    let leadSourceChart: [ChartSlice]
    let funnel: [ChartSlice]
    let quotationStatusChart: [ChartSlice]
}

nonisolated struct ChartSlice: Decodable, Sendable, Identifiable {
    let name: String
    let value: Int
    var id: String { name }

    /// Enum-ish names arrive SCREAMING_CASE; soften them for axis labels.
    var displayName: String {
        guard name.uppercased() == name, name.contains("_") || name.count > 3 else { return name }
        return name
            .split(separator: "_")
            .map { $0.prefix(1).uppercased() + $0.dropFirst().lowercased() }
            .joined(separator: " ")
    }
}

// MARK: - Customers

nonisolated struct Customer: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let customerCode: String
    let customerType: CustomerType
    let displayName: String
    let legalName: String?
    let email: String?
    let phone: String?
    let whatsapp: String?
    let website: String?
    let addressLine1: String?
    let area: String?
    let city: String?
    let country: String?
    let taxNumber: String?
    let industryType: String?
    let status: String?
    let notes: String?
    let createdAt: Date?
    let contacts: [Contact]?
    let leads: [Lead]?

    var primaryContact: Contact? {
        contacts?.first { $0.isPrimary == true } ?? contacts?.first
    }

    var locationLine: String? {
        let parts = [area, city, country].compactMap { $0?.nilIfBlank }
        return parts.isEmpty ? nil : parts.joined(separator: ", ")
    }

    static func == (lhs: Customer, rhs: Customer) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

nonisolated struct Contact: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
    let designation: String?
    let department: String?
    let email: String?
    let phone: String?
    let whatsapp: String?
    let isPrimary: Bool?
}

// MARK: - Leads

nonisolated struct Lead: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let enquiryNumber: String
    let projectTitle: String
    let requirementSummary: String?
    let location: String?
    let status: LeadStatus
    let source: LeadSource
    let priority: String?
    let expectedBudget: Double?
    let expectedClosingDate: Date?
    let siteVisitRequired: Bool?
    let siteVisitDate: Date?
    let enquiryDate: Date?
    let createdAt: Date?
    let notes: String?
    let customer: Customer?
    let contact: Contact?
    let assignedTo: NamedRef?

    static func == (lhs: Lead, rhs: Lead) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

nonisolated struct NamedRef: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String?
}

// MARK: - Quotations

nonisolated struct Quotation: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let quotationNumber: String
    let revisionNumber: Int
    let isLocked: Bool
    let status: QuotationStatus
    let projectTitle: String?
    let projectLocation: String?
    let requirementSummary: String?
    let proposedSolution: String?
    let scopeSummary: String?
    let issueDate: Date?
    let validUntil: Date?
    let currency: String
    let subtotal: Double
    let discountAmount: Double
    let taxAmount: Double
    let grandTotal: Double
    let totalCost: Double?
    let grossMargin: Double?
    let internalNotes: String?
    let parentQuotationId: String?
    let createdAt: Date?
    let sentAt: Date?
    let acceptedAt: Date?

    let customer: Customer?
    let contact: Contact?
    let serviceType: ServiceType?
    let createdBy: NamedRef?
    let items: [QuotationItem]?
    let terms: [QuotationTerm]?
    let approvals: [Approval]?
    let shares: [Share]?

    var marginPercent: Double? {
        guard let grossMargin, subtotal > 0 else { return nil }
        return grossMargin / subtotal * 100
    }

    var isExpired: Bool {
        guard let validUntil else { return false }
        return validUntil < Date() && status != .accepted
    }

    static func == (lhs: Quotation, rhs: Quotation) -> Bool {
        lhs.id == rhs.id && lhs.status == rhs.status
    }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

nonisolated struct QuotationItem: Decodable, Sendable, Identifiable {
    let id: String
    let itemType: ItemType
    let sectionTitle: String?
    let description: String?
    let image: String?
    let quantity: Double
    let unit: String
    let unitPrice: Double
    let discountAmount: Double
    let taxAmount: Double
    let lineTotal: Double
    let warranty: String?
    let deliveryTime: String?
    let remarks: String?
    let isOptional: Bool
    let sortOrder: Int

    var isHeading: Bool { itemType == .sectionHeading }

    /// The builder puts the product name in `sectionTitle` and the blurb in
    /// `description`, so the title falls back through both.
    var title: String {
        sectionTitle?.nilIfBlank ?? description?.nilIfBlank ?? "Item"
    }

    var subtitle: String? {
        guard let description = description?.nilIfBlank, description != title else { return nil }
        return description
    }
}

nonisolated struct QuotationTerm: Decodable, Sendable, Identifiable {
    let id: String
    let content: String
    let sortOrder: Int
    let category: TermCategory?

    struct TermCategory: Decodable, Sendable {
        let id: String
        let name: String
    }
}

nonisolated struct Approval: Decodable, Sendable, Identifiable {
    let id: String
    let status: String
    let comments: String?
    let requestedAt: Date?
    let approvedAt: Date?
    let rejectedAt: Date?
    let requestedBy: NamedRef?
    let approver: NamedRef?
}

nonisolated struct Share: Decodable, Sendable, Identifiable {
    let id: String
    let token: String
    let recipientEmail: String
    let sentAt: Date?
    let viewedAt: Date?
    let downloadCount: Int?
}

nonisolated struct ServiceType: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
    let slug: String
}

/// `GET /quotations/:id/readiness`
nonisolated struct QuotationReadiness: Decodable, Sendable {
    let isReady: Bool
    let score: Double
    let warnings: [String]
}

/// `POST /quotations/:id/generate-share-link`
nonisolated struct ShareLinkResponse: Decodable, Sendable {
    let success: Bool
    let token: String
    let portalLink: String
}

// MARK: - Invoices

nonisolated struct Invoice: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let invoiceNumber: String?
    let invoiceType: InvoiceType
    let invoiceStatus: InvoiceStatus
    let paymentStatus: PaymentStatus
    let invoiceDate: Date?
    let dueDate: Date?
    let currency: String
    let subtotal: Double
    let discountAmount: Double
    let taxAmount: Double
    let grandTotal: Double
    let paidAmount: Double
    let balanceAmount: Double
    let notes: String?
    let terms: String?
    let createdAt: Date?

    let customer: Customer?
    let contact: Contact?
    let serviceType: ServiceType?
    let quotation: QuotationRef?
    let items: [InvoiceItem]?
    let payments: [Payment]?

    struct QuotationRef: Decodable, Sendable {
        let quotationNumber: String?
        let projectTitle: String?
    }

    /// Draft invoices have no number yet.
    var displayNumber: String { invoiceNumber ?? "Draft" }

    var isOverdue: Bool {
        guard let dueDate else { return false }
        return dueDate < Date() && balanceAmount > 0.01
    }

    var paidFraction: Double {
        guard grandTotal > 0 else { return 0 }
        return min(max(paidAmount / grandTotal, 0), 1)
    }

    static func == (lhs: Invoice, rhs: Invoice) -> Bool {
        lhs.id == rhs.id && lhs.paidAmount == rhs.paidAmount
    }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

nonisolated struct InvoiceItem: Decodable, Sendable, Identifiable {
    let id: String
    let itemType: ItemType
    let sectionTitle: String?
    let description: String
    let quantity: Double
    let unit: String
    let unitPrice: Double
    let discountAmount: Double
    let taxAmount: Double
    let lineTotal: Double
    let sortOrder: Int

    var isHeading: Bool { itemType == .sectionHeading }
}

nonisolated struct Payment: Decodable, Sendable, Identifiable {
    let id: String
    let paymentDate: Date?
    let amount: Double
    let paymentMethod: PaymentMethod
    let referenceNumber: String?
    let notes: String?
    let isVerified: Bool
    let receipt: Receipt?

    struct Receipt: Decodable, Sendable {
        let receiptNumber: String
    }
}

// MARK: - Notifications

nonisolated struct AppNotification: Decodable, Sendable, Identifiable {
    let id: String
    let title: String
    let message: String
    let type: NotificationKind
    let referenceId: String?
    let isRead: Bool
    let createdAt: Date
}

// MARK: - Small helpers

nonisolated extension String {
    /// Treats whitespace-only strings as absent, which the API returns often.
    var nilIfBlank: String? {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }

    /// Terms and scope summaries are authored in a rich-text editor, so they
    /// can arrive as HTML.
    var strippingHTML: String {
        replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression)
            .replacingOccurrences(of: "&nbsp;", with: " ")
            .replacingOccurrences(of: "&amp;", with: "&")
            .replacingOccurrences(of: "&lt;", with: "<")
            .replacingOccurrences(of: "&gt;", with: ">")
            .replacingOccurrences(of: "&quot;", with: "\"")
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
