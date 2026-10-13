import Foundation

// MARK: - Catalog

nonisolated struct Product: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let productCode: String
    let productName: String
    let brand: String?
    let modelNumber: String?
    let shortDescription: String?
    let detailedDescription: String?
    let technicalSpecification: String?
    let categoryId: String
    let serviceTypeId: String
    let unit: String
    let costPrice: Double
    let sellingPrice: Double
    let minimumSellingPrice: Double
    let currency: String
    let taxable: Bool
    let taxRate: Double
    let warrantyPeriod: String?
    let productImage: String?
    let installationNotes: String?
    let internalNotes: String?
    let isActive: Bool
    let category: ProductCategory?
    let serviceType: ServiceType?

    static func == (lhs: Product, rhs: Product) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

nonisolated struct ProductCategory: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String?
    let isActive: Bool
    let serviceTypeId: String
    let serviceType: ServiceType?
}

nonisolated struct ServiceItem: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let serviceCode: String
    let serviceName: String
    let category: String?
    let description: String?
    let unit: String
    let defaultPrice: Double
    let minimumPrice: Double
    let scopeDescription: String?
    let deliverables: String?
    let exclusions: String?
    let serviceTypeId: String
    let isActive: Bool
    let serviceType: ServiceType?
}

// MARK: - Terms master

nonisolated struct TermsCategory: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String?
    let isActive: Bool
    let templates: [TermsTemplate]?
}

nonisolated struct TermsTemplate: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let title: String
    let content: String
    let sortOrder: Int
    let isDefault: Bool
    let isActive: Bool
    let categoryId: String
    let serviceTypeId: String?
    let category: TermsCategory?
    let serviceType: ServiceType?

    static func == (lhs: TermsTemplate, rhs: TermsTemplate) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

nonisolated struct TermsGroup: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String?
    let isActive: Bool
    let templates: [TermsTemplate]?

    static func == (lhs: TermsGroup, rhs: TermsGroup) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// MARK: - Revision comparison

nonisolated struct RevisionDiff: Decodable, Sendable {
    let fromRevision: Int
    let toRevision: Int
    let totalChanges: TotalChanges
    let itemCountChanges: ItemCountChanges
    let addedItems: [QuotationItem]
    let removedItems: [QuotationItem]

    struct TotalChanges: Decodable, Sendable {
        let from: Double
        let to: Double
        let diff: Double
    }

    struct ItemCountChanges: Decodable, Sendable {
        let from: Int
        let to: Int
    }
}

// MARK: - Administration

nonisolated struct AuditLogEntry: Decodable, Sendable, Identifiable {
    let id: String
    let action: String
    let module: String
    let entityType: String
    let entityId: String?
    let ipAddress: String?
    let createdAt: Date
    let actor: Actor?

    struct Actor: Decodable, Sendable {
        let id: String
        let name: String
        let email: String
    }
}

nonisolated struct UserSummary: Decodable, Sendable, Identifiable {
    let id: String
    let name: String
    let email: String
    let phone: String?
    let status: String
    let createdAt: Date?
    let company: NamedRef?
    let roles: [RoleWrapper]?

    struct RoleWrapper: Decodable, Sendable {
        let role: RoleRef
        struct RoleRef: Decodable, Sendable {
            let id: String
            let name: String
        }
    }

    var roleNames: [String] { (roles ?? []).map(\.role.name) }
}

nonisolated struct Role: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String?
    let permissions: [RolePermission]?

    struct RolePermission: Decodable, Sendable, Hashable {
        let permission: PermissionRow
    }

    var permissionIDs: Set<String> {
        Set((permissions ?? []).map(\.permission.id))
    }

    static func == (lhs: Role, rhs: Role) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

nonisolated struct PermissionRow: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let action: String
    let description: String?

    var domain: String {
        action.split(separator: ".").first.map(String.init) ?? "other"
    }

    var verb: String {
        action.split(separator: ".").dropFirst().joined(separator: " ")
            .replacingOccurrences(of: "_", with: " ")
    }
}

// MARK: - Company settings

nonisolated struct Company: Decodable, Sendable, Identifiable {
    let id: String
    let name: String
    let legalName: String?
    let taxNumber: String?
    let address: String?
    let phone: String?
    let email: String?
    let defaultCurrency: String?
    let defaultQuotationValidityDays: Int?
    let quotationPrefix: String?
    let invoicePrefix: String?
    let footerText: String?
    let brandColor: String?
    let smtpHost: String?
    let smtpPort: Int?
    let smtpUser: String?
    let bankAccounts: [BankAccount]?
}

nonisolated struct BankAccount: Decodable, Sendable, Identifiable {
    let id: String
    let bankName: String
    let accountName: String
    let accountNumber: String
    let iban: String?
    let swiftCode: String?
    let branch: String?
    let currency: String
    let isDefault: Bool
}

nonisolated struct QuotationTemplate: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String?
    let coverPageStyle: String?
    let defaultServiceIntroduction: String?
    let qrVerificationPlacement: String?
    let isActive: Bool
}
