import SwiftUI

@MainActor
@Observable
final class QuotationDetailModel {
    var quotation: Quotation?
    var readiness: QuotationReadiness?
    var loadError: Error?
    var actionError: String?
    var busyAction: String?
    var shareLink: String?

    private let api: APIClient
    private let id: String

    init(id: String, api: APIClient = .shared) {
        self.id = id
        self.api = api
    }

    func load() async {
        do {
            quotation = try await api.get("quotations/\(id)", as: Quotation.self)
            loadError = nil
            // Readiness is advisory; a failure here should not blank the screen.
            readiness = try? await api.get("quotations/\(id)/readiness", as: QuotationReadiness.self)
        } catch {
            loadError = error
        }
    }

    private func run(_ name: String, _ work: () async throws -> Void) async {
        busyAction = name
        actionError = nil
        defer { busyAction = nil }

        do {
            try await work()
            await load()
        } catch {
            actionError = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func submitForApproval() async {
        await run("submit") {
            try await api.send("quotations/\(id)/submit-for-approval", method: .post)
        }
    }

    func approve(comments: String) async {
        await run("approve") {
            try await api.send(
                "quotations/\(id)/approve",
                method: .post,
                body: ["comments": comments]
            )
        }
    }

    func reject(comments: String) async {
        await run("reject") {
            try await api.send(
                "quotations/\(id)/reject",
                method: .post,
                body: ["comments": comments]
            )
        }
    }

    func createRevision() async -> String? {
        busyAction = "revise"
        defer { busyAction = nil }
        do {
            let revision = try await api.post(
                "quotations/\(id)/create-revision",
                as: Quotation.self
            )
            return revision.id
        } catch {
            actionError = (error as? APIError)?.errorDescription ?? error.localizedDescription
            return nil
        }
    }

    func generateShareLink() async {
        busyAction = "share"
        defer { busyAction = nil }
        do {
            let response = try await api.post(
                "quotations/\(id)/generate-share-link",
                as: ShareLinkResponse.self
            )
            shareLink = response.portalLink
            await load()
        } catch {
            actionError = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func send(to email: String) async {
        await run("send") {
            try await api.send(
                "quotations/\(id)/send",
                method: .post,
                body: ["recipientEmail": email]
            )
        }
    }
}

struct QuotationDetailView: View {
    let quotationID: String
    let preview: Quotation?

    @Environment(SessionStore.self) private var session
    @Environment(RecentsStore.self) private var recents
    @State private var model: QuotationDetailModel
    @State private var pdf = PDFDownloader()
    @State private var commentPrompt: CommentPrompt?
    @State private var sendPrompt = false
    @State private var recipient = ""
    @State private var revisionID: String?
    @State private var showsEditor = false

    init(quotationID: String, preview: Quotation? = nil) {
        self.quotationID = quotationID
        self.preview = preview
        _model = State(initialValue: QuotationDetailModel(id: quotationID))
    }

    private struct CommentPrompt: Identifiable {
        let id = UUID()
        let isApproval: Bool
        var text = ""
    }

    private var quotation: Quotation? { model.quotation ?? preview }

    var body: some View {
        Group {
            if let quotation {
                content(quotation)
            } else if let error = model.loadError {
                ErrorState(error: error) { Task { await model.load() } }
            } else {
                LoadingState()
            }
        }
        .navigationTitle(quotation?.quotationNumber ?? "Quotation")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await model.load()
            if let quotation = model.quotation {
                recents.record(
                    .quotation,
                    id: quotation.id,
                    title: quotation.quotationNumber,
                    subtitle: quotation.customer?.displayName ?? quotation.status.label
                )
            }
        }
        .refreshable { await model.load() }
        .onChange(of: model.actionError) { _, message in
            if message != nil { Haptics.error() }
        }
        .toolbar { toolbarContent }
        .sheet(item: $pdf.fileURL.map()) { wrapper in
            PDFPreview(url: wrapper.url, title: quotation?.quotationNumber ?? "Quotation")
        }
        .sheet(item: $commentPrompt) { prompt in
            CommentSheet(
                title: prompt.isApproval ? "Approve Quotation" : "Reject Quotation",
                message: prompt.isApproval
                    ? "Approving locks the quotation. Further changes require a new revision."
                    : "Tell the requester why this was rejected.",
                confirmLabel: prompt.isApproval ? "Approve" : "Reject",
                isDestructive: !prompt.isApproval
            ) { comments in
                Task {
                    if prompt.isApproval {
                        await model.approve(comments: comments)
                    } else {
                        await model.reject(comments: comments)
                    }
                }
            }
        }
        .alert("Send to Customer", isPresented: $sendPrompt) {
            TextField("Email address", text: $recipient)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
            Button("Cancel", role: .cancel) {}
            Button("Send") {
                Task { await model.send(to: recipient) }
            }
            .disabled(!recipient.contains("@"))
        } message: {
            Text("A secure portal link will be emailed to the customer.")
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
        .navigationDestination(item: $revisionID) { id in
            QuotationDetailView(quotationID: id)
        }
        .sheet(isPresented: $showsEditor) {
            if let quotation = model.quotation {
                EditQuotationView(quotation: quotation) {
                    Task { await model.load() }
                }
            }
        }
    }

    // MARK: - Content

    @ViewBuilder
    private func content(_ quotation: Quotation) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                header(quotation)

                if let readiness = model.readiness,
                   !readiness.warnings.isEmpty,
                   !quotation.isLocked {
                    readinessCard(readiness)
                }

                actionBar(quotation)

                if let summary = quotation.scopeSummary?.strippingHTML.nilIfBlank {
                    Card("Scope of Work", symbol: "list.bullet.rectangle") {
                        Text(summary).font(.subheadline)
                    }
                }

                projectCard(quotation)

                if let items = quotation.items, !items.isEmpty {
                    itemsCard(items, currency: quotation.currency)
                }

                totalsCard(quotation)

                if session.can(.quotationsApprove), quotation.grossMargin != nil {
                    marginCard(quotation)
                }

                if let terms = quotation.terms, !terms.isEmpty {
                    termsCard(terms)
                }

                if let approvals = quotation.approvals, !approvals.isEmpty {
                    approvalsCard(approvals)
                }

                if let shares = quotation.shares, !shares.isEmpty {
                    sharesCard(shares)
                }
            }
            .padding(16)
        }
        .background(Color(.systemGroupedBackground))
    }

    private func header(_ quotation: Quotation) -> some View {
        Card {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    StatusChip(
                        text: quotation.status.label,
                        tint: quotation.status.tint,
                        symbol: quotation.status.symbol
                    )
                    if quotation.revisionNumber > 0 {
                        StatusChip(text: "Revision \(quotation.revisionNumber)", tint: .secondary)
                    }
                    if quotation.isLocked {
                        StatusChip(text: "Locked", tint: .secondary, symbol: "lock.fill")
                    }
                    Spacer()
                }

                if let title = quotation.projectTitle?.nilIfBlank {
                    Text(title).font(.title3.weight(.semibold))
                }

                if let customer = quotation.customer {
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

                Text(Format.money(quotation.grandTotal, currency: quotation.currency))
                    .font(.title.weight(.bold))
                    .foregroundStyle(Brand.primary)

                if let validUntil = quotation.validUntil,
                   let deadline = Format.deadline(validUntil) {
                    Label(
                        "Valid until \(Format.date(validUntil)) · \(deadline)",
                        systemImage: quotation.isExpired ? "exclamationmark.triangle" : "calendar"
                    )
                    .font(.caption)
                    .foregroundStyle(quotation.isExpired ? .red : .secondary)
                }
            }
        }
    }

    private func readinessCard(_ readiness: QuotationReadiness) -> some View {
        Card {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Label("Readiness", systemImage: "checklist")
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                    Text(Format.percent(readiness.score, digits: 0))
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(readiness.isReady ? .green : .orange)
                }

                ProgressView(value: readiness.score / 100)
                    .tint(readiness.isReady ? .green : .orange)

                ForEach(readiness.warnings, id: \.self) { warning in
                    Label(warning, systemImage: "exclamationmark.triangle.fill")
                        .font(.caption)
                        .foregroundStyle(.orange)
                }
            }
        }
    }

    private func projectCard(_ quotation: Quotation) -> some View {
        Card("Details", symbol: "info.circle") {
            VStack(spacing: 10) {
                DetailRow(label: "Service", value: quotation.serviceType?.name)
                DetailRow(label: "Location", value: quotation.projectLocation)
                DetailRow(label: "Issued", value: Format.date(quotation.issueDate))
                DetailRow(label: "Valid until", value: Format.date(quotation.validUntil))
                DetailRow(label: "Prepared by", value: quotation.createdBy?.name)
                if let contact = quotation.contact {
                    DetailRow(label: "Contact", value: contact.name)
                }
            }
        }
    }

    private func itemsCard(_ items: [QuotationItem], currency: String) -> some View {
        Card("Line Items", symbol: "list.bullet") {
            VStack(spacing: 0) {
                ForEach(items.sorted { $0.sortOrder < $1.sortOrder }) { item in
                    if item.isHeading {
                        Text(item.title.uppercased())
                            .font(.caption.weight(.bold))
                            .foregroundStyle(Brand.primary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.top, 12)
                            .padding(.bottom, 6)
                    } else {
                        LineItemRow(item: item, currency: currency)
                        Divider()
                    }
                }
            }
        }
    }

    private func totalsCard(_ quotation: Quotation) -> some View {
        Card("Commercial Summary", symbol: "sum") {
            VStack(spacing: 10) {
                AmountRow(label: "Subtotal", amount: quotation.subtotal, currency: quotation.currency)
                if quotation.discountAmount > 0 {
                    AmountRow(
                        label: "Discount",
                        amount: -quotation.discountAmount,
                        currency: quotation.currency,
                        tint: .red
                    )
                }
                if quotation.taxAmount > 0 {
                    AmountRow(label: "Tax", amount: quotation.taxAmount, currency: quotation.currency)
                }
                Divider()
                AmountRow(
                    label: "Grand Total",
                    amount: quotation.grandTotal,
                    currency: quotation.currency,
                    isTotal: true
                )
            }
        }
    }

    private func marginCard(_ quotation: Quotation) -> some View {
        let margin = quotation.grossMargin ?? 0
        return Card("Profitability", symbol: "chart.line.uptrend.xyaxis") {
            VStack(spacing: 10) {
                AmountRow(
                    label: "Estimated cost",
                    amount: quotation.totalCost ?? 0,
                    currency: quotation.currency
                )
                AmountRow(
                    label: "Gross margin",
                    amount: margin,
                    currency: quotation.currency,
                    isTotal: true,
                    tint: margin < 0 ? .red : .green
                )
                if let percent = quotation.marginPercent {
                    Text("\(Format.percent(percent)) margin")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
                if margin < 0 {
                    Label(
                        "This quotation is priced below cost.",
                        systemImage: "exclamationmark.octagon.fill"
                    )
                    .font(.caption)
                    .foregroundStyle(.red)
                }
            }
        }
    }

    private func termsCard(_ terms: [QuotationTerm]) -> some View {
        Card("Terms & Conditions", symbol: "doc.plaintext") {
            VStack(alignment: .leading, spacing: 10) {
                ForEach(Array(terms.sorted { $0.sortOrder < $1.sortOrder }.enumerated()), id: \.element.id) { index, term in
                    HStack(alignment: .top, spacing: 8) {
                        Text("\(index + 1).")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(Brand.primary)
                        Text(term.content.strippingHTML)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
    }

    private func approvalsCard(_ approvals: [Approval]) -> some View {
        Card("Approval History", symbol: "checkmark.seal") {
            VStack(spacing: 10) {
                ForEach(approvals) { approval in
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(approval.status.capitalized)
                                .font(.subheadline.weight(.medium))
                            if let by = approval.approver?.name ?? approval.requestedBy?.name {
                                Text(by).font(.caption).foregroundStyle(.secondary)
                            }
                            if let comments = approval.comments?.nilIfBlank {
                                Text(comments).font(.caption2).foregroundStyle(.tertiary)
                            }
                        }
                        Spacer()
                        Text(Format.relative(approval.approvedAt ?? approval.rejectedAt ?? approval.requestedAt))
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
            }
        }
    }

    private func sharesCard(_ shares: [Share]) -> some View {
        Card("Customer Activity", symbol: "paperplane") {
            VStack(spacing: 10) {
                ForEach(shares) { share in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(share.recipientEmail == "share-link" ? "Share link" : share.recipientEmail)
                                .font(.subheadline)
                                .lineLimit(1)
                            Text("Sent \(Format.relative(share.sentAt))")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        StatusChip(
                            text: share.viewedAt == nil ? "Unopened" : "Viewed",
                            tint: share.viewedAt == nil ? .secondary : .green
                        )
                    }
                }
            }
        }
    }

    // MARK: - Actions

    @ViewBuilder
    private func actionBar(_ quotation: Quotation) -> some View {
        let canSubmit = session.can(.quotationsApprove) && quotation.status.isEditable
        let canDecide = session.can(.quotationsApprove) && quotation.status == .pendingApproval
        let canRevise = session.can(.quotationsRevise) && quotation.isLocked

        let canEdit = session.can(.quotationsUpdate) && !quotation.isLocked && quotation.status.isEditable

        if canSubmit || canDecide || canRevise || canEdit {
            Card {
                VStack(spacing: 10) {
                    if canEdit {
                        Button {
                            showsEditor = true
                        } label: {
                            Label("Edit Quotation", systemImage: "square.and.pencil")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                    }

                    if quotation.parentQuotationId != nil {
                        NavigationLink {
                            CompareRevisionsView(quotation: quotation)
                        } label: {
                            Label("Compare Versions", systemImage: "arrow.left.arrow.right")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                    }

                    if canDecide {
                        HStack(spacing: 10) {
                            Button {
                                commentPrompt = CommentPrompt(isApproval: false)
                            } label: {
                                Label("Reject", systemImage: "xmark.circle")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.bordered)
                            .tint(.red)

                            Button {
                                commentPrompt = CommentPrompt(isApproval: true)
                            } label: {
                                Label("Approve", systemImage: "checkmark.circle")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.green)
                        }
                    }

                    if canSubmit {
                        Button {
                            Task { await model.submitForApproval() }
                        } label: {
                            Label("Submit for Approval", systemImage: "paperplane")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                    }

                    if canRevise {
                        Button {
                            Task { revisionID = await model.createRevision() }
                        } label: {
                            Label(
                                "Create Revision \(quotation.revisionNumber + 1)",
                                systemImage: "doc.badge.plus"
                            )
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .disabled(model.busyAction != nil)
                .overlay {
                    if model.busyAction != nil { ProgressView() }
                }
            }
        }
    }

    @ToolbarContentBuilder
    private var toolbarContent: some ToolbarContent {
        ToolbarItem(placement: .topBarTrailing) {
            Menu {
                if session.can(.quotationsGeneratePDF) {
                    Button {
                        Task {
                            await pdf.generate(
                                path: "quotations/\(quotationID)/generate-pdf",
                                name: quotation?.quotationNumber ?? "quotation"
                            )
                        }
                    } label: {
                        Label("Generate PDF", systemImage: "arrow.down.doc")
                    }
                }

                if session.can(.quotationsSend) {
                    Button {
                        Task { await model.generateShareLink() }
                    } label: {
                        Label("Create Share Link", systemImage: "link")
                    }

                    Button {
                        recipient = quotation?.customer?.email ?? ""
                        sendPrompt = true
                    } label: {
                        Label("Email to Customer", systemImage: "envelope")
                    }
                }

                if let link = model.shareLink {
                    ShareLink(item: link) {
                        Label("Share Portal Link", systemImage: "square.and.arrow.up")
                    }
                }
            } label: {
                if pdf.isWorking || model.busyAction == "share" {
                    ProgressView()
                } else {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
    }
}

struct LineItemRow: View {
    let item: QuotationItem
    let currency: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            VStack(alignment: .leading, spacing: 3) {
                Text(item.title)
                    .font(.subheadline.weight(.medium))

                if let subtitle = item.subtitle {
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                HStack(spacing: 6) {
                    Text("\(Format.quantity(item.quantity)) \(item.unit)")
                    Text("×")
                    Text(Format.money(item.unitPrice, currency: currency, showCode: false))
                    if item.discountAmount > 0 {
                        Text("− \(Format.money(item.discountAmount, currency: currency, showCode: false))")
                            .foregroundStyle(.red)
                    }
                }
                .font(.caption2)
                .foregroundStyle(.secondary)

                if item.isOptional {
                    StatusChip(text: "Optional", tint: .orange)
                }
            }

            Spacer(minLength: 8)

            Text(Format.money(item.lineTotal, currency: currency, showCode: false))
                .font(.subheadline.weight(.semibold))
                .monospacedDigit()
        }
        .padding(.vertical, 8)
    }
}

/// Shared approve/reject comment sheet.
struct CommentSheet: View {
    let title: String
    let message: String
    let confirmLabel: String
    var isDestructive = false
    let onConfirm: (String) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var text = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Comments", text: $text, axis: .vertical)
                        .lineLimit(3...8)
                } footer: {
                    Text(message)
                }
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(confirmLabel, role: isDestructive ? .destructive : nil) {
                        onConfirm(text)
                        dismiss()
                    }
                    .disabled(isDestructive && text.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .presentationDetents([.medium])
    }
}

/// Wraps a `URL` so it can drive an `item:`-style sheet.
struct IdentifiableURL: Identifiable {
    let url: URL
    var id: String { url.absoluteString }
}

extension Binding where Value == URL? {
    /// Bridges an optional URL into the `Identifiable` a sheet needs.
    func map() -> Binding<IdentifiableURL?> {
        Binding<IdentifiableURL?>(
            get: { wrappedValue.map(IdentifiableURL.init) },
            set: { wrappedValue = $0?.url }
        )
    }
}
