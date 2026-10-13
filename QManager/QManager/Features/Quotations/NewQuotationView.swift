import SwiftUI

@MainActor
@Observable
final class NewQuotationModel {
    var customerID = ""
    var serviceTypeID = ""
    var projectTitle = ""
    var projectLocation = ""
    var currency = "KWD"
    var scopeSummary = ""
    var discountType: DiscountType = .percentage
    var discountValue: Double = 0
    var items: [ItemDraft] = []
    var terms: [TermDraft] = []

    var isSaving = false
    var errorMessage: String?

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    // MARK: Draft persistence

    private static let draftKey = "qmanager.quotationDraft"

    private struct Snapshot: Codable {
        var customerID: String
        var serviceTypeID: String
        var projectTitle: String
        var projectLocation: String
        var currency: String
        var scopeSummary: String
        var discountType: DiscountType
        var discountValue: Double
        var items: [ItemDraft]
        var terms: [TermDraft]
        var savedAt: Date
    }

    /// True when a previous session left unfinished work behind.
    static func hasSavedDraft() -> Bool {
        UserDefaults.standard.data(forKey: draftKey) != nil
    }

    static func savedDraftDate() -> Date? {
        guard
            let data = UserDefaults.standard.data(forKey: draftKey),
            let snapshot = try? JSONDecoder().decode(Snapshot.self, from: data)
        else { return nil }
        return snapshot.savedAt
    }

    /// Called as the user moves through the wizard. Cheap enough to run on
    /// every step change, and it means a crash or a phone call costs nothing.
    func saveDraft() {
        guard !isEmpty else { return }
        let snapshot = Snapshot(
            customerID: customerID, serviceTypeID: serviceTypeID,
            projectTitle: projectTitle, projectLocation: projectLocation,
            currency: currency, scopeSummary: scopeSummary,
            discountType: discountType, discountValue: discountValue,
            items: items, terms: terms, savedAt: Date()
        )
        if let data = try? JSONEncoder().encode(snapshot) {
            UserDefaults.standard.set(data, forKey: Self.draftKey)
        }
    }

    func restoreDraft() {
        guard
            let data = UserDefaults.standard.data(forKey: Self.draftKey),
            let snapshot = try? JSONDecoder().decode(Snapshot.self, from: data)
        else { return }

        customerID = snapshot.customerID
        serviceTypeID = snapshot.serviceTypeID
        projectTitle = snapshot.projectTitle
        projectLocation = snapshot.projectLocation
        currency = snapshot.currency
        scopeSummary = snapshot.scopeSummary
        discountType = snapshot.discountType
        discountValue = snapshot.discountValue
        items = snapshot.items
        terms = snapshot.terms
    }

    func discardDraft() {
        UserDefaults.standard.removeObject(forKey: Self.draftKey)
    }

    private var isEmpty: Bool {
        customerID.isEmpty && projectTitle.isEmpty && items.isEmpty && terms.isEmpty
    }

    var subtotal: Double {
        items.filter { !$0.isHeading && !$0.isOptional }.reduce(0) { $0 + $1.lineTotal }
    }

    var globalDiscountAmount: Double {
        guard discountValue > 0 else { return 0 }
        return discountType == .percentage ? subtotal * (discountValue / 100) : discountValue
    }

    var grandTotal: Double { subtotal - globalDiscountAmount }

    func canAdvance(from step: Int) -> Bool {
        switch step {
        case 0: !customerID.isEmpty
        case 1: !serviceTypeID.isEmpty && !projectTitle.trimmingCharacters(in: .whitespaces).isEmpty
        default: true
        }
    }

    /// Creates the quotation, then pushes items and terms.
    ///
    /// The API models these as separate replace-all endpoints rather than one
    /// nested create, so this is three sequential calls by design.
    func save(companyID: String) async -> String? {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        do {
            let quotation = try await api.post(
                "quotations",
                body: CreateQuotationPayload(
                    companyId: companyID,
                    customerId: customerID,
                    serviceTypeId: serviceTypeID,
                    projectTitle: projectTitle.nilIfBlank,
                    projectLocation: projectLocation.nilIfBlank,
                    scopeSummary: scopeSummary.nilIfBlank,
                    currency: currency,
                    discountType: discountValue > 0 ? discountType.rawValue : nil,
                    discountValue: discountValue > 0 ? discountValue : nil
                ),
                as: Quotation.self
            )

            if !items.isEmpty {
                let payload = items.enumerated().map { ItemPayload(draft: $1, sortOrder: $0) }
                try await api.send("quotations/\(quotation.id)/items", method: .post, body: payload)
            }

            // Only override the service-type defaults the server already
            // applied if the user actually chose terms here.
            if !terms.isEmpty {
                let payload = terms.enumerated().map {
                    TermPayload(content: $1.content, categoryId: $1.categoryId, sortOrder: $0)
                }
                try await api.send("quotations/\(quotation.id)/terms", method: .post, body: payload)
            }

            discardDraft()
            return quotation.id
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
            return nil
        }
    }
}

struct NewQuotationView: View {
    var onCreated: (String) -> Void

    @Environment(SessionStore.self) private var session
    @Environment(CatalogStore.self) private var catalog
    @Environment(\.dismiss) private var dismiss

    @State private var model = NewQuotationModel()
    @State private var step = 0
    @State private var showsResumePrompt = false

    private let steps = ["Customer", "Project", "Items", "Terms", "Review"]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                StepBar(steps: steps, current: step)
                    .padding(.horizontal)
                    .padding(.vertical, 10)

                Divider()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        content
                    }
                    .padding(16)
                }

                Divider()
                footer
            }
            .navigationTitle("New Quotation")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .task {
                await catalog.loadIfNeeded()
                showsResumePrompt = NewQuotationModel.hasSavedDraft()
            }
            // Autosave as the user advances, so an interruption costs nothing.
            .onChange(of: step) { _, _ in model.saveDraft() }
            .confirmationDialog(
                "Resume unfinished quotation?",
                isPresented: $showsResumePrompt,
                titleVisibility: .visible
            ) {
                Button("Resume") {
                    model.restoreDraft()
                    Haptics.tap()
                }
                Button("Start Fresh", role: .destructive) { model.discardDraft() }
            } message: {
                if let date = NewQuotationModel.savedDraftDate() {
                    Text("You have a draft from \(Format.relative(date)).")
                }
            }
            .overlay {
                if model.isSaving { LoadingState(message: "Creating quotation…") }
            }
            .alert(
                "Could not save",
                isPresented: Binding(
                    get: { model.errorMessage != nil },
                    set: { if !$0 { model.errorMessage = nil } }
                )
            ) {
                Button("OK", role: .cancel) { model.errorMessage = nil }
            } message: {
                Text(model.errorMessage ?? "")
            }
        }
    }

    @ViewBuilder
    private var content: some View {
        switch step {
        case 0: customerStep
        case 1: projectStep
        case 2: itemsStep
        case 3: termsStep
        default: reviewStep
        }
    }

    // MARK: Steps

    private var customerStep: some View {
        Card("Customer", symbol: "building.2") {
            if catalog.customers.isEmpty {
                Text(catalog.isLoading ? "Loading customers…" : "No customers yet.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            } else {
                Picker("Customer", selection: $model.customerID) {
                    Text("Select a customer").tag("")
                    ForEach(catalog.customers) { customer in
                        Text("\(customer.displayName) (\(customer.customerCode))")
                            .tag(customer.id)
                    }
                }
                .pickerStyle(.navigationLink)
            }
        }
    }

    private var projectStep: some View {
        VStack(spacing: 16) {
            Card("Service", symbol: "square.grid.2x2") {
                Picker("Service type", selection: $model.serviceTypeID) {
                    Text("Select a service type").tag("")
                    ForEach(catalog.serviceTypes) { type in
                        Text(type.name).tag(type.id)
                    }
                }
                .pickerStyle(.navigationLink)
            }

            Card("Project", symbol: "text.alignleft") {
                VStack(spacing: 12) {
                    LabeledField("Title", text: $model.projectTitle, placeholder: "e.g. Villa Automation")
                    LabeledField("Location", text: $model.projectLocation, placeholder: "e.g. Al Nuzha, Kuwait")

                    Picker("Currency", selection: $model.currency) {
                        ForEach(["KWD", "AED", "USD", "EUR", "SAR"], id: \.self) { Text($0).tag($0) }
                    }
                }
            }
        }
    }

    private var itemsStep: some View {
        Card("Line Items", symbol: "list.bullet") {
            ItemEditor(
                items: $model.items,
                currency: model.currency,
                serviceTypeID: model.serviceTypeID.nilIfBlank
            )
        }
    }

    private var termsStep: some View {
        VStack(spacing: 16) {
            Card("Scope of Work", symbol: "doc.text") {
                TextField(
                    "Summarise what this project delivers…",
                    text: $model.scopeSummary,
                    axis: .vertical
                )
                .lineLimit(4...10)
                .font(.subheadline)
            }

            TermsPicker(terms: $model.terms)
        }
    }

    private var reviewStep: some View {
        VStack(spacing: 16) {
            Card("Summary", symbol: "checkmark.circle") {
                VStack(spacing: 10) {
                    DetailRow(
                        label: "Customer",
                        value: catalog.customers.first { $0.id == model.customerID }?.displayName
                    )
                    DetailRow(label: "Service", value: catalog.serviceName(for: model.serviceTypeID))
                    DetailRow(label: "Project", value: model.projectTitle)
                    DetailRow(label: "Items", value: "\(model.items.count)")
                    DetailRow(label: "Terms", value: "\(model.terms.count)")
                }
            }

            Card("Global Discount", symbol: "tag") {
                VStack(spacing: 12) {
                    Picker("Type", selection: $model.discountType) {
                        Text("Percentage").tag(DiscountType.percentage)
                        Text("Flat amount").tag(DiscountType.flatAmount)
                    }
                    .pickerStyle(.segmented)

                    LabeledContent("Value") {
                        TextField("0", value: $model.discountValue, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                }
            }

            Card("Totals", symbol: "sum") {
                VStack(spacing: 10) {
                    AmountRow(label: "Subtotal", amount: model.subtotal, currency: model.currency)
                    if model.globalDiscountAmount > 0 {
                        AmountRow(
                            label: "Discount",
                            amount: -model.globalDiscountAmount,
                            currency: model.currency,
                            tint: .red
                        )
                    }
                    Divider()
                    AmountRow(
                        label: "Estimated total",
                        amount: model.grandTotal,
                        currency: model.currency,
                        isTotal: true
                    )
                    Text("The server recalculates all totals on save.")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
            }
        }
    }

    // MARK: Footer

    private var footer: some View {
        HStack {
            Button("Back") { step -= 1 }
                .buttonStyle(.bordered)
                .disabled(step == 0)

            Spacer()

            if step < steps.count - 1 {
                Button("Next") { step += 1 }
                    .buttonStyle(.borderedProminent)
                    .disabled(!model.canAdvance(from: step))
            } else {
                Button {
                    Task {
                        guard let companyID = session.user?.companyId else { return }
                        if let id = await model.save(companyID: companyID) {
                            Haptics.success()
                            onCreated(id)
                            dismiss()
                        } else {
                            Haptics.error()
                        }
                    }
                } label: {
                    Label("Create Draft", systemImage: "checkmark")
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
                .disabled(model.isSaving)
            }
        }
        .padding(16)
    }
}

// MARK: - Shared bits

struct StepBar: View {
    let steps: [String]
    let current: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(Array(steps.enumerated()), id: \.offset) { index, title in
                VStack(spacing: 4) {
                    Capsule()
                        .fill(index <= current ? Brand.primary : Color.secondary.opacity(0.25))
                        .frame(height: 4)
                    Text(title)
                        .font(.caption2)
                        .foregroundStyle(index == current ? Brand.primary : .secondary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
            }
        }
    }
}

struct LabeledField: View {
    let label: String
    @Binding var text: String
    var placeholder: String = ""

    init(_ label: String, text: Binding<String>, placeholder: String = "") {
        self.label = label
        self._text = text
        self.placeholder = placeholder
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            TextField(placeholder, text: $text)
                .textFieldStyle(.roundedBorder)
        }
    }
}

/// Pick terms from groups or individual templates, then edit them freely.
struct TermsPicker: View {
    @Binding var terms: [TermDraft]
    @Environment(CatalogStore.self) private var catalog
    @State private var showsLibrary = false

    var body: some View {
        Card("Terms & Conditions", symbol: "doc.plaintext") {
            VStack(spacing: 12) {
                HStack {
                    Button {
                        showsLibrary = true
                    } label: {
                        Label("From Library", systemImage: "books.vertical")
                    }
                    .buttonStyle(.bordered)

                    Button {
                        terms.append(TermDraft())
                    } label: {
                        Label("Custom", systemImage: "plus")
                    }
                    .buttonStyle(.bordered)

                    Spacer()
                }

                if terms.isEmpty {
                    Text("None added — the service type's default terms will be applied automatically.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                } else {
                    ForEach($terms) { $term in
                        HStack(alignment: .top, spacing: 8) {
                            TextField("Clause", text: $term.content, axis: .vertical)
                                .lineLimit(2...6)
                                .font(.caption)
                                .textFieldStyle(.roundedBorder)

                            Button(role: .destructive) {
                                terms.removeAll { $0.id == term.id }
                            } label: {
                                Image(systemName: "trash")
                            }
                            .buttonStyle(.borderless)
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showsLibrary) {
            TermsLibrarySheet { picked in
                terms.append(contentsOf: picked)
            }
        }
    }
}

struct TermsLibrarySheet: View {
    let onAdd: ([TermDraft]) -> Void
    @Environment(CatalogStore.self) private var catalog
    @Environment(\.dismiss) private var dismiss
    @State private var selected: Set<String> = []

    var body: some View {
        NavigationStack {
            List {
                if !catalog.termsGroups.isEmpty {
                    Section("Groups") {
                        ForEach(catalog.termsGroups) { group in
                            Button {
                                onAdd((group.templates ?? []).map {
                                    TermDraft(content: $0.content, categoryId: $0.categoryId)
                                })
                                dismiss()
                            } label: {
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(group.name).font(.subheadline.weight(.medium))
                                        Text("\(group.templates?.count ?? 0) clauses")
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Image(systemName: "plus.circle")
                                }
                                .foregroundStyle(.primary)
                            }
                        }
                    }
                }

                Section("Individual clauses") {
                    if catalog.termsTemplates.isEmpty {
                        Text("No templates available.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    ForEach(catalog.termsTemplates) { template in
                        Button {
                            if selected.contains(template.id) {
                                selected.remove(template.id)
                            } else {
                                selected.insert(template.id)
                            }
                        } label: {
                            HStack(alignment: .top) {
                                Image(systemName: selected.contains(template.id)
                                      ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(selected.contains(template.id) ? Brand.primary : .secondary)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(template.title).font(.subheadline)
                                    Text(template.content.strippingHTML)
                                        .font(.caption2)
                                        .foregroundStyle(.secondary)
                                        .lineLimit(2)
                                }
                            }
                            .foregroundStyle(.primary)
                        }
                    }
                }
            }
            .navigationTitle("Terms Library")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add (\(selected.count))") {
                        onAdd(
                            catalog.termsTemplates
                                .filter { selected.contains($0.id) }
                                .map { TermDraft(content: $0.content, categoryId: $0.categoryId) }
                        )
                        dismiss()
                    }
                    .disabled(selected.isEmpty)
                }
            }
        }
    }
}
