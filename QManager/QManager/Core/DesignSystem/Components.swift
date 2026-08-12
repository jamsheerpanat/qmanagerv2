import SwiftUI

// MARK: - Brand

enum Brand {
    /// Matches the web app's default brand colour (#1a56db).
    static let primary = Color(red: 0.102, green: 0.337, blue: 0.859)
    static let deep = Color(red: 0.047, green: 0.102, blue: 0.184)
}

// MARK: - Status chip

struct StatusChip: View {
    let text: String
    let tint: Color
    var symbol: String?

    var body: some View {
        HStack(spacing: 4) {
            if let symbol {
                Image(systemName: symbol).font(.caption2.weight(.semibold))
            }
            Text(text)
                .font(.caption2.weight(.semibold))
                .lineLimit(1)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .foregroundStyle(tint)
        .background(tint.opacity(0.14), in: Capsule())
        .overlay(Capsule().strokeBorder(tint.opacity(0.22)))
    }
}

// MARK: - Metric tile

struct MetricTile: View {
    let title: String
    let value: String
    var caption: String?
    var symbol: String
    var tint: Color = Brand.primary

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: symbol)
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(tint)
                    .frame(width: 28, height: 28)
                    .background(tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                Spacer()
            }

            Text(value)
                .font(.title3.weight(.bold))
                .minimumScaleFactor(0.6)
                .lineLimit(1)
                .contentTransition(.numericText())

            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)

            if let caption {
                Text(caption)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - Rows

/// Key/value row used across every detail screen.
struct DetailRow: View {
    let label: String
    let value: String?
    var emphasised = false
    var tint: Color?

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer(minLength: 12)
            Text(value?.nilIfBlank ?? "—")
                .font(emphasised ? .subheadline.weight(.semibold) : .subheadline)
                .foregroundStyle(tint ?? .primary)
                .multilineTextAlignment(.trailing)
        }
    }
}

/// Totals block on quotations and invoices.
struct AmountRow: View {
    let label: String
    let amount: Double
    let currency: String
    var isTotal = false
    var tint: Color?

    var body: some View {
        HStack {
            Text(label)
                .font(isTotal ? .headline : .subheadline)
                .foregroundStyle(isTotal ? .primary : .secondary)
            Spacer()
            Text(Format.money(amount, currency: currency))
                .font(isTotal ? .headline.weight(.bold) : .subheadline.weight(.medium))
                .foregroundStyle(tint ?? (isTotal ? Brand.primary : .primary))
                .monospacedDigit()
        }
    }
}

// MARK: - States

struct LoadingState: View {
    var message = "Loading…"

    var body: some View {
        VStack(spacing: 12) {
            ProgressView()
            Text(message)
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct ErrorState: View {
    let error: Error
    var retry: (() -> Void)?

    private var apiError: APIError? { error as? APIError }

    var body: some View {
        ContentUnavailableView {
            Label("Something went wrong", systemImage: "exclamationmark.triangle")
        } description: {
            VStack(spacing: 6) {
                Text(apiError?.errorDescription ?? error.localizedDescription)
                if let hint = apiError?.failureHint {
                    Text(hint)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }
        } actions: {
            if let retry {
                Button("Try Again", action: retry)
                    .buttonStyle(.borderedProminent)
            }
        }
    }
}

/// Wraps a screen's load/error/content phases so every list behaves the same.
struct AsyncContent<Value, Content: View>: View {
    let phase: LoadPhase<Value>
    var emptyTitle: String = "Nothing here yet"
    var emptySymbol: String = "tray"
    var emptyMessage: String?
    let retry: () -> Void
    @ViewBuilder let content: (Value) -> Content

    var body: some View {
        switch phase {
        case .idle, .loading:
            LoadingState()
        case .failed(let error):
            ErrorState(error: error, retry: retry)
        case .loaded(let value):
            if let collection = value as? any Collection, collection.isEmpty {
                ContentUnavailableView(
                    emptyTitle,
                    systemImage: emptySymbol,
                    description: emptyMessage.map(Text.init)
                )
            } else {
                content(value)
            }
        }
    }
}

/// Simple phase machine shared by the feature models.
enum LoadPhase<Value> {
    case idle
    case loading
    case loaded(Value)
    case failed(Error)

    var value: Value? {
        if case .loaded(let value) = self { return value }
        return nil
    }

    var isLoading: Bool {
        if case .loading = self { return true }
        return false
    }
}

// MARK: - Section card

struct Card<Content: View>: View {
    var title: String?
    var symbol: String?
    var accessory: AnyView?
    @ViewBuilder let content: Content

    init(
        _ title: String? = nil,
        symbol: String? = nil,
        accessory: AnyView? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.symbol = symbol
        self.accessory = accessory
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let title {
                HStack {
                    Label {
                        Text(title)
                    } icon: {
                        if let symbol { Image(systemName: symbol) }
                    }
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.secondary)

                    Spacer()
                    accessory
                }
            }
            content
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Avatar

struct Avatar: View {
    let name: String
    var size: CGFloat = 36

    /// Deterministic colour per name, same idea as the web sidebar.
    private var tint: Color {
        let palette: [Color] = [.blue, .purple, .teal, .green, .orange, .red, .indigo]
        let hash = name.unicodeScalars.reduce(0) { ($0 &* 31 &+ Int($1.value)) & 0xFFFFFF }
        return palette[abs(hash) % palette.count]
    }

    private var initials: String {
        let parts = name.split(separator: " ").prefix(2)
        let letters = parts.compactMap(\.first).map(String.init).joined()
        return letters.isEmpty ? "?" : letters.uppercased()
    }

    var body: some View {
        Text(initials)
            .font(.system(size: size * 0.36, weight: .bold))
            .foregroundStyle(.white)
            .frame(width: size, height: size)
            .background(tint.gradient, in: RoundedRectangle(cornerRadius: size * 0.28))
    }
}
