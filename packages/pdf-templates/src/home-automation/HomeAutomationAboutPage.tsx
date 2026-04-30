import React from "react";

const InnerPageHeader = ({ pageTitle }: { pageTitle?: string }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "2px solid #e2e8f0",
      paddingBottom: "8px",
      marginBottom: "20px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img src="/octonics-logo.png" alt="Octonics" style={{ height: "28px", width: "auto", objectFit: "contain" }} />
      <div>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#1e3a5f", letterSpacing: "1px" }}>
          OCTONICS INNOVATIONS
        </div>
        {pageTitle && (
          <div style={{ fontSize: "7px", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase" }}>
            {pageTitle}
          </div>
        )}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img src="/knx-partner-logo.jpg" alt="KNX Partner" style={{ height: "20px", width: "auto", objectFit: "contain", opacity: 0.85 }} />
      <img src="/iso-certification.gif" alt="ISO Certified" style={{ height: "20px", width: "auto", objectFit: "contain", opacity: 0.85 }} />
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "7px", color: "#94a3b8", letterSpacing: "1px" }}>SMART HOME AUTOMATION PROPOSAL</div>
        <div style={{ fontSize: "7px", color: "#3b82f6", marginTop: "1px" }}>Confidential Document</div>
      </div>
    </div>
  </div>
);

const InnerPageFooter = ({ pageNum }: { pageNum?: number }) => (
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
      Octonics Innovations — Smart Home Automation Proposal
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "20px", height: "2px", background: "#1a56db", borderRadius: "1px" }} />
      {pageNum && (
        <span style={{ fontSize: "8px", color: "#1a56db", fontWeight: "600" }}>
          {pageNum}
        </span>
      )}
    </div>
  </div>
);

const ValueCard = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <div
    style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "14px",
      borderTop: "3px solid #1a56db",
    }}
  >
    <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
    <div style={{ fontWeight: "700", fontSize: "10px", color: "#1e3a5f", marginBottom: "4px", letterSpacing: "0.5px" }}>
      {title}
    </div>
    <div style={{ fontSize: "9px", color: "#64748b", lineHeight: "1.5" }}>{text}</div>
  </div>
);

export const HomeAutomationAboutPage = () => (
  <div
    className="pdf-page"
    style={{ fontFamily: "'Inter', 'Montserrat', sans-serif", background: "#f8fafc" }}
  >
    <div style={{ padding: "14mm 16mm", height: "297mm", display: "flex", flexDirection: "column" }}>
      <InnerPageHeader pageTitle="About Home Automation" />

      {/* Page section label */}
      <div style={{ marginBottom: "10px" }}>
        <span
          style={{
            fontSize: "7px",
            fontWeight: "700",
            letterSpacing: "2px",
            color: "#3b82f6",
            textTransform: "uppercase",
            background: "#eff6ff",
            padding: "3px 10px",
            borderRadius: "4px",
          }}
        >
          Page 1 — Our Solution
        </span>
      </div>

      {/* Title */}
      <div style={{ marginBottom: "14px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#0f172a",
            lineHeight: "1.2",
            letterSpacing: "-0.3px",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          INTELLIGENT HOME AUTOMATION
          <br />
          <span style={{ color: "#1a56db" }}>FOR MODERN LIVING</span>
        </h2>
        <div
          style={{ width: "50px", height: "3px", background: "linear-gradient(90deg,#1a56db,#60a5fa)", borderRadius: "2px", marginTop: "8px" }}
        />
      </div>

      {/* Intro paragraphs */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "16px",
          border: "1px solid #e2e8f0",
          marginBottom: "14px",
          borderLeft: "4px solid #1a56db",
        }}
      >
        <p style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.7", marginBottom: "8px" }}>
          Octonics Innovations provides professional smart home automation solutions designed to transform villas, apartments, and private residences into intelligent, comfortable, secure, and energy-efficient living spaces.
        </p>
        <p style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.7", marginBottom: "8px" }}>
          Our home automation solutions allow homeowners to control lighting, curtains, air conditioning, scenes, security, entertainment, and other connected systems from elegant wall keypads, touch panels, mobile applications, and centralized control interfaces.
        </p>
        <p style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.7", marginBottom: "8px" }}>
          We design every automation system based on the lifestyle, room usage, interior design, and comfort expectations of the client. The objective is not only to automate devices, but to create a smooth living experience where technology works naturally in the background.
        </p>
        <p style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.7", marginBottom: "8px" }}>
          Our smart home systems are built using professional-grade automation technologies such as <strong>KNX, DALI, RTI, CoolMaster</strong>, and other reliable integration platforms depending on the project requirements.
        </p>
        <p style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.7" }}>
          From a single room to a complete luxury villa, Octonics Innovations delivers automation systems that are stable, expandable, elegant, and easy to use.
        </p>
      </div>

      {/* Technology badges */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
        {["KNX", "DALI", "RTI", "CoolMaster", "IP Integration", "Mobile App"].map((tech) => (
          <span
            key={tech}
            style={{
              background: "linear-gradient(135deg, #1e3a5f, #1a56db)",
              color: "white",
              fontSize: "8px",
              fontWeight: "600",
              padding: "4px 10px",
              borderRadius: "4px",
              letterSpacing: "0.5px",
            }}
          >
            {tech}
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
        <ValueCard icon="🛋️" title="COMFORT" text="Control lighting, curtains, AC, and scenes from one simple interface." />
        <ValueCard icon="✨" title="LUXURY EXPERIENCE" text="Create elegant moods for welcome, dining, relaxing, cinema, sleep, and away modes." />
        <ValueCard icon="📱" title="CENTRALIZED CONTROL" text="Manage the entire home through wall keypads, touch panels, mobile apps, and remote access." />
        <ValueCard icon="⚡" title="ENERGY EFFICIENCY" text="Reduce unnecessary lighting and cooling usage through schedules, sensors, and smart logic." />
        <ValueCard icon="🔒" title="SECURITY INTEGRATION" text="Connect selected security, access, CCTV, and alert systems into the smart home experience." />
        <ValueCard icon="🚀" title="FUTURE READY" text="The system can be expanded later with additional rooms, devices, sensors, scenes, and integrations." />
      </div>

      <InnerPageFooter pageNum={1} />
    </div>
  </div>
);
