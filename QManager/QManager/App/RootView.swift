import SwiftUI

/// Decides between the launch state, the login screen, the biometric gate and
/// the signed-in app.
struct RootView: View {
    @Environment(SessionStore.self) private var session
    @Environment(BiometricLock.self) private var lock

    var body: some View {
        ZStack {
            switch session.phase {
            case .restoring:
                LaunchView()
                    .transition(.opacity)

            case .signedOut:
                LoginView()
                    .transition(.opacity.combined(with: .move(edge: .bottom)))

            case .signedIn:
                MainTabView()
                    .transition(.opacity)
                    .overlay {
                        if lock.isLocked {
                            LockScreen()
                                .transition(.opacity)
                        }
                    }
            }
        }
        .animation(.smooth(duration: 0.35), value: session.phase)
        .animation(.smooth, value: lock.isLocked)
    }
}

private struct LaunchView: View {
    var body: some View {
        ZStack {
            Brand.deepGradient.ignoresSafeArea()
            VStack(spacing: 22) {
                LogoMark(width: 220, mono: true)
                ProgressView().tint(.white.opacity(0.65))
            }
        }
    }
}

private struct LockScreen: View {
    @Environment(BiometricLock.self) private var lock
    @Environment(SessionStore.self) private var session

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                LogoMark(width: 170)
                    .padding(.bottom, 4)

                Image(systemName: "lock.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(Brand.primary)

                Text("QManager is locked")
                    .font(.headline)

                Button {
                    Task { await lock.unlock() }
                } label: {
                    Label("Unlock with \(lock.biometryName)", systemImage: "faceid")
                        .frame(maxWidth: 260)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)

                Button("Sign Out", role: .destructive) {
                    Task { await session.signOut() }
                }
                .font(.footnote)
            }
        }
        .task { await lock.unlock() }
    }
}

