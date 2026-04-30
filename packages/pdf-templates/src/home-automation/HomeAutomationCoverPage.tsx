import React from "react";

export const HomeAutomationCoverPage = ({
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
    style={{
      background: "#0a0f1e",
      fontFamily: "'Montserrat', 'Inter', sans-serif",
    }}
  >
    {/* Background image */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/smart-home-cover.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.38,
      }}
    />

    {/* Gradient overlays */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(135deg, rgba(6,12,34,0.97) 0%, rgba(10,20,60,0.82) 50%, rgba(6,12,34,0.97) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "45%",
        background: "linear-gradient(to top, #060c22 0%, transparent 100%)",
      }}
    />

    {/* Blue accent line top */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, #1a56db, #60a5fa, #1a56db)",
      }}
    />

    {/* Content */}
    <div
      style={{
        position: "relative",
        zIndex: 10,
        height: "297mm",
        padding: "16mm 18mm",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header: Logo + Company */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/octonics-logo.png" alt="Octonics" style={{ height: "40px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            <div>
              <div style={{ color: "white", fontWeight: "700", fontSize: "14px", letterSpacing: "1px" }}>
                OCTONICS
              </div>
              <div style={{ color: "#60a5fa", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase" }}>
                INNOVATIONS
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
            <img src="/knx-partner-logo.jpg" alt="KNX" style={{ height: "22px", width: "auto", objectFit: "contain", opacity: 0.7 }} />
            <img src="/iso-certification.gif" alt="ISO" style={{ height: "22px", width: "auto", objectFit: "contain", opacity: 0.7 }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#94a3b8", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase" }}>
              Reference
            </div>
            <div style={{ color: "#60a5fa", fontSize: "12px", fontWeight: "600", marginTop: "2px" }}>
              {proposalReference || "OC-2025-0001"}
            </div>
            {revisionNumber && revisionNumber !== "0" && (
              <div style={{ color: "#94a3b8", fontSize: "9px", marginTop: "2px" }}>
                Rev. {revisionNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Main Title */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "20mm" }}>
        {/* Category badge */}
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(26,86,219,0.25)",
              border: "1px solid rgba(96,165,250,0.4)",
              color: "#60a5fa",
              fontSize: "8px",
              fontWeight: "600",
              letterSpacing: "3px",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: "20px",
            }}
          >
            Smart Home Automation
          </span>
        </div>

        <h1
          style={{
            color: "white",
            fontSize: "36px",
            fontWeight: "800",
            lineHeight: "1.1",
            letterSpacing: "-0.5px",
            marginBottom: "8px",
          }}
        >
          SMART HOME
          <br />
          <span style={{ color: "#60a5fa" }}>AUTOMATION</span>
          <br />
          PROPOSAL
        </h1>

        <div
          style={{
            width: "60px",
            height: "3px",
            background: "linear-gradient(90deg, #1a56db, #60a5fa)",
            borderRadius: "2px",
            marginTop: "16px",
            marginBottom: "14px",
          }}
        />

        <p style={{ color: "#94a3b8", fontSize: "11px", lineHeight: "1.6", maxWidth: "320px" }}>
          A premium intelligent living solution designed for comfort, luxury, security, and effortless control.
        </p>

        {/* Project name */}
        {projectName && (
          <div style={{ marginTop: "16px" }}>
            <div style={{ color: "#64748b", fontSize: "8px", letterSpacing: "2px", textTransform: "uppercase" }}>
              Project
            </div>
            <div style={{ color: "white", fontSize: "16px", fontWeight: "700", marginTop: "3px" }}>
              {projectName}
            </div>
            {projectLocation && (
              <div style={{ color: "#60a5fa", fontSize: "10px", marginTop: "2px" }}>
                📍 {projectLocation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom: Client info + Date */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ color: "#64748b", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
            Prepared For
          </div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>{customerName || "—"}</div>
          {customerCompany && (
            <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "1px" }}>{customerCompany}</div>
          )}
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
            Prepared By
          </div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>Octonics Innovations</div>
          <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "1px" }}>Kuwait</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#64748b", fontSize: "7px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
            Proposal Date
          </div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>
            {proposalDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>
    </div>

    {/* Bottom blue accent line */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #1a56db, #60a5fa, #1a56db)",
      }}
    />
  </div>
);
