import SwiftUI

@MainActor
@Observable
final class InvoiceListModel {
    var phase: LoadPhase<[Invoice]> = .idle
    var search = ""
    var scope: Scope = .all
    var isStale = false

    enum Scope: String, CaseIterable, Identifiable {
        case all = "All"
        case unpaid = "Unpaid"
        case overdue = "Overdue"
        case paid = "Paid"
        var id: String { rawValue }
    }

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    var filtered: [Invoice] {
        let all = phase.value ?? []
        let term = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return all.filter { invoice in
            switch scope {
            case .all: break
            case .unpaid: if invoice.balanceAmount <= 0.01 { return false }
            case .overdue: if !invoice.isOverdue { return false }
            case .paid: if invoice.paymentStatus != .paid { return false }
            }

            guard !term.isEmpty else { return true }
            return invoice.displayNumber.lowercased().contains(term)
                || (invoice.customer?.displayName.lowercased().contains(term) ?? false)
        }
    }

    var outstandingTotal: Double {
        (phase.value ?? []).reduce(0) { $0 + $1.balanceAmount }
    }

    func loadCached() async {
        if phase.value == nil, let cached = await api.cached("invoices", as: [Invoice].self) {
            phase = .loaded(cached)
            isStale = true
        }
    }

    func load(showSpinner: Bool = true) async {
        if showSpinner, phase.value == nil { phase = .loading }
        do {
            phase = .loaded(
                try await api.get("invoices", as: [Invoice].self, cacheKey: "invoices")
            )
            isStale = false
        } catch {
            if phase.value == nil { phase = .failed(error) }
        }
    }
}

struct InvoiceListView: View {
    @Environment(SessionStore.self) private var session
    @State private var model = InvoiceListModel()
    @State private var showsNew = false
    @State private var createdID: String?

    var body: some View {
        NavigationStack {
            AsyncContent(
                phase: model.phase,
                emptyTitle: "No invoices",
                emptySymbol: "doc.plaintext",
                emptyMessage: "Invoices converted from quotations will appear here.",
                retry: { Task { await model.load() } }
            ) { _ in
                list
            }
            .navigationTitle("Invoices")
            .searchable(text: $model.search, prompt: "Invoice number or customer")
            .refreshable { await model.load(showSpinner: false) }
            .task {
                await model.loadCached()
                await model.load(showSpinner: model.phase.value == nil)
            }
            .toolbar {
                if session.can(.invoicesCreate) {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button { showsNew = true } label: { Image(systemName: "plus") }
                    }
                }
            }
            .sheet(isPresented: $showsNew) {
                NewInvoiceView { id in
                    createdID = id
                    Task { await model.load(showSpinner: false) }
                }
            }
            .navigationDestination(item: $createdID) { id in
                InvoiceDetailView(invoiceID: id)
            }
        }
    }

    private var list: some View {
        List {
            Section {
                Picker("Scope", selection: $model.scope) {
                    ForEach(InvoiceListModel.Scope.allCases) { scope in
                        Text(scope.rawValue).tag(scope)
                    }
                }
                .pickerStyle(.segmented)
                .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
            }
            .listRowBackground(Color.clear)

            if model.outstandingTotal > 0.01 {
                Section {
                    HStack {
                        Label("Total outstanding", systemImage: "exclamationmark.circle")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text(Format.money(model.outstandingTotal))
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(.orange)
                            .monospacedDigit()
                    }
                }
            }

            if model.filtered.isEmpty {
                ContentUnavailableView(
                    "Nothing matches",
                    systemImage: "line.3.horizontal.decrease.circle",
                    description: Text("Try a different filter or search term.")
                )
                .listRowBackground(Color.clear)
            } else {
                ForEach(model.filtered) { invoice in
                    NavigationLink(value: invoice) {
                        InvoiceRow(invoice: invoice)
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationDestination(for: Invoice.self) { invoice in
            InvoiceDetailView(invoiceID: invoice.id, preview: invoice)
        }
    }
}

struct InvoiceRow: View {
    let invoice: Invoice

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Text(invoice.displayNumber)
                    .font(.subheadline.weight(.semibold))
                Spacer()
                StatusChip(
                    text: invoice.isOverdue ? "Overdue" : invoice.invoiceStatus.label,
                    tint: invoice.isOverdue ? .red : invoice.invoiceStatus.tint
                )
            }

            if let customer = invoice.customer?.displayName {
                Text(customer)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            HStack {
                Text(Format.money(invoice.grandTotal, currency: invoice.currency))
                    .font(.subheadline.weight(.bold))
                    .monospacedDigit()

                Spacer()

                if invoice.balanceAmount > 0.01 {
                    Text("\(Format.money(invoice.balanceAmount, currency: invoice.currency, showCode: false)) due")
                        .font(.caption)
                        .foregroundStyle(.orange)
                } else if invoice.paymentStatus == .paid {
                    Label("Paid", systemImage: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundStyle(.green)
                }
            }

            if invoice.paidAmount > 0, invoice.balanceAmount > 0.01 {
                ProgressView(value: invoice.paidFraction)
                    .tint(.green)
            }
        }
        .padding(.vertical, 4)
    }
}
