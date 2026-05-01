import React from "react";

// ── Shared inner-page chrome ────────────────────────────────────────────────

export const BAHeader = ({ pageTitle }: { pageTitle?: string }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "2px solid #e2e8f0",
      paddingBottom: "8px",
      marginBottom: "18px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img
        src="/octonics-logo.png"
        alt="Octonics"
        style={{ height: "28px", width: "auto", objectFit: "contain" }}
      />
      <div>
        <div
          style={{
            fontSize: "9px",
            fontWeight: "700",
            color: "#0c2340",
            letterSpacing: "1px",
          }}
        >
          OCTONICS INNOVATIONS
        </div>
        {pageTitle && (
          <div
            style={{
              fontSize: "7px",
              color: "#64748b",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {pageTitle}
          </div>
        )}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img
        src="/knx-partner-logo.jpg"
        alt="KNX Partner"
        style={{
          height: "20px",
          width: "auto",
          objectFit: "contain",
          opacity: 0.85,
        }}
      />
      <img
        src="/iso-certification.gif"
        alt="ISO Certified"
        style={{
          height: "20px",
          width: "auto",
          objectFit: "contain",
          opacity: 0.85,
        }}
      />
      <div style={{ textAlign: "right" }}>
        <div
          style={{ fontSize: "7px", color: "#94a3b8", letterSpacing: "1px" }}
        >
          BUILDING AUTOMATION PROPOSAL
        </div>
        <div style={{ fontSize: "7px", color: "#0ea5e9", marginTop: "1px" }}>
          Confidential Document
        </div>
      </div>
    </div>
  </div>
);

export const BAFooter = ({ pageNum }: { pageNum?: number }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid #e2e8f0",
      paddingTop: "8px",
      marginTop: "auto",
    }}
  >
    <span style={{ fontSize: "7px", color: "#94a3b8" }}>
      Octonics Innovations — Building Automation Proposal
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "20px",
          height: "2px",
          background: "#0ea5e9",
          borderRadius: "1px",
        }}
      />
      {pageNum && (
        <span style={{ fontSize: "8px", color: "#0ea5e9", fontWeight: "600" }}>
          {pageNum}
        </span>
      )}
    </div>
  </div>
);

// ── Value card ───────────────────────────────────────────────────────────────

const ValueCard = ({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) => (
  <div
    style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "12px 14px",
      borderTop: "3px solid #0ea5e9",
    }}
  >
    <div style={{ fontSize: "18px", marginBottom: "5px" }}>{icon}</div>
    <div
      style={{
        fontWeight: "700",
        fontSize: "9.5px",
        color: "#0c2340",
        marginBottom: "4px",
        letterSpacing: "0.4px",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {title}
    </div>
    <div style={{ fontSize: "8.5px", color: "#64748b", lineHeight: "1.5" }}>
      {text}
    </div>
  </div>
);

// ── About Page ───────────────────────────────────────────────────────────────

export const BuildingAutomationAboutPage = () => (
  <div
    className="pdf-page"
    style={{
      fontFamily: "'Inter', 'Montserrat', sans-serif",
      background: "#f8fafc",
    }}
  >
    <div
      style={{
        padding: "14mm 16mm",
        height: "297mm",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <BAHeader pageTitle="About Building Automation" />

      <div style={{ marginBottom: "10px" }}>
        <span
          style={{
            fontSize: "7px",
            fontWeight: "700",
            letterSpacing: "2px",
            color: "#0ea5e9",
            textTransform: "uppercase",
            background: "#e0f2fe",
            padding: "3px 10px",
            borderRadius: "4px",
          }}
        >
          Page 1 — Our Solution
        </span>
      </div>

      <h2
        style={{
          fontSize: "19px",
          fontWeight: "800",
          color: "#0f172a",
          lineHeight: "1.2",
          letterSpacing: "-0.3px",
          fontFamily: "'Montserrat', sans-serif",
          marginBottom: "6px",
        }}
      >
        SMART BUILDING AUTOMATION FOR
        <br />
        <span style={{ color: "#0369a1" }}>
          CONTROL, EFFICIENCY & SUSTAINABILITY
        </span>
      </h2>
      <div
        style={{
          width: "50px",
          height: "3px",
          background: "linear-gradient(90deg,#0369a1,#06b6d4)",
          borderRadius: "2px",
          marginBottom: "12px",
        }}
      />

      {/* Intro box */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "14px 16px",
          border: "1px solid #e2e8f0",
          marginBottom: "12px",
          borderLeft: "4px solid #0ea5e9",
        }}
      >
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          Octonics Innovations provides professional building automation
          solutions for commercial buildings, offices, showrooms, warehouses,
          clinics, schools, mixed-use facilities, and other business
          environments.
        </p>
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          A building automation system connects multiple building services such
          as lighting, HVAC, sensors, energy monitoring, access control, alarms,
          and centralized dashboards into one coordinated control environment.
        </p>
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          The purpose of building automation is to improve operational
          efficiency, reduce energy consumption, increase comfort, support
          facility management, and provide real-time visibility of building
          performance.
        </p>
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          Our solutions are designed using professional automation standards
          such as <strong>KNX, DALI, BACnet, Modbus</strong>, IP-based control
          systems, and other integration technologies depending on the project
          requirement.
        </p>
        <p style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.7" }}>
          Octonics Innovations focuses on delivering automation systems that are
          reliable, scalable, easy to maintain, and suitable for long-term
          facility operations.
        </p>
      </div>

      {/* Protocol badges */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "12px",
          flexWrap: "wrap" as any,
        }}
      >
        {[
          "KNX",
          "DALI",
          "BACnet",
          "Modbus",
          "IP Control",
          "MQTT",
          "OPC-UA",
        ].map((t) => (
          <span
            key={t}
            style={{
              background: "linear-gradient(135deg, #0c2340, #0369a1)",
              color: "white",
              fontSize: "8px",
              fontWeight: "600",
              padding: "3px 9px",
              borderRadius: "4px",
              letterSpacing: "0.5px",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Value cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          marginBottom: "auto",
        }}
      >
        <ValueCard
          icon="🖥️"
          title="CENTRALIZED CONTROL"
          text="Monitor and control building systems from one centralized platform."
        />
        <ValueCard
          icon="⚡"
          title="ENERGY OPTIMIZATION"
          text="Reduce unnecessary lighting, HVAC, and equipment usage through automation logic."
        />
        <ValueCard
          icon="📊"
          title="FACILITY VISIBILITY"
          text="Real-time status, alarms, schedules, logs, and reports for facility teams."
        />
        <ValueCard
          icon="🌡️"
          title="COMFORT & PRODUCTIVITY"
          text="Maintain better lighting, temperature, and environmental conditions for occupants."
        />
        <ValueCard
          icon="🏗️"
          title="SCALABLE ARCHITECTURE"
          text="Suitable for small offices, large buildings, warehouses, schools, clinics, and facilities."
        />
        <ValueCard
          icon="🔧"
          title="MAINTENANCE SUPPORT"
          text="Improve maintenance response with alerts, equipment status, and operation history."
        />
      </div>

      <BAFooter pageNum={1} />
    </div>
  </div>
);
