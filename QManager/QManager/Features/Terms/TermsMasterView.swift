import SwiftUI

/// T&C master data: reusable clause templates, the categories that classify
/// them, and groups that bundle several clauses for one-tap insertion.
struct TermsMasterView: View {
    @Environment(CatalogStore.self) private var catalog

    @State private var tab = Tab.templates
    @State private var categories: [TermsCategory] = []
    @State private var editingTemplate: TermsTemplate?
    @State private var showsNewTemplate = false
    @State private var showsNewCategory = false
    @State private var isLoading = false

    private enum Tab: String, CaseIterable, Identifiable {
        case templates = "Clauses"
        case groups = "Groups"
        case categories = "Categories"
        var id: String { rawValue }
    }

    var body: some View {
        List {
            Section {
                Picker("Section", selection: $tab) {
                    ForEach(Tab.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
            }
            .listRowBackground(Color.clear)

            switch tab {
            case .templates: templateSection
            case .groups: groupSection
            case .categories: categorySection
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Terms & Conditions")
        .refreshable { await reload() }
        .task {
            await catalog.loadIfNeeded()
            await loadCategories()
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    if tab == .categories { showsNewCategory = true } else { showsNewTemplate = true }
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showsNewTemplate) {
            TermsTemplateForm(template: nil, categories: categories) { await reload() }
        }
        .sheet(item: $editingTemplate) { template in
            TermsTemplateForm(template: template, categories: categories) { await reload() }
        }
        .sheet(isPresented: $showsNewCategory) {
            SimpleNameForm(title: "New Category", path: "terms/categories") { await reload() }
        }
    }

    @ViewBuilder
    private var templateSection: some View {
        if catalog.termsTemplates.isEmpty {
            ContentUnavailableView(
                "No clauses",
                systemImage: "doc.plaintext",
                description: Text("Clause templates can be dropped into any quotation.")
            )
            .listRowBackground(Color.clear)
        } else {
            ForEach(catalog.termsTemplates) { template in
                Button {
                    editingTemplate = template
                } label: {
                    VStack(alignment: .leading, spacing: 3) {
                        HStack {
                            Text(template.title).font(.subheadline.weight(.medium))
                            if template.isDefault {
                                StatusChip(text: "Default", tint: .green)
                            }
                        }
                        Text(template.content.strippingHTML)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                        if let category = template.category?.name {
                            Text(category).font(.caption2).foregroundStyle(.tertiary)
                        }
                    }
                }
                .buttonStyle(.plain)
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        Task {
                            try? await APIClient.shared.send(
                                "terms/templates/\(template.id)", method: .delete
                            )
                            await reload()
                        }
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var groupSection: some View {
        if catalog.termsGroups.isEmpty {
            ContentUnavailableView(
                "No groups",
                systemImage: "square.stack.3d.up",
                description: Text("Groups bundle several clauses so they can be added at once.")
            )
            .listRowBackground(Color.clear)
        } else {
            ForEach(catalog.termsGroups) { group in
                VStack(alignment: .leading, spacing: 4) {
                    Text(group.name).font(.subheadline.weight(.medium))
                    Text("\(group.templates?.count ?? 0) clauses")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    @ViewBuilder
    private var categorySection: some View {
        if categories.isEmpty {
            ContentUnavailableView(
                "No categories",
                systemImage: "folder",
                description: Text("Categories classify clauses — payment, delivery, warranty…")
            )
            .listRowBackground(Color.clear)
        } else {
            ForEach(categories) { category in
                HStack {
                    Text(category.name).font(.subheadline)
                    Spacer()
                    Text("\(category.templates?.count ?? 0)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private func loadCategories() async {
        categories = (try? await APIClient.shared.get(
            "terms/categories", as: [TermsCategory].self
        )) ?? []
    }

    private func reload() async {
        await catalog.reload()
        await loadCategories()
    }
}

struct TermsTemplateForm: View {
    let template: TermsTemplate?
    let categories: [TermsCategory]
    let onSaved: () async -> Void

    @Environment(CatalogStore.self) private var catalog
    @Environment(\.dismiss) private var dismiss

    @State private var title: String
    @State private var content: String
    @State private var categoryID: String
    @State private var serviceTypeID: String
    @State private var isDefault: Bool
    @State private var sortOrder: Int
    @State private var isSaving = false
    @State private var errorMessage: String?

    init(template: TermsTemplate?, categories: [TermsCategory], onSaved: @escaping () async -> Void) {
        self.template = template
        self.categories = categories
        self.onSaved = onSaved
        _title = State(initialValue: template?.title ?? "")
        _content = State(initialValue: (template?.content ?? "").strippingHTML)
        _categoryID = State(initialValue: template?.categoryId ?? "")
        _serviceTypeID = State(initialValue: template?.serviceTypeId ?? "")
        _isDefault = State(initialValue: template?.isDefault ?? false)
        _sortOrder = State(initialValue: template?.sortOrder ?? 0)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Clause") {
                    TextField("Title", text: $title)
                    TextField("Content", text: $content, axis: .vertical)
                        .lineLimit(4...12)
                }

                Section("Classification") {
                    Picker("Category", selection: $categoryID) {
                        Text("Select…").tag("")
                        ForEach(categories) { Text($0.name).tag($0.id) }
                    }
                    Picker("Service type", selection: $serviceTypeID) {
                        Text("Any").tag("")
                        ForEach(catalog.serviceTypes) { Text($0.name).tag($0.id) }
                    }
                }

                Section {
                    Toggle("Apply by default", isOn: $isDefault)
                    Stepper("Sort order: \(sortOrder)", value: $sortOrder, in: 0...99)
                } footer: {
                    Text("Default clauses attached to a service type are copied into every new quotation of that type.")
                }

                if let errorMessage {
                    Section { Text(errorMessage).font(.footnote).foregroundStyle(.red) }
                }
            }
            .navigationTitle(template == nil ? "New Clause" : "Edit Clause")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(title.isEmpty || content.isEmpty || categoryID.isEmpty || isSaving)
                }
            }
        }
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }

        struct Payload: Encodable, Sendable {
            let title: String
            let content: String
            let categoryId: String
            let serviceTypeId: String?
            let isDefault: Bool
            let sortOrder: Int
        }

        let payload = Payload(
            title: title,
            content: content,
            categoryId: categoryID,
            serviceTypeId: serviceTypeID.nilIfBlank,
            isDefault: isDefault,
            sortOrder: sortOrder
        )

        do {
            if let template {
                try await APIClient.shared.send(
                    "terms/templates/\(template.id)", method: .patch, body: payload
                )
            } else {
                try await APIClient.shared.send("terms/templates", method: .post, body: payload)
            }
            await onSaved()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

/// Small reusable "just a name" creator, used for terms categories and groups.
struct SimpleNameForm: View {
    let title: String
    let path: String
    let onSaved: () async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var description = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $name)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(2...4)
                }
                if let errorMessage {
                    Section { Text(errorMessage).font(.footnote).foregroundStyle(.red) }
                }
            }
            .navigationTitle(title)
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
                                    path,
                                    method: .post,
                                    body: ["name": name, "description": description]
                                )
                                await onSaved()
                                dismiss()
                            } catch {
                                errorMessage = (error as? APIError)?.errorDescription
                                    ?? error.localizedDescription
                            }
                        }
                    }
                    .disabled(name.isEmpty || isSaving)
                }
            }
        }
    }
}
