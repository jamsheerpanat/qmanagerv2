import React from "react";
import { QRCodeSVG } from "qrcode.react";

export const ModernInvoicePage = ({
  projectName = "",
  sectionName = "",
  invoiceNumber,
  invoiceDate,
  dueDate,
  invoiceStatus = "DRAFT",
  paymentStatus = "UNPAID",
  referenceNumber = "",

  companyName = "Octonics Co. W.L.L.",
  companyAddress = "Corporate Office\nOffice No. 5, 2nd Floor, Tower 3, 22 Street\nBlock 13, Qibla, Kuwait City",
  companyTaxNumber = "",
  companyEmail = "info@octonics.com",
  companyPhone = "+965 9924 0074",
  companyBankAccounts = [],

  customerName,
  customerCompany,
  customerAddress,
  customerTaxNumber = "",
  customerEmail = "",
  customerPhone = "",

  items = [],
  subtotal = 0,
  discount = 0,
  tax = 0,
  grandTotal = 0,
  paidAmount = 0,
  balanceAmount = 0,
  currency = "KWD",
  notes = "",
  terms = "",
  qrVerificationUrl = "",
}: any) => {
  
  const displayBankAccounts = companyBankAccounts && companyBankAccounts.length > 0 
    ? companyBankAccounts 
    : [
        {
          bankName: "Commercial Bank of Kuwait",
          accountName: "OCTONICS INNOVATION CO FOR TECHNICAL AND COMPUTER AND SERVICES",
          accountNumber: "9621507010",
          iban: "KW16COMB0000509621507100414015",
          swiftCode: "COMBKWKW"
        }
      ];

  // Status Colors
  const isPaid = balanceAmount <= 0.01 && paidAmount > 0;
  
  const getBadgeColors = () => {
    if (invoiceStatus === 'CANCELLED') return { bg: '#fee2e2', text: '#b91c1c' };
    if (isPaid) return { bg: '#d1fae5', text: '#047857' };
    if (invoiceStatus === 'DRAFT') return { bg: '#f1f5f9', text: '#475569' };
    return { bg: '#e0e7ff', text: '#4338ca' };
  };

  const getStatusText = () => {
    if (invoiceStatus === 'CANCELLED') return 'CANCELLED';
    if (isPaid) return 'PAID IN FULL';
    if (invoiceStatus === 'DRAFT') return 'DRAFT';
    return 'ISSUED';
  };

  const badge = getBadgeColors();

  return (
    <div
      className="pdf-page"
      style={{
        fontFamily: "'Inter', sans-serif",
        color: "#1e293b",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "#fafaf9", // very subtle warm gray background
        position: "relative"
      }}
    >
      {/* Background Accent Graphics */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(67, 56, 202, 0.03) 0%, rgba(250, 250, 249, 0) 70%)', zIndex: 0 }}></div>

      {/* HEADER SECTION - Brand & Invoice Meta */}
      <div style={{ padding: "48px 48px 32px 48px", display: "flex", justifyContent: "space-between", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <img 
            src="/octonics-logo.png" 
            alt="Logo" 
            style={{ height: "42px", width: "auto", objectFit: "contain", objectPosition: "left" }} 
          />
          <div style={{ marginTop: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.5px" }}>{companyName}</h2>
            <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.6", marginTop: "6px", whiteSpace: "pre-wrap" }}>
              {companyAddress}
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "3px" }}>
                {companyTaxNumber && <div><span style={{ fontWeight: 600 }}>VAT/TRN:</span> {companyTaxNumber}</div>}
                {companyPhone && <div><span style={{ fontWeight: 600 }}>TEL:</span> {companyPhone}</div>}
                {companyEmail && <div><span style={{ fontWeight: 600 }}>EMAIL:</span> {companyEmail}</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ 
            display: "inline-block", 
            padding: "6px 16px", 
            borderRadius: "20px", 
            backgroundColor: badge.bg, 
            color: badge.text, 
            fontSize: "10px", 
            fontWeight: 800, 
            letterSpacing: "1px",
            marginBottom: "16px"
          }}>
            {getStatusText()}
          </div>
          
          <h1 style={{ fontSize: "48px", fontWeight: 900, color: "#1e1b4b", letterSpacing: "-2px", margin: "0 0 16px 0", lineHeight: "1" }}>
            INVOICE
          </h1>

          <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
            <div>
              <div style={{ fontSize: "8px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Invoice Number</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{invoiceNumber || "INV-0000"}</div>
            </div>
            <div>
              <div style={{ fontSize: "8px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Date of Issue</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{invoiceDate}</div>
            </div>
          </div>
          
          {(dueDate || referenceNumber || projectName || sectionName) && (
            <div style={{ display: "flex", gap: "24px", textAlign: "right", marginTop: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              {projectName && (
                <div>
                  <div style={{ fontSize: "8px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Project</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{projectName}</div>
                </div>
              )}
              {sectionName && (
                <div>
                  <div style={{ fontSize: "8px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Section</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{sectionName}</div>
                </div>
              )}
              {dueDate && (
                <div>
                  <div style={{ fontSize: "8px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Due Date</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{dueDate}</div>
                </div>
              )}
              {referenceNumber && (
                <div>
                  <div style={{ fontSize: "8px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Reference</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{referenceNumber}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BILL TO & SUMMARY CARDS */}
      <div style={{ padding: "0 48px", display: "flex", gap: "24px", zIndex: 1, marginTop: "16px" }}>
        
        {/* Bill To Card */}
        <div style={{ flex: 1, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h3 style={{ fontSize: "10px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Billed To</h3>
          </div>
          
          <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "16px", marginBottom: "4px", letterSpacing: "-0.5px" }}>
            {customerCompany || customerName || "Valued Customer"}
          </div>
          {customerCompany && customerName && (
            <div style={{ color: "#4338ca", fontWeight: 700, fontSize: "12px", marginBottom: "8px" }}>
              {customerName}
            </div>
          )}
          {customerAddress && (
            <div style={{ color: "#64748b", fontSize: "11px", whiteSpace: "pre-wrap", lineHeight: "1.5", marginBottom: "12px" }}>
              {customerAddress}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px", fontSize: "10px", color: "#64748b" }}>
            {customerTaxNumber && <div><div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>VAT/TRN</div><strong style={{ color: "#0f172a" }}>{customerTaxNumber}</strong></div>}
            {customerPhone && <div><div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Phone</div><strong style={{ color: "#0f172a" }}>{customerPhone}</strong></div>}
            {customerEmail && <div style={{ gridColumn: "span 2" }}><div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Email</div><strong style={{ color: "#0f172a" }}>{customerEmail}</strong></div>}
          </div>
        </div>

        {/* Amount Summary Card */}
        <div style={{ width: "280px", backgroundColor: "#1e1b4b", borderRadius: "16px", padding: "24px", color: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 15px -3px rgba(30, 27, 75, 0.2)" }}>
          <div>
            <h3 style={{ fontSize: "10px", fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px 0" }}>
              Payment Summary
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
              <span style={{ color: "#c7d2fe" }}>Total Amount</span>
              <span style={{ fontWeight: 600 }}>{currency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#c7d2fe" }}>Amount Paid</span>
              <span style={{ fontWeight: 600, color: "#34d399" }}>{currency} {paidAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span>
            </div>
          </div>
          
          <div style={{ marginTop: "24px", backgroundColor: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px" }}>
            <div style={{ fontSize: "10px", color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Balance Due</div>
            <div style={{ fontWeight: 900, color: "#ffffff", fontSize: "24px", letterSpacing: "-1px" }}>
              {currency} {balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })}
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div style={{ marginTop: "40px", paddingLeft: "48px", paddingRight: "48px", flex: 1, zIndex: 1 }}>
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "0 0 12px 0", color: "#94a3b8", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "2px solid #e2e8f0" }}>Description</th>
              <th style={{ padding: "0 0 12px 0", color: "#94a3b8", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", textAlign: "center", borderBottom: "2px solid #e2e8f0", width: "8%" }}>Qty</th>
              <th style={{ padding: "0 0 12px 0", color: "#94a3b8", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", textAlign: "right", borderBottom: "2px solid #e2e8f0", width: "12%" }}>Price</th>
              <th style={{ padding: "0 0 12px 0", color: "#94a3b8", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", textAlign: "right", borderBottom: "2px solid #e2e8f0", width: "12%" }}>Discount</th>
              {tax > 0 && <th style={{ padding: "0 0 12px 0", color: "#94a3b8", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", textAlign: "right", borderBottom: "2px solid #e2e8f0", width: "12%" }}>VAT</th>}
              <th style={{ padding: "0 0 12px 0", color: "#94a3b8", fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", textAlign: "right", borderBottom: "2px solid #e2e8f0", width: "12%" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              return items.map((item: any, idx: number) => {
                if (item.itemType === "SECTION_HEADING") {
                  return (
                    <tr key={idx}>
                      <td colSpan={tax > 0 ? 6 : 5} style={{ padding: "24px 0 8px 0", borderBottom: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#4338ca", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                          {item.sectionTitle || item.description || "Section"}
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                const itemName = item.sectionTitle || item.product?.productName || item.serviceItem?.serviceName || item.description || "Item";
                const showDesc = item.description && item.description !== itemName && item.description !== "Item";

                return (
                  <tr key={idx}>
                    <td style={{ padding: "16px 0", borderBottom: "1px dashed #e2e8f0", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12px", marginBottom: showDesc ? "4px" : "0" }}>
                        {itemName}
                      </div>
                      {showDesc && (
                        <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.5", whiteSpace: "pre-wrap", maxWidth: "90%" }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "12px", color: "#334155", textAlign: "center", verticalAlign: "top", borderBottom: "1px dashed #e2e8f0", fontWeight: 600 }}>
                      {item.quantity || 1} <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 500 }}>{item.unit}</span>
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "12px", color: "#334155", textAlign: "right", verticalAlign: "top", borderBottom: "1px dashed #e2e8f0" }}>
                      {(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} <span style={{ fontSize: "9px", color: "#94a3b8", marginLeft: "4px" }}>{currency}</span>
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "12px", color: "#ef4444", textAlign: "right", verticalAlign: "top", borderBottom: "1px dashed #e2e8f0" }}>
                      {item.discountAmount > 0 ? (
                        <>
                          -{(item.discountAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} <span style={{ fontSize: "9px", color: "#f87171", marginLeft: "4px" }}>{currency}</span>
                        </>
                      ) : "-"}
                    </td>
                    {tax > 0 && (
                      <td style={{ padding: "16px 0", fontSize: "12px", color: "#334155", textAlign: "right", verticalAlign: "top", borderBottom: "1px dashed #e2e8f0" }}>
                        {item.taxAmount ? item.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 3 }) : "-"} {item.taxAmount ? <span style={{ fontSize: "9px", color: "#94a3b8", marginLeft: "4px" }}>{currency}</span> : null}
                        {item.taxRate ? <div style={{ fontSize: "8px", color: "#94a3b8", marginTop: "2px" }}>({item.taxRate}%)</div> : null}
                      </td>
                    )}
                    <td style={{ padding: "16px 0", fontSize: "12px", color: "#0f172a", textAlign: "right", verticalAlign: "top", borderBottom: "1px dashed #e2e8f0", fontWeight: 700 }}>
                      {(item.lineTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} <span style={{ fontSize: "9px", color: "#94a3b8", marginLeft: "4px" }}>{currency}</span>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>

        {/* Totals Breakdown */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <div style={{ width: "300px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
            <table style={{ width: "100%", fontSize: "12px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "6px 0", color: "#64748b", fontWeight: 500 }}>Subtotal</td>
                  <td style={{ padding: "6px 0", textAlign: "right", color: "#0f172a", fontWeight: 600 }}>
                    {currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                  </td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td style={{ padding: "6px 0", color: "#ef4444", fontWeight: 500 }}>Discount</td>
                    <td style={{ padding: "6px 0", textAlign: "right", color: "#ef4444", fontWeight: 600 }}>
                      - {currency} {discount.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                    </td>
                  </tr>
                )}
                {tax > 0 && (
                  <tr>
                    <td style={{ padding: "6px 0", color: "#64748b", fontWeight: 500 }}>Total VAT</td>
                    <td style={{ padding: "6px 0", textAlign: "right", color: "#0f172a", fontWeight: 600 }}>
                      {currency} {tax.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2} style={{ padding: "12px 0" }}>
                    <div style={{ height: "1px", backgroundColor: "#e2e8f0" }}></div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 0", color: "#0f172a", fontWeight: 800, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Grand Total</td>
                  <td style={{ padding: "4px 0", textAlign: "right", color: "#4338ca", fontWeight: 900, fontSize: "16px" }}>
                    {currency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Sections: Bank Details, Terms, Notes */}
      <div style={{ paddingLeft: "48px", paddingRight: "48px", marginTop: "40px", display: "flex", gap: "32px", pageBreakInside: "avoid", zIndex: 1 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {displayBankAccounts && displayBankAccounts.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                </div>
                <h4 style={{ fontSize: "10px", fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                  Payment Details
                </h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {displayBankAccounts.map((bank: any, idx: number) => (
                  <div key={idx} style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", minWidth: "220px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                    <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "8px", fontSize: "11px", letterSpacing: "0.5px" }}>{bank.bankName}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", fontSize: "10px", color: "#64748b" }}>
                      <span style={{ fontWeight: 600 }}>Name:</span> <span style={{ color: "#0f172a", fontWeight: 500 }}>{bank.accountName}</span>
                      <span style={{ fontWeight: 600 }}>Account:</span> <span style={{ color: "#0f172a", fontWeight: 500, fontFamily: "monospace", fontSize: "11px" }}>{bank.accountNumber}</span>
                      {bank.iban && <><span style={{ fontWeight: 600 }}>IBAN:</span> <span style={{ color: "#0f172a", fontWeight: 500, fontFamily: "monospace", fontSize: "11px" }}>{bank.iban}</span></>}
                      {bank.swiftCode && <><span style={{ fontWeight: 600 }}>SWIFT:</span> <span style={{ color: "#0f172a", fontWeight: 500 }}>{bank.swiftCode}</span></>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notes && (
            <div>
              <h4 style={{ fontSize: "10px", fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0" }}>
                Notes
              </h4>
              <div style={{ fontSize: "10px", color: "#475569", whiteSpace: "pre-wrap", lineHeight: "1.6", backgroundColor: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                {notes}
              </div>
            </div>
          )}

          {terms && (
            <div>
              <h4 style={{ fontSize: "10px", fontWeight: 800, color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0" }}>
                Terms & Conditions
              </h4>
              <div style={{ fontSize: "9px", color: "#64748b", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {terms}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer / QR Verification */}
      <div
        style={{
          marginTop: "48px",
          marginLeft: "48px",
          marginRight: "48px",
          marginBottom: "32px",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "16px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          zIndex: 1,
          pageBreakInside: "avoid",
          color: "#ffffff"
        }}
      >
        <div style={{ fontSize: "10px", color: "#cbd5e1", maxWidth: "400px", lineHeight: "1.6" }}>
          <strong style={{ color: "#f8fafc", fontSize: "12px", letterSpacing: "0.5px" }}>{companyName}</strong><br/>
          <div style={{ marginTop: "6px" }}>
            This is a system-generated document and does not require a physical signature. <br/>
            For inquiries, please contact <span style={{ color: "#38bdf8", fontWeight: 600 }}>{companyEmail}</span>.
          </div>
        </div>

        {qrVerificationUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "right" }}>
            <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
              Scan to Verify<br />
              <strong style={{ color: "#f8fafc", fontSize: "11px" }}>Authenticity</strong>
            </div>
            <div
              style={{
                padding: "8px",
                backgroundColor: "rgba(255, 255, 255, 1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            >
              <QRCodeSVG value={qrVerificationUrl} size={50} level="M" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
