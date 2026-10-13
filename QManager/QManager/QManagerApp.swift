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
                // .privacyShield() must be applied *before* the environment
                // injections. Environment flows outside-in, so a modifier
                // placed after `.environment(session)` sits outside that
                // injection and cannot read SessionStore — which crashed the
                // app on launch with "No Observable object of type
                // SessionStore found".
                .privacyShield()
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
