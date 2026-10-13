import Foundation

/// Errors surfaced by `APIClient`, phrased for humans.
nonisolated enum APIError: LocalizedError, Equatable {
    case invalidURL
    case unauthorized
    case invalidCredentials
    case apiNotReachable
    case forbidden(String?)
    case notFound
    case server(status: Int, message: String?)
    case decoding(String)
    case offline
    case timedOut
    case transport(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            "The server address is not valid. Check it in Settings."
        case .unauthorized:
            "Your session has expired. Please sign in again."
        case .invalidCredentials:
            "Incorrect email or password."
        case .apiNotReachable:
            "No QManager API at this address. Check the server in Settings."
        case .forbidden(let message):
            message ?? "You do not have permission to do that."
        case .notFound:
            "That record no longer exists."
        case .server(let status, let message):
            message ?? "The server returned an error (\(status))."
        case .decoding:
            "The server sent something unexpected."
        case .offline:
            "You appear to be offline."
        case .timedOut:
            "The request took too long. Try again."
        case .transport(let message):
            message
        }
    }

    /// Detail worth showing under the headline, when there is any.
    var failureHint: String? {
        switch self {
        case .decoding(let detail): detail.nilIfBlank
        case .invalidURL: "Settings › Server"
        case .apiNotReachable: "The address must include any path the API is mounted under."
        default: nil
        }
    }
}

/// Shape NestJS uses for thrown HttpExceptions.
nonisolated struct ServerErrorBody: Decodable {
    let message: MessageValue?
    let error: String?
    let statusCode: Int?

    /// `message` is a string for most exceptions but an array for
    /// class-validator failures.
    enum MessageValue: Decodable {
        case single(String)
        case many([String])

        init(from decoder: Decoder) throws {
            let container = try decoder.singleValueContainer()
            if let text = try? container.decode(String.self) {
                self = .single(text)
            } else if let list = try? container.decode([String].self) {
                self = .many(list)
            } else {
                self = .many([])
            }
        }

        var joined: String {
            switch self {
            case .single(let text): text
            case .many(let list): list.joined(separator: "\n")
            }
        }
    }

    var displayMessage: String? {
        let text = message?.joined ?? error
        guard let text, !text.isEmpty else { return nil }
        return text
    }
}
