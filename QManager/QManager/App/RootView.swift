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
            Brand.deep.ignoresSafeArea()
            VStack(spacing: 18) {
                BrandMark(size: 64)
                ProgressView()
                    .tint(.white.opacity(0.7))
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
                Image(systemName: "lock.fill")
                    .font(.system(size: 42))
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

/// Wordmark used on the launch, login and lock screens.
struct BrandMark: View {
    var size: CGFloat = 56
    var showsText = true

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: "doc.text.fill")
                .font(.system(size: size * 0.5, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: size, height: size)
                .background(Brand.primary.gradient, in: RoundedRectangle(cornerRadius: size * 0.26))

            if showsText {
                Text("QManager")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.white)
            }
        }
    }
}
