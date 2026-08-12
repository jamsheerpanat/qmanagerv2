import UIKit

/// Thin wrapper over the feedback generators so call sites read as intent
/// ("this succeeded") rather than as UIKit plumbing.
@MainActor
enum Haptics {
    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    static func warning() {
        UINotificationFeedbackGenerator().notificationOccurred(.warning)
    }

    static func error() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }

    /// For selections and light confirmations.
    static func tap() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    static func nudge() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }
}
