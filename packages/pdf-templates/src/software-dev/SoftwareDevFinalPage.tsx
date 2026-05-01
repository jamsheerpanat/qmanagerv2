import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { SDHeader, SDFooter } from "./SoftwareDevAboutPage";

const WHY_POINTS = [
  "Kuwait-based technology solution provider",
  "KNX certified system integration expertise",
  "ISO certified company",
  "Experience in automation, software, and IT infrastructure",
  "Professional design and documentation",
  "Modern technology approach",
  "Scalable and future-ready solutions",
  "Local support and implementation capability",
];

const METHODOLOGY = [
  {
    step: "01",
    title: "Requirement Review",
    desc: "We review the client's requirement, business process, workflow, users, reports, and technical expectations.",
  },
  {
    step: "02",
    title: "Solution Design",
    desc: "We prepare the system architecture, UI/UX direction, database plan, user roles, workflow, and module structure.",
  },
  {
    step: "03",
    title: "Development",
    desc: "The approved software is developed using a structured and maintainable development approach.",
  },
  {
    step: "04",
    title: "Testing & QC",
    desc: "The system is tested for functionality, usability, security, performance, and data accuracy.",
  },
  {
    step: "05",
    title: "Deployment",
    desc: "The application is deployed to the approved hosting, server, or cloud environment.",
  },
  {
    step: "06",
    title: "Training & Handover",
    desc: "Users are trained to operate the system, and basic documentation is provided where applicable.",
  },
  {
    step: "07",
    title: "Support",
    desc: "Post-delivery support will be provided as per the agreed support contract.",
  },
];

const GENERAL_NOTES = [
  "The final scope will be based on the approved quotation items.",
  "Any additional feature, module, report, integration, or change request outside the approved scope will be quoted separately.",
  "Hosting, domain, SSL, SMS, WhatsApp, email, third-party API, payment gateway, and external license charges are excluded unless clearly mentioned.",
  "Timeline will be confirmed after final approval, advance payment, and availability of all required project information.",
  "Warranty and support terms will be applicable as mentioned in the final quotation.",
];

export const SoftwareDevFinalPage = ({
  terms,
  paymentTerms,
  validityPeriod,
  deliveryTimeline,
  customerName,
  qrVerificationUrl,
  proposalReference,
  proposalDate,
}: any) => {
  const verifyUrl = qrVerificationUrl || "https://octonics.com/verify";

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
        <SDHeader pageTitle="Methodology, Terms & Verification" />

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
            Page 4 — Terms & Acceptance
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            flex: 1,
          }}
        >
          {/* Left column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column" as any,
              gap: "9px",
            }}
          >
            {/* Why Octonics */}
            <div
              style={{
                background: "linear-gradient(135deg,#1e1b4b,#312e81)",
                borderRadius: "10px",
                padding: "11px",
              }}
            >
              <div
                style={{
                  color: "#a5b4fc",
                  fontSize: "8.5px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  marginBottom: "7px",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                ⭐ WHY OCTONICS INNOVATIONS
              </div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "7.5px",
                  lineHeight: "1.5",
                  marginBottom: "7px",
                }}
              >
                Octonics Innovations is a Kuwait-based technology solutions
                company delivering smart automation, software development, IT
                infrastructure, surveillance, access control, data solutions,
                and intelligent business systems.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as any,
                  gap: "3px",
                }}
              >
                {WHY_POINTS.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background: "#4f46e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "1px",
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: "6px",
                          fontWeight: "700",
                        }}
                      >
                        ✓
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "7.5px",
                        color: "#c7d2fe",
                        lineHeight: "1.4",
                      }}
                    >
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Methodology */}
            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  fontWeight: "700",
                  color: "#1e1b4b",
                  marginBottom: "8px",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                🔄 IMPLEMENTATION METHODOLOGY
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as any,
                  gap: "5px",
                }}
              >
                {METHODOLOGY.map((m) => (
                  <div
                    key={m.step}
                    style={{
                      display: "flex",
                      gap: "7px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "20px",
                        height: "20px",
                        borderRadius: "5px",
                        background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "7px",
                          fontWeight: "800",
                          color: "white",
                        }}
                      >
                        {m.step}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "8px",
                          fontWeight: "700",
                          color: "#1e1b4b",
                        }}
                      >
                        {m.title}
                      </div>
                      <div
                        style={{
                          fontSize: "7px",
                          color: "#64748b",
                          lineHeight: "1.4",
                        }}
                      >
                        {m.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Notes */}
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fbbf24",
                borderRadius: "8px",
                padding: "9px",
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  fontWeight: "700",
                  color: "#92400e",
                  marginBottom: "5px",
                }}
              >
                📋 GENERAL NOTES
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as any,
                  gap: "3px",
                }}
              >
                {GENERAL_NOTES.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "4px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        color: "#d97706",
                        fontSize: "8px",
                        flexShrink: 0,
                      }}
                    >
                      •
                    </span>
                    <span
                      style={{
                        fontSize: "7.5px",
                        color: "#78350f",
                        lineHeight: "1.4",
                      }}
                    >
                      {n}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Commercial terms */}
            {paymentTerms && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "7px",
                  padding: "8px",
                  borderLeft: "3px solid #4f46e5",
                }}
              >
                <div
                  style={{
                    fontSize: "7px",
                    fontWeight: "700",
                    color: "#4f46e5",
                    letterSpacing: "1px",
                    marginBottom: "3px",
                  }}
                >
                  PAYMENT TERMS
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#334155",
                    lineHeight: "1.5",
                  }}
                >
                  {paymentTerms}
                </div>
              </div>
            )}
            {validityPeriod && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "7px",
                  padding: "8px",
                  borderLeft: "3px solid #10b981",
                }}
              >
                <div
                  style={{
                    fontSize: "7px",
                    fontWeight: "700",
                    color: "#10b981",
                    letterSpacing: "1px",
                    marginBottom: "3px",
                  }}
                >
                  VALIDITY
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#334155",
                    lineHeight: "1.5",
                  }}
                >
                  {validityPeriod}
                </div>
              </div>
            )}
            {deliveryTimeline && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "7px",
                  padding: "8px",
                  borderLeft: "3px solid #f59e0b",
                }}
              >
                <div
                  style={{
                    fontSize: "7px",
                    fontWeight: "700",
                    color: "#f59e0b",
                    letterSpacing: "1px",
                    marginBottom: "3px",
                  }}
                >
                  DELIVERY TIMELINE
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    color: "#334155",
                    lineHeight: "1.5",
                  }}
                >
                  {deliveryTimeline}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column" as any,
              gap: "10px",
            }}
          >
            {/* Signature */}
            <div
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "10px",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                ✍️ SIGNATURE & ACCEPTANCE
              </div>
              <p
                style={{
                  fontSize: "8px",
                  color: "#64748b",
                  lineHeight: "1.5",
                  marginBottom: "12px",
                }}
              >
                By signing below, the customer acknowledges and accepts the full
                scope, commercial offer, and terms outlined in this proposal.
              </p>
              <div style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    fontSize: "7px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "2px",
                  }}
                >
                  Prepared For
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "10px",
                  }}
                >
                  {customerName || "———————————————"}
                </div>
                {[
                  { label: "Customer Name", h: "20px" },
                  { label: "Signature", h: "32px" },
                  { label: "Date", h: "20px" },
                ].map(({ label, h }) => (
                  <div key={label} style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        fontSize: "7px",
                        color: "#94a3b8",
                        marginBottom: "2px",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        borderBottom: "1px solid #cbd5e1",
                        height: h,
                        background: "#f8fafc",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}
              >
                <div
                  style={{
                    fontSize: "7px",
                    color: "#94a3b8",
                    marginBottom: "5px",
                  }}
                >
                  Company Stamp / Seal (if applicable)
                </div>
                <div
                  style={{
                    height: "36px",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "6px",
                    background: "#f8fafc",
                  }}
                />
              </div>
            </div>

            {/* Next-Gen Verification & Tracking Panel */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                position: "relative",
                overflow: "hidden",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  background: "#4f46e5",
                }}
              />

              <div
                style={{
                  padding: "12px 14px 12px 18px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    background: "white",
                    padding: "6px",
                    borderRadius: "8px",
                    flexShrink: 0,
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <QRCodeSVG
                    value={verifyUrl}
                    size={54}
                    level="H"
                    fgColor="#1e1b4b"
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span
                      style={{
                        color: "#0f172a",
                        fontSize: "7.5px",
                        fontWeight: "800",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      Secure Digital Ledger
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "2px",
                        }}
                      >
                        Reference ID
                      </div>
                      <div
                        style={{
                          color: "#4f46e5",
                          fontSize: "10px",
                          fontWeight: "700",
                          fontFamily: "'Courier New', Courier, monospace",
                        }}
                      >
                        {proposalReference || "—"}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "2px",
                        }}
                      >
                        Generated Date
                      </div>
                      <div
                        style={{
                          color: "#0f172a",
                          fontSize: "9px",
                          fontWeight: "600",
                        }}
                      >
                        {proposalDate || "—"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "6px",
                      color: "#64748b",
                      lineHeight: "1.4",
                    }}
                  >
                    Scan QR code to authenticate document via QManager secure
                    ledger.
                  </div>
                  <div
                    style={{
                      fontSize: "5.5px",
                      color: "#94a3b8",
                      marginTop: "2px",
                      wordBreak: "break-all" as any,
                    }}
                  >
                    {verifyUrl}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg,#1e1b4b,#312e81)",
                borderRadius: "10px",
                padding: "14px",
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  paddingBottom: "10px",
                }}
              >
                <img
                  src="/octonics-logo.png"
                  alt="Octonics"
                  style={{
                    height: "22px",
                    width: "auto",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
                />
                <div style={{ display: "flex", gap: "6px" }}>
                  <img
                    src="/iso-certification.gif"
                    alt="ISO"
                    style={{
                      height: "18px",
                      width: "auto",
                      objectFit: "contain",
                      opacity: 0.9,
                      background: "white",
                      padding: "2px 3px",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: "white",
                    fontSize: "9.5px",
                    fontWeight: "700",
                    marginBottom: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Octonics Innovations
                </div>
                <div
                  style={{
                    color: "#a5b4fc",
                    fontSize: "7px",
                    lineHeight: "1.4",
                  }}
                >
                  Smart Automation · Software Development · IT Infrastructure
                </div>
              </div>
            </div>
          </div>
        </div>

        <SDFooter pageNum={4} />
      </div>
    </div>
  );
};
