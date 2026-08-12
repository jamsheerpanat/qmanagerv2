import Foundation

/// Where the app points and how it is branded.
///
/// The server URL is user-editable in Settings so the same build can run
/// against production or a developer machine.
enum AppConfig {
    /// Production QManager API.
    ///
    /// Note the `/api` suffix: the host root serves the Next.js frontend, and
    /// nginx proxies only `/api/*` to NestJS. Pointing at the bare host makes
    /// every call 404 against the web app instead.
    nonisolated static let productionBaseURL = URL(string: "https://qmanager2.octolabs.cloud/api")!

    /// A developer machine running `pnpm dev` (NestJS listens on 3001).
    nonisolated static let localBaseURL = URL(string: "http://localhost:3001")!

    nonisolated private static let baseURLKey = "qmanager.baseURL"

    nonisolated static var baseURL: URL {
        get {
            guard
                let raw = UserDefaults.standard.string(forKey: baseURLKey),
                let url = URL(string: raw)
            else { return productionBaseURL }
            return url
        }
        set {
            UserDefaults.standard.set(newValue.absoluteString, forKey: baseURLKey)
        }
    }

    nonisolated static var appVersion: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }
}
