import SwiftUI

/// Editable line-item list: reorder, delete, edit inline, and add from catalog.
/// Shared by the create wizard and the edit screen.
struct ItemEditor: View {
    @Binding var items: [ItemDraft]
    let currency: String
    let serviceTypeID: String?
    @Environment(CatalogStore.self) private var catalog

    @State private var showsPicker = false
    @State private var editing: ItemDraft.ID?

    private var runningSubtotal: Double {
        items.filter { !$0.isHeading && !$0.isOptional }
            .reduce(0) { $0 + $1.lineTotal }
    }

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Button {
                    showsPicker = true
                } label: {
                    Label("Add Item", systemImage: "plus.circle.fill")
                }
                .buttonStyle(.borderedProminent)

                Button {
                    items.append(.heading())
                } label: {
                    Label("Section", systemImage: "text.append")
                }
                .buttonStyle(.bordered)

                Spacer()
            }

            if items.isEmpty {
                ContentUnavailableView(
                    "No items yet",
                    systemImage: "list.bullet.rectangle",
                    description: Text("Add products, services or a custom line.")
                )
                .frame(height: 180)
            } else {
                List {
                    ForEach($items) { $item in
                        ItemRow(item: $item, currency: currency) {
                            editing = item.id
                        }
                    }
                    .onDelete { items.remove(atOffsets: $0) }
                    .onMove { items.move(fromOffsets: $0, toOffset: $1) }

                    Section {
                        HStack {
                            Text("Subtotal").font(.subheadline.weight(.semibold))
                            Spacer()
                            Text(Format.money(runningSubtotal, currency: currency))
                                .font(.subheadline.weight(.bold))
                                .monospacedDigit()
                        }
                    }
                }
                .listStyle(.plain)
                .frame(height: max(220, CGFloat(items.count) * 78 + 60))
                .scrollDisabled(true)
                .environment(\.editMode, .constant(.active))
            }
        }
        .sheet(isPresented: $showsPicker) {
            CatalogPicker(serviceTypeID: serviceTypeID) { draft in
                items.append(draft)
            }
        }
        .sheet(item: Binding(
            get: { editing.flatMap { id in items.first { $0.id == id } } },
            set: { editing = $0?.id }
        )) { draft in
            if let index = items.firstIndex(where: { $0.id == draft.id }) {
                ItemDetailEditor(item: $items[index], currency: currency)
            }
        }
    }
}

private struct ItemRow: View {
    @Binding var item: ItemDraft
    let currency: String
    let onEdit: () -> Void

    var body: some View {
        if item.isHeading {
            HStack(spacing: 8) {
                Image(systemName: "text.alignleft")
                    .font(.caption)
                    .foregroundStyle(Brand.primary)
                TextField("Section title", text: $item.sectionTitle)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Brand.primary)
            }
            .listRowBackground(Brand.primary.opacity(0.08))
        } else {
            Button(action: onEdit) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(item.sectionTitle.nilIfBlank ?? item.description.nilIfBlank ?? "Item")
                            .font(.subheadline.weight(.medium))
                            .lineLimit(1)
                        HStack(spacing: 6) {
                            Text("\(Format.quantity(item.quantity)) \(item.unit)")
                            Text("×")
                            Text(Format.money(item.unitPrice, currency: currency, showCode: false))
                            if item.discountValue > 0 {
                                Text("−\(Format.money(item.discountAmount, currency: currency, showCode: false))")
                                    .foregroundStyle(.red)
                            }
                            if item.isOptional {
                                Text("· optional").foregroundStyle(.orange)
                            }
                        }
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(Format.money(item.lineTotal, currency: currency, showCode: false))
                            .font(.subheadline.weight(.semibold))
                            .monospacedDigit()
                        Image(systemName: "chevron.right")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
            }
            .buttonStyle(.plain)
        }
    }
}

/// Full editor for one line, presented as a sheet.
struct ItemDetailEditor: View {
    @Binding var item: ItemDraft
    let currency: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Description") {
                    TextField("Title", text: $item.sectionTitle)
                    TextField("Details", text: $item.description, axis: .vertical)
                        .lineLimit(2...5)
                }

                Section("Pricing") {
                    LabeledContent("Quantity") {
                        TextField("1", value: $item.quantity, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                    LabeledContent("Unit") {
                        TextField("pcs", text: $item.unit)
                            .multilineTextAlignment(.trailing)
                    }
                    LabeledContent("Unit price") {
                        TextField("0", value: $item.unitPrice, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                    LabeledContent("Tax %") {
                        TextField("0", value: $item.taxRate, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                }

                Section("Discount") {
                    Picker("Type", selection: $item.discountType) {
                        Text("Percentage").tag(DiscountType.percentage)
                        Text("Flat amount").tag(DiscountType.flatAmount)
                    }
                    .pickerStyle(.segmented)

                    LabeledContent("Value") {
                        TextField("0", value: $item.discountValue, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                }

                Section("Options") {
                    Toggle("Optional item", isOn: $item.isOptional)
                    TextField("Warranty", text: $item.warranty)
                    TextField("Delivery time", text: $item.deliveryTime)
                }

                Section {
                    HStack {
                        Text("Line total").font(.headline)
                        Spacer()
                        Text(Format.money(item.lineTotal, currency: currency))
                            .font(.headline)
                            .foregroundStyle(Brand.primary)
                            .monospacedDigit()
                    }
                } footer: {
                    Text("Final amounts are recalculated by the server on save.")
                }
            }
            .navigationTitle("Edit Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

/// Product / service picker with search, plus a custom-line escape hatch.
struct CatalogPicker: View {
    let serviceTypeID: String?
    let onPick: (ItemDraft) -> Void

    @Environment(CatalogStore.self) private var catalog
    @Environment(\.dismiss) private var dismiss
    @State private var tab = Tab.products
    @State private var search = ""

    private enum Tab: String, CaseIterable, Identifiable {
        case products = "Products"
        case services = "Services"
        var id: String { rawValue }
    }

    private var filteredProducts: [Product] {
        let term = search.lowercased()
        return catalog.products.filter { product in
            guard term.isEmpty else {
                return product.productName.lowercased().contains(term)
                    || product.productCode.lowercased().contains(term)
                    || (product.brand?.lowercased().contains(term) ?? false)
                    || (product.modelNumber?.lowercased().contains(term) ?? false)
            }
            return true
        }
    }

    private var filteredServices: [ServiceItem] {
        let term = search.lowercased()
        return catalog.serviceItems.filter { service in
            guard term.isEmpty else {
                return service.serviceName.lowercased().contains(term)
                    || service.serviceCode.lowercased().contains(term)
            }
            return true
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Picker("Kind", selection: $tab) {
                        ForEach(Tab.allCases) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                }
                .listRowBackground(Color.clear)

                if tab == .products {
                    ForEach(filteredProducts) { product in
                        Button {
                            onPick(.from(product: product))
                            dismiss()
                        } label: {
                            catalogRow(
                                title: product.productName,
                                subtitle: "\(product.productCode) · \(product.brand ?? "—")",
                                price: product.sellingPrice,
                                tax: product.taxRate
                            )
                        }
                    }
                } else {
                    ForEach(filteredServices) { service in
                        Button {
                            onPick(.from(service: service))
                            dismiss()
                        } label: {
                            catalogRow(
                                title: service.serviceName,
                                subtitle: service.serviceCode,
                                price: service.defaultPrice,
                                tax: 0
                            )
                        }
                    }
                }

                Section {
                    Button {
                        onPick(.custom())
                        dismiss()
                    } label: {
                        Label("Add a custom line", systemImage: "square.and.pencil")
                    }
                } footer: {
                    Text("A one-off line that is not saved to the catalog.")
                }
            }
            .searchable(text: $search, prompt: "Name, code, brand or model")
            .navigationTitle("Add Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func catalogRow(title: String, subtitle: String, price: Double, tax: Double) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.subheadline.weight(.medium)).lineLimit(1)
                Text(subtitle).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(Format.money(price, showCode: false))
                    .font(.subheadline.weight(.semibold))
                    .monospacedDigit()
                if tax > 0 {
                    Text("tax \(Format.percent(tax, digits: 0))")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .foregroundStyle(.primary)
    }
}
