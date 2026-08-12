import SwiftUI

struct LoginView: View {
    @Environment(SessionStore.self) private var session

    @State private var email = ""
    @State private var password = ""
    @State private var showsServerSheet = false
    @FocusState private var focus: Field?

    private enum Field { case email, password }

    private var canSubmit: Bool {
        email.contains("@") && password.count >= 6 && !session.isSigningIn
    }

    var body: some View {
        ZStack {
            // The wordmark is navy on white, so the sign-in surface is light:
            // knocking the logo out to mono here would throw away its gradient.
            Brand.surface.ignoresSafeArea()

            // A soft wash of the brand gradient, anchored top-left.
            RadialGradient(
                colors: [Brand.accent.opacity(0.18), .clear],
                center: .topLeading, startRadius: 20, endRadius: 520
            )
            .ignoresSafeArea()

            RadialGradient(
                colors: [Brand.primary.opacity(0.14), .clear],
                center: .bottomTrailing, startRadius: 20, endRadius: 480
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 26) {
                    Spacer(minLength: 48)

                    LogoMark(width: 236)
                        .padding(.bottom, 4)

                    VStack(spacing: 14) {
                        field(
                            "Email", text: $email, symbol: "envelope",
                            field: .email, keyboard: .emailAddress, content: .username
                        )

                        field(
                            "Password", text: $password, symbol: "lock",
                            field: .password, isSecure: true, content: .password
                        )

                        if let error = session.signInError {
                            Label(error, systemImage: "exclamationmark.circle.fill")
                                .font(.caption)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(10)
                                .background(.red.gradient, in: RoundedRectangle(cornerRadius: 10))
                                .transition(.move(edge: .top).combined(with: .opacity))
                        }

                        Button(action: submit) {
                            Group {
                                if session.isSigningIn {
                                    ProgressView().tint(.white)
                                } else {
                                    Text("Sign In").fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity, minHeight: 28)
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .disabled(!canSubmit)
                    }
                    .padding(20)
                    .background(
                        Brand.surfaceRaised,
                        in: RoundedRectangle(cornerRadius: 22)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 22)
                            .strokeBorder(Brand.primary.opacity(0.08))
                    )
                    .shadow(color: Brand.primary.opacity(0.10), radius: 22, y: 10)
                    .padding(.horizontal, 22)

                    Button {
                        showsServerSheet = true
                    } label: {
                        Label(
                            AppConfig.baseURL.host() ?? "Configure server",
                            systemImage: "server.rack"
                        )
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }

                    Spacer(minLength: 24)
                }
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .animation(.smooth, value: session.signInError)
        .onAppear { focus = .email }
        .sheet(isPresented: $showsServerSheet) {
            ServerSettingsView()
        }
    }

    @ViewBuilder
    private func field(
        _ title: String,
        text: Binding<String>,
        symbol: String,
        field: Field,
        isSecure: Bool = false,
        keyboard: UIKeyboardType = .default,
        content: UITextContentType? = nil
    ) -> some View {
        HStack(spacing: 10) {
            Image(systemName: symbol)
                .foregroundStyle(.secondary)
                .frame(width: 18)

            Group {
                if isSecure {
                    SecureField(title, text: text)
                        .onSubmit(submit)
                } else {
                    TextField(title, text: text)
                        .keyboardType(keyboard)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .onSubmit { focus = .password }
                }
            }
            .textContentType(content)
            .focused($focus, equals: field)
            .submitLabel(isSecure ? .go : .next)
        }
        .padding(12)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 12))
    }

    private func submit() {
        guard canSubmit else { return }
        focus = nil
        Task { await session.signIn(email: email, password: password) }
    }
}

/// Lets the same build target production or a developer machine.
struct ServerSettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var urlText = AppConfig.baseURL.absoluteString
    @State private var validationError: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("https://example.com", text: $urlText)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                } header: {
                    Text("API Base URL")
                } footer: {
                    if let validationError {
                        Text(validationError).foregroundStyle(.red)
                    } else {
                        Text("The address of the QManager API, without a trailing slash.")
                    }
                }

                Section("Presets") {
                    Button("Production") {
                        urlText = AppConfig.productionBaseURL.absoluteString
                    }
                    Button("Local development (localhost:3001)") {
                        urlText = AppConfig.localBaseURL.absoluteString
                    }
                }
            }
            .navigationTitle("Server")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save)
                }
            }
        }
    }

    private func save() {
        let trimmed = urlText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard
            let url = URL(string: trimmed),
            let scheme = url.scheme?.lowercased(),
            scheme == "http" || scheme == "https",
            url.host() != nil
        else {
            validationError = "Enter a full URL including http:// or https://"
            return
        }

        AppConfig.baseURL = url
        dismiss()
    }
}
