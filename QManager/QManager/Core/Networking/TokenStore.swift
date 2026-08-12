import Foundation

/// Owns the JWT pair.
///
/// An actor because both `APIClient` (on a background executor) and the UI
/// touch it; serialising access removes any chance of a torn read during the
/// refresh dance.
actor TokenStore {
    static let shared = TokenStore()

    private enum Key {
        static let access = "accessToken"
        static let refresh = "refreshToken"
        static let userID = "userID"
    }

    private(set) var accessToken: String?
    private(set) var refreshToken: String?
    private(set) var userID: String?

    init() {
        accessToken = Keychain.get(Key.access)
        refreshToken = Keychain.get(Key.refresh)
        userID = Keychain.get(Key.userID)
    }

    var hasSession: Bool { accessToken != nil && refreshToken != nil }

    func save(accessToken: String, refreshToken: String, userID: String?) {
        self.accessToken = accessToken
        self.refreshToken = refreshToken
        Keychain.set(accessToken, for: Key.access)
        Keychain.set(refreshToken, for: Key.refresh)

        if let userID {
            self.userID = userID
            Keychain.set(userID, for: Key.userID)
        }
    }

    /// The backend rotates the refresh token on every refresh, so both halves
    /// must be replaced together.
    func updateTokens(accessToken: String, refreshToken: String) {
        save(accessToken: accessToken, refreshToken: refreshToken, userID: userID)
    }

    func setUserID(_ id: String) {
        userID = id
        Keychain.set(id, for: Key.userID)
    }

    func clear() {
        accessToken = nil
        refreshToken = nil
        userID = nil
        Keychain.remove(Key.access)
        Keychain.remove(Key.refresh)
        Keychain.remove(Key.userID)
    }
}
