import SwiftUI

@MainActor
@Observable
final class InvoiceDetailModel {
    var invoice: Invoice?
    var loadError: Error?
    var actionError: String?
    var isBusy = false

    private let api: APIClient
    private let id: String

    init(id: String, api: APIClient = .shared) {
        self.id = id
        self.api = api
    }

    func load() async {
        do {
            invoice = try await api.get("invoices/\(id)", as: Invoice.self)
            loadError = nil
        } catch {
            loadError = error
        }
    }

    func issue() async {
        isBusy = true
        defer { isBusy = false }
        do {
            try await api.send("invoices/\(id)/issue", method: .post)
            await load()
        } catch {
            actionError = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func recordPayment(_ draft: PaymentDraft) async -> Bool {
        isBusy = true
        defer { isBusy = false }
        do {
            try await api.send("invoices/\(id)/payments", method: .post, body: draft)
            await load()
            return true
        } catch {
            actionError = (error as? APIError)?.errorDescription ?? error.localizedDescription
            return false
        }
    }
}

nonisolated struct PaymentDraft: Encodable, Sendable {
    var amount: Double
    var paymentMethod: String
    var referenceNumber: String?
    var notes: String?
}

struct InvoiceDetailView: View {
    let invoiceID: String
    let preview: Invoice?

    @Environment(SessionStore.self) private var session
    @Environment(RecentsStore.self) private var recents
    @State private var model: InvoiceDetailModel
    @State private var pdf = PDFDownloader()
    @State private var showsPaymentSheet = false

    init(invoiceID: String, preview: Invoice? = nil) {
        self.invoiceID = invoiceID
        self.preview = preview
        _model = State(initialValue: InvoiceDetailModel(id: invoiceID))
    }

    private var invoice: Invoice? { model.invoice ?? preview }

    var body: some View {
        Group {
            if let invoice {
                content(invoice)
            } else if let error = model.loadError {
                ErrorState(error: error) { Task { await model.load() } }
            } else {
                LoadingState()
            }
        }
        .navigationTitle(invoice?.displayNumber ?? "Invoice")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await model.load()
            if let invoice = model.invoice {
                recents.record(
                    .invoice,
                    id: invoice.id,
                    title: invoice.displayNumber,
                    subtitle: invoice.customer?.displayName ?? invoice.invoiceStatus.label
                )
            }
        }
        .refreshable { await model.load() }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                if session.can(.invoicesGeneratePDF) {
                    Button {
                        Task {
                            await pdf.generate(
                                path: "invoices/\(invoiceID)/generate-pdf",
                                name: invoice?.displayNumber ?? "invoice"
                            )
                        }
                    } label: {
                        if pdf.isWorking {
                            ProgressView()
                        } else {
                            Image(systemName: "arrow.down.doc")
                        }
                    }
                }
            }
        }
        .sheet(item: $pdf.fileURL.map()) { wrapper in
            PDFPreview(url: wrapper.url, title: invoice?.displayNumber ?? "Invoice")
        }
        .sheet(isPresented: $showsPaymentSheet) {
            if let invoice {
                RecordPaymentView(invoice: invoice) { draft in
                    let ok = await model.recordPayment(draft)
                    if ok { Haptics.success() } else { Haptics.error() }
                    return ok
                }
            }
        }
        .alert(
            "Action failed",
            isPresented: Binding(
                get: { model.actionError != nil },
                set: { if !$0 { model.actionError = nil } }
            )
        ) {
            Button("OK", role: .cancel) { model.actionError = nil }
        } message: {
            Text(model.actionError ?? "")
        }
    }

    @ViewBuilder
    private func content(_ invoice: Invoice) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                header(invoice)
                actions(invoice)

                if let items = invoice.items, !items.isEmpty {
                    Card("Line Items", symbol: "list.bullet") {
                        VStack(spacing: 0) {
                            ForEach(items.sorted { $0.sortOrder < $1.sortOrder }) { item in
                                if item.isHeading {
                                    Text(item.description.uppercased())
                                        .font(.caption.weight(.bold))
                                        .foregroundStyle(Brand.primary)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding(.top, 12)
                                        .padding(.bottom, 6)
                                } else {
                                    invoiceItemRow(item, currency: invoice.currency)
                                    Divider()
                                }
                            }
                        }
                    }
                }

                totals(invoice)

                if let payments = invoice.payments, !payments.isEmpty {
                    paymentsCard(payments, currency: invoice.currency)
                }

                if let notes = invoice.notes?.strippingHTML.nilIfBlank {
                    Card("Notes", symbol: "note.text") {
                        Text(notes).font(.subheadline)
                    }
                }
            }
            .padding(16)
        }
        .background(Color(.systemGroupedBackground))
    }

    private func header(_ invoice: Invoice) -> some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    StatusChip(
                        text: invoice.invoiceStatus.label,
                        tint: invoice.invoiceStatus.tint
                    )
                    StatusChip(
                        text: invoice.paymentStatus.label,
                        tint: invoice.paymentStatus.tint
                    )
                    Spacer()
                }

                if let title = invoice.quotation?.projectTitle?.nilIfBlank {
                    Text(title).font(.title3.weight(.semibold))
                }

                if let customer = invoice.customer {
                    HStack(spacing: 10) {
                        Avatar(name: customer.displayName, size: 34)
                        VStack(alignment: .leading, spacing: 1) {
                            Text(customer.displayName).font(.subheadline.weight(.medium))
                            Text(customer.customerCode)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(Format.money(invoice.grandTotal, currency: invoice.currency))
                        .font(.title.weight(.bold))
                        .foregroundStyle(Brand.primary)

                    if invoice.balanceAmount > 0.01 {
                        Text("\(Format.money(invoice.balanceAmount, currency: invoice.currency)) outstanding")
                            .font(.subheadline)
                            .foregroundStyle(.orange)
                    }
                }

                if invoice.paidAmount > 0 {
                    VStack(alignment: .leading, spacing: 4) {
                        ProgressView(value: invoice.paidFraction).tint(.green)
                        Text("\(Format.money(invoice.paidAmount, currency: invoice.currency)) received")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                if let dueDate = invoice.dueDate, let deadline = Format.deadline(dueDate) {
                    Label(
                        "Due \(Format.date(dueDate)) · \(deadline)",
                        systemImage: invoice.isOverdue ? "exclamationmark.triangle" : "calendar"
                    )
                    .font(.caption)
                    .foregroundStyle(invoice.isOverdue ? .red : .secondary)
                }
            }
        }
    }

    @ViewBuilder
    private func actions(_ invoice: Invoice) -> some View {
        let canIssue = session.can(.invoicesCreate) && invoice.invoiceStatus == .draft
        let canPay = session.can(.invoicesRecordPayment)
            && invoice.invoiceStatus != .draft
            && invoice.invoiceStatus != .cancelled
            && invoice.balanceAmount > 0.01

        if canIssue || canPay {
            Card {
                VStack(spacing: 10) {
                    if canIssue {
                        Button {
                            Task { await model.issue() }
                        } label: {
                            Label("Issue Invoice", systemImage: "checkmark.seal")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                    }

                    if canPay {
                        Button {
                            showsPaymentSheet = true
                        } label: {
                            Label("Record Payment", systemImage: "creditcard")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.green)
                    }
                }
                .disabled(model.isBusy)
                .overlay { if model.isBusy { ProgressView() } }
            }
        }
    }

    private func invoiceItemRow(_ item: InvoiceItem, currency: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            VStack(alignment: .leading, spacing: 3) {
                Text(item.description)
                    .font(.subheadline.weight(.medium))
                HStack(spacing: 6) {
                    Text("\(Format.quantity(item.quantity)) \(item.unit)")
                    Text("×")
                    Text(Format.money(item.unitPrice, currency: currency, showCode: false))
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
            }
            Spacer(minLength: 8)
            Text(Format.money(item.lineTotal, currency: currency, showCode: false))
                .font(.subheadline.weight(.semibold))
                .monospacedDigit()
        }
        .padding(.vertical, 8)
    }

    private func totals(_ invoice: Invoice) -> some View {
        Card("Summary", symbol: "sum") {
            VStack(spacing: 10) {
                AmountRow(label: "Subtotal", amount: invoice.subtotal, currency: invoice.currency)
                if invoice.discountAmount > 0 {
                    AmountRow(
                        label: "Discount",
                        amount: -invoice.discountAmount,
                        currency: invoice.currency,
                        tint: .red
                    )
                }
                if invoice.taxAmount > 0 {
                    AmountRow(label: "Tax", amount: invoice.taxAmount, currency: invoice.currency)
                }
                Divider()
                AmountRow(
                    label: "Total",
                    amount: invoice.grandTotal,
                    currency: invoice.currency,
                    isTotal: true
                )
                AmountRow(
                    label: "Paid",
                    amount: invoice.paidAmount,
                    currency: invoice.currency,
                    tint: .green
                )
                AmountRow(
                    label: "Balance",
                    amount: invoice.balanceAmount,
                    currency: invoice.currency,
                    isTotal: true,
                    tint: invoice.balanceAmount > 0.01 ? .orange : .green
                )
            }
        }
    }

    private func paymentsCard(_ payments: [Payment], currency: String) -> some View {
        Card("Payments", symbol: "creditcard") {
            VStack(spacing: 12) {
                ForEach(payments) { payment in
                    HStack(alignment: .top) {
                        Image(systemName: payment.paymentMethod.symbol)
                            .foregroundStyle(payment.isVerified ? .green : .orange)
                            .frame(width: 24)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(payment.paymentMethod.label)
                                .font(.subheadline.weight(.medium))
                            Text(Format.date(payment.paymentDate))
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                            if let reference = payment.referenceNumber?.nilIfBlank {
                                Text("Ref \(reference)")
                                    .font(.caption2)
                                    .foregroundStyle(.tertiary)
                            }
                            if !payment.isVerified {
                                StatusChip(text: "Unverified", tint: .orange)
                            }
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text(Format.money(payment.amount, currency: currency, showCode: false))
                                .font(.subheadline.weight(.semibold))
                                .monospacedDigit()
                            if let receipt = payment.receipt?.receiptNumber {
                                Text(receipt)
                                    .font(.caption2)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                    }
                }
            }
        }
    }
}

struct RecordPaymentView: View {
    let invoice: Invoice
    let onSubmit: (PaymentDraft) async -> Bool

    @Environment(\.dismiss) private var dismiss
    @State private var amountText = ""
    @State private var method: PaymentMethod = .bankTransfer
    @State private var reference = ""
    @State private var notes = ""
    @State private var isSubmitting = false

    private var amount: Double? {
        Double(amountText.replacingOccurrences(of: ",", with: ""))
    }

    /// The API rejects anything above the balance (with a small tolerance),
    /// so block it here rather than round-tripping for the error.
    private var validationMessage: String? {
        guard let amount else {
            return amountText.isEmpty ? nil : "Enter a valid number."
        }
        if amount <= 0 { return "Amount must be greater than zero." }
        if amount > invoice.balanceAmount + 0.01 {
            return "Cannot exceed the outstanding balance of \(Format.money(invoice.balanceAmount, currency: invoice.currency))."
        }
        return nil
    }

    private var canSubmit: Bool {
        amount != nil && validationMessage == nil && !isSubmitting
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack {
                        Text(invoice.currency)
                            .foregroundStyle(.secondary)
                        TextField("0.000", text: $amountText)
                            .keyboardType(.decimalPad)
                            .font(.title3.weight(.semibold))
                            .monospacedDigit()
                    }

                    Button("Pay full balance") {
                        amountText = Format.money(
                            invoice.balanceAmount,
                            currency: invoice.currency,
                            showCode: false
                        ).replacingOccurrences(of: ",", with: "")
                    }
                    .font(.footnote)
                } header: {
                    Text("Amount")
                } footer: {
                    if let validationMessage {
                        Text(validationMessage).foregroundStyle(.red)
                    } else {
                        Text("Outstanding: \(Format.money(invoice.balanceAmount, currency: invoice.currency))")
                    }
                }

                Section("Method") {
                    Picker("Payment method", selection: $method) {
                        ForEach(PaymentMethod.allCases) { option in
                            Label(option.label, systemImage: option.symbol).tag(option)
                        }
                    }
                    .pickerStyle(.menu)

                    TextField("Reference number", text: $reference)
                }

                Section("Notes") {
                    TextField("Optional", text: $notes, axis: .vertical)
                        .lineLimit(2...5)
                }
            }
            .navigationTitle("Record Payment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        guard let amount else { return }
                        isSubmitting = true
                        Task {
                            let ok = await onSubmit(
                                PaymentDraft(
                                    amount: amount,
                                    paymentMethod: method.rawValue,
                                    referenceNumber: reference.nilIfBlank,
                                    notes: notes.nilIfBlank
                                )
                            )
                            isSubmitting = false
                            if ok { dismiss() }
                        }
                    }
                    .disabled(!canSubmit)
                }
            }
        }
    }
}
