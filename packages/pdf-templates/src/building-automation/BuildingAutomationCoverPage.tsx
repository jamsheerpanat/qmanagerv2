import React from "react";

export const BuildingAutomationCoverPage = ({
  projectName,
  customerName,
  customerCompany,
  proposalDate,
  proposalReference,
  revisionNumber,
  projectLocation,
}: any) => (
  <div
    className="pdf-page relative overflow-hidden"
    style={{ background: "#04080f", fontFamily: "'Montserrat', 'Inter', sans-serif" }}
  >
    {/* Background image */}
    <div
      style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/building-automation-cover.jpg')",
        backgroundSize: "cover", backgroundPosition: "center", opacity: 0.32,
      }}
    />
    {/* Dark gradient overlay */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(4,8,15,0.97) 0%, rgba(6,20,60,0.85) 55%, rgba(4,8,15,0.97) 100%)" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, #04080f 0%, transparent 100%)" }} />

    {/* Cyan top accent bar */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #0ea5e9, #06b6d4, #0ea5e9)" }} />

    {/* Grid pattern overlay */}
    <div style={{
      position: "absolute", inset: 0, opacity: 0.04,
      backgroundImage: "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
      backgroundSize: "30px 30px",
    }} />

    {/* Content */}
    <div style={{ position: "relative", zIndex: 10, height: "297mm", padding: "16mm 18mm", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

      {/* Top: Logo + Ref */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/octonics-logo.png" alt="Octonics" style={{ height: "40px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "14px", letterSpacing: "1px" }}>OCTONICS</div>
            <div style={{ color: "#06b6d4", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase" }}>INNOVATIONS</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
            <img src="/knx-partner-logo.jpg" alt="KNX" style={{ height: "22px", width: "auto", objectFit: "contain", opacity: 0.7 }} />
            <img src="/iso-certification.gif" alt="ISO" style={{ height: "22px", width: "auto", objectFit: "contain", opacity: 0.7 }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#64748b", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase" }}>Reference</div>
            <div style={{ color: "#06b6d4", fontSize: "12px", fontWeight: "600", marginTop: "2px" }}>{proposalReference || "OC-BA-2025-0001"}</div>
            {revisionNumber && revisionNumber !== "0" && (
              <div style={{ color: "#64748b", fontSize: "9px", marginTop: "2px" }}>Rev. {revisionNumber}</div>
            )}
          </div>
        </div>
      </div>

      {/* System architecture mini-graphic */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "8mm" }}>
        {[
          { icon: "💡", label: "Lighting" },
          { icon: "❄️", label: "HVAC" },
          { icon: "📡", label: "Sensors" },
          { icon: "⚡", label: "Energy" },
          { icon: "🔒", label: "Access" },
          { icon: "🖥️", label: "BMS" },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", margin: "0 auto 3px" }}>{item.icon}</div>
              <div style={{ fontSize: "6px", color: "#64748b", letterSpacing: "0.5px" }}>{item.label}</div>
            </div>
            {i < 5 && <div style={{ width: "16px", height: "1px", background: "rgba(6,182,212,0.4)", marginBottom: "14px" }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Main Title block */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "6mm" }}>
        <div style={{ marginBottom: "10px" }}>
          <span style={{ display: "inline-block", background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.4)", color: "#06b6d4", fontSize: "8px", fontWeight: "600", letterSpacing: "3px", textTransform: "uppercase", padding: "5px 14px", borderRadius: "20px" }}>
            Building Management System
          </span>
        </div>

        <h1 style={{ color: "white", fontSize: "34px", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.5px", marginBottom: "6px" }}>
          BUILDING
          <br /><span style={{ color: "#06b6d4" }}>AUTOMATION</span>
          <br />PROPOSAL
        </h1>

        <div style={{ width: "60px", height: "3px", background: "linear-gradient(90deg, #0369a1, #06b6d4)", borderRadius: "2px", marginTop: "14px", marginBottom: "12px" }} />

        <p style={{ color: "#94a3b8", fontSize: "10.5px", lineHeight: "1.6", maxWidth: "340px" }}>
          A centralized intelligent building solution designed for efficiency, control, monitoring, energy optimization, and operational excellence.
        </p>

        {projectName && (
          <div style={{ marginTop: "14px", padding: "10px 14px", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "8px", display: "inline-block" }}>
            <div style={{ color: "#64748b", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "3px" }}>Project</div>
            <div style={{ color: "white", fontSize: "14px", fontWeight: "700" }}>{projectName}</div>
            {projectLocation && <div style={{ color: "#06b6d4", fontSize: "9px", marginTop: "2px" }}>📍 {projectLocation}</div>}
          </div>
        )}
      </div>

      {/* Bottom: 3-col info strip */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        <div>
          <div style={{ color: "#475569", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Prepared For</div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>{customerName || "—"}</div>
          {customerCompany && <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "1px" }}>{customerCompany}</div>}
        </div>
        <div>
          <div style={{ color: "#475569", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Prepared By</div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>Octonics Innovations</div>
          <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "1px" }}>Kuwait</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#475569", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Proposal Date</div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>{proposalDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</div>
        </div>
      </div>
    </div>

    {/* Cyan bottom accent */}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0369a1, #06b6d4, #0369a1)" }} />
  </div>
);
