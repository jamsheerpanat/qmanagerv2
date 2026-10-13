import SwiftUI

/// Hides the screen while the app is inactive.
///
/// iOS snapshots the UI when the app moves to the background, and that snapshot
/// is what appears in the app switcher. For a commercial app that means
/// customer names, quotation values and outstanding balances sitting in a
/// screenshot on disk. Covering the window before the snapshot is taken is the
/// supported way to prevent it.
///
/// This is separate from `BiometricLock`: the lock gates re-entry, the shield
/// protects the snapshot, and the shield applies even when the lock is off.
struct PrivacyShield: ViewModifier {
    @Environment(\.scenePhase) private var scenePhase
    @Environment(SessionStore.self) private var session

    /// `.inactive` covers the moment the switcher snapshot is taken, which is
    /// before `.background` arrives.
    private var isObscured: Bool {
        session.phase == .signedIn && scenePhase != .active
    }

    func body(content: Content) -> some View {
        content
            .overlay {
                if isObscured {
                    ZStack {
                        Brand.deepGradient.ignoresSafeArea()
                        LogoMark(width: 200, mono: true)
                    }
                    .transition(.opacity)
                }
            }
            .animation(.easeOut(duration: 0.12), value: isObscured)
    }
}

extension View {
    func privacyShield() -> some View { modifier(PrivacyShield()) }
}
