import SwiftUI

@main
struct QManagerApp: App {
    @State private var session = SessionStore()
    @State private var lock = BiometricLock()
    @State private var catalog = CatalogStore()
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(session)
                .environment(lock)
                .environment(catalog)
                .tint(Brand.primary)
                .task { await session.restore() }
        }
        .onChange(of: scenePhase) { _, phase in
            // Re-arm the device gate whenever the app leaves the foreground.
            if phase == .background, session.phase == .signedIn {
                lock.lockIfEnabled()
            }
        }
    }
}
