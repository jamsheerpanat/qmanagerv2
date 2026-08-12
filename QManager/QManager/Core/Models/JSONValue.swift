import Foundation

/// Minimal JSON value so reports can render rows whose shape varies by type.
nonisolated enum JSONValue: Decodable, Sendable {
    case string(String)
    case number(Double)
    case bool(Bool)
    case object([String: JSONValue])
    case array([JSONValue])
    case null

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Double.self) {
            self = .number(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode([String: JSONValue].self) {
            self = .object(value)
        } else if let value = try? container.decode([JSONValue].self) {
            self = .array(value)
        } else {
            self = .null
        }
    }

    var displayValue: String? {
        switch self {
        case .string(let value):
            // Dates arrive as ISO strings; shorten them for the table.
            if value.count >= 20, value.contains("T"),
               let date = ISO8601DateFormatter().date(from: value) {
                return Format.date(date)
            }
            return value
        case .number(let value):
            return value == value.rounded()
                ? String(Int(value))
                : String(format: "%.3f", value)
        case .bool(let value): return value ? "Yes" : "No"
        case .null, .object, .array: return nil
        }
    }

    var nestedDisplayName: String? {
        if case .object(let dict) = self { return dict["displayName"]?.displayValue }
        return nil
    }
}
