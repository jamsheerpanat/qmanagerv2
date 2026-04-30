import React from "react";
import { ITHeader, ITFooter } from "./ITInfraAboutPage";

const ScopeCard = ({ number, icon, title, intro, features }: { number: string; icon: string; title: string; intro: string; features: string[] }) => (
  <div style={{ marginBottom: "9px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 10px", background: "linear-gradient(90deg, #0c1a2e, #0c2d50)", borderBottom: "1px solid #0369a1" }}>
      <span style={{ fontSize: "12px" }}>{icon}</span>
      <span style={{ fontSize: "7px", fontWeight: "800", color: "#38bdf8", background: "rgba(56,189,248,0.12)", padding: "1px 5px", borderRadius: "3px" }}>{number}</span>
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
  { number: "01", icon: "🌐", title: "NETWORK DESIGN & IMPLEMENTATION", intro: "A professional network design ensures stable connectivity, proper segmentation, reliable performance, and easier maintenance.", features: ["Network architecture planning", "IP address planning", "LAN design", "WAN design", "VLAN configuration", "Switch configuration", "Router configuration", "Internet failover", "Network documentation"] },
  { number: "02", icon: "🛡️", title: "FIREWALL & CYBERSECURITY", intro: "Firewall and security configuration protect the business network from unauthorized access, threats, misuse, and unsafe traffic.", features: ["Firewall installation", "Security policy", "Internet access control", "VPN configuration", "Remote access security", "Web filtering", "Application control", "IPS where licensed", "Security best practices"] },
  { number: "03", icon: "🔌", title: "STRUCTURED CABLING", intro: "Structured cabling provides the physical foundation for reliable network, telephone, CCTV, access control, and other low-voltage systems.", features: ["Cat6 / Cat6A cabling", "Fiber backbone", "Patch panel termination", "Faceplate installation", "Rack installation", "Cable labeling", "Cable testing", "Clean rack dressing"] },
  { number: "04", icon: "📡", title: "WI-FI INFRASTRUCTURE", intro: "Enterprise-grade Wi-Fi provides reliable wireless connectivity for staff, guests, mobile devices, and business applications.", features: ["AP placement planning", "Wi-Fi coverage design", "Staff Wi-Fi network", "Guest Wi-Fi network", "VLAN-based separation", "Controller-based management", "Secure wireless auth", "Roaming support"] },
  { number: "05", icon: "🖥️", title: "SERVER & STORAGE SOLUTIONS", intro: "Servers and storage systems support centralized data, applications, user access, backup, and business continuity.", features: ["File server setup", "Application server", "Virtualization support", "NAS storage setup", "User & permission mgmt", "Shared folder config", "Storage planning", "Server hardening"] },
  { number: "06", icon: "💾", title: "BACKUP & DISASTER RECOVERY", intro: "Backup and disaster recovery solutions protect business data from accidental deletion, hardware failure, ransomware, and disruption.", features: ["Local backup config", "Cloud backup option", "Scheduled backup jobs", "Backup monitoring", "Retention policy", "Recovery testing", "DR planning", "Critical data protection"] },
  { number: "07", icon: "🔧", title: "IT SUPPORT & MAINTENANCE", intro: "Ongoing IT support maintains performance, reduces downtime, and resolves issues quickly for smooth daily operations.", features: ["Preventive maintenance", "Troubleshooting", "Remote support", "On-site support", "Network health check", "Firewall health check", "Server health check", "Asset documentation"] },
];

const DELIVERABLES = [
  "IT infrastructure assessment",
  "Network design and planning",
  "Firewall configuration",
  "Switch and router configuration",
  "Structured cabling implementation",
  "Wi-Fi deployment",
  "Server and storage setup",
  "Backup configuration",
  "VPN setup",
  "Testing and verification",
  "Documentation and labeling",
  "Admin/user handover",
  "Support as per agreement",
];

export const ITInfraScopePage = () => (
  <div className="pdf-page" style={{ fontFamily: "'Inter', 'Montserrat', sans-serif", background: "#f8fafc" }}>
    <div style={{ padding: "14mm 16mm", height: "297mm", display: "flex", flexDirection: "column" }}>
      <ITHeader pageTitle="Scope, Features & Deliverables" />

      <div style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "7px", fontWeight: "700", letterSpacing: "2px", color: "#0ea5e9", textTransform: "uppercase", background: "#e0f2fe", padding: "3px 10px", borderRadius: "4px" }}>Page 2 — Proposed Scope</span>
      </div>

      <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", lineHeight: "1.2", fontFamily: "'Montserrat', sans-serif", marginBottom: "4px" }}>
        PROPOSED IT <span style={{ color: "#0369a1" }}>INFRASTRUCTURE SCOPE</span>
      </h2>
      <div style={{ width: "50px", height: "3px", background: "linear-gradient(90deg,#0369a1,#38bdf8)", borderRadius: "2px", marginBottom: "8px" }} />
      <p style={{ fontSize: "8.5px", color: "#64748b", marginBottom: "10px" }}>
        The proposed IT infrastructure solution can include the following systems and services based on the selected project scope and approved quotation items.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px", flex: 1 }}>
        <div>{SCOPES.slice(0, 4).map((s) => <ScopeCard key={s.number} {...s} />)}</div>
        <div>
          {SCOPES.slice(4).map((s) => <ScopeCard key={s.number} {...s} />)}
          <div style={{ background: "linear-gradient(135deg,#0c1a2e,#0c2d50)", borderRadius: "8px", padding: "10px 12px", marginTop: "4px" }}>
            <div style={{ color: "#38bdf8", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "7px" }}>📦 Deliverables</div>
            <div style={{ display: "flex", flexDirection: "column" as any, gap: "3px" }}>
              {DELIVERABLES.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#0ea5e9", flexShrink: 0, marginTop: "3px" }} />
                  <span style={{ fontSize: "7.5px", color: "#bae6fd", lineHeight: "1.4" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ITFooter pageNum={2} />
    </div>
  </div>
);
