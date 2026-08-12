import Foundation

/// Editable in-memory line item, shared by the create wizard and the editor.
///
/// The backend replaces the whole item collection on save (`POST
/// /quotations/:id/items` does deleteMany + createMany), so the UI keeps a plain
/// array and posts it wholesale rather than diffing.
nonisolated struct ItemDraft: Identifiable, Hashable {
    let id = UUID()
    var itemType: ItemType = .product
    var sectionTitle: String = ""
    var description: String = ""
    var quantity: Double = 1
    var unit: String = "pcs"
    var unitPrice: Double = 0
    var discountType: DiscountType = .percentage
    var discountValue: Double = 0
    var taxRate: Double = 0
    var productId: String?
    var serviceItemId: String?
    var isOptional: Bool = false
    var warranty: String = ""
    var deliveryTime: String = ""

    var isHeading: Bool { itemType == .sectionHeading }

    /// Mirrors the server's per-line maths so totals update as you type.
    var discountAmount: Double {
        guard discountValue > 0 else { return 0 }
        return discountType == .percentage
            ? quantity * unitPrice * (discountValue / 100)
            : discountValue
    }

    var lineTotal: Double {
        guard !isHeading else { return 0 }
        let beforeTax = quantity * unitPrice - discountAmount
        return beforeTax + beforeTax * (taxRate / 100)
    }

    static func heading(_ title: String = "New Section") -> ItemDraft {
        var draft = ItemDraft()
        draft.itemType = .sectionHeading
        draft.sectionTitle = title
        return draft
    }

    static func from(product: Product) -> ItemDraft {
        var draft = ItemDraft()
        draft.itemType = .product
        draft.productId = product.id
        draft.sectionTitle = product.productName
        draft.description = product.shortDescription ?? ""
        draft.unit = product.unit
        draft.unitPrice = product.sellingPrice
        draft.taxRate = product.taxRate
        return draft
    }

    static func from(service: ServiceItem) -> ItemDraft {
        var draft = ItemDraft()
        draft.itemType = .service
        draft.serviceItemId = service.id
        draft.sectionTitle = service.serviceName
        draft.description = service.description ?? ""
        draft.unit = service.unit
        draft.unitPrice = service.defaultPrice
        return draft
    }

    static func custom() -> ItemDraft {
        var draft = ItemDraft()
        draft.itemType = .custom
        draft.sectionTitle = "Custom line"
        return draft
    }

    /// Rebuilds a draft from a saved item so the editor can round-trip.
    init(from item: QuotationItem) {
        itemType = item.itemType
        sectionTitle = item.sectionTitle ?? ""
        description = item.description ?? ""
        quantity = item.quantity
        unit = item.unit
        unitPrice = item.unitPrice
        taxRate = item.taxAmount > 0 && item.lineTotal > 0
            ? (item.taxAmount / max(item.lineTotal - item.taxAmount, 0.0001)) * 100
            : 0
        isOptional = item.isOptional
        warranty = item.warranty ?? ""
        deliveryTime = item.deliveryTime ?? ""
        // Discounts come back as a computed amount; represent them as a flat
        // value so re-saving reproduces the same number.
        if item.discountAmount > 0 {
            discountType = .flatAmount
            discountValue = item.discountAmount
        }
    }

    init() {}
}

/// Wire format for `POST /quotations/:id/items` (QuotationItemDto).
nonisolated struct ItemPayload: Encodable, Sendable {
    let itemType: String
    let sectionTitle: String?
    let description: String?
    let quantity: Double
    let unit: String
    let unitPrice: Double
    let discountType: String?
    let discountValue: Double?
    let taxRate: Double
    let productId: String?
    let serviceItemId: String?
    let isOptional: Bool
    let warranty: String?
    let deliveryTime: String?
    let sortOrder: Int

    init(draft: ItemDraft, sortOrder: Int) {
        itemType = draft.itemType.rawValue
        sectionTitle = draft.sectionTitle.nilIfBlank
        description = draft.description.nilIfBlank
        // Headings must carry no money — the server skips them in the rollup,
        // and sending stray values would still store them on the row.
        quantity = draft.isHeading ? 0 : draft.quantity
        unit = draft.unit
        unitPrice = draft.isHeading ? 0 : draft.unitPrice
        discountType = draft.discountValue > 0 ? draft.discountType.rawValue : nil
        discountValue = draft.discountValue > 0 ? draft.discountValue : nil
        taxRate = draft.isHeading ? 0 : draft.taxRate
        productId = draft.productId
        serviceItemId = draft.serviceItemId
        isOptional = draft.isOptional
        warranty = draft.warranty.nilIfBlank
        deliveryTime = draft.deliveryTime.nilIfBlank
        self.sortOrder = sortOrder
    }
}

/// Wire format for `POST /quotations/:id/terms` (QuotationTermDto).
nonisolated struct TermPayload: Encodable, Sendable {
    let content: String
    let categoryId: String?
    let sortOrder: Int
}

nonisolated struct TermDraft: Identifiable, Hashable {
    let id = UUID()
    var content: String
    var categoryId: String?

    init(content: String = "", categoryId: String? = nil) {
        self.content = content
        self.categoryId = categoryId
    }
}

/// Wire format for `POST /quotations` (CreateQuotationDto).
nonisolated struct CreateQuotationPayload: Encodable, Sendable {
    let companyId: String
    let customerId: String
    let serviceTypeId: String
    let projectTitle: String?
    let projectLocation: String?
    let scopeSummary: String?
    let currency: String
    let discountType: String?
    let discountValue: Double?
}

/// Wire format for `PATCH /quotations/:id` (UpdateQuotationDto).
nonisolated struct UpdateQuotationPayload: Encodable, Sendable {
    var projectTitle: String?
    var projectLocation: String?
    var scopeSummary: String?
    var requirementSummary: String?
    var proposedSolution: String?
    var internalNotes: String?
    var currency: String?
    var discountType: String?
    var discountValue: Double?
}

/// Wire format for the catalog product endpoints.
nonisolated struct ProductPayload: Encodable, Sendable {
    var productCode: String
    var productName: String
    var brand: String?
    var modelNumber: String?
    var shortDescription: String?
    var categoryId: String
    var serviceTypeId: String
    var unit: String
    var costPrice: Double
    var sellingPrice: Double
    var minimumSellingPrice: Double
    var taxRate: Double
    var warrantyPeriod: String?
    var isActive: Bool
}
