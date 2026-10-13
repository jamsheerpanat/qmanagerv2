import SwiftUI
import PDFKit
import UIKit

/// Renders a downloaded PDF and offers the system share sheet.
struct PDFPreview: View {
    let url: URL
    let title: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            PDFKitView(url: url)
                .ignoresSafeArea(edges: .bottom)
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Done") { dismiss() }
                    }
                    ToolbarItem(placement: .primaryAction) {
                        ShareLink(item: url) {
                            Image(systemName: "square.and.arrow.up")
                        }
                    }
                }
        }
    }
}

private struct PDFKitView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> PDFView {
        let view = PDFView()
        view.autoScales = true
        view.displayMode = .singlePageContinuous
        view.displayDirection = .vertical
        view.backgroundColor = .secondarySystemBackground
        view.document = PDFDocument(url: url)
        return view
    }

    func updateUIView(_ view: PDFView, context: Context) {
        if view.document?.documentURL != url {
            view.document = PDFDocument(url: url)
        }
    }
}

/// Tracks a "generate then present" PDF flow for a detail screen.
@MainActor
@Observable
final class PDFDownloader {
    var fileURL: URL?
    var isWorking = false
    var errorMessage: String?

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    func generate(path: String, name: String) async {
        isWorking = true
        defer { isWorking = false }
        do {
            fileURL = try await api.download(path, method: .post, suggestedName: name)
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}
