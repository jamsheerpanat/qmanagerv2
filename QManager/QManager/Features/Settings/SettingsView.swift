import SwiftUI

struct SettingsView: View {
    @Environment(SessionStore.self) private var session
    @Environment(BiometricLock.self) private var lock

    @State private var showsServerSheet = false
    @State private var showsSignOutConfirm = false
    @State private var showsPermissions = false

    var body: some View {
        @Bindable var lock = lock

        List {
            if let user = session.user {
                Section {
                    HStack(spacing: 14) {
                        Avatar(name: user.name, size: 52)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(user.name).font(.headline)
                            Text(user.email).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 6)

                    DetailRow(label: "Roles", value: user.roles.joined(separator: ", "))

                    Button {
                        showsPermissions = true
                    } label: {
                        HStack {
                            Text("Permissions")
                            Spacer()
                            Text("\(user.permissions.count)")
                                .foregroundStyle(.secondary)
                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                        }
                    }
                    .foregroundStyle(.primary)
                }
            }

            Section {
                if lock.isAvailable {
                    Toggle(isOn: $lock.isEnabled) {
                        Label("Require \(lock.biometryName)", systemImage: "faceid")
                    }
                } else {
                    Label("Biometrics unavailable on this device", systemImage: "faceid")
                        .foregroundStyle(.secondary)
                        .font(.footnote)
                }
            } header: {
                Text("Security")
            } footer: {
                Text("Locks the app when it goes to the background. Your session stays signed in.")
            }

            Section {
                Button {
                    showsServerSheet = true
                } label: {
                    HStack {
                        Label("Server", systemImage: "server.rack")
                        Spacer()
                        Text(AppConfig.baseURL.host() ?? "—")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
                .foregroundStyle(.primary)

                DetailRow(label: "App version", value: AppConfig.appVersion)
            } header: {
                Text("Connection")
            } footer: {
                Text("Changing the server signs you out.")
            }

            Section {
                Button("Sign Out", role: .destructive) {
                    showsSignOutConfirm = true
                }
                .frame(maxWidth: .infinity)
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showsServerSheet) {
            ServerSettingsView()
        }
        .sheet(isPresented: $showsPermissions) {
            PermissionListView(permissions: session.user?.permissions ?? [])
        }
        .confirmationDialog(
            "Sign out of QManager?",
            isPresented: $showsSignOutConfirm,
            titleVisibility: .visible
        ) {
            Button("Sign Out", role: .destructive) {
                Task { await session.signOut() }
            }
            Button("Cancel", role: .cancel) {}
        }
    }
}

/// Read-only view of what the signed-in account may do, useful when an action
/// is hidden and the user wonders why.
struct PermissionListView: View {
    let permissions: [String]
    @Environment(\.dismiss) private var dismiss

    private var grouped: [(domain: String, actions: [String])] {
        Dictionary(grouping: permissions) { permission in
            permission.split(separator: ".").first.map(String.init) ?? "other"
        }
        .map { (domain: $0.key.capitalized, actions: $0.value.sorted()) }
        .sorted { $0.domain < $1.domain }
    }

    var body: some View {
        NavigationStack {
            Group {
                if permissions.isEmpty {
                    ContentUnavailableView(
                        "No explicit permissions",
                        systemImage: "lock.slash",
                        description: Text("Super Admins bypass permission checks entirely.")
                    )
                } else {
                    List {
                        ForEach(grouped, id: \.domain) { group in
                            Section(group.domain) {
                                ForEach(group.actions, id: \.self) { action in
                                    Label(
                                        action.split(separator: ".").dropFirst().joined(separator: " ")
                                            .replacingOccurrences(of: "_", with: " ")
                                            .capitalized,
                                        systemImage: "checkmark.circle.fill"
                                    )
                                    .foregroundStyle(.primary)
                                    .font(.subheadline)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Permissions")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
