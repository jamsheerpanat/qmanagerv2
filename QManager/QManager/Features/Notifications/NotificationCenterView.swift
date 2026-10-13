import SwiftUI

@MainActor
@Observable
final class NotificationsModel {
    var phase: LoadPhase<[AppNotification]> = .idle
    var unreadCount = 0

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    func load(showSpinner: Bool = true) async {
        if showSpinner, phase.value == nil { phase = .loading }
        do {
            phase = .loaded(try await api.get("notifications", as: [AppNotification].self))
            unreadCount = await fetchUnreadCount()
        } catch {
            if phase.value == nil { phase = .failed(error) }
        }
    }

    /// The endpoint returns a bare integer.
    func fetchUnreadCount() async -> Int {
        (try? await api.get("notifications/unread-count", as: Int.self)) ?? 0
    }

    func markRead(_ notification: AppNotification) async {
        guard !notification.isRead else { return }
        try? await api.send("notifications/\(notification.id)/read", method: .patch)
        await load(showSpinner: false)
    }

    func markAllRead() async {
        try? await api.send("notifications/read-all", method: .patch)
        await load(showSpinner: false)
    }
}

struct NotificationCenterView: View {
    @Binding var unreadCount: Int
    @State private var model = NotificationsModel()

    var body: some View {
        AsyncContent(
            phase: model.phase,
            emptyTitle: "You're all caught up",
            emptySymbol: "bell.slash",
            emptyMessage: "Quotation, invoice and payment activity will show up here.",
            retry: { Task { await model.load() } }
        ) { notifications in
            List {
                ForEach(notifications) { notification in
                    NotificationRow(notification: notification)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            Task {
                                await model.markRead(notification)
                                unreadCount = model.unreadCount
                            }
                        }
                }
            }
            .listStyle(.plain)
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if model.unreadCount > 0 {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Mark all read") {
                        Task {
                            await model.markAllRead()
                            unreadCount = model.unreadCount
                        }
                    }
                    .font(.footnote)
                }
            }
        }
        .refreshable {
            await model.load(showSpinner: false)
            unreadCount = model.unreadCount
        }
        .task {
            await model.load()
            unreadCount = model.unreadCount
        }
    }
}

struct NotificationRow: View {
    let notification: AppNotification

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: notification.type.symbol)
                .font(.footnote)
                .foregroundStyle(notification.type.tint)
                .frame(width: 32, height: 32)
                .background(notification.type.tint.opacity(0.14), in: Circle())

            VStack(alignment: .leading, spacing: 3) {
                HStack(alignment: .top) {
                    Text(notification.title)
                        .font(.subheadline.weight(notification.isRead ? .regular : .semibold))
                    Spacer()
                    Text(Format.relative(notification.createdAt))
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }

                Text(notification.message)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if !notification.isRead {
                Circle()
                    .fill(Brand.primary)
                    .frame(width: 8, height: 8)
                    .padding(.top, 6)
            }
        }
        .padding(.vertical, 5)
        .listRowBackground(notification.isRead ? Color.clear : Brand.primary.opacity(0.05))
    }
}
