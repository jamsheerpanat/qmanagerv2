import React from "react";
import { BAHeader, BAFooter } from "./BuildingAutomationAboutPage";

const ScopeCard = ({
  number,
  icon,
  title,
  intro,
  features,
}: {
  number: string;
  icon: string;
  title: string;
  intro: string;
  features: string[];
}) => (
  <div
    style={{
      marginBottom: "10px",
      background: "white",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      breakInside: "avoid" as any,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 10px",
        background: "linear-gradient(90deg, #0c2340, #0c3560)",
        borderBottom: "1px solid #0369a1",
      }}
    >
      <span style={{ fontSize: "12px" }}>{icon}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            fontSize: "7px",
            fontWeight: "800",
            color: "#06b6d4",
            background: "rgba(6,182,212,0.15)",
            padding: "1px 5px",
            borderRadius: "3px",
          }}
        >
          {number}
        </span>
        <span
          style={{
            fontSize: "9px",
            fontWeight: "700",
            color: "white",
            letterSpacing: "0.3px",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {title}
        </span>
      </div>
    </div>
    <div style={{ padding: "8px 10px" }}>
      <p
        style={{
          fontSize: "8px",
          color: "#475569",
          lineHeight: "1.5",
          marginBottom: "6px",
        }}
      >
        {intro}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap" as any, gap: "3px" }}>
        {features.map((f, i) => (
          <span
            key={i}
            style={{
              fontSize: "7px",
              color: "#334155",
              background: "#f1f5f9",
              padding: "2px 6px",
              borderRadius: "3px",
              border: "1px solid #e2e8f0",
            }}
          >
            • {f}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const SCOPES = [
  {
    icon: "💡",
    title: "LIGHTING CONTROL SYSTEM",
    intro:
      "Automated lighting control reduces energy consumption, improves comfort, and provides centralized control of lighting circuits across different zones.",
    features: [
      "Zone-wise control",
      "Floor-wise control",
      "Schedule-based operation",
      "Motion & presence control",
      "Daylight-based control",
      "Centralized ON/OFF",
      "After-hours logic",
      "Common area automation",
    ],
    keywords: ["light", "knx", "dali", "luminaire", "lamp", "dimm"],
  },
  {
    icon: "❄️",
    title: "HVAC AUTOMATION",
    intro:
      "HVAC automation manages cooling, ventilation, and comfort levels more efficiently across the building.",
    features: [
      "AC ON/OFF control",
      "Temperature monitoring",
      "Zone-wise HVAC control",
      "Schedule-based operation",
      "Occupancy-based logic",
      "Energy-saving mode",
      "Fault/status monitoring",
      "Centralized dashboard",
    ],
    keywords: [
      "hvac",
      "ac ",
      "air condition",
      "vav",
      "fcu",
      "ahu",
      "chiller",
      "thermostat",
    ],
  },
  {
    icon: "📡",
    title: "SENSORS AND FIELD DEVICES",
    intro:
      "Sensors allow the building automation system to respond intelligently to occupancy, light levels, temperature, and environmental conditions.",
    features: [
      "Motion sensors",
      "Presence sensors",
      "Lux sensors",
      "Temperature sensors",
      "Door contact sensors",
      "Air quality / CO₂",
      "Water leak sensors",
      "Equipment status inputs",
    ],
    keywords: ["sensor", "detector", "meter", "contact", "presence", "motion"],
  },
  {
    icon: "⚡",
    title: "ENERGY MONITORING",
    intro:
      "Energy monitoring provides visibility of electrical consumption and helps facility teams understand usage patterns.",
    features: [
      "Main incomer metering",
      "Floor / panel metering",
      "Equipment-wise monitoring",
      "Consumption dashboards",
      "Peak load observation",
      "Energy trend reports",
    ],
    keywords: ["energy", "meter", "power", "electric", "consumption"],
  },
  {
    icon: "🖥️",
    title: "CENTRAL DASHBOARD & BMS",
    intro:
      "A centralized dashboard lets facility managers monitor systems, view alarms, control zones, and review operational data.",
    features: [
      "Building overview",
      "Lighting status",
      "HVAC status",
      "Sensor status",
      "Energy display",
      "Alarm & event monitoring",
      "User access levels",
      "Operation logs",
    ],
    keywords: ["bms", "dashboard", "software", "server", "scada"],
  },
  {
    icon: "🔒",
    title: "ACCESS CONTROL & SECURITY",
    intro:
      "Selected access control and security systems can be integrated into the building automation platform.",
    features: [
      "Door access status",
      "Access control integration",
      "CCTV integration",
      "Alarm system integration",
      "Visitor / restricted-area control",
      "Event history & logs",
    ],
    keywords: ["access", "security", "cctv", "camera", "door", "lock", "alarm"],
  },
  {
    icon: "⚙️",
    title: "AUTOMATION LOGIC & SCHEDULING",
    intro:
      "Custom automation logic configured based on the operational needs and working patterns of the building.",
    features: [
      "Working Hours Mode",
      "After-Hours Mode",
      "Weekend Mode",
      "Holiday Mode",
      "Energy Saving Mode",
      "Maintenance Mode",
      "Emergency Mode",
      "Security Mode",
    ],
    keywords: ["logic", "program", "schedule", "commissioning", "automation"],
  },
];

const DELIVERABLES = [
  "Building automation design support",
  "Control system architecture",
  "Device selection and BOQ support",
  "Lighting control programming",
  "HVAC automation programming",
  "Sensor integration",
  "Energy monitoring configuration",
  "Dashboard / BMS interface configuration",
  "Testing and commissioning",
  "Basic facility team training",
  "System handover documentation",
];

export const BuildingAutomationScopePage = ({
  items = [],
}: {
  items?: any[];
}) => {
  let activeScopes = SCOPES;

  if (items && items.length > 0) {
    const combinedText = items
      .map((i) => `${i.sectionTitle || ""} ${i.description || ""}`)
      .join(" ")
      .toLowerCase();

    activeScopes = SCOPES.filter((scope) => {
      // If any of the scope's keywords are found in the combined text of the items
      return scope.keywords.some((kw) => combinedText.includes(kw));
    });

    // Fallback if filtering removes everything
    if (activeScopes.length === 0) {
      activeScopes = SCOPES;
    }
  }

  // Assign sequential numbers after filtering (01, 02, etc.)
  const numberedScopes = activeScopes.map((scope, index) => ({
    ...scope,
    number: String(index + 1).padStart(2, "0"),
  }));

  const halfIndex = Math.ceil(numberedScopes.length / 2);
  const leftColumnScopes = numberedScopes.slice(0, halfIndex);
  const rightColumnScopes = numberedScopes.slice(halfIndex);

  return (
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
        <BAHeader pageTitle="Scope, Features & Deliverables" />

        <div style={{ marginBottom: "8px" }}>
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
            Page 2 — Proposed Scope
          </span>
        </div>

        <h2
          style={{
            fontSize: "17px",
            fontWeight: "800",
            color: "#0f172a",
            lineHeight: "1.2",
            fontFamily: "'Montserrat', sans-serif",
            marginBottom: "4px",
          }}
        >
          PROPOSED BUILDING{" "}
          <span style={{ color: "#0369a1" }}>AUTOMATION SCOPE</span>
        </h2>
        <div
          style={{
            width: "50px",
            height: "3px",
            background: "linear-gradient(90deg,#0369a1,#06b6d4)",
            borderRadius: "2px",
            marginBottom: "8px",
          }}
        />

        <p
          style={{ fontSize: "8.5px", color: "#64748b", marginBottom: "10px" }}
        >
          The proposed building automation solution can include the following
          systems based on the selected project scope and approved quotation
          items.
        </p>

        {/* Two-column scope layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 12px",
            flex: 1,
          }}
        >
          <div>
            {leftColumnScopes.map((s) => (
              <ScopeCard key={s.number} {...s} />
            ))}
          </div>
          <div>
            {rightColumnScopes.map((s) => (
              <ScopeCard key={s.number} {...s} />
            ))}

            {/* Deliverables dark card */}
            <div
              style={{
                background: "linear-gradient(135deg,#0c2340,#0c3560)",
                borderRadius: "8px",
                padding: "10px 12px",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  color: "#06b6d4",
                  fontSize: "8px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "7px",
                }}
              >
                📦 Deliverables
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as any,
                  gap: "3px",
                }}
              >
                {DELIVERABLES.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "#0ea5e9",
                        flexShrink: 0,
                        marginTop: "3px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "7.5px",
                        color: "#cbd5e1",
                        lineHeight: "1.4",
                      }}
                    >
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BAFooter pageNum={2} />
      </div>
    </div>
  );
};
