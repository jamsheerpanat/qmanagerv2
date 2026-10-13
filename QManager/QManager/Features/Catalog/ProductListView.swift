import SwiftUI

struct ProductListView: View {
    @Environment(SessionStore.self) private var session
    @Environment(CatalogStore.self) private var catalog

    @State private var search = ""
    @State private var serviceTypeFilter: String?
    @State private var editing: Product?
    @State private var showsNew = false

    private var filtered: [Product] {
        let term = search.lowercased()
        return catalog.products.filter { product in
            if let serviceTypeFilter, product.serviceTypeId != serviceTypeFilter { return false }
            guard !term.isEmpty else { return true }
            return product.productName.lowercased().contains(term)
                || product.productCode.lowercased().contains(term)
                || (product.brand?.lowercased().contains(term) ?? false)
                || (product.modelNumber?.lowercased().contains(term) ?? false)
        }
    }

    var body: some View {
        List {
            if !catalog.serviceTypes.isEmpty {
                Section {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            FilterChip(title: "All", isOn: serviceTypeFilter == nil, tint: Brand.primary) {
                                serviceTypeFilter = nil
                            }
                            ForEach(catalog.serviceTypes) { type in
                                FilterChip(
                                    title: type.name,
                                    isOn: serviceTypeFilter == type.id,
                                    tint: .indigo
                                ) {
                                    serviceTypeFilter = serviceTypeFilter == type.id ? nil : type.id
                                }
                            }
                        }
                    }
                    .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                }
                .listRowBackground(Color.clear)
            }

            if filtered.isEmpty {
                ContentUnavailableView(
                    catalog.products.isEmpty ? "No products" : "Nothing matches",
                    systemImage: "shippingbox",
                    description: Text(
                        catalog.products.isEmpty
                        ? "Add your first product to the catalog."
                        : "Try a different search or filter."
                    )
                )
                .listRowBackground(Color.clear)
            } else {
                ForEach(filtered) { product in
                    Button {
                        editing = product
                    } label: {
                        ProductRow(product: product)
                    }
                    .buttonStyle(.plain)
                    .swipeActions(edge: .trailing) {
                        if session.can(.productsView) {
                            Button(role: .destructive) {
                                Task { await delete(product) }
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                    }
                }
            }
        }
        .listStyle(.plain)
        .navigationTitle("Products")
        .searchable(text: $search, prompt: "Name, code, brand or model")
        .refreshable { await catalog.reload() }
        .task { await catalog.loadIfNeeded() }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showsNew = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showsNew) {
            ProductFormView(product: nil) { await catalog.reload() }
        }
        .sheet(item: $editing) { product in
            ProductFormView(product: product) { await catalog.reload() }
        }
    }

    private func delete(_ product: Product) async {
        try? await APIClient.shared.send("catalog/products/\(product.id)", method: .delete)
        await catalog.reload()
    }
}

struct ProductRow: View {
    let product: Product

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                Text(product.productName)
                    .font(.subheadline.weight(.medium))
                    .lineLimit(1)

                HStack(spacing: 5) {
                    Text(product.productCode)
                    if let brand = product.brand?.nilIfBlank { Text("· \(brand)") }
                    if let model = product.modelNumber?.nilIfBlank { Text("· \(model)") }
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)

                if let category = product.category?.name {
                    Text(category)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(Format.money(product.sellingPrice, currency: product.currency, showCode: false))
                    .font(.subheadline.weight(.semibold))
                    .monospacedDigit()
                if product.taxRate > 0 {
                    Text("tax \(Format.percent(product.taxRate, digits: 0))")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                if !product.isActive {
                    StatusChip(text: "Inactive", tint: .secondary)
                }
            }
        }
        .padding(.vertical, 3)
    }
}

/// Create or edit a catalog product.
struct ProductFormView: View {
    let product: Product?
    let onSaved: () async -> Void

    @Environment(CatalogStore.self) private var catalog
    @Environment(\.dismiss) private var dismiss

    @State private var code: String
    @State private var name: String
    @State private var brand: String
    @State private var modelNumber: String
    @State private var shortDescription: String
    @State private var serviceTypeID: String
    @State private var categoryID: String
    @State private var unit: String
    @State private var costPrice: Double
    @State private var sellingPrice: Double
    @State private var minimumSellingPrice: Double
    @State private var taxRate: Double
    @State private var warranty: String
    @State private var isActive: Bool

    @State private var isSaving = false
    @State private var errorMessage: String?

    init(product: Product?, onSaved: @escaping () async -> Void) {
        self.product = product
        self.onSaved = onSaved
        _code = State(initialValue: product?.productCode ?? "")
        _name = State(initialValue: product?.productName ?? "")
        _brand = State(initialValue: product?.brand ?? "")
        _modelNumber = State(initialValue: product?.modelNumber ?? "")
        _shortDescription = State(initialValue: product?.shortDescription ?? "")
        _serviceTypeID = State(initialValue: product?.serviceTypeId ?? "")
        _categoryID = State(initialValue: product?.categoryId ?? "")
        _unit = State(initialValue: product?.unit ?? "pcs")
        _costPrice = State(initialValue: product?.costPrice ?? 0)
        _sellingPrice = State(initialValue: product?.sellingPrice ?? 0)
        _minimumSellingPrice = State(initialValue: product?.minimumSellingPrice ?? 0)
        _taxRate = State(initialValue: product?.taxRate ?? 0)
        _warranty = State(initialValue: product?.warrantyPeriod ?? "")
        _isActive = State(initialValue: product?.isActive ?? true)
    }

    /// The API rejects a selling price below the minimum, so catch it here.
    private var priceWarning: String? {
        guard sellingPrice > 0, minimumSellingPrice > 0, sellingPrice < minimumSellingPrice else {
            return nil
        }
        return "Selling price cannot be below the minimum selling price."
    }

    private var canSave: Bool {
        !code.trimmingCharacters(in: .whitespaces).isEmpty
            && !name.trimmingCharacters(in: .whitespaces).isEmpty
            && !serviceTypeID.isEmpty
            && !categoryID.isEmpty
            && priceWarning == nil
            && !isSaving
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Identity") {
                    TextField("Product name", text: $name)
                    TextField("Product code", text: $code)
                        .textInputAutocapitalization(.characters)
                    TextField("Brand", text: $brand)
                    TextField("Model number", text: $modelNumber)
                }

                Section("Classification") {
                    Picker("Service type", selection: $serviceTypeID) {
                        Text("Select…").tag("")
                        ForEach(catalog.serviceTypes) { Text($0.name).tag($0.id) }
                    }
                    .onChange(of: serviceTypeID) { _, _ in
                        // Categories belong to a service type; drop a stale pick.
                        if !catalog.categories(for: serviceTypeID).contains(where: { $0.id == categoryID }) {
                            categoryID = ""
                        }
                    }

                    Picker("Category", selection: $categoryID) {
                        Text("Select…").tag("")
                        ForEach(catalog.categories(for: serviceTypeID.nilIfBlank)) {
                            Text($0.name).tag($0.id)
                        }
                    }
                    .disabled(serviceTypeID.isEmpty)
                }

                Section {
                    LabeledContent("Unit") {
                        TextField("pcs", text: $unit).multilineTextAlignment(.trailing)
                    }
                    priceField("Cost price", value: $costPrice)
                    priceField("Selling price", value: $sellingPrice)
                    priceField("Minimum selling", value: $minimumSellingPrice)
                    priceField("Tax %", value: $taxRate)
                } header: {
                    Text("Pricing")
                } footer: {
                    if let priceWarning {
                        Text(priceWarning).foregroundStyle(.red)
                    } else if sellingPrice > 0, costPrice > 0 {
                        let margin = (sellingPrice - costPrice) / sellingPrice * 100
                        Text("Margin \(Format.percent(margin))")
                    }
                }

                Section("Other") {
                    TextField("Short description", text: $shortDescription, axis: .vertical)
                        .lineLimit(2...4)
                    TextField("Warranty period", text: $warranty)
                    Toggle("Active", isOn: $isActive)
                }

                if let errorMessage {
                    Section {
                        Label(errorMessage, systemImage: "exclamationmark.triangle")
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle(product == nil ? "New Product" : "Edit Product")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }.disabled(!canSave)
                }
            }
            .overlay { if isSaving { LoadingState(message: "Saving…") } }
            .task { await catalog.loadIfNeeded() }
        }
    }

    private func priceField(_ label: String, value: Binding<Double>) -> some View {
        LabeledContent(label) {
            TextField("0", value: value, format: .number)
                .keyboardType(.decimalPad)
                .multilineTextAlignment(.trailing)
        }
    }

    private func save() async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        let payload = ProductPayload(
            productCode: code.trimmingCharacters(in: .whitespaces),
            productName: name.trimmingCharacters(in: .whitespaces),
            brand: brand.nilIfBlank,
            modelNumber: modelNumber.nilIfBlank,
            shortDescription: shortDescription.nilIfBlank,
            categoryId: categoryID,
            serviceTypeId: serviceTypeID,
            unit: unit.nilIfBlank ?? "pcs",
            costPrice: costPrice,
            sellingPrice: sellingPrice,
            minimumSellingPrice: minimumSellingPrice,
            taxRate: taxRate,
            warrantyPeriod: warranty.nilIfBlank,
            isActive: isActive
        )

        do {
            if let product {
                try await APIClient.shared.send(
                    "catalog/products/\(product.id)", method: .patch, body: payload
                )
            } else {
                try await APIClient.shared.send("catalog/products", method: .post, body: payload)
            }
            await onSaved()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}
