import React from "react";

/* ─────────────────────────── Shared Header / Footer ─────────────────────── */

const QHeader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: "7px",
      borderBottom: "1.5px solid #e2e8f0",
      marginBottom: "12px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img src="/octonics-logo.png" style={{ height: "22px", objectFit: "contain" }} />
      <div>
        <div style={{ fontSize: "8px", fontWeight: "700", color: "#1e3a5f", letterSpacing: "1.2px" }}>
          OCTONICS INNOVATIONS
        </div>
        <div style={{ fontSize: "6.5px", color: "#64748b", letterSpacing: "0.8px", marginTop: "1px" }}>
          COMMERCIAL QUOTATION
        </div>
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: "6.5px", color: "#94a3b8", letterSpacing: "1px" }}>
        SMART HOME AUTOMATION
      </div>
      <div style={{ fontSize: "6px", color: "#3b82f6", marginTop: "1px", fontWeight: "600" }}>
        Confidential
      </div>
    </div>
  </div>
);

const QFooter = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid #e8ecf0",
      paddingTop: "6px",
      marginTop: "12px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <img src="/octonics-logo.png" style={{ height: "8px", objectFit: "contain", opacity: 0.35 }} />
      <span style={{ fontSize: "5.5px", color: "#b0b8c4" }}>
        Octonics Innovations · Smart Home Automation Proposal
      </span>
    </div>
    <div
      style={{
        width: "18px",
        height: "1.5px",
        background: "linear-gradient(90deg,#1a56db,#60a5fa)",
        borderRadius: "1px",
      }}
    />
  </div>
);

/* ─────────────────────────── Main Quotation Component ────────────────────── */

export const HomeAutomationQuotationPage = ({
  items,
  subtotal,
  discount,
  tax,
  grandTotal,
  currency = "KWD",
}: any) => {
  const fmt = (n: any) =>
    Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

  /* ── Theme ── */
  const accent = "#1a56db";
  const accentLight = "#eff6ff";
  const darkGrad = "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)";

  /* ── Section totals ── */
  const sectionTotals: any[] = [];
  let currentSection = "General";
  let currentTotal = 0;
  (items || []).forEach((item: any) => {
    if (item.itemType === "SECTION_HEADING") {
      if (currentTotal > 0 || currentSection !== "General") {
        sectionTotals.push({ title: currentSection, total: currentTotal });
      }
      currentSection = item.sectionTitle || "Section";
      currentTotal = 0;
    } else {
      currentTotal +=
        (item.quantity || 0) * (item.unitPrice || 0) - (item.discountAmount || 0);
    }
  });
  if (currentTotal > 0 || currentSection !== "General") {
    sectionTotals.push({ title: currentSection, total: currentTotal });
  }

  /* ── Running serial counter (skips section headings + optionals) ── */
  let serial = 0;

  /* ── Reusable cell style helper ── */
  const cell = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    padding: "5px 7px",
    verticalAlign: "middle",
    ...extra,
  });

  return (
    <div
      className="pdf-page-flow"
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "white" }}
    >
      <div style={{ padding: "10mm 13mm 8mm" }}>
        <QHeader />

        {/* ── Title Strip ── */}
        <div style={{ marginBottom: "10px" }}>
          <span
            style={{
              fontSize: "5.5px",
              fontWeight: "700",
              letterSpacing: "1.8px",
              color: accent,
              textTransform: "uppercase",
              background: accentLight,
              padding: "2px 8px",
              borderRadius: "8px",
            }}
          >
            Quotation Items
          </span>
          <h2
            style={{
              fontSize: "15px",
              fontWeight: "800",
              color: "#0f172a",
              fontFamily: "'Montserrat',sans-serif",
              margin: "5px 0 0",
              letterSpacing: "-0.3px",
            }}
          >
            Commercial <span style={{ color: accent }}>Quotation</span>
          </h2>
          <div
            style={{
              width: "36px",
              height: "2px",
              background: `linear-gradient(90deg,${accent},#60a5fa)`,
              borderRadius: "2px",
              marginTop: "3px",
            }}
          />
        </div>

        {/* ── Items Table ── */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            borderSpacing: 0,
            fontSize: "7.5px",
            border: "1px solid #e2e8f0",
            borderRadius: "5px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <thead>
            <tr style={{ background: darkGrad, color: "#fff" }}>
              {[
                { label: "#", w: "3.5%", align: "center" as const },
                { label: "Item / Product", w: "27%", align: "left" as const },
                { label: "Description", w: "30%", align: "left" as const },
                { label: "Brand", w: "8%", align: "center" as const },
                { label: "Qty", w: "5.5%", align: "center" as const },
                { label: "Unit Price", w: "13%", align: "right" as const },
                { label: "Total", w: "13%", align: "right" as const },
              ].map((h) => (
                <th
                  key={h.label}
                  style={{
                    padding: "6px 7px",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                    fontSize: "6px",
                    textTransform: "uppercase",
                    textAlign: h.align,
                    width: h.w,
                  }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {(items || []).map((item: any, idx: number) => {
              /* ── Section heading row ── */
              if (item.itemType === "SECTION_HEADING") {
                return (
                  <tr
                    key={idx}
                    style={{
                      breakInside: "avoid",
                      pageBreakInside: "avoid",
                    }}
                  >
                    <td
                      colSpan={7}
                      style={{
                        padding: "5px 8px",
                        fontWeight: "700",
                        color: accent,
                        fontSize: "7px",
                        letterSpacing: "0.4px",
                        background: accentLight,
                        borderLeft: `2.5px solid ${accent}`,
                        borderBottom: "1px solid #dbeafe",
                      }}
                    >
                      {item.sectionTitle}
                    </td>
                  </tr>
                );
              }

              /* ── Regular item row ── */
              serial++;
              const lineTotal =
                (item.quantity || 0) * (item.unitPrice || 0) -
                (item.discountAmount || 0);
              const stripe = idx % 2 === 0 ? "#ffffff" : "#f8fafc";

              return (
                <tr
                  key={idx}
                  style={{
                    background: stripe,
                    borderBottom: "1px solid #f1f5f9",
                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  {/* # */}
                  <td style={cell({ textAlign: "center", color: "#94a3b8", fontSize: "6.5px", fontWeight: "600" })}>
                    {item.isOptional ? (
                      <span
                        style={{
                          fontSize: "5px",
                          background: "#fef3c7",
                          color: "#92400e",
                          padding: "1px 3px",
                          borderRadius: "2px",
                          fontWeight: "700",
                          letterSpacing: "0.3px",
                        }}
                      >
                        OPT
                      </span>
                    ) : (
                      <span style={{ background: "#f1f5f9", borderRadius: "3px", padding: "1px 4px" }}>
                        {item.serialNumber || String(serial).padStart(2, "0")}
                      </span>
                    )}
                  </td>

                  {/* Item name + image */}
                  <td style={cell({ fontWeight: "600", color: "#0f172a", fontSize: "7px" })}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      {item.image && (
                        <img
                          src={item.image}
                          style={{
                            width: "20px",
                            height: "20px",
                            objectFit: "contain",
                            borderRadius: "3px",
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span style={{ lineHeight: "1.25" }}>
                        {item.sectionTitle || item.description}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td style={cell({ color: "#64748b", fontSize: "6.5px", lineHeight: "1.3" })}>
                    {item.description}
                    {item.warranty && (
                      <div style={{ color: accent, fontSize: "5.5px", marginTop: "1px", fontWeight: "600" }}>
                        ✓ {item.warranty}
                      </div>
                    )}
                  </td>

                  {/* Brand */}
                  <td style={cell({ textAlign: "center", color: "#64748b", fontSize: "6.5px" })}>
                    {item.brand || "—"}
                  </td>

                  {/* Qty */}
                  <td style={cell({ textAlign: "center", color: "#0f172a", fontWeight: "700", fontSize: "7px" })}>
                    {item.quantity || 0}
                    <div style={{ fontSize: "5px", color: "#94a3b8", fontWeight: "400" }}>
                      {item.unit || "pcs"}
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td
                    style={cell({
                      textAlign: "right",
                      color: "#475569",
                      fontSize: "7px",
                      fontVariantNumeric: "tabular-nums",
                    })}
                  >
                    {fmt(item.unitPrice)}
                  </td>

                  {/* Total */}
                  <td
                    style={cell({
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#0f172a",
                      fontSize: "7px",
                      fontVariantNumeric: "tabular-nums",
                    })}
                  >
                    {fmt(lineTotal)}
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {(!items || items.length === 0) && (
              <tr>
                <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "8px" }}>
                  No items defined for this quotation.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── Totals Block ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "12px",
            breakInside: "avoid",
            pageBreakInside: "avoid",
          }}
        >
          <div style={{ width: "230px" }}>
            {/* Section summary */}
            {sectionTotals.length > 0 && (
              <div style={{ marginBottom: "8px" }}>
                <div
                  style={{
                    fontSize: "5.5px",
                    fontWeight: "700",
                    color: "#94a3b8",
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                    textAlign: "right",
                  }}
                >
                  Section Summary
                </div>
                <div
                  style={{
                    border: "1px solid #e8ecf0",
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  {sectionTotals.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 10px",
                        borderBottom:
                          i === sectionTotals.length - 1
                            ? "none"
                            : "1px solid #f1f5f9",
                        fontSize: "6.5px",
                      }}
                    >
                      <span style={{ color: "#475569" }}>{s.title}</span>
                      <span style={{ fontWeight: "600", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                        {fmt(s.total)}{" "}
                        <span style={{ fontSize: "5px", color: "#94a3b8" }}>{currency}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price summary */}
            <div
              style={{
                fontSize: "5.5px",
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                marginBottom: "3px",
                textAlign: "right",
              }}
            >
              Price Summary
            </div>
            <div
              style={{
                border: "1px solid #e8ecf0",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              {[
                { label: "Subtotal", value: fmt(subtotal), color: "#0f172a", bg: "#fff" },
                { label: "Discount", value: `− ${fmt(discount)}`, color: "#dc2626", bg: "#fef2f2" },
                { label: "Tax (VAT)", value: `+ ${fmt(tax)}`, color: "#64748b", bg: "#f8fafc" },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 10px",
                    background: bg,
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "7px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span style={{ fontWeight: "600", color, fontVariantNumeric: "tabular-nums" }}>
                    {value}{" "}
                    <span style={{ fontSize: "5px", color: "#94a3b8" }}>{currency}</span>
                  </span>
                </div>
              ))}

              {/* Grand total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  background: darkGrad,
                }}
              >
                <span
                  style={{
                    fontSize: "7px",
                    fontWeight: "700",
                    color: "#fff",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                  }}
                >
                  Grand Total
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#60a5fa",
                    fontFamily: "'Montserrat',sans-serif",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmt(grandTotal)}{" "}
                  <span style={{ fontSize: "6.5px", fontWeight: "600" }}>{currency}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <QFooter />
      </div>
    </div>
  );
};
