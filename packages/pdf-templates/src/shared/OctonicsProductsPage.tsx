import React from "react";

// ── Shared "Our Products" page used by all Octonics proposal templates ───────

const PRODUCTS = [
  {
    key: "octomedicare",
    logo: "/product-octomedicare.png",
    name: "OctoMediCare",
    tagline: "Healthcare Management System",
    color: "#0891b2",
    bg: "linear-gradient(135deg,#ecfeff,#cffafe)",
    border: "#a5f3fc",
    desc: "A modern clinic & medical center management system covering patient registration, appointments, queue/token flow, doctor consultation, billing, lab, pharmacy, insurance/claiming, and QR-based paperless workflows.",
    tags: [
      "Clinic",
      "Medical Center",
      "Lab",
      "Pharmacy",
      "Insurance",
      "QR Workflow",
    ],
  },
  {
    key: "octovyre",
    logo: "/product-octovyre.svg",
    name: "OctoVyre",
    tagline: "Intelligent Business Operating System",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
    border: "#ddd6fe",
    desc: "A next-generation ERP alternative for GCC companies connecting finance, HR, inventory, sales, purchase, approvals, reports, and branch operations with specialized engines for manufacturing, trading, services, and retail.",
    tags: ["ERP", "Finance", "HR", "Inventory", "Sales", "Manufacturing"],
  },
  {
    key: "qrkuwait",
    logo: "/product-qrkuwait.png",
    name: "QRKuwait",
    tagline: "QR-Based Digital Ordering Platform",
    color: "#059669",
    bg: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
    border: "#a7f3d0",
    desc: "A QR-based digital ordering platform for restaurants, cafés, groceries, and retail in Kuwait. Customers scan a QR code to browse menus, place orders, and enjoy a seamless experience without printed menus.",
    tags: ["Restaurant", "Café", "Grocery", "Retail", "QR Order", "Kuwait"],
  },
  {
    key: "octonext",
    logo: "/product-octonext.png",
    name: "OctoNext",
    tagline: "Modern Retail POS & Business Management",
    color: "#d97706",
    bg: "linear-gradient(135deg,#fffbeb,#fef3c7)",
    border: "#fde68a",
    desc: "A modern retail POS and business management solution replacing recurring-payment POS systems. Supports billing, product management, inventory, sales tracking, user control, reports, and business visibility.",
    tags: ["POS", "Retail", "Inventory", "Sales", "Billing", "Reports"],
  },
  {
    key: "madrasatonaa",
    logo: "/product-madrasatonaa.png",
    name: "Madrasatonaa",
    tagline: "Smart School Management Platform",
    color: "#1a56db",
    bg: "linear-gradient(135deg,#eff6ff,#dbeafe)",
    border: "#bfdbfe",
    desc: "A smart school management platform for schools, parents, teachers, and students. Manages admissions, attendance, communication, academics, fees, announcements, parent engagement, and daily school operations.",
    tags: [
      "School",
      "Admissions",
      "Attendance",
      "Academic",
      "Parents",
      "Mobile",
    ],
  },
];

interface OctonicsProductsPageProps {
  /** Pass the accent color of the calling template */
  accentColor?: string;
  headerLabel?: string;
}

export const OctonicsProductsPage = ({
  accentColor = "#1a56db",
  headerLabel = "PROPOSAL",
}: OctonicsProductsPageProps) => (
  <div
    className="pdf-page"
    style={{
      fontFamily: "'Inter','Montserrat',sans-serif",
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
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "8px",
          marginBottom: "16px",
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
            <div
              style={{
                fontSize: "7px",
                color: "#64748b",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Our Flagship Products
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/iso-certification.gif"
            alt="ISO"
            style={{
              height: "18px",
              width: "auto",
              objectFit: "contain",
              opacity: 0.8,
            }}
          />
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "7px",
                color: "#94a3b8",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {headerLabel}
            </div>
            <div
              style={{ fontSize: "7px", color: accentColor, marginTop: "1px" }}
            >
              Confidential Document
            </div>
          </div>
        </div>
      </div>

      {/* ── Section intro ── */}
      <div style={{ marginBottom: "16px" }}>
        <span
          style={{
            fontSize: "8px",
            fontWeight: "800",
            letterSpacing: "2.5px",
            color: accentColor,
            textTransform: "uppercase",
            background: `${accentColor}14`,
            padding: "4px 12px",
            borderRadius: "6px",
            border: `1px solid ${accentColor}30`,
          }}
        >
          Octonics Innovations — Product Portfolio
        </span>
      </div>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "900",
              color: "#0f172a",
              lineHeight: "1.1",
              fontFamily: "'Montserrat',sans-serif",
              marginBottom: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            OUR FLAGSHIP <br />
            <span style={{ color: accentColor }}>DIGITAL PRODUCTS</span>
          </h2>
          <div
            style={{
              width: "50px",
              height: "4px",
              background: `linear-gradient(90deg,${accentColor},${accentColor}44)`,
              borderRadius: "2px",
            }}
          />
        </div>
        <p
          style={{
            fontSize: "9px",
            color: "#64748b",
            lineHeight: "1.6",
            maxWidth: "340px",
            textAlign: "right",
          }}
        >
          Beyond our project services, Octonics Innovations develops and
          delivers a growing portfolio of enterprise-grade digital products
          serving healthcare, retail, education, food, and business sectors
          across the GCC region.
        </p>
      </div>

      {/* ── Product grid (5 products) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          flex: 1,
        }}
      >
        {PRODUCTS.map((p, i) => {
          const isFeatured = i === 4; // Make the last one full-width featured
          return (
            <div
              key={p.key}
              style={{
                background: p.bg,
                border: `1px solid ${p.border}`,
                borderRadius: "16px",
                padding: isFeatured ? "20px 28px" : "20px 24px",
                display: "flex",
                flexDirection: isFeatured
                  ? ("row" as const)
                  : ("column" as const),
                alignItems: isFeatured ? "center" : "flex-start",
                gap: isFeatured ? "24px" : "14px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
                ...(isFeatured ? { gridColumn: "1 / -1" } : {}),
              }}
            >
              {/* Background Watermark Number */}
              <div
                style={{
                  position: "absolute",
                  top: isFeatured ? "-10px" : "-5px",
                  right: isFeatured ? "20px" : "10px",
                  fontSize: isFeatured ? "80px" : "60px",
                  fontWeight: "900",
                  color: p.color,
                  opacity: 0.04,
                  lineHeight: "1",
                  pointerEvents: "none",
                  fontFamily: "'Montserrat',sans-serif",
                }}
              >
                0{i + 1}
              </div>

              {/* Logo Box */}
              <div
                style={{
                  height: isFeatured ? "64px" : "50px",
                  minWidth: isFeatured ? "64px" : "50px",
                  padding: "0 14px",
                  borderRadius: "12px",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${p.border}`,
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  zIndex: 1,
                }}
              >
                <img
                  src={p.logo}
                  alt={p.name}
                  style={{
                    height: isFeatured ? "42px" : "32px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: isFeatured ? "row" : "column",
                    alignItems: isFeatured ? "center" : "flex-start",
                    gap: isFeatured ? "12px" : "2px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "800",
                      fontSize: isFeatured ? "16px" : "13px",
                      color: "#0f172a",
                      fontFamily: "'Montserrat',sans-serif",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {p.name}
                  </div>
                  {isFeatured && (
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "#cbd5e1",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: isFeatured ? "9px" : "8px",
                      color: p.color,
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {p.tagline}
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: "8.5px",
                    color: "#475569",
                    lineHeight: "1.6",
                    margin: "0 0 12px 0",
                    maxWidth: isFeatured ? "85%" : "100%",
                  }}
                >
                  {p.desc}
                </p>

                {/* Tags */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap" as const,
                  }}
                >
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "7.5px",
                        fontWeight: "600",
                        color: "#0f172a",
                        background: "rgba(255,255,255,0.7)",
                        border: `1px solid rgba(0,0,0,0.05)`,
                        padding: "3px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #e2e8f0",
          paddingTop: "8px",
          marginTop: "10px",
        }}
      >
        <span style={{ fontSize: "7px", color: "#94a3b8" }}>
          Octonics Innovations — Technology for the Future
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src="/octonics-emblem.png"
            alt="Octonics"
            style={{
              height: "16px",
              width: "auto",
              objectFit: "contain",
              opacity: 0.3,
            }}
          />
          <div
            style={{
              width: "20px",
              height: "2px",
              background: accentColor,
              borderRadius: "1px",
            }}
          />
        </div>
      </div>
    </div>
  </div>
);
