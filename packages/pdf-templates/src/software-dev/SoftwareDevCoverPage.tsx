import React from "react";

export const SoftwareDevCoverPage = ({
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
      background: "#030712",
      fontFamily: "'Montserrat', 'Inter', sans-serif",
    }}
  >
    {/* BG image */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/software-dev-cover.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.28,
      }}
    />
    {/* Gradient overlay */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(140deg, rgba(3,7,18,0.97) 0%, rgba(15,10,60,0.85) 50%, rgba(3,7,18,0.97) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "45%",
        background: "linear-gradient(to top, #030712 0%, transparent 100%)",
      }}
    />
    {/* Purple/blue top bar */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background:
          "linear-gradient(90deg, #6366f1, #3b82f6, #8b5cf6, #6366f1)",
      }}
    />
    {/* Subtle dot grid */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.05,
        backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "900",
              color: "white",
            }}
          >
            O
          </div>
          <div>
            <div
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "14px",
                letterSpacing: "1px",
              }}
            >
              OCTONICS
            </div>
            <div
              style={{
                color: "#818cf8",
                fontSize: "9px",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              INNOVATIONS
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#475569",
              fontSize: "8px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Reference
          </div>
          <div
            style={{
              color: "#818cf8",
              fontSize: "12px",
              fontWeight: "600",
              marginTop: "2px",
            }}
          >
            {proposalReference || "OC-SD-2025-0001"}
          </div>
          {revisionNumber && revisionNumber !== "0" && (
            <div
              style={{ color: "#475569", fontSize: "9px", marginTop: "2px" }}
            >
              Rev. {revisionNumber}
            </div>
          )}
        </div>
      </div>

      {/* Tech stack pills row */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap" as any,
          marginTop: "8mm",
        }}
      >
        {[
          "React",
          "Next.js",
          "Node.js",
          "NestJS",
          "PostgreSQL",
          "React Native",
          "REST API",
          "Cloud",
        ].map((t) => (
          <span
            key={t}
            style={{
              fontSize: "7px",
              color: "#a5b4fc",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              padding: "3px 8px",
              borderRadius: "12px",
              letterSpacing: "0.3px",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Main title */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: "6mm",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.35)",
              color: "#818cf8",
              fontSize: "8px",
              fontWeight: "600",
              letterSpacing: "3px",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: "20px",
            }}
          >
            Software Development
          </span>
        </div>
        <h1
          style={{
            color: "white",
            fontSize: "33px",
            fontWeight: "800",
            lineHeight: "1.1",
            letterSpacing: "-0.5px",
            marginBottom: "6px",
          }}
        >
          SOFTWARE
          <br />
          <span style={{ color: "#818cf8" }}>DEVELOPMENT</span>
          <br />
          PROPOSAL
        </h1>
        <div
          style={{
            width: "60px",
            height: "3px",
            background: "linear-gradient(90deg, #4f46e5, #818cf8)",
            borderRadius: "2px",
            marginTop: "14px",
            marginBottom: "12px",
          }}
        />
        <p
          style={{
            color: "#94a3b8",
            fontSize: "10.5px",
            lineHeight: "1.6",
            maxWidth: "340px",
          }}
        >
          A modern digital solution designed to automate operations, improve
          visibility, reduce manual work, and support business growth.
        </p>
        {projectName && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: "8px",
              display: "inline-block",
            }}
          >
            <div
              style={{
                color: "#475569",
                fontSize: "7px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "3px",
              }}
            >
              Project
            </div>
            <div
              style={{ color: "white", fontSize: "14px", fontWeight: "700" }}
            >
              {projectName}
            </div>
            {projectLocation && (
              <div
                style={{ color: "#818cf8", fontSize: "9px", marginTop: "2px" }}
              >
                📍 {projectLocation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom info strip */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "14px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "14px",
        }}
      >
        <div>
          <div
            style={{
              color: "#334155",
              fontSize: "7px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Prepared For
          </div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>
            {customerName || "—"}
          </div>
          {customerCompany && (
            <div
              style={{ color: "#94a3b8", fontSize: "10px", marginTop: "1px" }}
            >
              {customerCompany}
            </div>
          )}
        </div>
        <div>
          <div
            style={{
              color: "#334155",
              fontSize: "7px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Prepared By
          </div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>
            Octonics Innovations
          </div>
          <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "1px" }}>
            Kuwait
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#334155",
              fontSize: "7px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Proposal Date
          </div>
          <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }}>
            {proposalDate ||
              new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
          </div>
        </div>
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "3px",
        background:
          "linear-gradient(90deg, #4f46e5, #818cf8, #7c3aed, #4f46e5)",
      }}
    />
  </div>
);
