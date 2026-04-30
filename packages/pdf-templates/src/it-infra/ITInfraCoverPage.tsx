import React from "react";

export const ITInfraCoverPage = ({
  projectName, customerName, customerCompany,
  proposalDate, proposalReference, revisionNumber, projectLocation,
}: any) => (
  <div className="pdf-page relative overflow-hidden" style={{ background: "#050a0f", fontFamily: "'Montserrat', 'Inter', sans-serif" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/it-infra-cover.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.30 }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(5,10,15,0.97) 0%, rgba(5,25,55,0.88) 55%, rgba(5,10,15,0.97) 100%)" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(to top, #050a0f 0%, transparent 100%)" }} />
    {/* Steel-blue top bar */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #0369a1, #38bdf8, #0ea5e9, #38bdf8, #0369a1)" }} />
    {/* Circuit trace pattern */}
    <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

    <div style={{ position: "relative", zIndex: 10, height: "297mm", padding: "16mm 18mm", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "linear-gradient(135deg, #0369a1, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", color: "white" }}>O</div>
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "14px", letterSpacing: "1px" }}>OCTONICS</div>
            <div style={{ color: "#38bdf8", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase" }}>INNOVATIONS</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#475569", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase" }}>Reference</div>
          <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: "600", marginTop: "2px" }}>{proposalReference || "OC-IT-2025-0001"}</div>
          {revisionNumber && revisionNumber !== "0" && <div style={{ color: "#475569", fontSize: "9px", marginTop: "2px" }}>Rev. {revisionNumber}</div>}
        </div>
      </div>

      {/* Layer-style system icon row */}
      <div style={{ marginTop: "8mm" }}>
        <div style={{ fontSize: "7px", color: "#475569", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Infrastructure Layers</div>
        <div style={{ display: "flex", gap: "0" }}>
          {[
            { icon: "🛡️", label: "Firewall" },
            { icon: "🌐", label: "Network" },
            { icon: "📡", label: "Wi-Fi" },
            { icon: "🔌", label: "Cabling" },
            { icon: "🖥️", label: "Servers" },
            { icon: "💾", label: "Backup" },
            { icon: "🔧", label: "Support" },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              <div style={{ textAlign: "center", padding: "6px 10px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.18)", borderRight: i < 6 ? "none" : "1px solid rgba(56,189,248,0.18)", borderRadius: i === 0 ? "6px 0 0 6px" : i === 6 ? "0 6px 6px 0" : "0" }}>
                <div style={{ fontSize: "14px", marginBottom: "2px" }}>{item.icon}</div>
                <div style={{ fontSize: "6px", color: "#64748b", letterSpacing: "0.5px" }}>{item.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main title */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "6mm" }}>
        <div style={{ marginBottom: "10px" }}>
          <span style={{ display: "inline-block", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8", fontSize: "8px", fontWeight: "600", letterSpacing: "3px", textTransform: "uppercase", padding: "5px 14px", borderRadius: "20px" }}>IT Infrastructure</span>
        </div>
        <h1 style={{ color: "white", fontSize: "33px", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.5px", marginBottom: "6px" }}>
          IT<br /><span style={{ color: "#38bdf8" }}>INFRASTRUCTURE</span><br />PROPOSAL
        </h1>
        <div style={{ width: "60px", height: "3px", background: "linear-gradient(90deg, #0369a1, #38bdf8)", borderRadius: "2px", marginTop: "14px", marginBottom: "12px" }} />
        <p style={{ color: "#94a3b8", fontSize: "10.5px", lineHeight: "1.6", maxWidth: "340px" }}>
          A secure, reliable, and scalable IT infrastructure solution designed to support modern business operations.
        </p>
        {projectName && (
          <div style={{ marginTop: "14px", padding: "10px 14px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.18)", borderRadius: "8px", display: "inline-block" }}>
            <div style={{ color: "#475569", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "3px" }}>Project</div>
            <div style={{ color: "white", fontSize: "14px", fontWeight: "700" }}>{projectName}</div>
            {projectLocation && <div style={{ color: "#38bdf8", fontSize: "9px", marginTop: "2px" }}>📍 {projectLocation}</div>}
          </div>
        )}
      </div>

      {/* Bottom strip */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        <div>
          <div style={{ color: "#334155", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Prepared For</div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>{customerName || "—"}</div>
          {customerCompany && <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "1px" }}>{customerCompany}</div>}
        </div>
        <div>
          <div style={{ color: "#334155", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Prepared By</div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>Octonics Innovations</div>
          <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "1px" }}>Kuwait</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#334155", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Proposal Date</div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>{proposalDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</div>
        </div>
      </div>
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0369a1, #38bdf8, #0369a1)" }} />
  </div>
);
