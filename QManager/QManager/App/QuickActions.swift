import SwiftUI
import UIKit

/// Home-screen shortcuts (long-press the app icon).
///
/// Declared in code rather than Info.plist so the titles can stay in step with
/// the app, and so the handler and the declaration live together.
nonisolated enum QuickAction: String, CaseIterable, Sendable {
    case newQuotation = "com.octonics.QManager.newQuotation"
    case search = "com.octonics.QManager.search"
    case invoices = "com.octonics.QManager.invoices"

    var title: String {
        switch self {
        case .newQuotation: "New Quotation"
        case .search: "Search"
        case .invoices: "Outstanding Invoices"
        }
    }

    var symbol: UIApplicationShortcutIcon {
        switch self {
        case .newQuotation: UIApplicationShortcutIcon(systemImageName: "doc.badge.plus")
        case .search: UIApplicationShortcutIcon(systemImageName: "magnifyingglass")
        case .invoices: UIApplicationShortcutIcon(systemImageName: "doc.plaintext")
        }
    }

    var shortcutItem: UIApplicationShortcutItem {
        UIApplicationShortcutItem(type: rawValue, localizedTitle: title, localizedSubtitle: nil, icon: symbol)
    }
}

/// Carries a pending shortcut from the app delegate into SwiftUI.
@MainActor
@Observable
final class QuickActionRouter {
    var pending: QuickAction?

    static let shared = QuickActionRouter()

    func register() {
        UIApplication.shared.shortcutItems = QuickAction.allCases.map(\.shortcutItem)
    }

    func handle(_ item: UIApplicationShortcutItem) {
        pending = QuickAction(rawValue: item.type)
    }

    func consume() -> QuickAction? {
        defer { pending = nil }
        return pending
    }
}

/// Shortcut items are delivered through UIKit, so a small delegate is the
/// supported bridge even in a pure SwiftUI lifecycle.
final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        if let item = launchOptions?[.shortcutItem] as? UIApplicationShortcutItem {
            MainActor.assumeIsolated { QuickActionRouter.shared.handle(item) }
        }
        return true
    }

    func application(
        _ application: UIApplication,
        configurationForConnecting session: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(
            name: nil, sessionRole: session.role
        )
        configuration.delegateClass = SceneDelegate.self
        return configuration
    }
}

/// Handles shortcuts chosen while the app is already running.
final class SceneDelegate: NSObject, UIWindowSceneDelegate {
    func windowScene(
        _ windowScene: UIWindowScene,
        performActionFor shortcutItem: UIApplicationShortcutItem,
        completionHandler: @escaping (Bool) -> Void
    ) {
        MainActor.assumeIsolated { QuickActionRouter.shared.handle(shortcutItem) }
        completionHandler(true)
    }
}
