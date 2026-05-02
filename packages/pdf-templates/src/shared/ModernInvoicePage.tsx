import React from "react";
import { QRCodeSVG } from "qrcode.react";

export const ModernInvoicePage = ({
  invoiceNumber,
  invoiceDate,
  dueDate,
  customerName,
  customerCompany,
  customerAddress,
  items = [],
  subtotal = 0,
  discount = 0,
  tax = 0,
  grandTotal = 0,
  paidAmount = 0,
  balanceAmount = 0,
  currency = "KWD",
  notes = "",
  qrVerificationUrl = "",
  companyName = "Octonics Co. W.L.L.",
  companyAddress = "",
}: any) => {
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
      {/* Next-Gen Top Banner Accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "12px",
          background: "linear-gradient(90deg, #0f172a 0%, #3b82f6 50%, #06b6d4 100%)",
        }}
      />
      
      {/* Background Graphic Accent (Very faint tech lines) */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: 0,
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(59,130,246,0.03) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Header Section */}
      <div
        style={{
          paddingTop: "64px",
          paddingLeft: "48px",
          paddingRight: "48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <img 
            src="/octonics-logo.png" 
            alt="Octonics Logo" 
            style={{ height: "48px", width: "auto", objectFit: "contain" }} 
          />
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              lineHeight: "1.7",
              letterSpacing: "0.02em",
              borderLeft: "2px solid #e2e8f0",
              paddingLeft: "16px"
            }}
          >
            📍 Office 46, Hawally Arab Complex<br />
            &nbsp;&nbsp;&nbsp;&nbsp;Block 205, Hawally, Kuwait<br />
            ✉️ info@octonics.com<br />
            📞 +965 9924 0074
          </div>
        </div>
        
        <div style={{ textAlign: "right" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-1.5px",
              margin: "0 0 4px 0",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px"
            }}
          >
            INVOICE
            <span style={{ width: "8px", height: "8px", backgroundColor: "#3b82f6", borderRadius: "50%", display: "inline-block" }}></span>
          </h1>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#3b82f6",
              marginBottom: "24px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            #{invoiceNumber || "INV-0000"}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#475569",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "180px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
              <span style={{ fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Date</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{invoiceDate}</span>
            </div>
            {dueDate && (
              <div style={{ display: "flex", justifyContent: "space-between", width: "180px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
                <span style={{ fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Due</span>
                <span style={{ color: "#0f172a", fontWeight: 600 }}>{dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer & Company Details */}
      <div
        style={{
          marginTop: "64px",
          paddingLeft: "48px",
          paddingRight: "48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ width: "50%", position: "relative" }}>
          <h3
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#3b82f6",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "16px",
              margin: "0 0 16px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span style={{ width: "16px", height: "1px", backgroundColor: "#3b82f6" }}></span>
            Billed To
          </h3>
          <div
            style={{
              color: "#0f172a",
              fontWeight: 700,
              fontSize: "20px",
              letterSpacing: "-0.5px"
            }}
          >
            {customerName || "Valued Customer"}
          </div>
          {customerCompany && (
            <div style={{ color: "#475569", marginTop: "6px", fontWeight: 500 }}>
              {customerCompany}
            </div>
          )}
          {customerAddress && (
            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginTop: "6px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.6"
              }}
            >
              {customerAddress}
            </div>
          )}
        </div>
        
        <div style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <h3
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "16px",
              margin: "0 0 16px 0",
            }}
          >
            Total Amount Due
          </h3>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-1px",
              display: "flex",
              alignItems: "flex-start",
              gap: "6px"
            }}
          >
            <span style={{ fontSize: "16px", color: "#64748b", marginTop: "6px" }}>{currency}</span>
            {(balanceAmount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })}
          </div>
        </div>
      </div>

      {/* Invoice Items Table (Dark Header Tech Style) */}
      <div style={{ marginTop: "56px", paddingLeft: "48px", paddingRight: "48px", flex: 1 }}>
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ backgroundColor: "#0f172a" }}>
              <th
                style={{
                  padding: "16px 20px",
                  fontWeight: 700,
                  color: "#ffffff",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  width: "50%",
                  borderTopLeftRadius: "8px",
                  borderBottomLeftRadius: "8px",
                }}
              >
                Item Description
              </th>
              <th
                style={{
                  padding: "16px 20px",
                  fontWeight: 700,
                  color: "#ffffff",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  textAlign: "center",
                  width: "16.66%",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  padding: "16px 20px",
                  fontWeight: 700,
                  color: "#ffffff",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  textAlign: "right",
                  width: "16.66%",
                }}
              >
                Unit Price
              </th>
              <th
                style={{
                  padding: "16px 20px",
                  fontWeight: 700,
                  color: "#ffffff",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  textAlign: "right",
                  width: "16.66%",
                  borderTopRightRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} style={{ 
                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
              }}>
                <td style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "20px", paddingRight: "20px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "14px" }}>
                    {item.sectionTitle || item.description || "Item"}
                  </div>
                  {item.sectionTitle && item.description && (
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", lineHeight: "1.5" }}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td style={{ paddingTop: "20px", paddingBottom: "20px", textAlign: "center", borderBottom: "1px solid #f1f5f9", fontWeight: 500, color: "#475569" }}>
                  {item.quantity || 1}
                </td>
                <td style={{ paddingTop: "20px", paddingBottom: "20px", textAlign: "right", borderBottom: "1px solid #f1f5f9", fontWeight: 500, color: "#475569" }}>
                  {(item.unitPrice || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td style={{ paddingTop: "20px", paddingBottom: "20px", textAlign: "right", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#0f172a", paddingRight: "20px" }}>
                  {(item.lineTotal || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes Section */}
      <div
        style={{
          marginTop: "40px",
          paddingLeft: "48px",
          paddingRight: "48px",
          display: "flex",
          justifyContent: "space-between",
          pageBreakInside: "avoid",
        }}
      >
        {/* Notes Section */}
        <div style={{ width: "45%" }}>
          {notes && (
            <div style={{ 
              backgroundColor: "#f8fafc", 
              padding: "24px", 
              borderRadius: "12px",
              border: "1px dashed #cbd5e1"
            }}>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: "12px",
                  margin: "0 0 12px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span style={{ width: "4px", height: "12px", backgroundColor: "#94a3b8", borderRadius: "2px" }}></span>
                Additional Notes
              </h4>
              <p style={{ fontSize: "13px", color: "#475569", whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.6" }}>
                {notes}
              </p>
            </div>
          )}
        </div>

        {/* Next-Gen Totals Card Section */}
        <div
          style={{
            width: "48%",
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
            border: "1px solid #f1f5f9",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Subtle Card Accent */}
          <div style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "4px", background: "linear-gradient(90deg, #3b82f6, #06b6d4)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Subtotal</span>
            <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "15px" }}>
              {(subtotal || 0).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>{currency}</span>
            </span>
          </div>
          {(discount || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", color: "#ef4444" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Discount Applied</span>
              <span style={{ fontWeight: 600, fontSize: "15px" }}>
                -
                {discount.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                <span style={{ fontSize: "12px", opacity: 0.7 }}>{currency}</span>
              </span>
            </div>
          )}
          {(tax || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Estimated Tax</span>
              <span style={{ color: "#0f172a", fontWeight: 600, fontSize: "15px" }}>
                {tax.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{currency}</span>
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "20px",
              paddingBottom: "20px",
              borderTop: "2px dashed #e2e8f0",
              borderBottom: "2px dashed #e2e8f0",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Total Due</span>
            <span style={{ fontWeight: 900, color: "#3b82f6", fontSize: "20px" }}>
              {(grandTotal || 0).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 700 }}>{currency}</span>
            </span>
          </div>

          {(paidAmount || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", color: "#10b981" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "6px", height: "6px", backgroundColor: "#10b981", borderRadius: "50%" }}></span>
                Amount Paid
              </span>
              <span style={{ fontWeight: 700, fontSize: "15px" }}>
                {paidAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                <span style={{ fontSize: "12px", opacity: 0.8 }}>{currency}</span>
              </span>
            </div>
          )}

          {(paidAmount || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "1px" }}>Remaining</span>
              <span style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a" }}>
                {(balanceAmount || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>{currency}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / QR Verification */}
      <div
        style={{
          marginTop: "auto",
          paddingLeft: "48px",
          paddingRight: "48px",
          paddingBottom: "40px",
          paddingTop: "32px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: "11px", color: "#94a3b8", maxWidth: "384px", lineHeight: "1.6" }}>
          This document is system-generated and does not require a physical signature.<br/>
          If you have any questions, contact us at <strong style={{ color: "#64748b" }}>info@octonics.com</strong>
        </div>

        {qrVerificationUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
              Scan to Verify<br />
              <span style={{ color: "#3b82f6" }}>Authenticity</span>
            </div>
            <div
              style={{
                padding: "8px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "1px solid #e2e8f0",
              }}
            >
              <QRCodeSVG value={qrVerificationUrl} size={56} level="M" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
