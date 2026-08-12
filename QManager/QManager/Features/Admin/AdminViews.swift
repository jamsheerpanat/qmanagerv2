import SwiftUI

// MARK: - Audit log

struct AuditLogView: View {
    @State private var entries: [AuditLogEntry] = []
    @State private var page = 1
    @State private var isLoading = false
    @State private var error: Error?

    var body: some View {
        List {
            if let error, entries.isEmpty {
                ErrorState(error: error) { Task { await load(reset: true) } }
                    .listRowBackground(Color.clear)
            } else if entries.isEmpty, !isLoading {
                ContentUnavailableView(
                    "No audit entries",
                    systemImage: "clipboard",
                    description: Text("Logins and record changes are recorded here.")
                )
                .listRowBackground(Color.clear)
            } else {
                ForEach(entries) { entry in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            StatusChip(text: entry.action, tint: tint(for: entry.action))
                            Text(entry.module).font(.caption).foregroundStyle(.secondary)
                            Spacer()
                            Text(Format.relative(entry.createdAt))
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        Text(entry.actor?.name ?? "System")
                            .font(.subheadline.weight(.medium))
                        if let email = entry.actor?.email {
                            Text(email).font(.caption2).foregroundStyle(.secondary)
                        }
                        if let ip = entry.ipAddress?.nilIfBlank {
                            Text("IP \(ip)").font(.caption2).foregroundStyle(.tertiary)
                        }
                    }
                    .padding(.vertical, 2)
                }

                if !entries.isEmpty {
                    Button {
                        Task { await load(reset: false) }
                    } label: {
                        if isLoading { ProgressView() } else { Text("Load more") }
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .navigationTitle("Audit Log")
        .refreshable { await load(reset: true) }
        .task { if entries.isEmpty { await load(reset: true) } }
    }

    private func tint(for action: String) -> Color {
        switch action.uppercased() {
        case "CREATE": .green
        case "UPDATE": .blue
        case "DELETE": .red
        case "LOGIN": .purple
        case "LOGOUT": .secondary
        default: .secondary
        }
    }

    private func load(reset: Bool) async {
        isLoading = true
        defer { isLoading = false }
        if reset { page = 1 }

        do {
            let batch = try await APIClient.shared.get(
                "audit-logs",
                query: ["page": "\(page)", "limit": "50"],
                as: [AuditLogEntry].self
            )
            entries = reset ? batch : entries + batch
            if !batch.isEmpty { page += 1 }
            error = nil
        } catch {
            self.error = error
        }
    }
}

// MARK: - Users

struct UsersView: View {
    @State private var users: [UserSummary] = []
    @State private var roles: [Role] = []
    @State private var error: Error?
    @State private var isLoading = false
    @State private var showsNew = false

    var body: some View {
        List {
            if let error, users.isEmpty {
                ErrorState(error: error) { Task { await load() } }
                    .listRowBackground(Color.clear)
            }

            ForEach(users) { user in
                HStack(spacing: 12) {
                    Avatar(name: user.name, size: 40)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(user.name).font(.subheadline.weight(.medium))
                        Text(user.email).font(.caption2).foregroundStyle(.secondary)
                        if !user.roleNames.isEmpty {
                            Text(user.roleNames.joined(separator: ", "))
                                .font(.caption2)
                                .foregroundStyle(Brand.primary)
                        }
                    }
                    Spacer()
                    StatusChip(
                        text: user.status.capitalized,
                        tint: user.status == "ACTIVE" ? .green : .secondary
                    )
                }
                .padding(.vertical, 2)
            }
        }
        .navigationTitle("Users")
        .refreshable { await load() }
        .task { if users.isEmpty { await load() } }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showsNew = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showsNew) {
            UserFormView(roles: roles) { await load() }
        }
        .overlay { if isLoading && users.isEmpty { LoadingState() } }
    }

    private func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            users = try await APIClient.shared.get("users", as: [UserSummary].self)
            roles = (try? await APIClient.shared.get("roles", as: [Role].self)) ?? []
            error = nil
        } catch {
            self.error = error
        }
    }
}

struct UserFormView: View {
    let roles: [Role]
    let onSaved: () async -> Void

    @Environment(SessionStore.self) private var session
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var password = ""
    @State private var selectedRoles: Set<String> = []
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Person") {
                    TextField("Full name", text: $name)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                    TextField("Phone", text: $phone).keyboardType(.phonePad)
                }

                Section {
                    SecureField("Password", text: $password)
                } header: {
                    Text("Credentials")
                } footer: {
                    Text("Leave blank to use the system default, which the user should change on first sign-in.")
                }

                Section("Roles") {
                    if roles.isEmpty {
                        Text("No roles available.").font(.footnote).foregroundStyle(.secondary)
                    }
                    ForEach(roles) { role in
                        Button {
                            if selectedRoles.contains(role.id) {
                                selectedRoles.remove(role.id)
                            } else {
                                selectedRoles.insert(role.id)
                            }
                        } label: {
                            HStack {
                                Image(systemName: selectedRoles.contains(role.id)
                                      ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(selectedRoles.contains(role.id) ? Brand.primary : .secondary)
                                Text(role.name)
                                Spacer()
                                Text("\(role.permissions?.count ?? 0) perms")
                                    .font(.caption2)
                                    .foregroundStyle(.tertiary)
                            }
                            .foregroundStyle(.primary)
                        }
                    }
                }

                if let errorMessage {
                    Section { Text(errorMessage).font(.footnote).foregroundStyle(.red) }
                }
            }
            .navigationTitle("New User")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(name.isEmpty || !email.contains("@") || isSaving)
                }
            }
        }
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }

        struct Payload: Encodable, Sendable {
            let name: String
            let email: String
            let phone: String?
            let password: String?
            let companyId: String
            let roleIds: [String]
        }

        guard let companyID = session.user?.companyId else { return }

        do {
            try await APIClient.shared.send(
                "users",
                method: .post,
                body: Payload(
                    name: name,
                    email: email.lowercased(),
                    phone: phone.nilIfBlank,
                    password: password.nilIfBlank,
                    companyId: companyID,
                    roleIds: Array(selectedRoles)
                )
            )
            await onSaved()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

// MARK: - Roles

struct RolesView: View {
    @State private var roles: [Role] = []
    @State private var permissions: [PermissionRow] = []
    @State private var editing: Role?
    @State private var error: Error?

    var body: some View {
        List {
            if let error, roles.isEmpty {
                ErrorState(error: error) { Task { await load() } }
                    .listRowBackground(Color.clear)
            }

            ForEach(roles) { role in
                Button {
                    editing = role
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(role.name).font(.subheadline.weight(.medium))
                            if let description = role.description?.nilIfBlank {
                                Text(description).font(.caption2).foregroundStyle(.secondary)
                            }
                        }
                        Spacer()
                        Text("\(role.permissions?.count ?? 0)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Image(systemName: "chevron.right").font(.caption2).foregroundStyle(.tertiary)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .navigationTitle("Roles & Permissions")
        .refreshable { await load() }
        .task { if roles.isEmpty { await load() } }
        .sheet(item: $editing) { role in
            RoleEditorView(role: role, allPermissions: permissions) { await load() }
        }
    }

    private func load() async {
        do {
            roles = try await APIClient.shared.get("roles", as: [Role].self)
            permissions = (try? await APIClient.shared.get("permissions", as: [PermissionRow].self)) ?? []
            error = nil
        } catch {
            self.error = error
        }
    }
}

struct RoleEditorView: View {
    let role: Role
    let allPermissions: [PermissionRow]
    let onSaved: () async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var selected: Set<String>
    @State private var isSaving = false
    @State private var errorMessage: String?

    init(role: Role, allPermissions: [PermissionRow], onSaved: @escaping () async -> Void) {
        self.role = role
        self.allPermissions = allPermissions
        self.onSaved = onSaved
        _selected = State(initialValue: role.permissionIDs)
    }

    private var grouped: [(domain: String, rows: [PermissionRow])] {
        Dictionary(grouping: allPermissions, by: \.domain)
            .map { (domain: $0.key.capitalized, rows: $0.value.sorted { $0.action < $1.action }) }
            .sorted { $0.domain < $1.domain }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("Super Admin bypasses these checks entirely.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                ForEach(grouped, id: \.domain) { group in
                    Section(group.domain) {
                        ForEach(group.rows) { permission in
                            Button {
                                if selected.contains(permission.id) {
                                    selected.remove(permission.id)
                                } else {
                                    selected.insert(permission.id)
                                }
                            } label: {
                                HStack {
                                    Image(systemName: selected.contains(permission.id)
                                          ? "checkmark.square.fill" : "square")
                                        .foregroundStyle(selected.contains(permission.id) ? Brand.primary : .secondary)
                                    Text(permission.verb.capitalized)
                                    Spacer()
                                }
                                .foregroundStyle(.primary)
                            }
                        }
                    }
                }

                if let errorMessage {
                    Section { Text(errorMessage).font(.footnote).foregroundStyle(.red) }
                }
            }
            .navigationTitle(role.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            isSaving = true
                            defer { isSaving = false }
                            do {
                                try await APIClient.shared.send(
                                    "roles/\(role.id)",
                                    method: .patch,
                                    body: ["permissionIds": Array(selected)]
                                )
                                await onSaved()
                                dismiss()
                            } catch {
                                errorMessage = (error as? APIError)?.errorDescription
                                    ?? error.localizedDescription
                            }
                        }
                    }
                    .disabled(isSaving)
                }
            }
        }
    }
}

// MARK: - Company settings

struct CompanySettingsView: View {
    @State private var company: Company?
    @State private var error: Error?

    @State private var name = ""
    @State private var legalName = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var address = ""
    @State private var taxNumber = ""
    @State private var quotationPrefix = ""
    @State private var invoicePrefix = ""
    @State private var validityDays = 30
    @State private var footerText = ""
    @State private var isSaving = false
    @State private var savedAt: Date?

    var body: some View {
        Form {
            if company == nil {
                Section { LoadingState().frame(height: 120) }
            } else {
                Section("Company") {
                    TextField("Name", text: $name)
                    TextField("Legal name", text: $legalName)
                    TextField("Tax number", text: $taxNumber)
                }

                Section("Contact") {
                    TextField("Email", text: $email).keyboardType(.emailAddress)
                    TextField("Phone", text: $phone).keyboardType(.phonePad)
                    TextField("Address", text: $address, axis: .vertical).lineLimit(2...4)
                }

                Section {
                    LabeledContent("Quotation prefix") {
                        TextField("QT", text: $quotationPrefix).multilineTextAlignment(.trailing)
                    }
                    LabeledContent("Invoice prefix") {
                        TextField("INV", text: $invoicePrefix).multilineTextAlignment(.trailing)
                    }
                    Stepper("Validity: \(validityDays) days", value: $validityDays, in: 1...365)
                } header: {
                    Text("Numbering & Defaults")
                } footer: {
                    Text("Prefixes apply to newly created documents only; existing numbers are never rewritten.")
                }

                Section("Document Footer") {
                    TextField("Footer text", text: $footerText, axis: .vertical).lineLimit(2...4)
                }

                if let bankAccounts = company?.bankAccounts, !bankAccounts.isEmpty {
                    Section("Bank Accounts") {
                        ForEach(bankAccounts) { account in
                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    Text(account.bankName).font(.subheadline.weight(.medium))
                                    if account.isDefault { StatusChip(text: "Default", tint: .green) }
                                }
                                Text(account.accountNumber).font(.caption2).foregroundStyle(.secondary)
                                if let iban = account.iban?.nilIfBlank {
                                    Text("IBAN \(iban)").font(.caption2).foregroundStyle(.tertiary)
                                }
                            }
                        }
                    }
                }

                Section {
                    Button {
                        Task { await save() }
                    } label: {
                        HStack {
                            if isSaving { ProgressView().padding(.trailing, 4) }
                            Text("Save Changes")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .disabled(isSaving)

                    if let savedAt {
                        Text("Saved \(Format.relative(savedAt))")
                            .font(.caption2)
                            .foregroundStyle(.green)
                            .frame(maxWidth: .infinity)
                    }
                }
            }

            if let error {
                Section { ErrorState(error: error) { Task { await load() } } }
            }
        }
        .navigationTitle("Company")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
    }

    private func load() async {
        do {
            let loaded = try await APIClient.shared.get("settings/company", as: Company.self)
            company = loaded
            name = loaded.name
            legalName = loaded.legalName ?? ""
            email = loaded.email ?? ""
            phone = loaded.phone ?? ""
            address = loaded.address ?? ""
            taxNumber = loaded.taxNumber ?? ""
            quotationPrefix = loaded.quotationPrefix ?? "QT"
            invoicePrefix = loaded.invoicePrefix ?? "INV"
            validityDays = loaded.defaultQuotationValidityDays ?? 30
            footerText = loaded.footerText ?? ""
            error = nil
        } catch {
            self.error = error
        }
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }

        struct Payload: Encodable, Sendable {
            let name: String
            let legalName: String?
            let email: String?
            let phone: String?
            let address: String?
            let taxNumber: String?
            let quotationPrefix: String
            let invoicePrefix: String
            let defaultQuotationValidityDays: Int
            let footerText: String?
        }

        do {
            try await APIClient.shared.send(
                "settings/company",
                method: .patch,
                body: Payload(
                    name: name,
                    legalName: legalName.nilIfBlank,
                    email: email.nilIfBlank,
                    phone: phone.nilIfBlank,
                    address: address.nilIfBlank,
                    taxNumber: taxNumber.nilIfBlank,
                    quotationPrefix: quotationPrefix.nilIfBlank ?? "QT",
                    invoicePrefix: invoicePrefix.nilIfBlank ?? "INV",
                    defaultQuotationValidityDays: validityDays,
                    footerText: footerText.nilIfBlank
                )
            )
            savedAt = Date()
            await load()
        } catch {
            self.error = error
        }
    }
}

// MARK: - PDF templates

struct PDFTemplatesView: View {
    @State private var templates: [QuotationTemplate] = []
    @State private var error: Error?

    var body: some View {
        List {
            if let error, templates.isEmpty {
                ErrorState(error: error) { Task { await load() } }
                    .listRowBackground(Color.clear)
            } else if templates.isEmpty {
                ContentUnavailableView(
                    "No templates",
                    systemImage: "doc.richtext",
                    description: Text("Quotation templates control the PDF cover and section layout.")
                )
                .listRowBackground(Color.clear)
            } else {
                ForEach(templates) { template in
                    VStack(alignment: .leading, spacing: 3) {
                        HStack {
                            Text(template.name).font(.subheadline.weight(.medium))
                            if !template.isActive { StatusChip(text: "Inactive", tint: .secondary) }
                        }
                        if let description = template.description?.nilIfBlank {
                            Text(description).font(.caption2).foregroundStyle(.secondary)
                        }
                        if let style = template.coverPageStyle?.nilIfBlank {
                            Text("Cover: \(style)").font(.caption2).foregroundStyle(.tertiary)
                        }
                    }
                }
            }
        }
        .navigationTitle("PDF Templates")
        .refreshable { await load() }
        .task { if templates.isEmpty { await load() } }
    }

    private func load() async {
        do {
            templates = try await APIClient.shared.get(
                "settings/templates", as: [QuotationTemplate].self
            )
            error = nil
        } catch {
            self.error = error
        }
    }
}
