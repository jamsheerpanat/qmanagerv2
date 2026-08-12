import Foundation

/// Stores raw API responses on disk so lists render instantly on launch and
/// remain readable with no connection.
///
/// Raw `Data` is cached rather than decoded models, so the domain types stay
/// `Decodable`-only and there is exactly one decoding path (APIClient's).
actor ResponseCache {
    static let shared = ResponseCache()

    private let directory: URL
    private let staleAfter: TimeInterval = 60 * 60 * 24 * 7

    init() {
        let caches = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        directory = caches.appendingPathComponent("api-responses", isDirectory: true)
        try? FileManager.default.createDirectory(
            at: directory,
            withIntermediateDirectories: true,
            // Cached quotations and invoices are commercial data. Without this
            // they inherit the default protection class and are readable while
            // the device is locked after first unlock.
            attributes: [.protectionKey: FileProtectionType.completeUnlessOpen]
        )

        // Never back the cache up — it is reconstructable from the API, and
        // syncing business data into iCloud backups is needless exposure.
        var resourceValues = URLResourceValues()
        resourceValues.isExcludedFromBackup = true
        var mutableDirectory = directory
        try? mutableDirectory.setResourceValues(resourceValues)
    }

    private func url(for key: String) -> URL {
        // Keys are paths like "quotations" or "quotations/<uuid>".
        let safe = key.replacingOccurrences(of: "/", with: "_")
        return directory.appendingPathComponent("\(safe).json")
    }

    func data(for key: String) -> Data? {
        let url = url(for: key)
        guard
            let attributes = try? FileManager.default.attributesOfItem(atPath: url.path),
            let modified = attributes[.modificationDate] as? Date,
            Date().timeIntervalSince(modified) < staleAfter
        else {
            return nil
        }
        return try? Data(contentsOf: url)
    }

    func age(for key: String) -> Date? {
        let attributes = try? FileManager.default.attributesOfItem(atPath: url(for: key).path)
        return attributes?[.modificationDate] as? Date
    }

    func store(_ data: Data, for key: String) {
        try? data.write(to: url(for: key), options: [.atomic, .completeFileProtectionUnlessOpen])
    }

    /// Called on sign-out — cached business data must not outlive the session.
    func clear() {
        try? FileManager.default.removeItem(at: directory)
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    }
}
