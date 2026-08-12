import SwiftUI

/// Report browser backed by `GET /reports/:type`, with CSV export via the
/// system share sheet.
struct ReportsView: View {
    @State private var kind: ReportKind = .quotations
    @State private var startDate = Calendar.current.date(byAdding: .month, value: -3, to: Date())!
    @State private var endDate = Date()
    @State private var useDateRange = false
    @State private var rows: [[String: JSONValue]] = []
    @State private var isLoading = false
    @State private var error: Error?
    @State private var csvURL: URL?
    @State private var isExporting = false

    enum ReportKind: String, CaseIterable, Identifiable {
        case quotations, invoices, customers
        var id: String { rawValue }
        var label: String { rawValue.capitalized }

        var columns: [String] {
            switch self {
            case .quotations: ["quotationNumber", "status", "grandTotal", "issueDate"]
            case .invoices: ["invoiceNumber", "paymentStatus", "grandTotal", "balanceAmount"]
            case .customers: ["displayName", "email", "phone", "customerType"]
            }
        }
    }

    var body: some View {
        List {
            Section {
                Picker("Report", selection: $kind) {
                    ForEach(ReportKind.allCases) { Text($0.label).tag($0) }
                }
                .pickerStyle(.segmented)

                Toggle("Filter by date", isOn: $useDateRange)
                if useDateRange {
                    DatePicker("From", selection: $startDate, displayedComponents: .date)
                    DatePicker("To", selection: $endDate, displayedComponents: .date)
                }

                Button {
                    Task { await load() }
                } label: {
                    Label("Run Report", systemImage: "play.circle")
                }
                .disabled(isLoading)
            }

            if isLoading {
                Section { LoadingState(message: "Running…").frame(height: 120) }
            } else if let error {
                Section { ErrorState(error: error) { Task { await load() } } }
            } else if !rows.isEmpty {
                Section("\(rows.count) rows") {
                    ForEach(Array(rows.enumerated()), id: \.offset) { _, row in
                        VStack(alignment: .leading, spacing: 3) {
                            ForEach(kind.columns, id: \.self) { column in
                                if let value = row[column]?.displayValue {
                                    HStack {
                                        Text(prettify(column))
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                        Spacer()
                                        Text(value).font(.caption).lineLimit(1)
                                    }
                                }
                            }
                            if let customer = row["customer"]?.nestedDisplayName {
                                HStack {
                                    Text("Customer").font(.caption2).foregroundStyle(.secondary)
                                    Spacer()
                                    Text(customer).font(.caption)
                                }
                            }
                        }
                        .padding(.vertical, 3)
                    }
                }
            }
        }
        .navigationTitle("Reports")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await exportCSV() }
                } label: {
                    if isExporting { ProgressView() } else { Image(systemName: "square.and.arrow.up") }
                }
                .disabled(isExporting)
            }
        }
        .sheet(item: $csvURL.map()) { wrapper in
            ShareSheet(url: wrapper.url)
        }
        .task { await load() }
    }

    private func prettify(_ key: String) -> String {
        key.replacingOccurrences(of: "([A-Z])", with: " $1", options: .regularExpression)
            .capitalized
    }

    private var query: [String: String] {
        var params: [String: String] = [:]
        if useDateRange {
            params["startDate"] = ISO8601DateFormatter().string(from: startDate)
            params["endDate"] = ISO8601DateFormatter().string(from: endDate)
        }
        return params
    }

    private func load() async {
        isLoading = true
        error = nil
        defer { isLoading = false }
        do {
            rows = try await APIClient.shared.get(
                "reports/\(kind.rawValue)",
                query: query,
                as: [[String: JSONValue]].self
            )
        } catch {
            self.error = error
            rows = []
        }
    }

    private func exportCSV() async {
        isExporting = true
        defer { isExporting = false }

        var params = query
        params["export"] = "csv"
        do {
            csvURL = try await APIClient.shared.downloadCSV(
                "reports/\(kind.rawValue)",
                query: params,
                suggestedName: "\(kind.rawValue)-report"
            )
        } catch {
            self.error = error
        }
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: [url], applicationActivities: nil)
    }

    func updateUIViewController(_ controller: UIActivityViewController, context: Context) {}
}
