import SwiftUI

@MainActor
@Observable
final class LeadListModel {
    var phase: LoadPhase<[Lead]> = .idle
    var search = ""
    var statusFilter: LeadStatus?

    private let api: APIClient
    init(api: APIClient = .shared) { self.api = api }

    var filtered: [Lead] {
        let all = phase.value ?? []
        let term = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return all.filter { lead in
            if let statusFilter, lead.status != statusFilter { return false }
            guard !term.isEmpty else { return true }
            return lead.projectTitle.lowercased().contains(term)
                || lead.enquiryNumber.lowercased().contains(term)
                || (lead.customer?.displayName.lowercased().contains(term) ?? false)
        }
    }

    var availableStatuses: [LeadStatus] {
        let present = Set((phase.value ?? []).map(\.status))
        return LeadStatus.allCases.filter { present.contains($0) }
    }

    func load(showSpinner: Bool = true) async {
        if showSpinner, phase.value == nil { phase = .loading }
        do {
            phase = .loaded(try await api.get("leads", as: [Lead].self))
        } catch {
            if phase.value == nil { phase = .failed(error) }
        }
    }

    func updateStatus(_ lead: Lead, to status: LeadStatus) async {
        try? await api.send(
            "leads/\(lead.id)",
            method: .patch,
            body: ["status": status.rawValue]
        )
        await load(showSpinner: false)
    }
}

struct LeadListView: View {
    @Environment(SessionStore.self) private var session
    @State private var model = LeadListModel()
    @State private var showsNew = false

    var body: some View {
        AsyncContent(
            phase: model.phase,
            emptyTitle: "No leads",
            emptySymbol: "bolt",
            emptyMessage: "Enquiries you capture will appear here.",
            retry: { Task { await model.load() } }
        ) { _ in
            List {
                if !model.availableStatuses.isEmpty {
                    Section {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                FilterChip(title: "All", isOn: model.statusFilter == nil, tint: Brand.primary) {
                                    model.statusFilter = nil
                                }
                                ForEach(model.availableStatuses) { status in
                                    FilterChip(
                                        title: status.label,
                                        isOn: model.statusFilter == status,
                                        tint: status.tint
                                    ) {
                                        model.statusFilter = model.statusFilter == status ? nil : status
                                    }
                                }
                            }
                        }
                        .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                    }
                    .listRowBackground(Color.clear)
                }

                ForEach(model.filtered) { lead in
                    NavigationLink(value: lead) {
                        LeadRow(lead: lead)
                    }
                    .swipeActions(edge: .trailing) {
                        if session.can(.leadsUpdate), lead.status != .won {
                            Button {
                                Task { await model.updateStatus(lead, to: .won) }
                            } label: {
                                Label("Won", systemImage: "trophy")
                            }
                            .tint(.green)
                        }
                    }
                }
            }
            .listStyle(.plain)
            .navigationDestination(for: Lead.self) { lead in
                LeadDetailView(lead: lead)
            }
        }
        .navigationTitle("Leads")
        .searchable(text: $model.search, prompt: "Project, enquiry or customer")
        .refreshable { await model.load(showSpinner: false) }
        .task { if model.phase.value == nil { await model.load() } }
        .toolbar {
            if session.can(.leadsCreate) {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showsNew = true } label: { Image(systemName: "plus") }
                }
            }
        }
        .sheet(isPresented: $showsNew) {
            LeadFormView { await model.load(showSpinner: false) }
        }
    }
}

struct LeadRow: View {
    let lead: Lead

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(lead.enquiryNumber)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Spacer()
                StatusChip(text: lead.status.label, tint: lead.status.tint)
            }

            Text(lead.projectTitle)
                .font(.subheadline.weight(.medium))
                .lineLimit(2)

            HStack {
                if let customer = lead.customer?.displayName {
                    Label(customer, systemImage: "building.2")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                Spacer()
                if let budget = lead.expectedBudget, budget > 0 {
                    Text(Format.compactMoney(budget))
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct LeadDetailView: View {
    let lead: Lead

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Card {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            StatusChip(text: lead.status.label, tint: lead.status.tint)
                            Spacer()
                            Text(lead.enquiryNumber)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Text(lead.projectTitle).font(.title3.weight(.semibold))
                        if let customer = lead.customer {
                            HStack(spacing: 10) {
                                Avatar(name: customer.displayName, size: 34)
                                Text(customer.displayName).font(.subheadline)
                            }
                        }
                    }
                }

                Card("Details", symbol: "info.circle") {
                    VStack(spacing: 10) {
                        DetailRow(label: "Source", value: lead.source.label)
                        DetailRow(label: "Priority", value: lead.priority?.capitalized)
                        DetailRow(label: "Location", value: lead.location)
                        DetailRow(label: "Enquiry date", value: Format.date(lead.enquiryDate))
                        DetailRow(label: "Expected close", value: Format.date(lead.expectedClosingDate))
                        if let budget = lead.expectedBudget, budget > 0 {
                            DetailRow(
                                label: "Expected budget",
                                value: Format.money(budget),
                                emphasised: true
                            )
                        }
                        DetailRow(label: "Assigned to", value: lead.assignedTo?.name)
                        if lead.siteVisitRequired == true {
                            DetailRow(label: "Site visit", value: Format.date(lead.siteVisitDate))
                        }
                    }
                }

                if let summary = lead.requirementSummary?.strippingHTML.nilIfBlank {
                    Card("Requirement", symbol: "text.alignleft") {
                        Text(summary).font(.subheadline)
                    }
                }

                if let contact = lead.contact {
                    Card("Contact", symbol: "person.crop.circle") {
                        VStack(spacing: 10) {
                            DetailRow(label: "Name", value: contact.name)
                            DetailRow(label: "Designation", value: contact.designation)
                            if let phone = contact.phone?.nilIfBlank {
                                ContactActionRow(
                                    label: "Phone",
                                    value: phone,
                                    symbol: "phone.fill",
                                    url: URL(string: "tel://\(phone.filter { !$0.isWhitespace })")
                                )
                            }
                        }
                    }
                }

                if let notes = lead.notes?.nilIfBlank {
                    Card("Notes", symbol: "note.text") {
                        Text(notes).font(.subheadline)
                    }
                }
            }
            .padding(16)
        }
        .background(Brand.surface)
        .navigationTitle(lead.enquiryNumber)
        .navigationBarTitleDisplayMode(.inline)
    }
}
