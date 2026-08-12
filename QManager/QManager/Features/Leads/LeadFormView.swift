import SwiftUI

struct LeadFormView: View {
    let onCreated: () async -> Void

    @Environment(CatalogStore.self) private var catalog
    @Environment(\.dismiss) private var dismiss

    @State private var customerID = ""
    @State private var projectTitle = ""
    @State private var requirementSummary = ""
    @State private var location = ""
    @State private var source: LeadSource = .directSales
    @State private var status: LeadStatus = .new
    @State private var priority = "MEDIUM"
    @State private var expectedBudget: Double = 0
    @State private var expectedClosingDate = Date().addingTimeInterval(30 * 86_400)
    @State private var hasClosingDate = false
    @State private var siteVisitRequired = false
    @State private var notes = ""

    @State private var isSaving = false
    @State private var errorMessage: String?

    private var canSave: Bool {
        !customerID.isEmpty
            && !projectTitle.trimmingCharacters(in: .whitespaces).isEmpty
            && !isSaving
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Customer") {
                    Picker("Customer", selection: $customerID) {
                        Text("Select…").tag("")
                        ForEach(catalog.customers) {
                            Text("\($0.displayName) (\($0.customerCode))").tag($0.id)
                        }
                    }
                    .pickerStyle(.navigationLink)
                }

                Section("Enquiry") {
                    TextField("Project title", text: $projectTitle)
                    TextField("Location", text: $location)
                    TextField("Requirement summary", text: $requirementSummary, axis: .vertical)
                        .lineLimit(3...8)
                }

                Section("Classification") {
                    Picker("Source", selection: $source) {
                        ForEach(LeadSource.allCases) { Text($0.label).tag($0) }
                    }
                    Picker("Status", selection: $status) {
                        ForEach(LeadStatus.allCases.filter { $0 != .unknown }) { Text($0.label).tag($0) }
                    }
                    Picker("Priority", selection: $priority) {
                        ForEach(["LOW", "MEDIUM", "HIGH", "URGENT"], id: \.self) {
                            Text($0.capitalized).tag($0)
                        }
                    }
                }

                Section("Commercial") {
                    LabeledContent("Expected budget") {
                        TextField("0", value: $expectedBudget, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                    Toggle("Has expected close date", isOn: $hasClosingDate)
                    if hasClosingDate {
                        DatePicker(
                            "Expected close",
                            selection: $expectedClosingDate,
                            displayedComponents: .date
                        )
                    }
                    Toggle("Site visit required", isOn: $siteVisitRequired)
                }

                Section("Notes") {
                    TextField("Optional", text: $notes, axis: .vertical).lineLimit(2...5)
                }

                if let errorMessage {
                    Section {
                        Label(errorMessage, systemImage: "exclamationmark.triangle")
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("New Lead")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }.disabled(!canSave)
                }
            }
            .overlay { if isSaving { LoadingState(message: "Saving…") } }
            .task { await catalog.loadIfNeeded() }
        }
    }

    private func save() async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }

        // enquiryNumber is generated server-side when omitted.
        struct Payload: Encodable, Sendable {
            let customerId: String
            let projectTitle: String
            let requirementSummary: String?
            let location: String?
            let source: String
            let status: String
            let priority: String
            let expectedBudget: Double?
            let expectedClosingDate: Date?
            let siteVisitRequired: Bool
            let notes: String?
        }

        do {
            try await APIClient.shared.send(
                "leads",
                method: .post,
                body: Payload(
                    customerId: customerID,
                    projectTitle: projectTitle.trimmingCharacters(in: .whitespaces),
                    requirementSummary: requirementSummary.nilIfBlank,
                    location: location.nilIfBlank,
                    source: source.rawValue,
                    status: status.rawValue,
                    priority: priority,
                    expectedBudget: expectedBudget > 0 ? expectedBudget : nil,
                    expectedClosingDate: hasClosingDate ? expectedClosingDate : nil,
                    siteVisitRequired: siteVisitRequired,
                    notes: notes.nilIfBlank
                )
            )
            await onCreated()
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}
