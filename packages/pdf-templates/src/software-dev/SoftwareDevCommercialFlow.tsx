import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { SDHeader, SDFooter } from "./SoftwareDevAboutPage";

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
  <div style={{ marginBottom: "9px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden", breakInside: "avoid" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 10px", background: "linear-gradient(90deg, #1e1b4b, #312e81)", borderBottom: "1px solid #4f46e5" }}>
      <span style={{ fontSize: "11px" }}>{icon}</span>
      <span style={{ fontSize: "7px", fontWeight: "800", color: "#a5b4fc", background: "rgba(165,180,252,0.12)", padding: "1px 5px", borderRadius: "3px" }}>{number}</span>
      <span style={{ fontSize: "8.5px", fontWeight: "700", color: "white", letterSpacing: "0.3px", fontFamily: "'Montserrat', sans-serif" }}>{title}</span>
    </div>
    <div style={{ padding: "7px 10px" }}>
      <p style={{ fontSize: "7.5px", color: "#475569", lineHeight: "1.5", marginBottom: "5px" }}>{intro}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
        {features.map((f, i) => (
          <span key={i} style={{ fontSize: "7px", color: "#334155", background: "#f1f5f9", padding: "2px 6px", borderRadius: "3px", border: "1px solid #e2e8f0" }}>• {f}</span>
        ))}
      </div>
    </div>
  </div>
);

const SCOPES = [
  {
    number: "01",
    icon: "🌐",
    title: "WEB APPLICATION DEVELOPMENT",
    intro: "A secure and responsive web application for office users, management teams, admins, and operational departments.",
    features: ["Secure login", "User management", "Role-based access", "Dashboard", "Data entry forms", "Workflow management", "Reports & analytics", "PDF generation", "Email notifications", "Activity logs"],
  },
  {
    number: "02",
    icon: "📱",
    title: "MOBILE APPLICATION DEVELOPMENT",
    intro: "Mobile apps for customers, employees, field staff, technicians, sales teams, or management users.",
    features: ["Android & iOS", "Mobile login", "User dashboard", "Push notifications", "QR code scanning", "Mobile forms", "Task updates", "Real-time status"],
  },
  {
    number: "03",
    icon: "🏢",
    title: "BUSINESS MANAGEMENT SYSTEM / ERP",
    intro: "Custom business modules to manage core operations in a structured digital platform.",
    features: ["Customer management", "Lead management", "Quotation management", "Invoice management", "Inventory management", "Purchase management", "HR records", "Branch management", "Approval workflows"],
  },
  {
    number: "04",
    icon: "🎯",
    title: "CRM & SALES AUTOMATION",
    intro: "CRM tools to manage leads, customers, follow-ups, quotations, and sales pipelines more effectively.",
    features: ["Lead registration", "Customer database", "Enquiry tracking", "Follow-up reminders", "Sales pipeline", "Quotation tracking", "Communication history", "Conversion reports"],
  },
  {
    number: "05",
    icon: "📄",
    title: "DOCUMENT & PDF AUTOMATION",
    intro: "Generate professional documents automatically using predefined templates and approved data.",
    features: ["Quotations & proposals", "Invoices & receipts", "Delivery notes", "Work orders", "Agreements", "Auto numbering", "Company branding", "QR verification", "Signature section"],
  },
  {
    number: "06",
    icon: "📊",
    title: "DASHBOARDS & REPORTS",
    intro: "Dashboards and reports provide management with clear visibility of business performance.",
    features: ["Management dashboard", "Sales dashboard", "Customer reports", "Quotation reports", "Invoice reports", "Payment status", "User activity", "Export PDF / Excel", "Date filtering"],
  },
  {
    number: "07",
    icon: "🔗",
    title: "INTEGRATION SERVICES",
    intro: "The software can be integrated with selected external systems and services depending on project requirements.",
    features: ["Email service", "SMS / WhatsApp", "Payment gateway", "Accounting software", "Barcode & QR", "API integrations", "Cloud storage", "Third-party tools"],
  },
];

const DELIVERABLES = [
  "Requirement analysis",
  "System architecture planning",
  "UI/UX design",
  "Database design",
  "Web application development",
  "Mobile app development (if included)",
  "Admin panel development",
  "PDF & document template setup",
  "Reports & dashboard setup",
  "Testing and bug fixing",
  "Deployment support",
  "User training",
  "Basic technical documentation",
  "Post-deployment support as agreed",
];

const GENERAL_NOTES = [
  "The final scope will be based on the approved quotation items.",
  "Any additional feature, module, report, integration, or change request outside the approved scope will be quoted separately.",
  "Hosting, domain, SSL, SMS, WhatsApp, email, third-party API, payment gateway, and external license charges are excluded unless clearly mentioned.",
  "Timeline will be confirmed after final approval, advance payment, and availability of all required project information.",
  "Warranty and support terms will be applicable as mentioned in the final quotation.",
];

export const SoftwareDevCommercialFlow = ({
  items,
  subtotal,
  discount,
  tax,
  grandTotal,
  currency = "KWD",
  scopeSummary,
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
  const fmt = (n: any) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const accent = "#4f46e5";
  const accentLight = "#eef2ff";
  const darkGrad = "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)";
  const accentHighlight = "#a5b4fc";

  const sectionTotals: any[] = [];
  let cs = "General", ct = 0;
  (items || []).forEach((item: any) => {
    if (item.itemType === "SECTION_HEADING") {
      if (ct > 0 || cs !== "General") sectionTotals.push({ title: cs, total: ct });
      cs = item.sectionTitle || "Section"; ct = 0;
    } else { ct += (item.quantity || 0) * (item.unitPrice || 0) - (item.discountAmount || 0); }
  });
  if (ct > 0 || cs !== "General") sectionTotals.push({ title: cs, total: ct });

  let serial = 0;
  const cell = (extra: React.CSSProperties = {}): React.CSSProperties => ({ padding: "5px 7px", verticalAlign: "middle", ...extra });

  return (
    <div className="pdf-page-flow" style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "white" }}>
      <div style={{ padding: "10mm 13mm 8mm" }}>
        <SDHeader pageTitle="Scope, Commercials & Terms" />

        {/* --- SCOPE SECTION --- */}
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", lineHeight: "1.2", fontFamily: "'Montserrat', sans-serif", marginBottom: "4px" }}>
            PROPOSED SOFTWARE <span style={{ color: "#4f46e5" }}>DEVELOPMENT SCOPE</span>
          </h2>
          <div style={{ width: "50px", height: "3px", background: "linear-gradient(90deg,#4f46e5,#818cf8)", borderRadius: "2px", marginBottom: "8px" }} />
          
          {scopeSummary ? (
            <div style={{ marginTop: "4px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "9px", color: "#334155", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                {scopeSummary}
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "8.5px", color: "#64748b", marginBottom: "10px" }}>
                The proposed software solution can include the following modules and capabilities based on the selected project scope and approved quotation items.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                <div>{SCOPES.slice(0, 4).map((s) => <ScopeCard key={s.number} {...s} />)}</div>
                <div>
                  {SCOPES.slice(4).map((s) => <ScopeCard key={s.number} {...s} />)}
                  <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: "8px", padding: "10px 12px", marginTop: "4px" }}>
                    <div style={{ color: "#a5b4fc", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "7px" }}>📦 Deliverables</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {DELIVERABLES.map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6366f1", flexShrink: 0, marginTop: "3px" }} />
                          <span style={{ fontSize: "7.5px", color: "#c7d2fe", lineHeight: "1.4" }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* --- QUOTATION SECTION --- */}
        <div style={{ marginBottom: "10px", marginTop: "20px" }}>
          <span style={{ fontSize: "5.5px", fontWeight: "700", letterSpacing: "1.8px", color: accent, textTransform: "uppercase", background: accentLight, padding: "2px 8px", borderRadius: "8px" }}>Quotation Items</span>
          <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", fontFamily: "'Montserrat',sans-serif", margin: "5px 0 0", letterSpacing: "-0.3px" }}>
            Commercial <span style={{ color: accent }}>Quotation</span>
          </h2>
          <div style={{ width: "36px", height: "2px", background: `linear-gradient(90deg,${accent},${accentHighlight})`, borderRadius: "2px", marginTop: "3px" }} />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5px", border: "1px solid #e2e8f0", borderRadius: "5px", overflow: "hidden", marginBottom: "12px" }}>
          <thead>
            <tr style={{ background: darkGrad, color: "#fff" }}>
              {[{ label: "#", w: "3.5%", align: "center" as const },{ label: "Item / Product", w: "27%", align: "left" as const },{ label: "Description", w: "30%", align: "left" as const },{ label: "Brand", w: "8%", align: "center" as const },{ label: "Qty", w: "5.5%", align: "center" as const },{ label: "Unit Price", w: "13%", align: "right" as const },{ label: "Total", w: "13%", align: "right" as const }].map((h) => (
                <th key={h.label} style={{ padding: "6px 7px", fontWeight: "600", letterSpacing: "0.5px", fontSize: "6px", textTransform: "uppercase", textAlign: h.align, width: h.w }}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item: any, idx: number) => {
              if (item.itemType === "SECTION_HEADING") {
                return (<tr key={idx} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}><td colSpan={7} style={{ padding: "5px 8px", fontWeight: "700", color: accent, fontSize: "7px", letterSpacing: "0.4px", background: accentLight, borderLeft: `2.5px solid ${accent}`, borderBottom: `1px solid ${accentHighlight}44` }}>{item.sectionTitle}</td></tr>);
              }
              serial++;
              const lineTotal = (item.quantity || 0) * (item.unitPrice || 0) - (item.discountAmount || 0);
              const stripe = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
              return (
                <tr key={idx} style={{ background: stripe, borderBottom: "1px solid #f1f5f9", breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <td style={cell({ textAlign: "center", color: "#94a3b8", fontSize: "6.5px", fontWeight: "600" })}>
                    {item.isOptional ? <span style={{ fontSize: "5px", background: "#fef3c7", color: "#92400e", padding: "1px 3px", borderRadius: "2px", fontWeight: "700" }}>OPT</span> : <span style={{ background: "#f1f5f9", borderRadius: "3px", padding: "1px 4px" }}>{item.serialNumber || String(serial).padStart(2, "0")}</span>}
                  </td>
                  <td style={cell({ fontWeight: "600", color: "#0f172a", fontSize: "7px" })}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      {item.image && <img src={item.image} style={{ width: "20px", height: "20px", objectFit: "contain", borderRadius: "3px", border: "1px solid #e2e8f0", background: "#fff", flexShrink: 0 }} />}
                      <span style={{ lineHeight: "1.25" }}>{item.sectionTitle || item.description}</span>
                    </div>
                  </td>
                  <td style={cell({ color: "#64748b", fontSize: "6.5px", lineHeight: "1.3" })}>
                    {item.description}
                    {item.warranty && <div style={{ color: accent, fontSize: "5.5px", marginTop: "1px", fontWeight: "600" }}>✓ {item.warranty}</div>}
                  </td>
                  <td style={cell({ textAlign: "center", color: "#64748b", fontSize: "6.5px" })}>{item.brand || "—"}</td>
                  <td style={cell({ textAlign: "center", color: "#0f172a", fontWeight: "700", fontSize: "7px" })}>
                    {item.quantity || 0}<div style={{ fontSize: "5px", color: "#94a3b8", fontWeight: "400" }}>{item.unit || "pcs"}</div>
                  </td>
                  <td style={cell({ textAlign: "right", color: "#475569", fontSize: "7px", fontVariantNumeric: "tabular-nums" })}>{fmt(item.unitPrice)}</td>
                  <td style={cell({ textAlign: "right", fontWeight: "700", color: "#0f172a", fontSize: "7px", fontVariantNumeric: "tabular-nums" })}>{fmt(lineTotal)}</td>
                </tr>
              );
            })}
            {(!items || items.length === 0) && <tr><td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "8px" }}>No items defined.</td></tr>}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", breakInside: "avoid", pageBreakInside: "avoid" }}>
          <div style={{ width: "230px" }}>
            {sectionTotals.length > 0 && (
              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "5.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "3px", textAlign: "right" }}>Section Summary</div>
                <div style={{ border: "1px solid #e8ecf0", borderRadius: "6px", overflow: "hidden" }}>
                  {sectionTotals.map((s, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px", borderBottom: i === sectionTotals.length - 1 ? "none" : "1px solid #f1f5f9", fontSize: "6.5px" }}><span style={{ color: "#475569" }}>{s.title}</span><span style={{ fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{fmt(s.total)} <span style={{ fontSize: "5px", color: "#94a3b8" }}>{currency}</span></span></div>))}
                </div>
              </div>
            )}
            <div style={{ fontSize: "5.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "3px", textAlign: "right" }}>Price Summary</div>
            <div style={{ border: "1px solid #e8ecf0", borderRadius: "6px", overflow: "hidden" }}>
              {[{ label: "Subtotal", value: fmt(subtotal), color: "#0f172a", bg: "#fff" },{ label: "Discount", value: `− ${fmt(discount)}`, color: "#dc2626", bg: "#fef2f2" },{ label: "Tax (VAT)", value: `+ ${fmt(tax)}`, color: "#64748b", bg: "#f8fafc" }].map(({ label, value, color, bg }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 10px", background: bg, borderBottom: "1px solid #f1f5f9", fontSize: "7px" }}>
                  <span style={{ color: "#64748b" }}>{label}</span><span style={{ fontWeight: "600", color, fontVariantNumeric: "tabular-nums" }}>{value} <span style={{ fontSize: "5px", color: "#94a3b8" }}>{currency}</span></span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: darkGrad }}>
                <span style={{ fontSize: "7px", fontWeight: "700", color: "#fff", letterSpacing: "0.6px", textTransform: "uppercase" }}>Grand Total</span>
                <span style={{ fontSize: "12px", fontWeight: "800", color: accentHighlight, fontFamily: "'Montserrat',sans-serif", fontVariantNumeric: "tabular-nums" }}>{fmt(grandTotal)} <span style={{ fontSize: "6.5px", fontWeight: "600" }}>{currency}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TERMS AND SIGNATURE SECTION --- */}
        <div style={{ marginTop: "30px", borderTop: "2px dashed #e2e8f0", paddingTop: "20px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", lineHeight: "1.2", fontFamily: "'Montserrat', sans-serif", marginBottom: "4px" }}>
            TERMS & <span style={{ color: "#4f46e5" }}>ACCEPTANCE</span>
          </h2>
          <div style={{ width: "50px", height: "3px", background: "linear-gradient(90deg,#4f46e5,#818cf8)", borderRadius: "2px", marginBottom: "16px" }} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", breakInside: "avoid" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <div style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: "8px", padding: "9px" }}>
                <div style={{ fontSize: "8px", fontWeight: "700", color: "#92400e", marginBottom: "5px" }}>📋 GENERAL NOTES</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {GENERAL_NOTES.map((n, i) => (
                    <div key={i} style={{ display: "flex", gap: "4px", alignItems: "flex-start" }}>
                      <span style={{ color: "#d97706", fontSize: "8px", flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: "7.5px", color: "#78350f", lineHeight: "1.4" }}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>

              {paymentTerms && (
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "8px", borderLeft: "3px solid #4f46e5" }}>
                  <div style={{ fontSize: "7px", fontWeight: "700", color: "#4f46e5", letterSpacing: "1px", marginBottom: "3px" }}>PAYMENT TERMS</div>
                  <div style={{ fontSize: "8px", color: "#334155", lineHeight: "1.5" }}>{paymentTerms}</div>
                </div>
              )}
              {validityPeriod && (
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "8px", borderLeft: "3px solid #10b981" }}>
                  <div style={{ fontSize: "7px", fontWeight: "700", color: "#10b981", letterSpacing: "1px", marginBottom: "3px" }}>VALIDITY</div>
                  <div style={{ fontSize: "8px", color: "#334155", lineHeight: "1.5" }}>{validityPeriod}</div>
                </div>
              )}
              {deliveryTimeline && (
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "8px", borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ fontSize: "7px", fontWeight: "700", color: "#f59e0b", letterSpacing: "1px", marginBottom: "3px" }}>DELIVERY TIMELINE</div>
                  <div style={{ fontSize: "8px", color: "#334155", lineHeight: "1.5" }}>{deliveryTimeline}</div>
                </div>
              )}
              {terms && terms.length > 0 && (
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
                  <div style={{ fontSize: "8px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>TERMS & CONDITIONS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {terms.map((t: any, i: number) => (
                      <div key={i} style={{ fontSize: "7.5px", color: "#475569", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                        <strong>{t.category?.name || `${i + 1}.`}</strong> {t.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", flex: 1 }}>
                <div style={{ fontSize: "9px", fontWeight: "700", color: "#0f172a", marginBottom: "10px", fontFamily: "'Montserrat', sans-serif" }}>✍️ SIGNATURE & ACCEPTANCE</div>
                <p style={{ fontSize: "8px", color: "#64748b", lineHeight: "1.5", marginBottom: "12px" }}>
                  By signing below, the customer acknowledges and accepts the full scope, commercial offer, and terms outlined in this proposal.
                </p>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "7px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>Prepared For</div>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>{customerName || "———————————————"}</div>
                  {[{ label: "Customer Name", h: "20px" }, { label: "Signature", h: "32px" }, { label: "Date", h: "20px" }].map(({ label, h }) => (
                    <div key={label} style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "7px", color: "#94a3b8", marginBottom: "2px" }}>{label}</div>
                      <div style={{ borderBottom: "1px solid #cbd5e1", height: h, background: "#f8fafc", borderRadius: "3px" }} />
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                  <div style={{ fontSize: "7px", color: "#94a3b8", marginBottom: "5px" }}>Company Stamp / Seal (if applicable)</div>
                  <div style={{ height: "36px", border: "1px dashed #cbd5e1", borderRadius: "6px", background: "#f8fafc" }} />
                </div>
              </div>

              <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: "#4f46e5" }} />
                <div style={{ padding: "12px 14px 12px 18px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ background: "white", padding: "6px", borderRadius: "8px", flexShrink: 0, border: "1px solid #cbd5e1", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                    <QRCodeSVG value={verifyUrl} size={54} level="H" fgColor="#1e1b4b" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      <span style={{ color: "#0f172a", fontSize: "7.5px", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase" }}>Secure Digital Ledger</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <div style={{ color: "#64748b", fontSize: "6px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>Reference ID</div>
                        <div style={{ color: "#4f46e5", fontSize: "10px", fontWeight: "700", fontFamily: "'Courier New', Courier, monospace" }}>{proposalReference || "—"}</div>
                      </div>
                      <div>
                        <div style={{ color: "#64748b", fontSize: "6px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>Generated Date</div>
                        <div style={{ color: "#0f172a", fontSize: "9px", fontWeight: "600" }}>{proposalDate || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SDFooter />
      </div>
    </div>
  );
};
