import React from "react";

export const SDHeader = ({ pageTitle }: { pageTitle?: string }) => (
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
            color: "#1e1b4b",
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
          SOFTWARE DEVELOPMENT PROPOSAL
        </div>
        <div style={{ fontSize: "7px", color: "#6366f1", marginTop: "1px" }}>
          Confidential Document
        </div>
      </div>
    </div>
  </div>
);

export const SDFooter = ({ pageNum }: { pageNum?: number }) => (
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
      Octonics Innovations — Software Development Proposal
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "20px",
          height: "2px",
          background: "#6366f1",
          borderRadius: "1px",
        }}
      />
      {pageNum && (
        <span style={{ fontSize: "8px", color: "#6366f1", fontWeight: "600" }}>
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
      borderTop: "3px solid #6366f1",
    }}
  >
    <div style={{ fontSize: "18px", marginBottom: "5px" }}>{icon}</div>
    <div
      style={{
        fontWeight: "700",
        fontSize: "9.5px",
        color: "#1e1b4b",
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

export const SoftwareDevAboutPage = () => (
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
      <SDHeader pageTitle="About Software Development" />

      <div style={{ marginBottom: "10px" }}>
        <span
          style={{
            fontSize: "7px",
            fontWeight: "700",
            letterSpacing: "2px",
            color: "#6366f1",
            textTransform: "uppercase",
            background: "#eef2ff",
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
        CUSTOM SOFTWARE DEVELOPMENT
        <br />
        <span style={{ color: "#4f46e5" }}>FOR MODERN BUSINESS OPERATIONS</span>
      </h2>
      <div
        style={{
          width: "50px",
          height: "3px",
          background: "linear-gradient(90deg,#4f46e5,#818cf8)",
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
          borderLeft: "4px solid #6366f1",
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
          Octonics Innovations develops modern, secure, scalable, and
          user-friendly software solutions tailored to the exact workflow of
          each business.
        </p>
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          Our software development service focuses on building practical digital
          systems that reduce manual work, improve data accuracy, speed up
          operations, and give management better visibility over daily business
          activities.
        </p>
        <p
          style={{
            fontSize: "9.5px",
            color: "#334155",
            lineHeight: "1.7",
            marginBottom: "7px",
          }}
        >
          We design and develop{" "}
          <strong>
            web applications, mobile applications, ERP modules, CRM platforms,
            quotation systems, invoice systems, inventory systems, dashboards,
            reporting tools, portals, and custom workflow automation platforms.
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
          Every system is designed with a strong focus on usability, security,
          scalability, performance, and long-term maintainability. The objective
          is to create software that is technically strong and easy for real
          users to operate every day.
        </p>
        <p style={{ fontSize: "9.5px", color: "#334155", lineHeight: "1.7" }}>
          Octonics Innovations supports the complete software lifecycle —
          requirement analysis, UI/UX planning, database design, development,
          testing, deployment, training, and ongoing support.
        </p>
      </div>

      {/* Tech stack */}
      <div
        style={{
          display: "flex",
          gap: "5px",
          marginBottom: "12px",
          flexWrap: "wrap" as any,
        }}
      >
        {[
          "React / Next.js",
          "Node.js / NestJS",
          "React Native",
          "PostgreSQL",
          "REST API",
          "JWT Auth",
          "PDF Generation",
          "Cloud Deploy",
        ].map((t) => (
          <span
            key={t}
            style={{
              background: "linear-gradient(135deg, #1e1b4b, #4f46e5)",
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
          icon="🔧"
          title="CUSTOM WORKFLOW"
          text="Software designed around the client's real business process, not generic templates."
        />
        <ValueCard
          icon="🎨"
          title="MODERN UI/UX"
          text="Clean, fast, responsive, and easy-to-use interfaces for daily operations."
        />
        <ValueCard
          icon="⚡"
          title="AUTOMATION"
          text="Reduce repetitive manual work through smart workflows, notifications, and approvals."
        />
        <ValueCard
          icon="📊"
          title="DATA VISIBILITY"
          text="Real-time dashboards and reports for better management decisions."
        />
        <ValueCard
          icon="🔒"
          title="SECURITY"
          text="Role-based access, controlled permissions, audit logs, and secure authentication."
        />
        <ValueCard
          icon="🚀"
          title="SCALABILITY"
          text="The system can grow with additional users, branches, modules, reports, and integrations."
        />
      </div>

      <SDFooter pageNum={1} />
    </div>
  </div>
);
