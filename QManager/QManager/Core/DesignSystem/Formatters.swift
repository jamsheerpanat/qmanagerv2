import Foundation

nonisolated enum Format {
    /// Gulf currencies are quoted to three decimals, and the web app formats
    /// money that way throughout — matching it keeps totals identical across
    /// the portal, the PDF and this app.
    private static let threeDecimalCurrencies: Set<String> = ["KWD", "BHD", "OMR", "JOD", "TND"]

    static func fractionDigits(for currency: String) -> Int {
        threeDecimalCurrencies.contains(currency.uppercased()) ? 3 : 2
    }

    static func money(_ value: Double?, currency: String = "KWD", showCode: Bool = true) -> String {
        let digits = fractionDigits(for: currency)
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.minimumFractionDigits = digits
        formatter.maximumFractionDigits = digits
        formatter.usesGroupingSeparator = true

        let number = formatter.string(from: NSNumber(value: value ?? 0)) ?? "0"
        return showCode ? "\(number) \(currency.uppercased())" : number
    }

    /// Long numbers crowd the dashboard tiles, so abbreviate there only.
    static func compactMoney(_ value: Double?, currency: String = "KWD") -> String {
        let amount = value ?? 0
        let code = currency.uppercased()

        let magnitude = abs(amount)
        let sign = amount < 0 ? "-" : ""

        return switch magnitude {
        case 1_000_000...:
            "\(sign)\(trim(magnitude / 1_000_000))M \(code)"
        case 10_000...:
            "\(sign)\(trim(magnitude / 1_000))K \(code)"
        default:
            money(amount, currency: code)
        }
    }

    private static func trim(_ value: Double) -> String {
        let rounded = (value * 10).rounded() / 10
        return rounded == rounded.rounded()
            ? String(Int(rounded))
            : String(format: "%.1f", rounded)
    }

    static func quantity(_ value: Double) -> String {
        value == value.rounded()
            ? String(Int(value))
            : String(format: "%.2f", value)
    }

    static func percent(_ value: Double?, digits: Int = 1) -> String {
        guard let value else { return "—" }
        return String(format: "%.\(digits)f%%", value)
    }

    // MARK: - Dates

    static func date(_ date: Date?) -> String {
        guard let date else { return "—" }
        return date.formatted(.dateTime.day().month(.abbreviated).year())
    }

    static func dateTime(_ date: Date?) -> String {
        guard let date else { return "—" }
        return date.formatted(.dateTime.day().month(.abbreviated).year().hour().minute())
    }

    static func relative(_ date: Date?) -> String {
        guard let date else { return "" }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    /// "in 12 days" / "9 days overdue", for validity and due dates.
    static func deadline(_ date: Date?) -> String? {
        guard let date else { return nil }
        let days = Calendar.current.dateComponents([.day], from: Date(), to: date).day ?? 0

        return switch days {
        case 0: "Due today"
        case 1: "Due tomorrow"
        case 2...: "\(days) days left"
        case -1: "1 day overdue"
        default: "\(abs(days)) days overdue"
        }
    }
}
