import React from "react";

const InnerPageHeader = ({ pageTitle }: { pageTitle?: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px", marginBottom: "18px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img src="/octonics-logo.png" style={{ height: "26px", objectFit: "contain" }} />
      <div>
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#1e3a5f", letterSpacing: "1.5px" }}>OCTONICS INNOVATIONS</div>
        {pageTitle && <div style={{ fontSize: "7px", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", marginTop: "1px" }}>{pageTitle}</div>}
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: "7px", color: "#94a3b8", letterSpacing: "1.2px" }}>SMART HOME AUTOMATION PROPOSAL</div>
      <div style={{ fontSize: "6.5px", color: "#3b82f6", marginTop: "2px", fontWeight: "600" }}>Confidential Document</div>
    </div>
  </div>
);

const InnerPageFooter = ({ pageNum }: { pageNum?: number }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #e2e8f0", paddingTop: "10px", marginTop: "auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <img src="/octonics-logo.png" style={{ height: "10px", objectFit: "contain", opacity: 0.5 }} />
      <span style={{ fontSize: "6.5px", color: "#94a3b8" }}>Octonics Innovations — Smart Home Automation Proposal</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ width: "24px", height: "2px", background: "linear-gradient(90deg,#1a56db,#60a5fa)", borderRadius: "1px" }} />
      {pageNum && <span style={{ fontSize: "8px", color: "#1a56db", fontWeight: "700" }}>{pageNum}</span>}
    </div>
  </div>
);

export const HomeAutomationQuotationPage = ({
  items,
  subtotal,
  discount,
  tax,
  grandTotal,
  currency = "KWD",
}: any) => {
  const fmt = (n: any) =>
    Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Color theme
  const accent = "#1a56db";
  const accentLight = "#eff6ff";
  const accentGrad = "linear-gradient(135deg,#0f172a,#1e3a5f)";

  return (
    <div className="pdf-page" style={{ fontFamily: "'Inter', 'Montserrat', sans-serif", background: "white" }}>
      <div style={{ padding: "14mm 16mm", height: "297mm", display: "flex", flexDirection: "column" }}>
        <InnerPageHeader pageTitle="Commercial Quotation" />

        {/* Page badge */}
        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontSize: "6.5px", fontWeight: "700", letterSpacing: "2.5px", color: accent, textTransform: "uppercase", background: accentLight, padding: "3px 12px", borderRadius: "20px", border: `1px solid ${accent}22` }}>
            QUOTATION ITEMS
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", fontFamily: "'Montserrat', sans-serif", marginBottom: "2px", marginTop: "6px", letterSpacing: "-0.3px" }}>
          Commercial <span style={{ color: accent }}>Quotation</span>
        </h2>
        <div style={{ width: "60px", height: "3px", background: `linear-gradient(90deg,${accent},#60a5fa)`, borderRadius: "2px", marginBottom: "16px" }} />

        {/* Table */}
        <div style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8px" }}>
            <thead>
              <tr style={{ background: accentGrad, color: "white" }}>
                <th style={{ padding: "10px 8px", textAlign: "center", fontWeight: "700", letterSpacing: "0.8px", fontSize: "7px", textTransform: "uppercase", borderRadius: "8px 0 0 0", width: "5%" }}>#</th>
                <th style={{ padding: "10px 8px", textAlign: "left", fontWeight: "700", letterSpacing: "0.8px", fontSize: "7px", textTransform: "uppercase", width: "30%" }}>Item / Product</th>
                <th style={{ padding: "10px 8px", textAlign: "left", fontWeight: "700", letterSpacing: "0.8px", fontSize: "7px", textTransform: "uppercase", width: "25%" }}>Description</th>
                <th style={{ padding: "10px 8px", textAlign: "center", fontWeight: "700", letterSpacing: "0.8px", fontSize: "7px", textTransform: "uppercase", width: "10%" }}>Brand</th>
                <th style={{ padding: "10px 8px", textAlign: "center", fontWeight: "700", letterSpacing: "0.8px", fontSize: "7px", textTransform: "uppercase", width: "7%" }}>Qty</th>
                <th style={{ padding: "10px 8px", textAlign: "right", fontWeight: "700", letterSpacing: "0.8px", fontSize: "7px", textTransform: "uppercase", width: "12%" }}>Unit Price</th>
                <th style={{ padding: "10px 8px", textAlign: "right", fontWeight: "700", letterSpacing: "0.8px", fontSize: "7px", textTransform: "uppercase", borderRadius: "0 8px 0 0", width: "11%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item: any, idx: number) => {
                if (item.itemType === "SECTION_HEADING") {
                  return (
                    <tr key={idx}>
                      <td colSpan={7} style={{ padding: "8px 10px", fontWeight: "700", color: accent, fontSize: "8px", letterSpacing: "0.8px", background: accentLight, borderLeft: `3px solid ${accent}` }}>
                        ▸ {item.sectionTitle}
                      </td>
                    </tr>
                  );
                }
                const lineTotal = (item.quantity || 0) * (item.unitPrice || 0) - (item.discountAmount || 0);
                const isEven = idx % 2 === 0;
                return (
                  <tr key={idx} style={{ background: isEven ? "white" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "9px 8px", color: "#94a3b8", textAlign: "center", fontSize: "7.5px", fontWeight: "600" }}>
                      {item.isOptional ? (
                        <span style={{ fontSize: "6px", background: "#fef3c7", color: "#b45309", padding: "2px 5px", borderRadius: "4px", fontWeight: "700", letterSpacing: "0.5px" }}>OPT</span>
                      ) : (
                        <span style={{ background: "#f1f5f9", borderRadius: "4px", padding: "2px 5px" }}>{String(idx + 1).padStart(2, "0")}</span>
                      )}
                    </td>
                    <td style={{ padding: "9px 8px", fontWeight: "600", color: "#0f172a", fontSize: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.image && (
                          <img src={item.image} style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", padding: "2px" }} />
                        )}
                        <div>
                          <div style={{ lineHeight: "1.3" }}>{item.sectionTitle || item.description?.substring(0, 40)}</div>
                          {item.sectionTitle && item.description && item.sectionTitle !== item.description && (
                            <div style={{ fontSize: "6.5px", color: "#94a3b8", marginTop: "1px", lineHeight: "1.2" }}>{item.description?.substring(0, 50)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "9px 8px", color: "#64748b", fontSize: "7.5px", lineHeight: "1.4" }}>
                      {item.description?.substring(0, 70)}
                      {item.warranty && (
                        <div style={{ color: accent, fontSize: "6.5px", marginTop: "3px", fontWeight: "600" }}>✓ Warranty: {item.warranty}</div>
                      )}
                    </td>
                    <td style={{ padding: "9px 8px", textAlign: "center", color: "#64748b", fontSize: "7.5px" }}>
                      {item.brand || "—"}
                    </td>
                    <td style={{ padding: "9px 8px", textAlign: "center", color: "#0f172a", fontWeight: "700", fontSize: "8px" }}>
                      {item.quantity || 0}
                      <div style={{ fontSize: "6px", color: "#94a3b8", fontWeight: "500", marginTop: "1px" }}>{item.unit || "pcs"}</div>
                    </td>
                    <td style={{ padding: "9px 8px", textAlign: "right", color: "#475569", fontSize: "8px", fontFamily: "'Inter', monospace" }}>
                      {fmt(item.unitPrice)}
                    </td>
                    <td style={{ padding: "9px 8px", textAlign: "right", fontWeight: "700", color: "#0f172a", fontSize: "8.5px", fontFamily: "'Inter', monospace" }}>
                      {fmt(lineTotal)}
                    </td>
                  </tr>
                );
              })}
              {(!items || items.length === 0) && (
                <tr>
                  <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "9px" }}>
                    No items defined for this quotation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Card */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
          <div style={{ minWidth: "260px", maxWidth: "280px" }}>
            {/* Summary label */}
            <div style={{ fontSize: "7px", fontWeight: "700", color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px", textAlign: "right" }}>
              PRICE SUMMARY
            </div>
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {[
                { label: "Subtotal", value: fmt(subtotal), color: "#0f172a", bg: "white" },
                { label: "Discount", value: `− ${fmt(discount)}`, color: "#dc2626", bg: "#fef2f2" },
                { label: "Tax (VAT)", value: `+ ${fmt(tax)}`, color: "#64748b", bg: "#f8fafc" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: bg, borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "8px", color: "#64748b", fontWeight: "500" }}>{label}</span>
                  <span style={{ fontSize: "9px", fontWeight: "600", color, fontFamily: "'Inter', monospace" }}>{value} <span style={{ fontSize: "7px", color: "#94a3b8" }}>{currency}</span></span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: accentGrad }}>
                <span style={{ fontSize: "9px", fontWeight: "700", color: "white", letterSpacing: "1px", textTransform: "uppercase" }}>Grand Total</span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#60a5fa", fontFamily: "'Montserrat', sans-serif" }}>{fmt(grandTotal)} <span style={{ fontSize: "8px", fontWeight: "600" }}>{currency}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to push footer down */}
        <div style={{ flex: 1 }} />

        <InnerPageFooter pageNum={4} />
      </div>
    </div>
  );
};
