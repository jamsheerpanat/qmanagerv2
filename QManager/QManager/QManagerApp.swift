import SwiftUI

@main
struct QManagerApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    @State private var session = SessionStore()
    @State private var lock = BiometricLock()
    @State private var catalog = CatalogStore()
    @State private var recents = RecentsStore()
    @State private var quickActions = QuickActionRouter.shared

    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(session)
                .environment(lock)
                .environment(catalog)
                .environment(recents)
                .environment(quickActions)
                .tint(Brand.primary)
                .task {
                    await session.restore()
                    quickActions.register()
                }
        }
        .onChange(of: scenePhase) { _, phase in
            // Re-arm the device gate whenever the app leaves the foreground.
            if phase == .background, session.phase == .signedIn {
                lock.lockIfEnabled()
            }
        }
    }
}
