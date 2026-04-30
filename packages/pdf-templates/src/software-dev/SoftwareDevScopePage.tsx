import React from "react";
import { SDHeader, SDFooter } from "./SoftwareDevAboutPage";

const ScopeCard = ({ number, icon, title, intro, features }: { number: string; icon: string; title: string; intro: string; features: string[] }) => (
  <div style={{ marginBottom: "9px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 10px", background: "linear-gradient(90deg, #1e1b4b, #312e81)", borderBottom: "1px solid #4f46e5" }}>
      <span style={{ fontSize: "11px" }}>{icon}</span>
      <span style={{ fontSize: "7px", fontWeight: "800", color: "#a5b4fc", background: "rgba(165,180,252,0.12)", padding: "1px 5px", borderRadius: "3px" }}>{number}</span>
      <span style={{ fontSize: "8.5px", fontWeight: "700", color: "white", letterSpacing: "0.3px", fontFamily: "'Montserrat', sans-serif" }}>{title}</span>
    </div>
    <div style={{ padding: "7px 10px" }}>
      <p style={{ fontSize: "7.5px", color: "#475569", lineHeight: "1.5", marginBottom: "5px" }}>{intro}</p>
      <div style={{ display: "flex", flexWrap: "wrap" as any, gap: "3px" }}>
        {features.map((f, i) => (
          <span key={i} style={{ fontSize: "7px", color: "#334155", background: "#f1f5f9", padding: "2px 6px", borderRadius: "3px", border: "1px solid #e2e8f0" }}>• {f}</span>
        ))}
      </div>
    </div>
  </div>
);

const SCOPES = [
  { number: "01", icon: "🌐", title: "WEB APPLICATION DEVELOPMENT", intro: "A secure and responsive web application for office users, management teams, admins, and operational departments.", features: ["Secure login", "User management", "Role-based access", "Dashboard", "Data entry forms", "Workflow management", "Reports & analytics", "PDF generation", "Email notifications", "Activity logs"] },
  { number: "02", icon: "📱", title: "MOBILE APPLICATION DEVELOPMENT", intro: "Mobile apps for customers, employees, field staff, technicians, sales teams, or management users.", features: ["Android & iOS", "Mobile login", "User dashboard", "Push notifications", "QR code scanning", "Mobile forms", "Task updates", "Real-time status"] },
  { number: "03", icon: "🏢", title: "BUSINESS MANAGEMENT SYSTEM / ERP", intro: "Custom business modules to manage core operations in a structured digital platform.", features: ["Customer management", "Lead management", "Quotation management", "Invoice management", "Inventory management", "Purchase management", "HR records", "Branch management", "Approval workflows"] },
  { number: "04", icon: "🎯", title: "CRM & SALES AUTOMATION", intro: "CRM tools to manage leads, customers, follow-ups, quotations, and sales pipelines more effectively.", features: ["Lead registration", "Customer database", "Enquiry tracking", "Follow-up reminders", "Sales pipeline", "Quotation tracking", "Communication history", "Conversion reports"] },
  { number: "05", icon: "📄", title: "DOCUMENT & PDF AUTOMATION", intro: "Generate professional documents automatically using predefined templates and approved data.", features: ["Quotations & proposals", "Invoices & receipts", "Delivery notes", "Work orders", "Agreements", "Auto numbering", "Company branding", "QR verification", "Signature section"] },
  { number: "06", icon: "📊", title: "DASHBOARDS & REPORTS", intro: "Dashboards and reports provide management with clear visibility of business performance.", features: ["Management dashboard", "Sales dashboard", "Customer reports", "Quotation reports", "Invoice reports", "Payment status", "User activity", "Export PDF / Excel", "Date filtering"] },
  { number: "07", icon: "🔗", title: "INTEGRATION SERVICES", intro: "The software can be integrated with selected external systems and services depending on project requirements.", features: ["Email service", "SMS / WhatsApp", "Payment gateway", "Accounting software", "Barcode & QR", "API integrations", "Cloud storage", "Third-party tools"] },
];

const DELIVERABLES = [
  "Requirement analysis",
  "System architecture planning",
  "UI/UX design",
  "Database design",
  "Web application development",
  "Mobile app development (if included)",
  "Admin panel development",
  "PDF & document template setup",
  "Reports & dashboard setup",
  "Testing and bug fixing",
  "Deployment support",
  "User training",
  "Basic technical documentation",
  "Post-deployment support as agreed",
];

export const SoftwareDevScopePage = () => (
  <div className="pdf-page" style={{ fontFamily: "'Inter', 'Montserrat', sans-serif", background: "#f8fafc" }}>
    <div style={{ padding: "14mm 16mm", height: "297mm", display: "flex", flexDirection: "column" }}>
      <SDHeader pageTitle="Scope, Features & Deliverables" />

      <div style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "7px", fontWeight: "700", letterSpacing: "2px", color: "#6366f1", textTransform: "uppercase", background: "#eef2ff", padding: "3px 10px", borderRadius: "4px" }}>Page 2 — Proposed Scope</span>
      </div>

      <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", lineHeight: "1.2", fontFamily: "'Montserrat', sans-serif", marginBottom: "4px" }}>
        PROPOSED SOFTWARE <span style={{ color: "#4f46e5" }}>DEVELOPMENT SCOPE</span>
      </h2>
      <div style={{ width: "50px", height: "3px", background: "linear-gradient(90deg,#4f46e5,#818cf8)", borderRadius: "2px", marginBottom: "8px" }} />
      <p style={{ fontSize: "8.5px", color: "#64748b", marginBottom: "10px" }}>
        The proposed software solution can include the following modules and capabilities based on the selected project scope and approved quotation items.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px", flex: 1 }}>
        <div>{SCOPES.slice(0, 4).map((s) => <ScopeCard key={s.number} {...s} />)}</div>
        <div>
          {SCOPES.slice(4).map((s) => <ScopeCard key={s.number} {...s} />)}
          {/* Deliverables */}
          <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: "8px", padding: "10px 12px", marginTop: "4px" }}>
            <div style={{ color: "#a5b4fc", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "7px" }}>📦 Deliverables</div>
            <div style={{ display: "flex", flexDirection: "column" as any, gap: "3px" }}>
              {DELIVERABLES.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6366f1", flexShrink: 0, marginTop: "3px" }} />
                  <span style={{ fontSize: "7.5px", color: "#c7d2fe", lineHeight: "1.4" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SDFooter pageNum={2} />
    </div>
  </div>
);
