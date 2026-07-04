import React from "react";
import { QRCodeSVG } from "qrcode.react";

export const ModernInvoicePage = ({
  invoiceNumber,
  invoiceDate,
  dueDate,
  invoiceStatus = "DRAFT",
  paymentStatus = "UNPAID",
  referenceNumber = "",

  companyName = "Octonics Co. W.L.L.",
  companyAddress = "",
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
  
  // Status watermark colors
  const getStatusColor = () => {
    if (invoiceStatus === 'CANCELLED') return 'rgba(239, 68, 68, 0.1)'; // Red
    if (balanceAmount <= 0.01 && paidAmount > 0) return 'rgba(16, 185, 129, 0.1)'; // Green PAID
    if (invoiceStatus === 'DRAFT') return 'rgba(148, 163, 184, 0.1)'; // Gray
    return 'rgba(59, 130, 246, 0.05)'; // Blue subtle for ISSUED/UNPAID
  };

  const getStatusText = () => {
    if (invoiceStatus === 'CANCELLED') return 'CANCELLED';
    if (balanceAmount <= 0.01 && paidAmount > 0) return 'PAID';
    if (invoiceStatus === 'DRAFT') return 'DRAFT';
    return '';
  };

  const watermarkText = getStatusText();

  return (
    <div
      className="pdf-page"
      style={{
        fontFamily: "'Inter', sans-serif",
        color: "#1e293b",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "#ffffff",
      }}
    >
      {/* Top Banner Accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "8px",
          backgroundColor: "#0f172a",
        }}
      />

      {/* Watermark (if applicable) */}
      {watermarkText && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            fontSize: "140px",
            fontWeight: 900,
            color: getStatusColor(),
            zIndex: 0,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            letterSpacing: "10px",
            border: `8px solid ${getStatusColor()}`,
            padding: "20px 60px",
            borderRadius: "24px"
          }}
        >
          {watermarkText}
        </div>
      )}

      {/* Header Section */}
      <div
        style={{
          paddingTop: "50px",
          paddingLeft: "48px",
          paddingRight: "48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "50%" }}>
          <img 
            src="/octonics-logo.png" 
            alt="Logo" 
            style={{ height: "48px", width: "auto", objectFit: "contain", objectPosition: "left" }} 
          />
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>{companyName}</h2>
            <div
              style={{
                fontSize: "11px",
                color: "#475569",
                lineHeight: "1.6",
                marginTop: "8px",
                whiteSpace: "pre-wrap"
              }}
            >
              {companyAddress || "Office 46, Hawally Arab Complex\nBlock 205, Hawally, Kuwait"}
              
              <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {companyTaxNumber && <span><strong>VAT/TRN:</strong> {companyTaxNumber}</span>}
                {companyPhone && <span><strong>TEL:</strong> {companyPhone}</span>}
                {companyEmail && <span><strong>EMAIL:</strong> {companyEmail}</span>}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: "right" }}>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-1px",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
            }}
          >
            INVOICE
          </h1>
          
          <table style={{ marginLeft: "auto", fontSize: "12px", textAlign: "right", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>Invoice No.</td>
                <td style={{ padding: "4px 0", fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{invoiceNumber || "INV-0000"}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>Date</td>
                <td style={{ padding: "4px 0", fontWeight: 600, color: "#0f172a" }}>{invoiceDate}</td>
              </tr>
              {dueDate && (
                <tr>
                  <td style={{ padding: "4px 12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>Due Date</td>
                  <td style={{ padding: "4px 0", fontWeight: 600, color: "#0f172a" }}>{dueDate}</td>
                </tr>
              )}
              {referenceNumber && (
                <tr>
                  <td style={{ padding: "4px 12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", fontSize: "10px" }}>Reference</td>
                  <td style={{ padding: "4px 0", fontWeight: 600, color: "#0f172a" }}>{referenceNumber}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ paddingLeft: "48px", paddingRight: "48px", marginTop: "32px" }}>
        <div style={{ height: "1px", backgroundColor: "#e2e8f0", width: "100%" }}></div>
      </div>

      {/* Customer Details */}
      <div
        style={{
          marginTop: "32px",
          paddingLeft: "48px",
          paddingRight: "48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          zIndex: 1,
        }}
      >
        <div style={{ width: "55%" }}>
          <h3
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              margin: "0 0 12px 0",
            }}
          >
            Bill To
          </h3>
          <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "16px", marginBottom: "4px" }}>
            {customerCompany || customerName || "Valued Customer"}
          </div>
          {customerCompany && customerName && (
            <div style={{ color: "#334155", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
              Attn: {customerName}
            </div>
          )}
          {customerAddress && (
            <div style={{ color: "#475569", fontSize: "12px", whiteSpace: "pre-wrap", lineHeight: "1.6", marginBottom: "6px" }}>
              {customerAddress}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "8px", fontSize: "11px", color: "#475569" }}>
            {customerTaxNumber && <div><strong style={{ color: "#0f172a" }}>VAT/TRN:</strong> {customerTaxNumber}</div>}
            {customerPhone && <div><strong style={{ color: "#0f172a" }}>Phone:</strong> {customerPhone}</div>}
            {customerEmail && <div><strong style={{ color: "#0f172a" }}>Email:</strong> {customerEmail}</div>}
          </div>
        </div>
        
        <div style={{ width: "40%", backgroundColor: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 12px 0" }}>
            Payment Summary
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
            <span style={{ color: "#475569" }}>Total Amount:</span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{currency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
            <span style={{ color: "#475569" }}>Paid Amount:</span>
            <span style={{ fontWeight: 700, color: "#10b981" }}>{currency} {paidAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span>
          </div>
          <div style={{ height: "1px", backgroundColor: "#cbd5e1", margin: "12px 0" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#0f172a", fontWeight: 800, fontSize: "14px" }}>Balance Due:</span>
            <span style={{ fontWeight: 900, color: "#e11d48", fontSize: "18px" }}>{currency} {balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })}</span>
          </div>
        </div>
      </div>

      {/* Invoice Items Table - Highly Detailed */}
      <div style={{ marginTop: "40px", paddingLeft: "48px", paddingRight: "48px", flex: 1, zIndex: 1 }}>
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", backgroundColor: "#0f172a", color: "#ffffff", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", borderTopLeftRadius: "6px" }}>#</th>
              <th style={{ padding: "12px 16px", backgroundColor: "#0f172a", color: "#ffffff", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Description</th>
              <th style={{ padding: "12px 16px", backgroundColor: "#0f172a", color: "#ffffff", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", textAlign: "center" }}>Qty</th>
              <th style={{ padding: "12px 16px", backgroundColor: "#0f172a", color: "#ffffff", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Price</th>
              {tax > 0 && <th style={{ padding: "12px 16px", backgroundColor: "#0f172a", color: "#ffffff", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>VAT</th>}
              <th style={{ padding: "12px 16px", backgroundColor: "#0f172a", color: "#ffffff", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", textAlign: "right", borderTopRightRadius: "6px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let serial = 0;
              return items.map((item: any, idx: number) => {
                if (item.itemType === "SECTION_HEADING") {
                  return (
                    <tr key={idx} style={{ backgroundColor: "#e2e8f0", borderBottom: "1px solid #cbd5e1" }}>
                      <td colSpan={tax > 0 ? 6 : 5} style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {item.sectionTitle || item.description || "Section"}
                      </td>
                    </tr>
                  );
                }
                
                serial++;
                const itemName = item.sectionTitle || item.product?.productName || item.serviceItem?.serviceName || item.description || "Item";
                const showDesc = item.description && item.description !== itemName && item.description !== "Item";

                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: idx % 2 !== 0 ? "#f8fafc" : "#ffffff" }}>
                    <td style={{ padding: "16px", fontSize: "12px", color: "#475569", verticalAlign: "top" }}>
                      {serial}
                    </td>
                    <td style={{ padding: "16px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
                        {itemName}
                      </div>
                      {showDesc && (
                        <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px", fontSize: "12px", color: "#0f172a", textAlign: "center", verticalAlign: "top", fontWeight: 600 }}>
                      {item.quantity || 1} {item.unit !== "pcs" ? <span style={{ fontSize: "10px", color: "#64748b" }}>{item.unit}</span> : ""}
                    </td>
                    <td style={{ padding: "16px", fontSize: "12px", color: "#0f172a", textAlign: "right", verticalAlign: "top" }}>
                      {(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })}
                    </td>
                    {tax > 0 && (
                      <td style={{ padding: "16px", fontSize: "12px", color: "#475569", textAlign: "right", verticalAlign: "top" }}>
                        {item.taxAmount ? item.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 3 }) : "-"}
                        {item.taxRate ? <div style={{ fontSize: "9px", color: "#94a3b8" }}>({item.taxRate}%)</div> : null}
                      </td>
                    )}
                    <td style={{ padding: "16px", fontSize: "13px", color: "#0f172a", textAlign: "right", verticalAlign: "top", fontWeight: 700 }}>
                      {(item.lineTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>

        {/* Totals Section aligned right */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <div style={{ width: "320px" }}>
            <table style={{ width: "100%", fontSize: "13px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 0", color: "#475569", fontWeight: 600 }}>Subtotal</td>
                  <td style={{ padding: "8px 0", textAlign: "right", color: "#0f172a", fontWeight: 600 }}>
                    {currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                  </td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td style={{ padding: "8px 0", color: "#ef4444", fontWeight: 600 }}>Discount</td>
                    <td style={{ padding: "8px 0", textAlign: "right", color: "#ef4444", fontWeight: 600 }}>
                      - {currency} {discount.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                    </td>
                  </tr>
                )}
                {tax > 0 && (
                  <tr>
                    <td style={{ padding: "8px 0", color: "#475569", fontWeight: 600 }}>Total VAT</td>
                    <td style={{ padding: "8px 0", textAlign: "right", color: "#0f172a", fontWeight: 600 }}>
                      {currency} {tax.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2} style={{ padding: "8px 0" }}>
                    <div style={{ height: "2px", backgroundColor: "#0f172a" }}></div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "12px 0", color: "#0f172a", fontWeight: 800, fontSize: "16px", textTransform: "uppercase" }}>Grand Total</td>
                  <td style={{ padding: "12px 0", textAlign: "right", color: "#0f172a", fontWeight: 900, fontSize: "18px" }}>
                    {currency} {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Sections: Bank Details, Terms, Notes */}
      <div style={{ paddingLeft: "48px", paddingRight: "48px", marginTop: "32px", display: "flex", gap: "32px", pageBreakInside: "avoid", zIndex: 1 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {companyBankAccounts && companyBankAccounts.length > 0 && (
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                Bank Details for Transfer
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {companyBankAccounts.map((bank: any, idx: number) => (
                  <div key={idx} style={{ fontSize: "10px", color: "#475569", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0", minWidth: "200px" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontSize: "11px" }}>{bank.bankName}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}><span>Account Name:</span> <strong style={{color:"#0f172a"}}>{bank.accountName}</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}><span>Account No:</span> <strong style={{color:"#0f172a"}}>{bank.accountNumber}</strong></div>
                    {bank.iban && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}><span>IBAN:</span> <strong style={{color:"#0f172a"}}>{bank.iban}</strong></div>}
                    {bank.swiftCode && <div style={{ display: "flex", justifyContent: "space-between" }}><span>SWIFT:</span> <strong style={{color:"#0f172a"}}>{bank.swiftCode}</strong></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {notes && (
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                Notes / Instructions
              </h4>
              <div style={{ fontSize: "11px", color: "#475569", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {notes}
              </div>
            </div>
          )}

          {terms && (
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                Terms & Conditions
              </h4>
              <div style={{ fontSize: "10px", color: "#64748b", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                {terms}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer / QR Verification */}
      <div
        style={{
          marginTop: "32px",
          paddingLeft: "48px",
          paddingRight: "48px",
          paddingBottom: "32px",
          paddingTop: "32px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: "1px solid #e2e8f0",
          zIndex: 1,
          pageBreakInside: "avoid"
        }}
      >
        <div style={{ fontSize: "10px", color: "#94a3b8", maxWidth: "400px", lineHeight: "1.5" }}>
          <strong>{companyName}</strong><br/>
          This is a computer-generated document. No signature is required. <br/>
          For queries related to this invoice, please contact {companyEmail}
        </div>

        {qrVerificationUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "right" }}>
            <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
              Scan to Verify<br />
              <strong style={{ color: "#0f172a" }}>Authenticity</strong>
            </div>
            <div
              style={{
                padding: "6px",
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px"
              }}
            >
              <QRCodeSVG value={qrVerificationUrl} size={48} level="M" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
