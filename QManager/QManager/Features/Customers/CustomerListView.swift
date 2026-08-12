import SwiftUI

@MainActor
@Observable
final class CustomerListModel {
    var phase: LoadPhase<[Customer]> = .idle
    var search = ""

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    var filtered: [Customer] {
        let all = phase.value ?? []
        let term = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !term.isEmpty else { return all }

        return all.filter { customer in
            customer.displayName.lowercased().contains(term)
                || customer.customerCode.lowercased().contains(term)
                || (customer.email?.lowercased().contains(term) ?? false)
                || (customer.phone?.contains(term) ?? false)
        }
    }

    func load(showSpinner: Bool = true) async {
        if showSpinner, phase.value == nil { phase = .loading }
        do {
            phase = .loaded(try await api.get("customers", as: [Customer].self))
        } catch {
            if phase.value == nil { phase = .failed(error) }
        }
    }
}

struct CustomerListView: View {
    @Environment(SessionStore.self) private var session
    @State private var model = CustomerListModel()
    @State private var showsNewCustomer = false

    var body: some View {
        NavigationStack {
            AsyncContent(
                phase: model.phase,
                emptyTitle: "No customers",
                emptySymbol: "building.2",
                emptyMessage: "Add your first customer to get started.",
                retry: { Task { await model.load() } }
            ) { _ in
                List {
                    if model.filtered.isEmpty {
                        ContentUnavailableView.search(text: model.search)
                            .listRowBackground(Color.clear)
                    } else {
                        ForEach(model.filtered) { customer in
                            NavigationLink(value: customer) {
                                CustomerRow(customer: customer)
                            }
                        }
                    }
                }
                .listStyle(.plain)
                .navigationDestination(for: Customer.self) { customer in
                    CustomerDetailView(customerID: customer.id, preview: customer)
                }
            }
            .navigationTitle("Customers")
            .searchable(text: $model.search, prompt: "Name, code, email or phone")
            .refreshable { await model.load(showSpinner: false) }
            .task { if model.phase.value == nil { await model.load() } }
            .toolbar {
                if session.can(.customersCreate) {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button { showsNewCustomer = true } label: {
                            Image(systemName: "plus")
                        }
                    }
                }
            }
            .sheet(isPresented: $showsNewCustomer) {
                CustomerFormView { await model.load(showSpinner: false) }
            }
        }
    }
}

struct CustomerRow: View {
    let customer: Customer

    var body: some View {
        HStack(spacing: 12) {
            Avatar(name: customer.displayName, size: 42)

            VStack(alignment: .leading, spacing: 3) {
                Text(customer.displayName)
                    .font(.subheadline.weight(.medium))
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Image(systemName: customer.customerType.symbol)
                    Text(customer.customerCode)
                    if let location = customer.locationLine {
                        Text("· \(location)").lineLimit(1)
                    }
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding(.vertical, 3)
    }
}

// MARK: - Detail

@MainActor
@Observable
final class CustomerDetailModel {
    var customer: Customer?
    var loadError: Error?

    private let api: APIClient
    private let id: String

    init(id: String, api: APIClient = .shared) {
        self.id = id
        self.api = api
    }

    func load() async {
        do {
            customer = try await api.get("customers/\(id)", as: Customer.self)
            loadError = nil
        } catch {
            loadError = error
        }
    }
}

struct CustomerDetailView: View {
    let customerID: String
    let preview: Customer?

    @Environment(SessionStore.self) private var session
    @State private var model: CustomerDetailModel
    @State private var showsEdit = false
    @State private var showsNewContact = false
    @State private var editingContact: Contact?

    init(customerID: String, preview: Customer? = nil) {
        self.customerID = customerID
        self.preview = preview
        _model = State(initialValue: CustomerDetailModel(id: customerID))
    }

    private var customer: Customer? { model.customer ?? preview }

    var body: some View {
        Group {
            if let customer {
                ScrollView {
                    VStack(spacing: 16) {
                        header(customer)
                        contactCard(customer)

                        peopleCard(customer.contacts ?? [])

                        if let leads = customer.leads, !leads.isEmpty {
                            leadsCard(leads)
                        }

                        if let notes = customer.notes?.nilIfBlank {
                            Card("Notes", symbol: "note.text") {
                                Text(notes).font(.subheadline)
                            }
                        }
                    }
                    .padding(16)
                }
                .background(Color(.systemGroupedBackground))
            } else if let error = model.loadError {
                ErrorState(error: error) { Task { await model.load() } }
            } else {
                LoadingState()
            }
        }
        .navigationTitle(customer?.displayName ?? "Customer")
        .navigationBarTitleDisplayMode(.inline)
        .task { await model.load() }
        .refreshable { await model.load() }
        .toolbar {
            if session.can(.customersUpdate), customer != nil {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Edit") { showsEdit = true }
                }
            }
        }
        .sheet(isPresented: $showsEdit) {
            if let customer {
                CustomerFormView(customer: customer) { await model.load() }
            }
        }
        .sheet(isPresented: $showsNewContact) {
            ContactFormView(customerID: customerID, contact: nil) { await model.load() }
        }
        .sheet(item: $editingContact) { contact in
            ContactFormView(customerID: customerID, contact: contact) { await model.load() }
        }
    }

    private func header(_ customer: Customer) -> some View {
        Card {
            HStack(spacing: 14) {
                Avatar(name: customer.displayName, size: 56)
                VStack(alignment: .leading, spacing: 4) {
                    Text(customer.displayName).font(.headline)
                    if let legal = customer.legalName?.nilIfBlank, legal != customer.displayName {
                        Text(legal).font(.caption).foregroundStyle(.secondary)
                    }
                    HStack(spacing: 6) {
                        StatusChip(
                            text: customer.customerType.label,
                            tint: Brand.primary,
                            symbol: customer.customerType.symbol
                        )
                        Text(customer.customerCode)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
                Spacer()
            }
        }
    }

    private func contactCard(_ customer: Customer) -> some View {
        Card("Contact", symbol: "person.crop.circle") {
            VStack(spacing: 12) {
                if let phone = customer.phone?.nilIfBlank {
                    ContactActionRow(label: "Phone", value: phone, symbol: "phone.fill", url: URL(string: "tel://\(phone.filter { !$0.isWhitespace })"))
                }
                if let whatsapp = customer.whatsapp?.nilIfBlank {
                    ContactActionRow(
                        label: "WhatsApp",
                        value: whatsapp,
                        symbol: "message.fill",
                        url: URL(string: "https://wa.me/\(whatsapp.filter(\.isNumber))")
                    )
                }
                if let email = customer.email?.nilIfBlank {
                    ContactActionRow(label: "Email", value: email, symbol: "envelope.fill", url: URL(string: "mailto:\(email)"))
                }
                if let website = customer.website?.nilIfBlank {
                    ContactActionRow(
                        label: "Website",
                        value: website,
                        symbol: "safari.fill",
                        url: URL(string: website.hasPrefix("http") ? website : "https://\(website)")
                    )
                }

                DetailRow(label: "Address", value: [customer.addressLine1, customer.locationLine].compactMap { $0?.nilIfBlank }.joined(separator: ", ").nilIfBlank)
                DetailRow(label: "Tax number", value: customer.taxNumber)
                DetailRow(label: "Industry", value: customer.industryType)
            }
        }
    }

    private func peopleCard(_ contacts: [Contact]) -> some View {
        Card(
            "People",
            symbol: "person.2",
            accessory: session.can(.customersUpdate)
                ? AnyView(
                    Button {
                        showsNewContact = true
                    } label: {
                        Image(systemName: "plus.circle")
                    }
                )
                : nil
        ) {
            VStack(spacing: 12) {
                if contacts.isEmpty {
                    Text("No contacts yet.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                ForEach(contacts) { contact in
                    HStack(spacing: 10) {
                        Avatar(name: contact.name, size: 32)
                        VStack(alignment: .leading, spacing: 1) {
                            HStack(spacing: 5) {
                                Text(contact.name).font(.subheadline.weight(.medium))
                                if contact.isPrimary == true {
                                    Image(systemName: "star.fill")
                                        .font(.caption2)
                                        .foregroundStyle(.yellow)
                                }
                            }
                            if let designation = contact.designation?.nilIfBlank {
                                Text(designation).font(.caption2).foregroundStyle(.secondary)
                            }
                            if let email = contact.email?.nilIfBlank {
                                Text(email).font(.caption2).foregroundStyle(.tertiary)
                            }
                        }

                        Spacer()

                        if let phone = contact.phone?.nilIfBlank,
                           let url = URL(string: "tel://\(phone.filter { !$0.isWhitespace })") {
                            Link(destination: url) {
                                Image(systemName: "phone.circle.fill").font(.title3)
                            }
                        }

                        if session.can(.customersUpdate) {
                            Button {
                                editingContact = contact
                            } label: {
                                Image(systemName: "pencil.circle")
                                    .font(.title3)
                                    .foregroundStyle(.secondary)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }

    private func leadsCard(_ leads: [Lead]) -> some View {
        Card("Leads", symbol: "bolt") {
            VStack(spacing: 10) {
                ForEach(leads) { lead in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(lead.projectTitle).font(.subheadline).lineLimit(1)
                            Text(lead.enquiryNumber).font(.caption2).foregroundStyle(.secondary)
                        }
                        Spacer()
                        StatusChip(text: lead.status.label, tint: lead.status.tint)
                    }
                }
            }
        }
    }
}

struct ContactActionRow: View {
    let label: String
    let value: String
    let symbol: String
    let url: URL?

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer(minLength: 12)
            if let url {
                Link(destination: url) {
                    HStack(spacing: 5) {
                        Text(value).lineLimit(1)
                        Image(systemName: symbol).font(.caption2)
                    }
                    .font(.subheadline)
                }
            } else {
                Text(value).font(.subheadline)
            }
        }
    }
}


// MARK: - Create / edit

/// Creates a customer, or edits an existing one when `customer` is supplied.
struct CustomerFormView: View {
    let customer: Customer?
    let onSaved: () async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var displayName: String
    @State private var legalName: String
    @State private var type: CustomerType
    @State private var email: String
    @State private var phone: String
    @State private var whatsapp: String
    @State private var website: String
    @State private var addressLine1: String
    @State private var area: String
    @State private var city: String
    @State private var country: String
    @State private var taxNumber: String
    @State private var industryType: String
    @State private var notes: String

    @State private var isSaving = false
    @State private var errorMessage: String?

    init(customer: Customer? = nil, onSaved: @escaping () async -> Void) {
        self.customer = customer
        self.onSaved = onSaved
        _displayName = State(initialValue: customer?.displayName ?? "")
        _legalName = State(initialValue: customer?.legalName ?? "")
        _type = State(initialValue: customer?.customerType ?? .company)
        _email = State(initialValue: customer?.email ?? "")
        _phone = State(initialValue: customer?.phone ?? "")
        _whatsapp = State(initialValue: customer?.whatsapp ?? "")
        _website = State(initialValue: customer?.website ?? "")
        _addressLine1 = State(initialValue: customer?.addressLine1 ?? "")
        _area = State(initialValue: customer?.area ?? "")
        _city = State(initialValue: customer?.city ?? "")
        _country = State(initialValue: customer?.country ?? "")
        _taxNumber = State(initialValue: customer?.taxNumber ?? "")
        _industryType = State(initialValue: customer?.industryType ?? "")
        _notes = State(initialValue: customer?.notes ?? "")
    }

    private var canSave: Bool {
        !displayName.trimmingCharacters(in: .whitespaces).isEmpty && !isSaving
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Customer") {
                    TextField("Display name", text: $displayName)
                    TextField("Legal name", text: $legalName)
                    Picker("Type", selection: $type) {
                        ForEach(CustomerType.allCases) { option in
                            Label(option.label, systemImage: option.symbol).tag(option)
                        }
                    }
                    TextField("Industry", text: $industryType)
                    TextField("Tax number", text: $taxNumber)
                }

                Section("Contact") {
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                    TextField("Phone", text: $phone).keyboardType(.phonePad)
                    TextField("WhatsApp", text: $whatsapp).keyboardType(.phonePad)
                    TextField("Website", text: $website)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                }

                Section("Address") {
                    TextField("Address line", text: $addressLine1)
                    TextField("Area", text: $area)
                    TextField("City", text: $city)
                    TextField("Country", text: $country)
                }

                Section("Notes") {
                    TextField("Optional", text: $notes, axis: .vertical).lineLimit(2...5)
                }

                if let errorMessage {
                    Section {
                        Label(errorMessage, systemImage: "exclamationmark.triangle")
                            .foregroundStyle(.red)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle(customer == nil ? "New Customer" : "Edit Customer")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }.disabled(!canSave)
                }
            }
            .overlay { if isSaving { LoadingState(message: "Saving…") } }
        }
    }

    private func save() async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        // customerCode is generated server-side when omitted on create, and
        // must not be sent on update.
        var payload: [String: String] = [
            "displayName": displayName.trimmingCharacters(in: .whitespaces),
            "customerType": type.rawValue,
        ]
        let optionals: [String: String] = [
            "legalName": legalName, "email": email, "phone": phone, "whatsapp": whatsapp,
            "website": website, "addressLine1": addressLine1, "area": area, "city": city,
            "country": country, "taxNumber": taxNumber, "industryType": industryType,
            "notes": notes,
        ]
        for (key, value) in optionals {
            if let value = value.nilIfBlank { payload[key] = value }
        }

        do {
            if let customer {
                try await APIClient.shared.send(
                    "customers/\(customer.id)", method: .patch, body: payload
                )
            } else {
                try await APIClient.shared.send("customers", method: .post, body: payload)
            }
            await onSaved()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

/// Adds or edits one contact person under a customer.
struct ContactFormView: View {
    let customerID: String
    let contact: Contact?
    let onSaved: () async -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var name: String
    @State private var designation: String
    @State private var department: String
    @State private var email: String
    @State private var phone: String
    @State private var whatsapp: String
    @State private var isPrimary: Bool
    @State private var isSaving = false
    @State private var isDeleting = false
    @State private var errorMessage: String?

    init(customerID: String, contact: Contact?, onSaved: @escaping () async -> Void) {
        self.customerID = customerID
        self.contact = contact
        self.onSaved = onSaved
        _name = State(initialValue: contact?.name ?? "")
        _designation = State(initialValue: contact?.designation ?? "")
        _department = State(initialValue: contact?.department ?? "")
        _email = State(initialValue: contact?.email ?? "")
        _phone = State(initialValue: contact?.phone ?? "")
        _whatsapp = State(initialValue: contact?.whatsapp ?? "")
        _isPrimary = State(initialValue: contact?.isPrimary ?? false)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Person") {
                    TextField("Full name", text: $name)
                    TextField("Designation", text: $designation)
                    TextField("Department", text: $department)
                }

                Section("Reach") {
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                    TextField("Phone", text: $phone).keyboardType(.phonePad)
                    TextField("WhatsApp", text: $whatsapp).keyboardType(.phonePad)
                }

                Section {
                    Toggle("Primary contact", isOn: $isPrimary)
                } footer: {
                    Text("The primary contact is the default recipient on quotations and invoices.")
                }

                if contact != nil {
                    Section {
                        Button("Delete Contact", role: .destructive) {
                            Task { await delete() }
                        }
                        .frame(maxWidth: .infinity)
                        .disabled(isDeleting)
                    }
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage).font(.footnote).foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle(contact == nil ? "New Contact" : "Edit Contact")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isSaving)
                }
            }
            .overlay { if isSaving || isDeleting { LoadingState(message: "Saving…") } }
        }
    }

    private var basePath: String { "customers/\(customerID)/contacts" }

    private func save() async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        struct Payload: Encodable, Sendable {
            let name: String
            let designation: String?
            let department: String?
            let email: String?
            let phone: String?
            let whatsapp: String?
            let isPrimary: Bool
        }

        let payload = Payload(
            name: name.trimmingCharacters(in: .whitespaces),
            designation: designation.nilIfBlank,
            department: department.nilIfBlank,
            email: email.nilIfBlank,
            phone: phone.nilIfBlank,
            whatsapp: whatsapp.nilIfBlank,
            isPrimary: isPrimary
        )

        do {
            if let contact {
                try await APIClient.shared.send(
                    "\(basePath)/\(contact.id)", method: .patch, body: payload
                )
            } else {
                try await APIClient.shared.send(basePath, method: .post, body: payload)
            }
            await onSaved()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    private func delete() async {
        guard let contact else { return }
        isDeleting = true
        defer { isDeleting = false }
        do {
            try await APIClient.shared.send("\(basePath)/\(contact.id)", method: .delete)
            await onSaved()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}
