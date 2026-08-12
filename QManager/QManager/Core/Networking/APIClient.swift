import Foundation

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case patch = "PATCH"
    case delete = "DELETE"
}

/// Posted when the refresh token is rejected, so the UI can drop to the login
/// screen from wherever it happens to be.
extension Notification.Name {
    static let sessionExpired = Notification.Name("qmanager.sessionExpired")
}

/// Talks to the QManager NestJS API.
///
/// Access tokens live 15 minutes, so a 401 mid-session is normal rather than
/// exceptional: the client transparently refreshes once and replays the
/// request. Concurrent 401s share a single refresh via `refreshTask` instead of
/// stampeding the endpoint (which would also rotate the refresh token N times
/// and invalidate itself).
actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let tokens: TokenStore
    private var refreshTask: Task<Void, Error>?

    init(tokens: TokenStore = .shared) {
        self.tokens = tokens

        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        configuration.waitsForConnectivity = false
        self.session = URLSession(configuration: configuration)
    }

    // MARK: - Decoding

    /// Prisma serialises `DateTime` as ISO-8601 with milliseconds, but a few
    /// fields come back without the fractional part. Accept both.
    private static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        let withFraction = ISO8601DateFormatter()
        withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let plain = ISO8601DateFormatter()
        plain.formatOptions = [.withInternetDateTime]

        decoder.dateDecodingStrategy = .custom { decoder in
            let raw = try decoder.singleValueContainer().decode(String.self)
            if let date = withFraction.date(from: raw) { return date }
            if let date = plain.date(from: raw) { return date }
            throw DecodingError.dataCorrupted(
                .init(codingPath: decoder.codingPath, debugDescription: "Unrecognised date: \(raw)")
            )
        }
        return decoder
    }()

    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()

    // MARK: - Public surface

    func get<T: Decodable & Sendable>(
        _ path: String,
        query: [String: String] = [:],
        as type: T.Type = T.self
    ) async throws -> T {
        let data = try await perform(path: path, method: .get, query: query, body: nil)
        return try decode(data)
    }

    /// GET that also writes the raw response to the offline cache.
    func get<T: Decodable & Sendable>(
        _ path: String,
        query: [String: String] = [:],
        as type: T.Type = T.self,
        cacheKey: String
    ) async throws -> T {
        let data = try await perform(path: path, method: .get, query: query, body: nil)
        let value: T = try decode(data)
        // Only cache what decoded cleanly, so a schema change cannot poison the
        // cache with data the app will choke on at next launch.
        await ResponseCache.shared.store(data, for: cacheKey)
        return value
    }

    /// Last-known-good value for a cache key, or nil.
    func cached<T: Decodable & Sendable>(_ cacheKey: String, as type: T.Type) async -> T? {
        guard let data = await ResponseCache.shared.data(for: cacheKey) else { return nil }
        return try? Self.decoder.decode(T.self, from: data)
    }

    func cacheDate(_ cacheKey: String) async -> Date? {
        await ResponseCache.shared.age(for: cacheKey)
    }

    @discardableResult
    func post<T: Decodable & Sendable>(
        _ path: String,
        body: (any Encodable & Sendable)? = nil,
        as type: T.Type = T.self
    ) async throws -> T {
        let data = try await perform(path: path, method: .post, query: [:], body: try encode(body))
        return try decode(data)
    }

    @discardableResult
    func patch<T: Decodable & Sendable>(
        _ path: String,
        body: (any Encodable & Sendable)? = nil,
        as type: T.Type = T.self
    ) async throws -> T {
        let data = try await perform(path: path, method: .patch, query: [:], body: try encode(body))
        return try decode(data)
    }

    /// For endpoints whose response body we do not care about.
    func send(
        _ path: String,
        method: HTTPMethod,
        body: (any Encodable & Sendable)? = nil
    ) async throws {
        _ = try await perform(path: path, method: method, query: [:], body: try encode(body))
    }

    /// Downloads binary content (the generated PDFs) to a temporary file.
    func download(
        _ path: String,
        method: HTTPMethod = .post,
        suggestedName: String
    ) async throws -> URL {
        let data = try await perform(path: path, method: method, query: [:], body: nil)

        let safeName = suggestedName
            .replacingOccurrences(of: "/", with: "-")
            .replacingOccurrences(of: ":", with: "-")
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("\(safeName).pdf")

        try data.write(to: url, options: .atomic)
        return url
    }

    /// Downloads a CSV report to a temporary file for the share sheet.
    func downloadCSV(
        _ path: String,
        query: [String: String],
        suggestedName: String
    ) async throws -> URL {
        let data = try await perform(path: path, method: .get, query: query, body: nil)
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("\(suggestedName).csv")
        try data.write(to: url, options: .atomic)
        return url
    }

    // MARK: - Request pipeline

    private func perform(
        path: String,
        method: HTTPMethod,
        query: [String: String],
        body: Data?,
        isRetry: Bool = false,
        allowRefresh: Bool = true
    ) async throws -> Data {
        let request = try await buildRequest(path: path, method: method, query: query, body: body)

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch let error as URLError {
            switch error.code {
            case .notConnectedToInternet, .networkConnectionLost, .dataNotAllowed:
                throw APIError.offline
            case .timedOut:
                throw APIError.timedOut
            default:
                throw APIError.transport(error.localizedDescription)
            }
        }

        guard let http = response as? HTTPURLResponse else {
            throw APIError.transport("Malformed response from server.")
        }

        switch http.statusCode {
        case 200..<300:
            return data

        case 401 where !isRetry && allowRefresh:
            // One refresh, then replay. If the refresh itself fails the session
            // is genuinely dead.
            do {
                try await refreshSession()
            } catch {
                await endSession()
                throw APIError.unauthorized
            }
            return try await perform(
                path: path, method: method, query: query, body: body, isRetry: true
            )

        case 401:
            await endSession()
            throw APIError.unauthorized

        case 403:
            throw APIError.forbidden(Self.serverMessage(from: data))

        case 404:
            throw APIError.notFound

        default:
            throw APIError.server(status: http.statusCode, message: Self.serverMessage(from: data))
        }
    }

    private func buildRequest(
        path: String,
        method: HTTPMethod,
        query: [String: String],
        body: Data?
    ) async throws -> URLRequest {
        let base = AppConfig.baseURL
        guard var components = URLComponents(
            url: base.appendingPathComponent(path),
            resolvingAgainstBaseURL: false
        ) else {
            throw APIError.invalidURL
        }

        if !query.isEmpty {
            components.queryItems = query
                .sorted { $0.key < $1.key }
                .map { URLQueryItem(name: $0.key, value: $0.value) }
        }

        guard let url = components.url else { throw APIError.invalidURL }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        if let token = await tokens.accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return request
    }

    // MARK: - Session refresh

    private struct TokenPair: Decodable, Sendable {
        let accessToken: String
        let refreshToken: String

        enum CodingKeys: String, CodingKey {
            case accessToken = "access_token"
            case refreshToken = "refresh_token"
        }
    }

    private struct RefreshBody: Encodable, Sendable {
        let userId: String
        let refreshToken: String
    }

    private func refreshSession() async throws {
        // Coalesce: whoever gets here first owns the refresh, everyone else
        // awaits the same task.
        if let existing = refreshTask {
            return try await existing.value
        }

        let task = Task<Void, Error> { [tokens, session] in
            guard
                let refreshToken = await tokens.refreshToken,
                let userID = await tokens.userID
            else {
                throw APIError.unauthorized
            }

            var request = URLRequest(url: AppConfig.baseURL.appendingPathComponent("auth/refresh"))
            request.httpMethod = HTTPMethod.post.rawValue
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.httpBody = try JSONEncoder().encode(
                RefreshBody(userId: userID, refreshToken: refreshToken)
            )

            let (data, response) = try await session.data(for: request)
            guard
                let http = response as? HTTPURLResponse,
                (200..<300).contains(http.statusCode)
            else {
                throw APIError.unauthorized
            }

            let pair = try JSONDecoder().decode(TokenPair.self, from: data)
            await tokens.updateTokens(
                accessToken: pair.accessToken,
                refreshToken: pair.refreshToken
            )
        }

        refreshTask = task
        defer { refreshTask = nil }

        try await task.value
    }

    /// Signs in and stores the resulting pair. `userID` comes from `/auth/me`,
    /// which the caller fetches immediately afterwards.
    func login(email: String, password: String) async throws {
        struct Credentials: Encodable, Sendable {
            let email: String
            let password: String
        }

        let data: Data
        do {
            // allowRefresh: false — a 401 here means the credentials are wrong,
            // not that a session expired. Letting it fall into the refresh path
            // reported "Your session has expired" for a simple typo'd password.
            data = try await perform(
                path: "auth/login",
                method: .post,
                query: [:],
                body: try Self.encoder.encode(Credentials(email: email, password: password)),
                allowRefresh: false
            )
        } catch APIError.unauthorized {
            throw APIError.invalidCredentials
        } catch APIError.notFound {
            // /auth/login does not exist at this base URL — almost always the
            // server address is missing the path the API is mounted under.
            throw APIError.apiNotReachable
        }

        let pair = try decode(data) as TokenPair
        await tokens.save(
            accessToken: pair.accessToken,
            refreshToken: pair.refreshToken,
            userID: nil
        )
    }

    func recordUserID(_ id: String) async {
        await tokens.setUserID(id)
    }

    func logout() async {
        // Best effort: revoke server-side, then drop local state regardless.
        try? await send("auth/logout", method: .post)
        await tokens.clear()
        // Cached commercial data must not survive the session.
        await ResponseCache.shared.clear()
    }

    private func endSession() async {
        await tokens.clear()
        await MainActor.run {
            NotificationCenter.default.post(name: .sessionExpired, object: nil)
        }
    }

    // MARK: - Helpers

    private func encode(_ value: (any Encodable & Sendable)?) throws -> Data? {
        guard let value else { return nil }
        return try Self.encoder.encode(value)
    }

    private func decode<T: Decodable>(_ data: Data) throws -> T {
        // Endpoints that return no content still need to satisfy the generic.
        if T.self == EmptyResponse.self {
            return EmptyResponse() as! T
        }
        do {
            return try Self.decoder.decode(T.self, from: data)
        } catch {
            // The raw decoding error names fields and can echo values back into
            // the UI, so it is only surfaced in development builds.
            #if DEBUG
            throw APIError.decoding(String(describing: error))
            #else
            throw APIError.decoding("")
            #endif
        }
    }

    private static func serverMessage(from data: Data) -> String? {
        (try? JSONDecoder().decode(ServerErrorBody.self, from: data))?.displayMessage
    }
}

/// Placeholder for endpoints whose body we ignore.
nonisolated struct EmptyResponse: Decodable, Sendable {}
