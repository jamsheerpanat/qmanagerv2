import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { BAHeader, BAFooter } from "./BuildingAutomationAboutPage";

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

const GENERAL_NOTES = [
  "The final scope will be based on the approved quotation items.",
  "Any additional work outside the approved scope will be quoted separately.",
  "Product availability is subject to supplier stock at the time of order confirmation.",
  "Civil work, electrical work, false ceiling, furniture, and third-party work are excluded unless clearly mentioned.",
  "Timeline will be confirmed after final approval, advance payment, and availability of all required site information.",
  "Warranty and support terms will be applicable as mentioned in the final quotation.",
];

export const BuildingAutomationFinalPage = ({
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
        <BAHeader pageTitle="Terms, Signature & Verification" />

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
              gap: "10px",
            }}
          >
            {/* Why Octonics */}
            <div
              style={{
                background: "linear-gradient(135deg,#0c2340,#0c3560)",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <div
                style={{
                  color: "#06b6d4",
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
                  fontSize: "8px",
                  lineHeight: "1.5",
                  marginBottom: "8px",
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
                  gap: "4px",
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
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#0369a1",
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
                          fontSize: "7px",
                          fontWeight: "700",
                        }}
                      >
                        ✓
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "8px",
                        color: "#cbd5e1",
                        lineHeight: "1.4",
                      }}
                    >
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* General Notes */}
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fbbf24",
                borderRadius: "10px",
                padding: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  fontWeight: "700",
                  color: "#92400e",
                  marginBottom: "6px",
                  letterSpacing: "0.5px",
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
                  borderRadius: "8px",
                  padding: "8px",
                  borderLeft: "3px solid #0369a1",
                }}
              >
                <div
                  style={{
                    fontSize: "7px",
                    fontWeight: "700",
                    color: "#0369a1",
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
                  borderRadius: "8px",
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
                  borderRadius: "8px",
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

            {/* T&C snippet */}
            {terms && terms.length > 0 && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "8px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "5px",
                  }}
                >
                  TERMS & CONDITIONS
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column" as any,
                    gap: "3px",
                    maxHeight: "70px",
                    overflow: "hidden",
                  }}
                >
                  {terms.map((t: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "7.5px",
                        color: "#475569",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>{t.category?.name || `${i + 1}.`}</strong>{" "}
                      {t.content}
                    </div>
                  ))}
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
            {/* Signature block */}
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
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#94a3b8",
                      marginBottom: "2px",
                    }}
                  >
                    Customer Name
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid #cbd5e1",
                      height: "20px",
                      background: "#f8fafc",
                      borderRadius: "3px",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#94a3b8",
                      marginBottom: "2px",
                    }}
                  >
                    Signature
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid #cbd5e1",
                      height: "32px",
                      background: "#f8fafc",
                      borderRadius: "3px",
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#94a3b8",
                      marginBottom: "2px",
                    }}
                  >
                    Date
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid #cbd5e1",
                      height: "20px",
                      background: "#f8fafc",
                      borderRadius: "3px",
                    }}
                  />
                </div>
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
                  background: "#06b6d4",
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
                    fgColor="#0c2340"
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
                          color: "#06b6d4",
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

            {/* Company footer bar */}
            <div
              style={{
                background: "linear-gradient(135deg,#0c2340,#0c3560)",
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
                    src="/knx-partner-logo.jpg"
                    alt="KNX Partner"
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
                    color: "#06b6d4",
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

        <BAFooter pageNum={4} />
      </div>
    </div>
  );
};
