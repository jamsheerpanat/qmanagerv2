import SwiftUI

/// Creates a direct invoice. (Invoices can also be generated from an accepted
/// quotation via the quotation detail screen, which copies its line items.)
struct NewInvoiceView: View {
    let onCreated: (String) -> Void

    @Environment(SessionStore.self) private var session
    @Environment(CatalogStore.self) private var catalog
    @Environment(\.dismiss) private var dismiss

    @State private var customerID = ""
    @State private var serviceTypeID = ""
    @State private var invoiceType: InvoiceType = .direct
    @State private var currency = "KWD"
    @State private var dueDate = Date().addingTimeInterval(30 * 86_400)
    @State private var hasDueDate = true
    @State private var notes = ""
    @State private var terms = ""
    @State private var discountType: DiscountType = .percentage
    @State private var discountValue: Double = 0
    @State private var items: [ItemDraft] = []

    @State private var isSaving = false
    @State private var errorMessage: String?

    private var subtotal: Double {
        items.filter { !$0.isHeading }.reduce(0) { $0 + $1.lineTotal }
    }

    private var discountAmount: Double {
        guard discountValue > 0 else { return 0 }
        return discountType == .percentage ? subtotal * (discountValue / 100) : discountValue
    }

    private var canSave: Bool { !customerID.isEmpty && !isSaving }

    var body: some View {
        NavigationStack {
            Form {
                Section("Customer") {
                    Picker("Customer", selection: $customerID) {
                        Text("Select…").tag("")
                        ForEach(catalog.customers) {
                            Text("\($0.displayName) (\($0.customerCode))").tag($0.id)
                        }
                    }
                    .pickerStyle(.navigationLink)
                }

                Section("Invoice") {
                    Picker("Type", selection: $invoiceType) {
                        ForEach(InvoiceType.allCases.filter { $0 != .unknown }, id: \.self) {
                            Text($0.label).tag($0)
                        }
                    }
                    Picker("Service type", selection: $serviceTypeID) {
                        Text("None").tag("")
                        ForEach(catalog.serviceTypes) { Text($0.name).tag($0.id) }
                    }
                    Picker("Currency", selection: $currency) {
                        ForEach(["KWD", "AED", "USD", "EUR", "SAR"], id: \.self) { Text($0).tag($0) }
                    }
                    Toggle("Has due date", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker("Due", selection: $dueDate, displayedComponents: .date)
                    }
                }

                Section("Line Items") {
                    ItemEditor(
                        items: $items,
                        currency: currency,
                        serviceTypeID: serviceTypeID.nilIfBlank
                    )
                    .listRowInsets(EdgeInsets(top: 8, leading: 8, bottom: 8, trailing: 8))
                }

                Section("Discount") {
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
                        currency: currency,
                        isTotal: true
                    )
                }

                Section("Notes & Terms") {
                    TextField("Notes", text: $notes, axis: .vertical).lineLimit(2...5)
                    TextField("Terms", text: $terms, axis: .vertical).lineLimit(2...5)
                }

                if let errorMessage {
                    Section {
                        Label(errorMessage, systemImage: "exclamationmark.triangle")
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("New Invoice")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") { Task { await save() } }.disabled(!canSave)
                }
            }
            .overlay { if isSaving { LoadingState(message: "Creating…") } }
            .task { await catalog.loadIfNeeded() }
        }
    }

    private func save() async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        // InvoiceItemDto requires a non-optional `description`, unlike the
        // quotation DTO where the title lives in `sectionTitle`.
        struct InvoiceItemPayload: Encodable, Sendable {
            let itemType: String
            let description: String
            let quantity: Double
            let unit: String
            let unitPrice: Double
            let discountType: String?
            let discountValue: Double?
            let taxRate: Double
            let sortOrder: Int
        }

        struct Payload: Encodable, Sendable {
            let companyId: String
            let customerId: String
            let serviceTypeId: String?
            let invoiceType: String
            let currency: String
            let dueDate: String?
            let notes: String?
            let terms: String?
            let discountType: String?
            let discountValue: Double?
            let items: [InvoiceItemPayload]
        }

        guard let companyID = session.user?.companyId else { return }

        let payloadItems = items.enumerated().map { index, draft in
            InvoiceItemPayload(
                itemType: draft.itemType.rawValue,
                description: draft.sectionTitle.nilIfBlank
                    ?? draft.description.nilIfBlank
                    ?? "Item",
                quantity: draft.isHeading ? 0 : draft.quantity,
                unit: draft.unit,
                unitPrice: draft.isHeading ? 0 : draft.unitPrice,
                discountType: draft.discountValue > 0 ? draft.discountType.rawValue : nil,
                discountValue: draft.discountValue > 0 ? draft.discountValue : nil,
                taxRate: draft.isHeading ? 0 : draft.taxRate,
                sortOrder: index
            )
        }

        do {
            let invoice = try await APIClient.shared.post(
                "invoices",
                body: Payload(
                    companyId: companyID,
                    customerId: customerID,
                    serviceTypeId: serviceTypeID.nilIfBlank,
                    invoiceType: invoiceType.rawValue,
                    currency: currency,
                    dueDate: hasDueDate ? ISO8601DateFormatter().string(from: dueDate) : nil,
                    notes: notes.nilIfBlank,
                    terms: terms.nilIfBlank,
                    discountType: discountValue > 0 ? discountType.rawValue : nil,
                    discountValue: discountValue > 0 ? discountValue : nil,
                    items: payloadItems
                ),
                as: Invoice.self
            )
            onCreated(invoice.id)
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}
