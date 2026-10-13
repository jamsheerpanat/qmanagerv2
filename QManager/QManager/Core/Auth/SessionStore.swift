import Foundation
import Observation

/// Owns "who is signed in" for the whole app.
@MainActor
@Observable
final class SessionStore {
    enum Phase: Equatable {
        case restoring
        case signedOut
        case signedIn
    }

    private(set) var phase: Phase = .restoring
    private(set) var user: CurrentUser?
    private(set) var signInError: String?
    private(set) var isSigningIn = false

    private let api: APIClient

    init(api: APIClient = .shared) {
        self.api = api

        // The observer is intentionally not torn down: this store lives for the
        // lifetime of the app, and a `deinit` cannot touch main-actor state.
        NotificationCenter.default.addObserver(
            forName: .sessionExpired,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated {
                self?.handleExpiry()
            }
        }
    }

    func can(_ permission: Permission) -> Bool {
        user?.can(permission) ?? false
    }

    /// Called on launch: if a token pair survived in the Keychain, validate it
    /// by fetching the profile rather than trusting it blindly.
    func restore() async {
        guard await TokenStore.shared.hasSession else {
            phase = .signedOut
            return
        }

        do {
            user = try await api.get("auth/me", as: CurrentUser.self)
            phase = .signedIn
        } catch {
            await api.logout()
            phase = .signedOut
        }
    }

    func signIn(email: String, password: String) async {
        isSigningIn = true
        signInError = nil
        defer { isSigningIn = false }

        do {
            try await api.login(email: email, password: password)

            // The login response carries no profile, and the refresh endpoint
            // needs the user id, so fetch it before considering ourselves in.
            let profile = try await api.get("auth/me", as: CurrentUser.self)
            await api.recordUserID(profile.id)

            user = profile
            phase = .signedIn
        } catch {
            signInError = (error as? APIError)?.errorDescription ?? error.localizedDescription
            await api.logout()
        }
    }

    func signOut() async {
        await api.logout()
        user = nil
        signInError = nil
        phase = .signedOut
    }

    func refreshProfile() async {
        guard phase == .signedIn else { return }
        user = try? await api.get("auth/me", as: CurrentUser.self)
    }

    func clearError() { signInError = nil }

    private func handleExpiry() {
        user = nil
        phase = .signedOut
    }
}
