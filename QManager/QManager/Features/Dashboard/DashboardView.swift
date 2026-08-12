import SwiftUI
import Charts

@MainActor
@Observable
final class DashboardModel {
    var kpis: DashboardKPIs?
    var charts: DashboardCharts?
    var insights: [Insight] = []
    var error: Error?
    var isLoading = false
    var lastUpdated: Date?
    var isShowingCachedData = false

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    /// Paint from cache first so the dashboard is never a spinner on launch,
    /// then refresh in the background.
    func loadCached() async {
        kpis = await api.cached("reports/dashboard", as: DashboardKPIs.self)
        charts = await api.cached("reports/charts", as: DashboardCharts.self)
        await rebuildInsights(fromCacheOnly: true)
        if kpis != nil {
            isShowingCachedData = true
            lastUpdated = await api.cacheDate("reports/dashboard")
        }
    }

    func load(can: (Permission) -> Bool) async {
        isLoading = true
        defer { isLoading = false }

        do {
            async let kpis = api.get(
                "reports/dashboard", as: DashboardKPIs.self, cacheKey: "reports/dashboard"
            )
            async let charts = api.get(
                "reports/charts", as: DashboardCharts.self, cacheKey: "reports/charts"
            )
            self.kpis = try await kpis
            self.charts = try await charts
            error = nil
            isShowingCachedData = false
            lastUpdated = Date()
        } catch {
            // Keep whatever cache painted; only report if there is nothing.
            if kpis == nil { self.error = error }
        }

        await refreshInsights(can: can)
    }

    private func refreshInsights(can: (Permission) -> Bool) async {
        var quotations: [Quotation] = []
        var invoices: [Invoice] = []

        if can(.quotationsView) {
            quotations = (try? await api.get(
                "quotations", as: [Quotation].self, cacheKey: "quotations"
            )) ?? []
        }
        if can(.invoicesView) {
            invoices = (try? await api.get(
                "invoices", as: [Invoice].self, cacheKey: "invoices"
            )) ?? []
        }

        insights = InsightEngine.build(quotations: quotations, invoices: invoices)
    }

    private func rebuildInsights(fromCacheOnly: Bool) async {
        let quotations = await api.cached("quotations", as: [Quotation].self) ?? []
        let invoices = await api.cached("invoices", as: [Invoice].self) ?? []
        if !quotations.isEmpty || !invoices.isEmpty {
            insights = InsightEngine.build(quotations: quotations, invoices: invoices)
        }
    }
}

struct DashboardView: View {
    @Environment(SessionStore.self) private var session
    @Environment(RecentsStore.self) private var recents
    @Environment(QuickActionRouter.self) private var shortcutRouter
    @Binding var unreadCount: Int

    @State private var model = DashboardModel()
    @State private var notifications = NotificationsModel()
    @State private var showsSearch = false
    @State private var showsNewQuotation = false
    @State private var showsInvoices = false
    @State private var createdQuotationID: String?

    private var currency: String { "KWD" }

    var body: some View {
        NavigationStack {
            Group {
                if model.kpis == nil, model.isLoading {
                    LoadingState(message: "Loading your dashboard…")
                } else if let error = model.error, model.kpis == nil {
                    ErrorState(error: error) { Task { await reload() } }
                } else {
                    content
                }
            }
            .navigationTitle(greeting)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        Haptics.tap()
                        showsSearch = true
                    } label: {
                        Image(systemName: "magnifyingglass")
                    }
                    .accessibilityLabel("Search everything")
                }

                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink {
                        NotificationCenterView(unreadCount: $unreadCount)
                    } label: {
                        Image(systemName: unreadCount > 0 ? "bell.badge" : "bell")
                            .symbolRenderingMode(unreadCount > 0 ? .multicolor : .monochrome)
                    }
                }
            }
            .refreshable {
                await reload()
                Haptics.tap()
            }
            .task {
                if model.kpis == nil { await model.loadCached() }
                await reload()
            }
            .sheet(isPresented: $showsSearch) { GlobalSearchView() }
            // Home-screen shortcut (long-press the app icon).
            .onChange(of: shortcutRouter.pending) { _, action in
                guard let action = shortcutRouter.consume() else { return }
                switch action {
                case .newQuotation: showsNewQuotation = true
                case .search: showsSearch = true
                case .invoices: showsInvoices = true
                }
            }
            .navigationDestination(isPresented: $showsInvoices) { InvoiceListView() }
            .sheet(isPresented: $showsNewQuotation) {
                NewQuotationView { id in
                    createdQuotationID = id
                    Haptics.success()
                }
            }
            .navigationDestination(item: $createdQuotationID) { id in
                QuotationDetailView(quotationID: id)
            }
            .navigationDestination(for: Insight.Target.self) { target in
                switch target {
                case .quotation(let id): QuotationDetailView(quotationID: id)
                case .invoice(let id): InvoiceDetailView(invoiceID: id)
                case .quotationList: QuotationListView()
                case .invoiceList: InvoiceListView()
                }
            }
        }
    }

    private func reload() async {
        await model.load { session.can($0) }
        unreadCount = await notifications.fetchUnreadCount()
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let name = session.user?.name.split(separator: " ").first.map(String.init) ?? ""
        let part = switch hour {
        case 5..<12: "Good morning"
        case 12..<17: "Good afternoon"
        default: "Good evening"
        }
        return name.isEmpty ? part : "\(part), \(name)"
    }

    @ViewBuilder
    private var content: some View {
        ScrollView {
            VStack(spacing: 18) {
                if model.isShowingCachedData {
                    offlineBanner
                }

                quickActions

                if !model.insights.isEmpty {
                    insightsCard
                }

                if !recents.items.isEmpty {
                    recentsCard
                }

                if let kpis = model.kpis {
                    pipelineTiles(kpis)
                    moneyCard(kpis)
                }

                if let charts = model.charts {
                    if !charts.funnel.isEmpty { funnelCard(charts.funnel) }
                    if !charts.quotationStatusChart.isEmpty {
                        statusCard(charts.quotationStatusChart)
                    }
                    if !charts.leadSourceChart.isEmpty {
                        leadSourceCard(charts.leadSourceChart)
                    }
                }

                if let lastUpdated = model.lastUpdated {
                    Text("Updated \(Format.relative(lastUpdated))")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .padding(.top, 4)
                }
            }
            .padding(16)
        }
        .background(Color(.systemGroupedBackground))
    }

    private var offlineBanner: some View {
        Label(
            "Showing saved data — couldn't reach the server",
            systemImage: "wifi.slash"
        )
        .font(.caption)
        .foregroundStyle(.orange)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
    }

    // MARK: Quick actions

    private var quickActions: some View {
        HStack(spacing: 10) {
            if session.can(.quotationsCreate) {
                quickAction("New Quote", symbol: "doc.badge.plus", tint: Brand.primary) {
                    showsNewQuotation = true
                }
            }
            quickAction("Search", symbol: "magnifyingglass", tint: .teal) {
                showsSearch = true
            }
            if session.can(.quotationsView) {
                NavigationLink(value: Insight.Target.quotationList) {
                    quickActionLabel("Quotes", symbol: "doc.text", tint: .indigo)
                }
                .buttonStyle(.plain)
            }
            if session.can(.invoicesView) {
                NavigationLink(value: Insight.Target.invoiceList) {
                    quickActionLabel("Invoices", symbol: "doc.plaintext", tint: .blue)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func quickAction(
        _ title: String,
        symbol: String,
        tint: Color,
        action: @escaping () -> Void
    ) -> some View {
        Button {
            Haptics.tap()
            action()
        } label: {
            quickActionLabel(title, symbol: symbol, tint: tint)
        }
        .buttonStyle(.plain)
    }

    private func quickActionLabel(_ title: String, symbol: String, tint: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: symbol)
                .font(.title3)
                .foregroundStyle(tint)
            Text(title)
                .font(.caption2.weight(.medium))
                .foregroundStyle(.primary)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: Insights

    private var insightsCard: some View {
        Card("Needs Attention", symbol: "sparkles") {
            VStack(spacing: 8) {
                ForEach(model.insights) { insight in
                    NavigationLink(value: insight.target) {
                        HStack(spacing: 12) {
                            Image(systemName: insight.symbol)
                                .font(.footnote)
                                .foregroundStyle(insight.urgency.tint)
                                .frame(width: 32, height: 32)
                                .background(
                                    insight.urgency.tint.opacity(0.14),
                                    in: RoundedRectangle(cornerRadius: 8)
                                )

                            VStack(alignment: .leading, spacing: 2) {
                                Text(insight.title)
                                    .font(.subheadline.weight(.medium))
                                    .foregroundStyle(.primary)
                                Text(insight.detail)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        .padding(.vertical, 4)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var recentsCard: some View {
        Card("Recent", symbol: "clock.arrow.circlepath") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(recents.items) { item in
                        NavigationLink {
                            switch item.kind {
                            case .quotation: QuotationDetailView(quotationID: item.id)
                            case .invoice: InvoiceDetailView(invoiceID: item.id)
                            case .customer: CustomerDetailView(customerID: item.id)
                            }
                        } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                Image(systemName: item.kind.symbol)
                                    .font(.caption)
                                    .foregroundStyle(item.kind.tint)
                                Text(item.title)
                                    .font(.caption.weight(.semibold))
                                    .lineLimit(1)
                                Text(item.subtitle)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(1)
                            }
                            .frame(width: 128, alignment: .leading)
                            .padding(10)
                            .background(
                                item.kind.tint.opacity(0.08),
                                in: RoundedRectangle(cornerRadius: 10)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    // MARK: KPIs

    private func pipelineTiles(_ kpis: DashboardKPIs) -> some View {
        LazyVGrid(
            columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)],
            spacing: 12
        ) {
            MetricTile(
                title: "Customers", value: "\(kpis.customers)",
                symbol: "building.2.fill", tint: .blue
            )
            MetricTile(
                title: "Leads", value: "\(kpis.leads)",
                symbol: "bolt.fill", tint: .orange
            )
            MetricTile(
                title: "Quotations", value: "\(kpis.quotations.total)",
                caption: "\(kpis.quotations.accepted) accepted",
                symbol: "doc.text.fill", tint: .indigo
            )
            MetricTile(
                title: "Awaiting Approval", value: "\(kpis.quotations.pending)",
                caption: kpis.quotations.pending > 0 ? "Needs attention" : "All clear",
                symbol: "clock.badge.exclamationmark.fill",
                tint: kpis.quotations.pending > 0 ? .red : .green
            )
        }
    }

    private func moneyCard(_ kpis: DashboardKPIs) -> some View {
        Card("Financials", symbol: "banknote") {
            VStack(spacing: 14) {
                HStack(spacing: 12) {
                    moneyPill("Quoted", kpis.quotations.value, tint: .indigo, symbol: "doc.text")
                    moneyPill("Invoiced", kpis.invoices.totalValue, tint: .blue, symbol: "doc.plaintext")
                }

                Divider()

                AmountRow(label: "Collected", amount: kpis.invoices.paid, currency: currency, tint: .green)
                AmountRow(label: "Outstanding", amount: kpis.invoices.outstanding, currency: currency, tint: .orange)

                if kpis.invoices.overdue > 0 {
                    AmountRow(label: "Overdue", amount: kpis.invoices.overdue, currency: currency, tint: .red)
                }

                if kpis.invoices.totalValue > 0 {
                    let fraction = min(max(kpis.invoices.paid / kpis.invoices.totalValue, 0), 1)
                    VStack(alignment: .leading, spacing: 5) {
                        ProgressView(value: fraction).tint(.green)
                        Text("\(Format.percent(fraction * 100, digits: 0)) of invoiced value collected")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
    }

    private func moneyPill(_ title: String, _ value: Double, tint: Color, symbol: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(title, systemImage: symbol)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(Format.compactMoney(value, currency: currency))
                .font(.headline)
                .foregroundStyle(tint)
                .minimumScaleFactor(0.6)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(tint.opacity(0.09), in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: Charts

    private func funnelCard(_ slices: [ChartSlice]) -> some View {
        Card("Sales Funnel", symbol: "line.3.horizontal.decrease") {
            Chart(slices) { slice in
                BarMark(
                    x: .value("Count", slice.value),
                    y: .value("Stage", slice.displayName)
                )
                .foregroundStyle(Brand.primary.gradient)
                .cornerRadius(6)
                .annotation(position: .trailing) {
                    Text("\(slice.value)")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
            }
            .chartXAxis(.hidden)
            .frame(height: CGFloat(slices.count) * 44)
        }
    }

    private func statusCard(_ slices: [ChartSlice]) -> some View {
        Card("Quotations by Status", symbol: "chart.pie") {
            Chart(slices) { slice in
                SectorMark(
                    angle: .value("Count", slice.value),
                    innerRadius: .ratio(0.6),
                    angularInset: 1.5
                )
                .foregroundStyle(by: .value("Status", slice.displayName))
                .cornerRadius(4)
            }
            .frame(height: 220)
            .chartLegend(position: .bottom, alignment: .leading, spacing: 8)
        }
    }

    private func leadSourceCard(_ slices: [ChartSlice]) -> some View {
        Card("Lead Sources", symbol: "antenna.radiowaves.left.and.right") {
            Chart(slices.sorted { $0.value > $1.value }) { slice in
                BarMark(
                    x: .value("Source", slice.displayName),
                    y: .value("Count", slice.value)
                )
                .foregroundStyle(Color.orange.gradient)
                .cornerRadius(5)
            }
            .frame(height: 180)
            .chartXAxis {
                AxisMarks(preset: .aligned, position: .bottom) { _ in
                    AxisValueLabel(orientation: .verticalReversed).font(.caption2)
                }
            }
        }
    }
}
