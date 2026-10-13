import SwiftUI

/// Service types drive the PDF theme and the default terms applied to a new
/// quotation, so they are the root of the catalog hierarchy.
struct ServiceTypeListView: View {
    @Environment(CatalogStore.self) private var catalog
    @State private var editing: ServiceType?
    @State private var showsNew = false
    @State private var newCategoryFor: ServiceType?

    var body: some View {
        List {
            ForEach(catalog.serviceTypes) { type in
                Section {
                    Button {
                        editing = type
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(type.name).font(.subheadline.weight(.medium))
                                Text(type.slug).font(.caption2).foregroundStyle(.secondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.caption).foregroundStyle(.tertiary)
                        }
                    }
                    .buttonStyle(.plain)

                    let categories = catalog.categories(for: type.id)
                    ForEach(categories) { category in
                        HStack {
                            Image(systemName: "folder")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(category.name).font(.caption)
                            Spacer()
                            Text("\(catalog.products.filter { $0.categoryId == category.id }.count)")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                    }

                    Button {
                        newCategoryFor = type
                    } label: {
                        Label("Add category", systemImage: "plus.circle")
                            .font(.caption)
                    }
                }
            }

            if catalog.serviceTypes.isEmpty {
                ContentUnavailableView(
                    "No service types",
                    systemImage: "square.grid.2x2",
                    description: Text("Service types group products and pick the PDF template.")
                )
                .listRowBackground(Color.clear)
            }
        }
        .navigationTitle("Service Types")
        .refreshable { await catalog.reload() }
        .task { await catalog.loadIfNeeded() }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showsNew = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showsNew) {
            ServiceTypeFormView(serviceType: nil) { await catalog.reload() }
        }
        .sheet(item: $editing) { type in
            ServiceTypeFormView(serviceType: type) { await catalog.reload() }
        }
        .sheet(item: $newCategoryFor) { type in
            CategoryFormView(serviceType: type) { await catalog.reload() }
        }
    }
}

struct ServiceTypeFormView: View {
    let serviceType: ServiceType?
    let onSaved: () async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var name: String
    @State private var slug: String
    @State private var isSaving = false
    @State private var errorMessage: String?

    init(serviceType: ServiceType?, onSaved: @escaping () async -> Void) {
        self.serviceType = serviceType
        self.onSaved = onSaved
        _name = State(initialValue: serviceType?.name ?? "")
        _slug = State(initialValue: serviceType?.slug ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $name)
                        .onChange(of: name) { _, value in
                            // Only auto-derive for new records; changing an
                            // existing slug would break its PDF template route.
                            if serviceType == nil { slug = Self.slugify(value) }
                        }
                    TextField("Slug", text: $slug)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                } footer: {
                    Text("The slug selects the PDF template — e.g. `smart-home-automation` renders the home-automation design.")
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage).font(.footnote).foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle(serviceType == nil ? "New Service Type" : "Edit Service Type")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(name.isEmpty || slug.isEmpty || isSaving)
                }
            }
        }
    }

    private static func slugify(_ text: String) -> String {
        text.lowercased()
            .replacingOccurrences(of: "[^a-z0-9]+", with: "-", options: .regularExpression)
            .trimmingCharacters(in: CharacterSet(charactersIn: "-"))
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }
        let body = ["name": name, "slug": slug]
        do {
            if let serviceType {
                try await APIClient.shared.send(
                    "catalog/service-types/\(serviceType.id)", method: .patch, body: body
                )
            } else {
                try await APIClient.shared.send("catalog/service-types", method: .post, body: body)
            }
            await onSaved()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

struct CategoryFormView: View {
    let serviceType: ServiceType
    let onSaved: () async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Category") {
                    TextField("Name", text: $name)
                    LabeledContent("Service type", value: serviceType.name)
                }
                if let errorMessage {
                    Section { Text(errorMessage).font(.footnote).foregroundStyle(.red) }
                }
            }
            .navigationTitle("New Category")
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
                                    "catalog/categories",
                                    method: .post,
                                    body: ["name": name, "serviceTypeId": serviceType.id]
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
