import SwiftUI

/// Edits a DRAFT/REVISED quotation. Approved quotations are locked server-side
/// (`checkLock`), so this screen is only reachable for editable states.
struct EditQuotationView: View {
    let quotation: Quotation
    var onSaved: () -> Void

    @Environment(CatalogStore.self) private var catalog
    @Environment(\.dismiss) private var dismiss

    @State private var projectTitle: String
    @State private var projectLocation: String
    @State private var scopeSummary: String
    @State private var internalNotes: String
    @State private var discountType: DiscountType
    @State private var discountValue: Double
    @State private var items: [ItemDraft]
    @State private var terms: [TermDraft]

    @State private var isSaving = false
    @State private var errorMessage: String?

    init(quotation: Quotation, onSaved: @escaping () -> Void) {
        self.quotation = quotation
        self.onSaved = onSaved

        _projectTitle = State(initialValue: quotation.projectTitle ?? "")
        _projectLocation = State(initialValue: quotation.projectLocation ?? "")
        _scopeSummary = State(initialValue: (quotation.scopeSummary ?? "").strippingHTML)
        _internalNotes = State(initialValue: quotation.internalNotes ?? "")
        _discountType = State(initialValue: .percentage)
        _discountValue = State(initialValue: 0)
        _items = State(initialValue: (quotation.items ?? [])
            .sorted { $0.sortOrder < $1.sortOrder }
            .map(ItemDraft.init(from:)))
        _terms = State(initialValue: (quotation.terms ?? [])
            .sorted { $0.sortOrder < $1.sortOrder }
            .map { TermDraft(content: $0.content.strippingHTML, categoryId: $0.category?.id) })
    }

    private var subtotal: Double {
        items.filter { !$0.isHeading && !$0.isOptional }.reduce(0) { $0 + $1.lineTotal }
    }

    private var discountAmount: Double {
        guard discountValue > 0 else { return 0 }
        return discountType == .percentage ? subtotal * (discountValue / 100) : discountValue
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Project") {
                    TextField("Title", text: $projectTitle)
                    TextField("Location", text: $projectLocation)
                }

                Section("Scope of Work") {
                    TextField("Summary", text: $scopeSummary, axis: .vertical)
                        .lineLimit(3...10)
                }

                Section("Line Items") {
                    ItemEditor(
                        items: $items,
                        currency: quotation.currency,
                        serviceTypeID: quotation.serviceType?.id
                    )
                    .listRowInsets(EdgeInsets(top: 8, leading: 8, bottom: 8, trailing: 8))
                }

                Section("Global Discount") {
                    Picker("Type", selection: $discountType) {
                        Text("Percentage").tag(DiscountType.percentage)
                        Text("Flat amount").tag(DiscountType.flatAmount)
                    }
                    .pickerStyle(.segmented)

                    LabeledContent("Value") {
                        TextField("0", value: $discountValue, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }

                    AmountRow(
                        label: "Estimated total",
                        amount: subtotal - discountAmount,
                        currency: quotation.currency,
                        isTotal: true
                    )
                }

                Section("Terms") {
                    TermsPicker(terms: $terms)
                        .listRowInsets(EdgeInsets(top: 8, leading: 8, bottom: 8, trailing: 8))
                }

                Section("Internal Notes") {
                    TextField("Not shown to the customer", text: $internalNotes, axis: .vertical)
                        .lineLimit(2...6)
                }
            }
            .navigationTitle("Edit \(quotation.quotationNumber)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(isSaving)
                }
            }
            .overlay { if isSaving { LoadingState(message: "Saving…") } }
            .task { await catalog.loadIfNeeded() }
            .alert(
                "Could not save",
                isPresented: Binding(
                    get: { errorMessage != nil },
                    set: { if !$0 { errorMessage = nil } }
                )
            ) {
                Button("OK", role: .cancel) { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    private func save() async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        let api = APIClient.shared
        do {
            try await api.send(
                "quotations/\(quotation.id)",
                method: .patch,
                body: UpdateQuotationPayload(
                    projectTitle: projectTitle.nilIfBlank,
                    projectLocation: projectLocation.nilIfBlank,
                    scopeSummary: scopeSummary.nilIfBlank,
                    internalNotes: internalNotes.nilIfBlank,
                    discountType: discountValue > 0 ? discountType.rawValue : nil,
                    discountValue: discountValue > 0 ? discountValue : 0
                )
            )

            // Both collections are replace-all on the server.
            try await api.send(
                "quotations/\(quotation.id)/items",
                method: .post,
                body: items.enumerated().map { ItemPayload(draft: $1, sortOrder: $0) }
            )

            try await api.send(
                "quotations/\(quotation.id)/terms",
                method: .post,
                body: terms.enumerated().map {
                    TermPayload(content: $1.content, categoryId: $1.categoryId, sortOrder: $0)
                }
            )

            onSaved()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

/// Side-by-side revision comparison, backed by
/// `GET /quotations/:id/compare/:toId`.
struct CompareRevisionsView: View {
    let quotation: Quotation

    @State private var diff: RevisionDiff?
    @State private var error: Error?

    private var parentID: String? { quotation.parentQuotationId }

    var body: some View {
        Group {
            if parentID == nil {
                ContentUnavailableView(
                    "No earlier revision",
                    systemImage: "doc.on.doc",
                    description: Text("This is the first version of \(quotation.quotationNumber).")
                )
            } else if let diff {
                content(diff)
            } else if let error {
                ErrorState(error: error) { Task { await load() } }
            } else {
                LoadingState(message: "Comparing revisions…")
            }
        }
        .navigationTitle("Compare Versions")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
    }

    private func load() async {
        guard let parentID else { return }
        do {
            diff = try await APIClient.shared.get(
                "quotations/\(quotation.id)/compare/\(parentID)",
                as: RevisionDiff.self
            )
            error = nil
        } catch {
            self.error = error
        }
    }

    @ViewBuilder
    private func content(_ diff: RevisionDiff) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                Card("Value Change", symbol: "arrow.left.arrow.right") {
                    HStack(spacing: 12) {
                        revisionColumn(
                            "Rev \(diff.fromRevision)",
                            amount: diff.totalChanges.from,
                            tint: .secondary
                        )
                        Image(systemName: "arrow.right")
                            .foregroundStyle(.tertiary)
                        revisionColumn(
                            "Rev \(diff.toRevision)",
                            amount: diff.totalChanges.to,
                            tint: Brand.primary
                        )
                    }

                    let delta = diff.totalChanges.diff
                    HStack {
                        Image(systemName: delta >= 0 ? "arrow.up.right" : "arrow.down.right")
                        Text("\(delta >= 0 ? "+" : "")\(Format.money(delta, currency: quotation.currency))")
                            .fontWeight(.semibold)
                        Spacer()
                        Text("\(diff.itemCountChanges.from) → \(diff.itemCountChanges.to) items")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .font(.subheadline)
                    .foregroundStyle(delta >= 0 ? .green : .red)
                    .padding(.top, 4)
                }

                if !diff.addedItems.isEmpty {
                    changeCard("Added", items: diff.addedItems, tint: .green, symbol: "plus.circle.fill")
                }

                if !diff.removedItems.isEmpty {
                    changeCard("Removed", items: diff.removedItems, tint: .red, symbol: "minus.circle.fill")
                }

                if diff.addedItems.isEmpty && diff.removedItems.isEmpty {
                    Card {
                        Label(
                            "No line items were added or removed. Changes are limited to pricing, discounts or terms.",
                            systemImage: "info.circle"
                        )
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    }
                }
            }
            .padding(16)
        }
        .background(Color(.systemGroupedBackground))
    }

    private func revisionColumn(_ title: String, amount: Double, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.caption).foregroundStyle(.secondary)
            Text(Format.money(amount, currency: quotation.currency, showCode: false))
                .font(.headline)
                .foregroundStyle(tint)
                .minimumScaleFactor(0.6)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(tint.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
    }

    private func changeCard(_ title: String, items: [QuotationItem], tint: Color, symbol: String) -> some View {
        Card(title, symbol: symbol) {
            VStack(spacing: 10) {
                ForEach(items) { item in
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.title).font(.subheadline).lineLimit(2)
                            Text("Qty \(Format.quantity(item.quantity))")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(Format.money(item.lineTotal, currency: quotation.currency, showCode: false))
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(tint)
                            .monospacedDigit()
                    }
                }
            }
        }
    }
}
