import SwiftUI

@MainActor
@Observable
final class QuotationListModel {
    var phase: LoadPhase<[Quotation]> = .idle
    var search = ""
    var statusFilter: QuotationStatus?

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    var filtered: [Quotation] {
        let all = phase.value ?? []
        let term = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return all.filter { quotation in
            if let statusFilter, quotation.status != statusFilter { return false }
            guard !term.isEmpty else { return true }

            return quotation.quotationNumber.lowercased().contains(term)
                || (quotation.projectTitle?.lowercased().contains(term) ?? false)
                || (quotation.customer?.displayName.lowercased().contains(term) ?? false)
        }
    }

    /// Status values actually present, so the filter bar never offers a dead end.
    var availableStatuses: [QuotationStatus] {
        let present = Set((phase.value ?? []).map(\.status))
        return QuotationStatus.allCases.filter { present.contains($0) }
    }

    func load(showSpinner: Bool = true) async {
        if showSpinner, phase.value == nil { phase = .loading }
        do {
            phase = .loaded(try await api.get("quotations", as: [Quotation].self))
        } catch {
            if phase.value == nil { phase = .failed(error) }
        }
    }
}

struct QuotationListView: View {
    @Environment(SessionStore.self) private var session
    @State private var model = QuotationListModel()
    @State private var showsNew = false
    @State private var createdID: String?

    var body: some View {
        NavigationStack {
            AsyncContent(
                phase: model.phase,
                emptyTitle: "No quotations",
                emptySymbol: "doc.text",
                emptyMessage: "Quotations you create will appear here.",
                retry: { Task { await model.load() } }
            ) { _ in
                list
            }
            .navigationTitle("Quotations")
            .searchable(text: $model.search, prompt: "Number, project or customer")
            .refreshable { await model.load(showSpinner: false) }
            .task { if model.phase.value == nil { await model.load() } }
            .toolbar {
                if session.can(.quotationsCreate) {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button { showsNew = true } label: { Image(systemName: "plus") }
                    }
                }
            }
            .sheet(isPresented: $showsNew) {
                NewQuotationView { id in
                    createdID = id
                    Task { await model.load(showSpinner: false) }
                }
            }
            // Jump straight into whatever was just created.
            .navigationDestination(item: $createdID) { id in
                QuotationDetailView(quotationID: id)
            }
        }
    }

    private var list: some View {
        List {
            if !model.availableStatuses.isEmpty {
                Section {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            FilterChip(
                                title: "All",
                                isOn: model.statusFilter == nil,
                                tint: Brand.primary
                            ) {
                                model.statusFilter = nil
                            }

                            ForEach(model.availableStatuses, id: \.self) { status in
                                FilterChip(
                                    title: status.label,
                                    isOn: model.statusFilter == status,
                                    tint: status.tint
                                ) {
                                    model.statusFilter = model.statusFilter == status ? nil : status
                                }
                            }
                        }
                        .padding(.vertical, 2)
                    }
                    .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                }
                .listRowBackground(Color.clear)
            }

            if model.filtered.isEmpty {
                ContentUnavailableView.search(text: model.search)
                    .listRowBackground(Color.clear)
            } else {
                ForEach(model.filtered) { quotation in
                    NavigationLink(value: quotation) {
                        QuotationRow(quotation: quotation)
                    }
                }
            }
        }
        .listStyle(.plain)
        .navigationDestination(for: Quotation.self) { quotation in
            QuotationDetailView(quotationID: quotation.id, preview: quotation)
        }
    }
}

struct FilterChip: View {
    let title: String
    let isOn: Bool
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption.weight(.medium))
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .foregroundStyle(isOn ? .white : tint)
                .background(isOn ? tint : tint.opacity(0.12), in: Capsule())
        }
        .buttonStyle(.plain)
    }
}

struct QuotationRow: View {
    let quotation: Quotation

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Text(quotation.quotationNumber)
                    .font(.subheadline.weight(.semibold))

                if quotation.revisionNumber > 0 {
                    Text("Rev \(quotation.revisionNumber)")
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(.quaternary, in: RoundedRectangle(cornerRadius: 4))
                }

                if quotation.isLocked {
                    Image(systemName: "lock.fill")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }

                Spacer()

                StatusChip(
                    text: quotation.status.label,
                    tint: quotation.status.tint,
                    symbol: quotation.status.symbol
                )
            }

            if let title = quotation.projectTitle?.nilIfBlank {
                Text(title)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            HStack {
                if let customer = quotation.customer?.displayName {
                    Label(customer, systemImage: "building.2")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                Text(Format.money(quotation.grandTotal, currency: quotation.currency))
                    .font(.subheadline.weight(.bold))
                    .monospacedDigit()
            }
        }
        .padding(.vertical, 4)
    }
}
