import SwiftUI

@MainActor
@Observable
final class GlobalSearchModel {
    var query = ""
    var scope: Scope = .all
    var isLoading = false

    private(set) var quotations: [Quotation] = []
    private(set) var invoices: [Invoice] = []
    private(set) var customers: [Customer] = []
    private(set) var leads: [Lead] = []

    enum Scope: String, CaseIterable, Identifiable {
        case all = "All"
        case quotations = "Quotes"
        case invoices = "Invoices"
        case customers = "Customers"
        case leads = "Leads"
        var id: String { rawValue }
    }

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    private var term: String {
        query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    }

    var hasQuery: Bool { term.count >= 2 }

    var matchedQuotations: [Quotation] {
        guard hasQuery, scope == .all || scope == .quotations else { return [] }
        return quotations.filter {
            $0.quotationNumber.lowercased().contains(term)
                || ($0.projectTitle?.lowercased().contains(term) ?? false)
                || ($0.customer?.displayName.lowercased().contains(term) ?? false)
        }
    }

    var matchedInvoices: [Invoice] {
        guard hasQuery, scope == .all || scope == .invoices else { return [] }
        return invoices.filter {
            $0.displayNumber.lowercased().contains(term)
                || ($0.customer?.displayName.lowercased().contains(term) ?? false)
        }
    }

    var matchedCustomers: [Customer] {
        guard hasQuery, scope == .all || scope == .customers else { return [] }
        return customers.filter {
            $0.displayName.lowercased().contains(term)
                || $0.customerCode.lowercased().contains(term)
                || ($0.email?.lowercased().contains(term) ?? false)
                || ($0.phone?.contains(term) ?? false)
        }
    }

    var matchedLeads: [Lead] {
        guard hasQuery, scope == .all || scope == .leads else { return [] }
        return leads.filter {
            $0.projectTitle.lowercased().contains(term)
                || $0.enquiryNumber.lowercased().contains(term)
                || ($0.customer?.displayName.lowercased().contains(term) ?? false)
        }
    }

    var totalMatches: Int {
        matchedQuotations.count + matchedInvoices.count
            + matchedCustomers.count + matchedLeads.count
    }

    /// Seeds from cache so typing works instantly and offline, then refreshes.
    func load(can: (Permission) -> Bool) async {
        quotations = await api.cached("quotations", as: [Quotation].self) ?? []
        invoices = await api.cached("invoices", as: [Invoice].self) ?? []
        customers = await api.cached("customers", as: [Customer].self) ?? []
        leads = await api.cached("leads", as: [Lead].self) ?? []

        isLoading = true
        defer { isLoading = false }

        // Resolve permissions first: the closure is not Sendable, so it cannot
        // be captured by the concurrent child tasks below.
        let canQuotations = can(.quotationsView)
        let canInvoices = can(.invoicesView)
        let canCustomers = can(.customersView)
        let canLeads = can(.leadsView)

        // All four are independent; overlapping them turns four round trips
        // into one wall-clock wait.
        async let freshQuotations: [Quotation]? = canQuotations
            ? try? await api.get("quotations", as: [Quotation].self, cacheKey: "quotations") : nil
        async let freshInvoices: [Invoice]? = canInvoices
            ? try? await api.get("invoices", as: [Invoice].self, cacheKey: "invoices") : nil
        async let freshCustomers: [Customer]? = canCustomers
            ? try? await api.get("customers", as: [Customer].self, cacheKey: "customers") : nil
        async let freshLeads: [Lead]? = canLeads
            ? try? await api.get("leads", as: [Lead].self, cacheKey: "leads") : nil

        if let value = await freshQuotations { quotations = value }
        if let value = await freshInvoices { invoices = value }
        if let value = await freshCustomers { customers = value }
        if let value = await freshLeads { leads = value }
    }
}

/// One search field over every record type the user can see.
struct GlobalSearchView: View {
    @Environment(SessionStore.self) private var session
    @Environment(RecentsStore.self) private var recents
    @Environment(\.dismiss) private var dismiss

    @State private var model = GlobalSearchModel()
    @FocusState private var focused: Bool

    var body: some View {
        NavigationStack {
            List {
                if !model.hasQuery {
                    if recents.items.isEmpty {
                        ContentUnavailableView(
                            "Search everything",
                            systemImage: "magnifyingglass",
                            description: Text("Quotation numbers, invoices, customers, leads — all at once.")
                        )
                        .listRowBackground(Color.clear)
                    } else {
                        Section("Recent") {
                            ForEach(recents.items) { item in
                                recentRow(item)
                            }
                        }
                    }
                } else if model.totalMatches == 0 {
                    ContentUnavailableView.search(text: model.query)
                        .listRowBackground(Color.clear)
                } else {
                    if !model.matchedQuotations.isEmpty {
                        Section("Quotations") {
                            ForEach(model.matchedQuotations) { quotation in
                                NavigationLink {
                                    QuotationDetailView(quotationID: quotation.id, preview: quotation)
                                } label: {
                                    QuotationRow(quotation: quotation)
                                }
                            }
                        }
                    }

                    if !model.matchedInvoices.isEmpty {
                        Section("Invoices") {
                            ForEach(model.matchedInvoices) { invoice in
                                NavigationLink {
                                    InvoiceDetailView(invoiceID: invoice.id, preview: invoice)
                                } label: {
                                    InvoiceRow(invoice: invoice)
                                }
                            }
                        }
                    }

                    if !model.matchedCustomers.isEmpty {
                        Section("Customers") {
                            ForEach(model.matchedCustomers) { customer in
                                NavigationLink {
                                    CustomerDetailView(customerID: customer.id, preview: customer)
                                } label: {
                                    CustomerRow(customer: customer)
                                }
                            }
                        }
                    }

                    if !model.matchedLeads.isEmpty {
                        Section("Leads") {
                            ForEach(model.matchedLeads) { lead in
                                NavigationLink {
                                    LeadDetailView(lead: lead)
                                } label: {
                                    LeadRow(lead: lead)
                                }
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(
                text: $model.query,
                placement: .navigationBarDrawer(displayMode: .always),
                prompt: "Number, project, customer, phone…"
            )
            .searchScopes($model.scope) {
                ForEach(GlobalSearchModel.Scope.allCases) { Text($0.rawValue).tag($0) }
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .task { await model.load { session.can($0) } }
        }
    }

    @ViewBuilder
    private func recentRow(_ item: RecentItem) -> some View {
        NavigationLink {
            switch item.kind {
            case .quotation: QuotationDetailView(quotationID: item.id)
            case .invoice: InvoiceDetailView(invoiceID: item.id)
            case .customer: CustomerDetailView(customerID: item.id)
            }
        } label: {
            HStack(spacing: 12) {
                Image(systemName: item.kind.symbol)
                    .font(.footnote)
                    .foregroundStyle(item.kind.tint)
                    .frame(width: 30, height: 30)
                    .background(item.kind.tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.title).font(.subheadline.weight(.medium)).lineLimit(1)
                    Text(item.subtitle).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
                }
                Spacer()
                Text(Format.relative(item.viewedAt))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
    }
}
