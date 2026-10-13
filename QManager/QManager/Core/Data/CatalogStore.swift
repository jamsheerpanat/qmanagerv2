import Foundation
import Observation

/// Reference data shared by the quotation wizard, the editor and the catalog
/// screens. Loaded once and reused, because the wizard alone needs seven lists
/// and refetching them on every step would be wasteful.
@MainActor
@Observable
final class CatalogStore {
    var customers: [Customer] = []
    var serviceTypes: [ServiceType] = []
    var products: [Product] = []
    var categories: [ProductCategory] = []
    var serviceItems: [ServiceItem] = []
    var termsTemplates: [TermsTemplate] = []
    var termsGroups: [TermsGroup] = []

    var isLoading = false
    var error: Error?
    private(set) var hasLoaded = false

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    func loadIfNeeded() async {
        guard !hasLoaded, !isLoading else { return }
        await reload()
    }

    func reload() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Fetch concurrently — these are independent reads.
            async let customers = api.get("customers", as: [Customer].self)
            async let serviceTypes = api.get("catalog/service-types", as: [ServiceType].self)
            async let products = api.get("catalog/products", as: [Product].self)
            async let categories = api.get("catalog/categories", as: [ProductCategory].self)
            async let serviceItems = api.get("catalog/service-items", as: [ServiceItem].self)

            // Terms require their own permission, so a user without terms.view
            // still gets a usable wizard rather than a hard failure. Kicked off
            // with the rest so all seven requests overlap.
            async let termsTemplates = (try? await api.get(
                "terms/templates", as: [TermsTemplate].self
            )) ?? []
            async let termsGroups = (try? await api.get(
                "terms/groups", as: [TermsGroup].self
            )) ?? []

            self.customers = try await customers
            self.serviceTypes = try await serviceTypes
            self.products = try await products
            self.categories = try await categories
            self.serviceItems = try await serviceItems
            self.termsTemplates = await termsTemplates
            self.termsGroups = await termsGroups

            error = nil
            hasLoaded = true
        } catch {
            self.error = error
        }
    }

    func categories(for serviceTypeID: String?) -> [ProductCategory] {
        guard let serviceTypeID else { return categories }
        return categories.filter { $0.serviceTypeId == serviceTypeID }
    }

    func serviceName(for id: String?) -> String? {
        guard let id else { return nil }
        return serviceTypes.first { $0.id == id }?.name
    }

    /// Adds a product created inline from the wizard without a full refetch.
    func insert(product: Product) {
        products.insert(product, at: 0)
    }
}
