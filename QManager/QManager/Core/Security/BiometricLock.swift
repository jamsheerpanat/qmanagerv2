import Foundation
import LocalAuthentication

/// Optional Face ID / Touch ID gate in front of an already-signed-in session.
///
/// This protects data at the device level; it is not a second factor for the
/// API, which still relies on the JWT pair.
@MainActor
@Observable
final class BiometricLock {
    private static let enabledKey = "qmanager.biometricLockEnabled"

    /// True when the session is signed in but the device gate has not been passed.
    private(set) var isLocked = false

    var isEnabled: Bool {
        didSet { UserDefaults.standard.set(isEnabled, forKey: Self.enabledKey) }
    }

    init() {
        isEnabled = UserDefaults.standard.bool(forKey: Self.enabledKey)
    }

    /// What this device actually offers, so Settings can name it correctly.
    var biometryName: String {
        let context = LAContext()
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: nil) else {
            return "Biometrics"
        }
        return switch context.biometryType {
        case .faceID: "Face ID"
        case .touchID: "Touch ID"
        case .opticID: "Optic ID"
        default: "Passcode"
        }
    }

    var isAvailable: Bool {
        LAContext().canEvaluatePolicy(.deviceOwnerAuthentication, error: nil)
    }

    func lockIfEnabled() {
        if isEnabled { isLocked = true }
    }

    func unlock() async {
        guard isLocked else { return }

        let context = LAContext()
        context.localizedFallbackTitle = "Use Passcode"

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthentication,
                localizedReason: "Unlock QManager"
            )
            if success { isLocked = false }
        } catch {
            // Leave it locked; the user can retry from the lock screen.
        }
    }
}
