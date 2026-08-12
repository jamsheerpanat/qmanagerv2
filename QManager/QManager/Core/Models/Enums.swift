import SwiftUI

/// Decodes an API enum without exploding when the backend gains a new case.
nonisolated protocol LenientEnum: RawRepresentable, Decodable, Sendable, Hashable
where RawValue == String {
    static var fallback: Self { get }
}

nonisolated extension LenientEnum {
    init(from decoder: Decoder) throws {
        let raw = try decoder.singleValueContainer().decode(String.self)
        self = Self(rawValue: raw) ?? .fallback
    }

    /// "PENDING_APPROVAL" -> "Pending Approval"
    var label: String {
        rawValue
            .split(separator: "_")
            .map { $0.prefix(1).uppercased() + $0.dropFirst().lowercased() }
            .joined(separator: " ")
    }
}

// MARK: - Quotation

nonisolated enum QuotationStatus: String, LenientEnum, CaseIterable {
    case draft = "DRAFT"
    case pendingReview = "PENDING_REVIEW"
    case pendingApproval = "PENDING_APPROVAL"
    case approved = "APPROVED"
    case sentToCustomer = "SENT_TO_CUSTOMER"
    case viewedByCustomer = "VIEWED_BY_CUSTOMER"
    case underNegotiation = "UNDER_NEGOTIATION"
    case revised = "REVISED"
    case accepted = "ACCEPTED"
    case rejected = "REJECTED"
    case expired = "EXPIRED"
    case convertedToInvoice = "CONVERTED_TO_INVOICE"
    case cancelled = "CANCELLED"
    case unknown = "UNKNOWN"

    static let fallback = QuotationStatus.unknown

    var tint: Color {
        switch self {
        case .draft, .revised: .secondary
        case .pendingReview, .pendingApproval: .orange
        case .approved, .sentToCustomer, .viewedByCustomer: .blue
        case .accepted, .convertedToInvoice: .green
        case .rejected, .cancelled: .red
        case .expired: .brown
        case .underNegotiation: .purple
        case .unknown: .gray
        }
    }

    var symbol: String {
        switch self {
        case .draft, .revised: "square.and.pencil"
        case .pendingReview, .pendingApproval: "clock.badge.exclamationmark"
        case .approved: "checkmark.seal"
        case .sentToCustomer: "paperplane"
        case .viewedByCustomer: "eye"
        case .underNegotiation: "bubble.left.and.bubble.right"
        case .accepted: "checkmark.circle.fill"
        case .convertedToInvoice: "doc.on.doc"
        case .rejected: "xmark.circle.fill"
        case .expired: "calendar.badge.exclamationmark"
        case .cancelled: "slash.circle"
        case .unknown: "questionmark.circle"
        }
    }

    /// Mirrors `checkLock` on the backend: approved and later states are frozen.
    var isEditable: Bool { self == .draft || self == .revised }
}

// MARK: - Invoice

nonisolated enum InvoiceStatus: String, LenientEnum, CaseIterable {
    case draft = "DRAFT"
    case issued = "ISSUED"
    case sent = "SENT"
    case partiallyPaid = "PARTIALLY_PAID"
    case paid = "PAID"
    case overdue = "OVERDUE"
    case cancelled = "CANCELLED"
    case refunded = "REFUNDED"
    case writtenOff = "WRITTEN_OFF"
    case unknown = "UNKNOWN"

    static let fallback = InvoiceStatus.unknown

    var tint: Color {
        switch self {
        case .draft: .secondary
        case .issued, .sent: .blue
        case .partiallyPaid: .orange
        case .paid: .green
        case .overdue: .red
        case .cancelled, .writtenOff: .gray
        case .refunded: .purple
        case .unknown: .gray
        }
    }
}

nonisolated enum PaymentStatus: String, LenientEnum, CaseIterable {
    case unpaid = "UNPAID"
    case partiallyPaid = "PARTIALLY_PAID"
    case paid = "PAID"
    case overdue = "OVERDUE"
    case unknown = "UNKNOWN"

    static let fallback = PaymentStatus.unknown

    var tint: Color {
        switch self {
        case .unpaid: .secondary
        case .partiallyPaid: .orange
        case .paid: .green
        case .overdue: .red
        case .unknown: .gray
        }
    }
}

nonisolated enum InvoiceType: String, LenientEnum, CaseIterable {
    case direct = "DIRECT"
    case quotation = "QUOTATION"
    case advancePayment = "ADVANCE_PAYMENT"
    case milestone = "MILESTONE"
    case final = "FINAL"
    case proforma = "PROFORMA"
    case unknown = "UNKNOWN"

    static let fallback = InvoiceType.unknown
}

nonisolated enum PaymentMethod: String, LenientEnum, CaseIterable, Identifiable {
    case cash = "CASH"
    case knet = "KNET"
    case bankTransfer = "BANK_TRANSFER"
    case cheque = "CHEQUE"
    case onlineLink = "ONLINE_LINK"
    case other = "OTHER"

    static let fallback = PaymentMethod.other
    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .cash: "banknote"
        case .knet: "creditcard"
        case .bankTransfer: "building.columns"
        case .cheque: "doc.text"
        case .onlineLink: "link"
        case .other: "ellipsis.circle"
        }
    }
}

// MARK: - Items

nonisolated enum ItemType: String, LenientEnum {
    case product = "PRODUCT"
    case service = "SERVICE"
    case custom = "CUSTOM"
    case sectionHeading = "SECTION_HEADING"
    case optionalItem = "OPTIONAL_ITEM"
    case discountLine = "DISCOUNT_LINE"
    case unknown = "UNKNOWN"

    static let fallback = ItemType.unknown
}

nonisolated enum DiscountType: String, LenientEnum {
    case percentage = "PERCENTAGE"
    case flatAmount = "FLAT_AMOUNT"
    static let fallback = DiscountType.percentage
}

// MARK: - Leads

nonisolated enum LeadStatus: String, LenientEnum, CaseIterable, Identifiable {
    case new = "NEW"
    case contacted = "CONTACTED"
    case requirementCollected = "REQUIREMENT_COLLECTED"
    case siteVisitScheduled = "SITE_VISIT_SCHEDULED"
    case siteVisited = "SITE_VISITED"
    case quotationInProgress = "QUOTATION_IN_PROGRESS"
    case quotationSent = "QUOTATION_SENT"
    case underNegotiation = "UNDER_NEGOTIATION"
    case won = "WON"
    case lost = "LOST"
    case onHold = "ON_HOLD"
    case cancelled = "CANCELLED"
    case unknown = "UNKNOWN"

    static let fallback = LeadStatus.unknown
    var id: String { rawValue }

    var tint: Color {
        switch self {
        case .new: .blue
        case .contacted, .requirementCollected: .teal
        case .siteVisitScheduled, .siteVisited: .indigo
        case .quotationInProgress, .quotationSent: .orange
        case .underNegotiation: .purple
        case .won: .green
        case .lost, .cancelled: .red
        case .onHold: .brown
        case .unknown: .gray
        }
    }
}

nonisolated enum LeadSource: String, LenientEnum, CaseIterable, Identifiable {
    case website = "WEBSITE"
    case whatsapp = "WHATSAPP"
    case phoneCall = "PHONE_CALL"
    case email = "EMAIL"
    case instagram = "INSTAGRAM"
    case facebook = "FACEBOOK"
    case referral = "REFERRAL"
    case existingCustomer = "EXISTING_CUSTOMER"
    case walkIn = "WALK_IN"
    case tender = "TENDER"
    case partner = "PARTNER"
    case directSales = "DIRECT_SALES"
    case other = "OTHER"

    static let fallback = LeadSource.other
    var id: String { rawValue }
}

nonisolated enum CustomerType: String, LenientEnum, CaseIterable, Identifiable {
    case individual = "INDIVIDUAL"
    case company = "COMPANY"
    case government = "GOVERNMENT"
    case contractor = "CONTRACTOR"
    case consultant = "CONSULTANT"
    case reseller = "RESELLER"
    case existingClient = "EXISTING_CLIENT"
    case prospect = "PROSPECT"

    static let fallback = CustomerType.company
    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .individual: "person"
        case .company: "building.2"
        case .government: "building.columns"
        case .contractor: "hammer"
        case .consultant: "person.text.rectangle"
        case .reseller: "shippingbox"
        case .existingClient: "star"
        case .prospect: "sparkle.magnifyingglass"
        }
    }
}

nonisolated enum NotificationKind: String, LenientEnum {
    case lead = "LEAD"
    case quotation = "QUOTATION"
    case invoice = "INVOICE"
    case payment = "PAYMENT"
    case general = "GENERAL"

    static let fallback = NotificationKind.general

    var symbol: String {
        switch self {
        case .lead: "bolt.fill"
        case .quotation: "doc.text.fill"
        case .invoice: "doc.plaintext.fill"
        case .payment: "creditcard.fill"
        case .general: "bell.fill"
        }
    }

    var tint: Color {
        switch self {
        case .lead: .yellow
        case .quotation: .blue
        case .invoice: .indigo
        case .payment: .green
        case .general: .secondary
        }
    }
}
