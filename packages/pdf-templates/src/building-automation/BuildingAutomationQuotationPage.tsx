import React from "react";
import { BAHeader, BAFooter } from "./BuildingAutomationAboutPage";

export const BuildingAutomationQuotationPage = ({
  items, subtotal, discount, tax, grandTotal, currency = "KWD",
}: any) => {
  const fmt = (n: any) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const accent = "#0369a1";
  const accentLight = "#e0f2fe";
  const darkGrad = "linear-gradient(135deg,#0c2340 0%,#0c3560 100%)";
  const accentHighlight = "#06b6d4";

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
        <BAHeader pageTitle="Commercial Quotation" />
        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "5.5px", fontWeight: "700", letterSpacing: "1.8px", color: accent, textTransform: "uppercase", background: accentLight, padding: "2px 8px", borderRadius: "8px" }}>Quotation Items</span>
          <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", fontFamily: "'Montserrat',sans-serif", margin: "5px 0 0", letterSpacing: "-0.3px" }}>
            Commercial <span style={{ color: accent }}>Quotation</span>
          </h2>
          <div style={{ width: "36px", height: "2px", background: `linear-gradient(90deg,${accent},${accentHighlight})`, borderRadius: "2px", marginTop: "3px" }} />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5px", border: "1px solid #e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
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
                return (<tr key={idx} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}><td colSpan={7} style={{ padding: "5px 8px", fontWeight: "700", color: accent, fontSize: "7px", letterSpacing: "0.4px", background: accentLight, borderLeft: `2.5px solid ${accent}`, borderBottom: "1px solid #bae6fd" }}>{item.sectionTitle}</td></tr>);
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

        <BAFooter pageNum={4} />
      </div>
    </div>
  );
};
