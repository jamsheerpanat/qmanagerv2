import React from "react";

export const ITHeader = ({ pageTitle }: { pageTitle?: string }) => (
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
          IT INFRASTRUCTURE PROPOSAL
        </div>
        <div style={{ fontSize: "7px", color: "#0ea5e9", marginTop: "1px" }}>
          Confidential Document
        </div>
      </div>
    </div>
  </div>
);

export const ITFooter = ({ pageNum }: { pageNum?: number }) => (
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
      Octonics Innovations — IT Infrastructure Proposal
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

export const ITInfraAboutPage = () => (
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
      <ITHeader pageTitle="About IT Infrastructure" />

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
          fontSize: "18px",
          fontWeight: "800",
          color: "#0f172a",
          lineHeight: "1.2",
          letterSpacing: "-0.3px",
          fontFamily: "'Montserrat', sans-serif",
          marginBottom: "6px",
        }}
      >
        RELIABLE IT INFRASTRUCTURE FOR
        <br />
        <span style={{ color: "#0369a1" }}>SECURE BUSINESS OPERATIONS</span>
      </h2>
      <div
        style={{
          width: "50px",
          height: "3px",
          background: "linear-gradient(90deg,#0369a1,#38bdf8)",
          borderRadius: "2px",
          marginBottom: "12px",
        }}
      />

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
          Octonics Innovations provides complete IT infrastructure solutions for
          businesses that require stable, secure, and high-performance
          technology environments.
        </p>
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          A strong IT infrastructure is the foundation of every modern business.
          It supports communication, internet connectivity, data access,
          security, business applications, surveillance systems, access control
          systems, cloud services, and daily operations.
        </p>
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          Our IT infrastructure service includes{" "}
          <strong>
            network design, firewall implementation, structured cabling, Wi-Fi
            deployment, server setup, storage solutions, backup systems, remote
            access, monitoring, and ongoing support.
          </strong>
        </p>
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          We design every infrastructure solution based on the client's office
          layout, number of users, business requirements, security needs, future
          expansion plans, and budget.
        </p>
        <p style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.7" }}>
          Octonics Innovations focuses on professional implementation, proper
          documentation, clean installation, security best practices, and
          long-term reliability.
        </p>
      </div>

      {/* Vendor badges */}
      <div
        style={{
          display: "flex",
          gap: "5px",
          marginBottom: "12px",
          flexWrap: "wrap" as any,
        }}
      >
        {[
          "Cisco",
          "Fortinet",
          "Ubiquiti",
          "MikroTik",
          "Synology",
          "HPE",
          "Dell",
          "Veeam",
        ].map((t) => (
          <span
            key={t}
            style={{
              background: "linear-gradient(135deg, #0c2340, #0369a1)",
              color: "white",
              fontSize: "7.5px",
              fontWeight: "600",
              padding: "3px 9px",
              borderRadius: "4px",
              letterSpacing: "0.3px",
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
          icon="🛡️"
          title="SECURE NETWORK"
          text="Firewall, access control, secure VPN, and protected internal network design."
        />
        <ValueCard
          icon="🌐"
          title="STABLE CONNECTIVITY"
          text="Reliable wired and wireless connectivity for users, devices, and business systems."
        />
        <ValueCard
          icon="🔌"
          title="PROFESSIONAL CABLING"
          text="Structured cabling, rack dressing, labeling, and tested network points."
        />
        <ValueCard
          icon="💾"
          title="BUSINESS CONTINUITY"
          text="Backup, redundancy, remote access, and disaster recovery planning."
        />
        <ValueCard
          icon="📈"
          title="SCALABLE DESIGN"
          text="Infrastructure designed to support future users, branches, systems, and services."
        />
        <ValueCard
          icon="🔧"
          title="SUPPORT READY"
          text="Proper documentation and support structure for smooth maintenance."
        />
      </div>

      <ITFooter pageNum={1} />
    </div>
  </div>
);
