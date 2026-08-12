import SwiftUI

struct MainTabView: View {
    @Environment(SessionStore.self) private var session
    @State private var unreadCount = 0

    var body: some View {
        TabView {
            Tab("Home", systemImage: "square.grid.2x2") {
                DashboardView(unreadCount: $unreadCount)
            }

            if session.can(.quotationsView) {
                Tab("Quotations", systemImage: "doc.text") {
                    QuotationListView()
                }
            }

            if session.can(.invoicesView) {
                Tab("Invoices", systemImage: "doc.plaintext") {
                    InvoiceListView()
                }
            }

            if session.can(.customersView) {
                Tab("Customers", systemImage: "building.2") {
                    CustomerListView()
                }
            }

            Tab("More", systemImage: "ellipsis.circle") {
                MoreView(unreadCount: $unreadCount)
            }
        }
    }
}

/// Everything that does not earn a tab: CRM, catalog, reports and admin.
struct MoreView: View {
    @Environment(SessionStore.self) private var session
    @Binding var unreadCount: Int

    var body: some View {
        NavigationStack {
            List {
                Section {
                    if let user = session.user {
                        HStack(spacing: 14) {
                            Avatar(name: user.name, size: 52)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(user.name).font(.headline)
                                Text(user.email)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                if let role = user.roles.first {
                                    Text(role)
                                        .font(.caption2.weight(.semibold))
                                        .foregroundStyle(Brand.primary)
                                }
                            }
                        }
                        .padding(.vertical, 6)
                    }
                }

                Section("Workspace") {
                    NavigationLink {
                        NotificationCenterView(unreadCount: $unreadCount)
                    } label: {
                        Label {
                            HStack {
                                Text("Notifications")
                                Spacer()
                                if unreadCount > 0 {
                                    Text("\(unreadCount)")
                                        .font(.caption2.weight(.bold))
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 7)
                                        .padding(.vertical, 3)
                                        .background(.red, in: Capsule())
                                }
                            }
                        } icon: {
                            Image(systemName: "bell")
                        }
                    }

                    if session.can(.leadsView) {
                        NavigationLink {
                            LeadListView()
                        } label: {
                            Label("Leads", systemImage: "bolt")
                        }
                    }

                    if session.can(.reportsView) {
                        NavigationLink {
                            ReportsView()
                        } label: {
                            Label("Reports", systemImage: "chart.bar.doc.horizontal")
                        }
                    }
                }

                if session.can(.productsView) || session.can(.settingsManage) {
                    Section("Catalog") {
                        if session.can(.productsView) {
                            NavigationLink {
                                ProductListView()
                            } label: {
                                Label("Products", systemImage: "shippingbox")
                            }

                            NavigationLink {
                                ServiceTypeListView()
                            } label: {
                                Label("Service Types", systemImage: "square.grid.2x2")
                            }
                        }

                        NavigationLink {
                            TermsMasterView()
                        } label: {
                            Label("Terms & Conditions", systemImage: "doc.plaintext")
                        }
                    }
                }

                if session.can(.usersManage) || session.can(.settingsManage) || session.can(.auditView) {
                    Section("Administration") {
                        if session.can(.usersManage) {
                            NavigationLink {
                                UsersView()
                            } label: {
                                Label("Users", systemImage: "person.2")
                            }
                        }

                        if session.can(.settingsManage) {
                            NavigationLink {
                                RolesView()
                            } label: {
                                Label("Roles & Permissions", systemImage: "checkmark.shield")
                            }

                            NavigationLink {
                                CompanySettingsView()
                            } label: {
                                Label("Company", systemImage: "building.columns")
                            }

                            NavigationLink {
                                PDFTemplatesView()
                            } label: {
                                Label("PDF Templates", systemImage: "doc.richtext")
                            }
                        }

                        if session.can(.auditView) {
                            NavigationLink {
                                AuditLogView()
                            } label: {
                                Label("Audit Log", systemImage: "clipboard")
                            }
                        }
                    }
                }

                Section {
                    NavigationLink {
                        SettingsView()
                    } label: {
                        Label("App Settings", systemImage: "gearshape")
                    }
                }
            }
            .navigationTitle("More")
        }
    }
}
