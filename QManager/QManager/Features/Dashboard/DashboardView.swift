import SwiftUI
import Charts

@MainActor
@Observable
final class DashboardModel {
    var kpis: DashboardKPIs?
    var charts: DashboardCharts?
    var error: Error?
    var isLoading = false

    private let api: APIClient

    init(api: APIClient = .shared) { self.api = api }

    func load() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Both panels are independent, so fetch them together.
            async let kpis = api.get("reports/dashboard", as: DashboardKPIs.self)
            async let charts = api.get("reports/charts", as: DashboardCharts.self)
            self.kpis = try await kpis
            self.charts = try await charts
            error = nil
        } catch {
            self.error = error
        }
    }
}

struct DashboardView: View {
    @Environment(SessionStore.self) private var session
    @Binding var unreadCount: Int

    @State private var model = DashboardModel()
    @State private var notifications = NotificationsModel()

    private var currency: String { "KWD" }

    var body: some View {
        NavigationStack {
            Group {
                if model.kpis == nil, model.isLoading {
                    LoadingState(message: "Loading your dashboard…")
                } else if let error = model.error, model.kpis == nil {
                    ErrorState(error: error) { Task { await model.load() } }
                } else {
                    content
                }
            }
            .navigationTitle(greeting)
            .toolbar {
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
                await model.load()
                unreadCount = await notifications.fetchUnreadCount()
            }
            .task {
                if model.kpis == nil { await model.load() }
                unreadCount = await notifications.fetchUnreadCount()
            }
        }
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
                if let kpis = model.kpis {
                    pipelineTiles(kpis)
                    moneyCard(kpis)
                }

                if let charts = model.charts {
                    if !charts.funnel.isEmpty {
                        funnelCard(charts.funnel)
                    }
                    if !charts.quotationStatusChart.isEmpty {
                        statusCard(charts.quotationStatusChart)
                    }
                    if !charts.leadSourceChart.isEmpty {
                        leadSourceCard(charts.leadSourceChart)
                    }
                }
            }
            .padding(16)
        }
        .background(Color(.systemGroupedBackground))
    }

    private func pipelineTiles(_ kpis: DashboardKPIs) -> some View {
        LazyVGrid(
            columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)],
            spacing: 12
        ) {
            MetricTile(
                title: "Customers",
                value: "\(kpis.customers)",
                symbol: "building.2.fill",
                tint: .blue
            )
            MetricTile(
                title: "Leads",
                value: "\(kpis.leads)",
                symbol: "bolt.fill",
                tint: .orange
            )
            MetricTile(
                title: "Quotations",
                value: "\(kpis.quotations.total)",
                caption: "\(kpis.quotations.accepted) accepted",
                symbol: "doc.text.fill",
                tint: .indigo
            )
            MetricTile(
                title: "Awaiting Approval",
                value: "\(kpis.quotations.pending)",
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
                    moneyPill(
                        "Quoted",
                        kpis.quotations.value,
                        tint: .indigo,
                        symbol: "doc.text"
                    )
                    moneyPill(
                        "Invoiced",
                        kpis.invoices.totalValue,
                        tint: .blue,
                        symbol: "doc.plaintext"
                    )
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
                        ProgressView(value: fraction)
                            .tint(.green)
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
                // Source names are long; turn the labels so they do not collide.
                AxisMarks(preset: .aligned, position: .bottom) { _ in
                    AxisValueLabel(orientation: .verticalReversed)
                        .font(.caption2)
                }
            }
        }
    }
}
