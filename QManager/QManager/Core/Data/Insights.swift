import SwiftUI

/// Something the user probably wants to act on today.
nonisolated struct Insight: Identifiable, Sendable {
    enum Urgency: Int, Comparable, Sendable {
        case critical = 0, warning = 1, info = 2
        static func < (lhs: Urgency, rhs: Urgency) -> Bool { lhs.rawValue < rhs.rawValue }

        var tint: Color {
            switch self {
            case .critical: .red
            case .warning: .orange
            case .info: .blue
            }
        }
    }

    enum Target: Sendable, Hashable {
        case quotation(String)
        case invoice(String)
        case quotationList
        case invoiceList
    }

    let id: String
    let urgency: Urgency
    let symbol: String
    let title: String
    let detail: String
    let target: Target
}

/// Derives "needs attention" items from data already on screen.
///
/// Deliberately client-side: the API has no such endpoint, and everything here
/// is computable from the quotation and invoice lists the dashboard already
/// has, so it costs no extra round trip.
nonisolated enum InsightEngine {
    static func build(quotations: [Quotation], invoices: [Invoice]) -> [Insight] {
        var insights: [Insight] = []
        let now = Date()

        // ── Invoices ─────────────────────────────────────────────────────────
        let overdue = invoices.filter(\.isOverdue)
        if !overdue.isEmpty {
            let total = overdue.reduce(0) { $0 + $1.balanceAmount }
            insights.append(
                Insight(
                    id: "overdue-invoices",
                    urgency: .critical,
                    symbol: "exclamationmark.triangle.fill",
                    title: overdue.count == 1
                        ? "1 overdue invoice"
                        : "\(overdue.count) overdue invoices",
                    detail: "\(Format.money(total, currency: overdue[0].currency)) outstanding",
                    target: overdue.count == 1 ? .invoice(overdue[0].id) : .invoiceList
                )
            )
        }

        let dueSoon = invoices.filter { invoice in
            guard let due = invoice.dueDate, invoice.balanceAmount > 0.01, !invoice.isOverdue
            else { return false }
            return days(from: now, to: due) <= 7
        }
        if !dueSoon.isEmpty {
            insights.append(
                Insight(
                    id: "due-soon",
                    urgency: .warning,
                    symbol: "calendar.badge.clock",
                    title: "\(dueSoon.count) invoice\(dueSoon.count == 1 ? "" : "s") due this week",
                    detail: Format.money(
                        dueSoon.reduce(0) { $0 + $1.balanceAmount },
                        currency: dueSoon[0].currency
                    ),
                    target: dueSoon.count == 1 ? .invoice(dueSoon[0].id) : .invoiceList
                )
            )
        }

        // ── Quotations ───────────────────────────────────────────────────────
        let awaitingApproval = quotations.filter { $0.status == .pendingApproval }
        if !awaitingApproval.isEmpty {
            insights.append(
                Insight(
                    id: "awaiting-approval",
                    urgency: .warning,
                    symbol: "clock.badge.exclamationmark.fill",
                    title: "\(awaitingApproval.count) awaiting approval",
                    detail: awaitingApproval.count == 1
                        ? awaitingApproval[0].quotationNumber
                        : "Blocking the pipeline",
                    target: awaitingApproval.count == 1
                        ? .quotation(awaitingApproval[0].id)
                        : .quotationList
                )
            )
        }

        // Live quotations about to lapse. The nightly job flips these to
        // EXPIRED, so surfacing them early is the whole point.
        let expiring = quotations.filter { quotation in
            guard
                let validUntil = quotation.validUntil,
                quotation.status == .sentToCustomer || quotation.status == .approved
            else { return false }
            let remaining = days(from: now, to: validUntil)
            return remaining >= 0 && remaining <= 7
        }
        if !expiring.isEmpty {
            insights.append(
                Insight(
                    id: "expiring",
                    urgency: .critical,
                    symbol: "hourglass.bottomhalf.filled",
                    title: "\(expiring.count) quotation\(expiring.count == 1 ? "" : "s") expiring",
                    detail: expiring.count == 1
                        ? "\(expiring[0].quotationNumber) · \(Format.deadline(expiring[0].validUntil) ?? "")"
                        : "Valid for 7 days or less",
                    target: expiring.count == 1 ? .quotation(expiring[0].id) : .quotationList
                )
            )
        }

        // Sent but never opened after three days — worth a nudge call.
        let unopened = quotations.filter { quotation in
            guard quotation.status == .sentToCustomer, let sentAt = quotation.sentAt else {
                return false
            }
            return days(from: sentAt, to: now) >= 3
        }
        if !unopened.isEmpty {
            insights.append(
                Insight(
                    id: "unopened",
                    urgency: .info,
                    symbol: "envelope.badge",
                    title: "\(unopened.count) sent but not opened",
                    detail: "No customer activity for 3+ days",
                    target: unopened.count == 1 ? .quotation(unopened[0].id) : .quotationList
                )
            )
        }

        let drafts = quotations.filter { $0.status == .draft }
        if drafts.count >= 3 {
            insights.append(
                Insight(
                    id: "drafts",
                    urgency: .info,
                    symbol: "square.and.pencil",
                    title: "\(drafts.count) drafts unsent",
                    detail: "Finish and submit for approval",
                    target: .quotationList
                )
            )
        }

        return insights.sorted { $0.urgency < $1.urgency }
    }

    private static func days(from: Date, to: Date) -> Int {
        Calendar.current.dateComponents([.day], from: from, to: to).day ?? 0
    }
}

// MARK: - Recently viewed

nonisolated struct RecentItem: Codable, Identifiable, Hashable, Sendable {
    enum Kind: String, Codable, Sendable {
        case quotation, invoice, customer

        var symbol: String {
            switch self {
            case .quotation: "doc.text"
            case .invoice: "doc.plaintext"
            case .customer: "building.2"
            }
        }

        var tint: Color {
            switch self {
            case .quotation: Brand.primary
            case .invoice: Brand.tint
            case .customer: Brand.accent
            }
        }
    }

    let id: String
    let kind: Kind
    let title: String
    let subtitle: String
    let viewedAt: Date
}

/// Tracks what the user opened, so the dashboard can offer a way straight back.
@MainActor
@Observable
final class RecentsStore {
    private static let key = "qmanager.recentItems"
    private static let limit = 8

    private(set) var items: [RecentItem] = []

    init() {
        if let data = UserDefaults.standard.data(forKey: Self.key),
           let decoded = try? JSONDecoder().decode([RecentItem].self, from: data) {
            items = decoded
        }
    }

    func record(_ kind: RecentItem.Kind, id: String, title: String, subtitle: String) {
        // Move-to-front semantics; an item is only ever listed once.
        items.removeAll { $0.id == id && $0.kind == kind }
        items.insert(
            RecentItem(id: id, kind: kind, title: title, subtitle: subtitle, viewedAt: Date()),
            at: 0
        )
        items = Array(items.prefix(Self.limit))
        persist()
    }

    func clear() {
        items = []
        persist()
    }

    private func persist() {
        if let data = try? JSONEncoder().encode(items) {
            UserDefaults.standard.set(data, forKey: Self.key)
        }
    }
}
