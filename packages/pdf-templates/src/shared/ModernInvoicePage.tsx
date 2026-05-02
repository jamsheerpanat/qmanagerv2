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
        color: "#1f2937",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "white",
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
          background: "linear-gradient(to right, #2563eb, #4f46e5)",
        }}
      />

      {/* Header Section */}
      <div
        style={{
          paddingTop: "48px",
          paddingLeft: "48px",
          paddingRight: "48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            INVOICE
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              marginTop: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              margin: "4px 0 0 0",
            }}
          >
            {companyName}
          </p>
          {companyAddress && (
            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "4px",
                whiteSpace: "pre-wrap",
                maxWidth: "320px",
                margin: "4px 0 0 0",
              }}
            >
              {companyAddress}
            </p>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            {invoiceNumber || "INV-0000"}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#6b7280",
              marginTop: "4px",
              display: "flex",
              gap: "16px",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ marginBottom: "4px" }}>
                <span style={{ fontWeight: 600, color: "#374151" }}>Date:</span>{" "}
                {invoiceDate}
              </div>
              {dueDate && (
                <div>
                  <span style={{ fontWeight: 600, color: "#374151" }}>Due Date:</span>{" "}
                  {dueDate}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Company Details */}
      <div
        style={{
          marginTop: "48px",
          paddingLeft: "48px",
          paddingRight: "48px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: "50%" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "12px",
              margin: "0 0 12px 0",
            }}
          >
            Billed To
          </h3>
          <div
            style={{
              color: "#111827",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            {customerName || "Valued Customer"}
          </div>
          {customerCompany && (
            <div style={{ color: "#4b5563", marginTop: "4px" }}>
              {customerCompany}
            </div>
          )}
          {customerAddress && (
            <div
              style={{
                color: "#6b7280",
                fontSize: "14px",
                marginTop: "4px",
                whiteSpace: "pre-wrap",
              }}
            >
              {customerAddress}
            </div>
          )}
        </div>
        <div style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <h3
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "12px",
              margin: "0 0 12px 0",
            }}
          >
            Amount Due
          </h3>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              color: "#2563eb",
            }}
          >
            {(balanceAmount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })}{" "}
            {currency}
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div style={{ marginTop: "48px", paddingLeft: "48px", paddingRight: "48px", flex: 1 }}>
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th
                style={{
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  fontWeight: 700,
                  color: "#4b5563",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  width: "50%",
                }}
              >
                Description
              </th>
              <th
                style={{
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  fontWeight: 700,
                  color: "#4b5563",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: "center",
                  width: "16.66%",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  fontWeight: 700,
                  color: "#4b5563",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: "right",
                  width: "16.66%",
                }}
              >
                Price
              </th>
              <th
                style={{
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  fontWeight: 700,
                  color: "#4b5563",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: "right",
                  width: "16.66%",
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ paddingTop: "16px", paddingBottom: "16px", color: "#1f2937", paddingRight: "16px" }}>
                  <div style={{ fontWeight: 500 }}>
                    {item.sectionTitle || item.description || "Item"}
                  </div>
                  {item.sectionTitle && item.description && (
                    <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td style={{ paddingTop: "16px", paddingBottom: "16px", textAlign: "center", color: "#1f2937" }}>
                  {item.quantity || 1}
                </td>
                <td style={{ paddingTop: "16px", paddingBottom: "16px", textAlign: "right", color: "#1f2937" }}>
                  {(item.unitPrice || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td style={{ paddingTop: "16px", paddingBottom: "16px", textAlign: "right", fontWeight: 500, color: "#111827" }}>
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
          marginTop: "32px",
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
            <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px" }}>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                  margin: "0 0 8px 0",
                }}
              >
                Notes
              </h4>
              <p style={{ fontSize: "14px", color: "#4b5563", whiteSpace: "pre-wrap", margin: 0 }}>
                {notes}
              </p>
            </div>
          )}
        </div>

        {/* Totals Section */}
        <div
          style={{
            width: "45%",
            backgroundColor: "#f9fafb",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #f3f4f6",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: 500 }}>Subtotal</span>
            <span style={{ color: "#111827", fontWeight: 500 }}>
              {(subtotal || 0).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              {currency}
            </span>
          </div>
          {(discount || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", color: "#dc2626" }}>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Discount</span>
              <span style={{ fontWeight: 500 }}>
                -
                {discount.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                {currency}
              </span>
            </div>
          )}
          {(tax || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: 500 }}>Tax</span>
              <span style={{ color: "#111827", fontWeight: 500 }}>
                {tax.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                {currency}
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "12px",
              paddingBottom: "12px",
              borderTop: "1px solid #e5e7eb",
              borderBottom: "1px solid #e5e7eb",
              marginTop: "12px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontWeight: 700, color: "#111827" }}>Grand Total</span>
            <span style={{ fontWeight: 700, color: "#111827" }}>
              {(grandTotal || 0).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              {currency}
            </span>
          </div>

          {(paidAmount || 0) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", color: "#16a34a" }}>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Amount Paid</span>
              <span style={{ fontWeight: 500 }}>
                {paidAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                {currency}
              </span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Balance Due</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#2563eb" }}>
              {(balanceAmount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Footer / QR Verification */}
      <div
        style={{
          marginTop: "auto",
          paddingLeft: "48px",
          paddingRight: "48px",
          paddingBottom: "32px",
          paddingTop: "32px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <div style={{ fontSize: "12px", color: "#9ca3af", maxWidth: "384px" }}>
          If you have any questions about this invoice, please contact us at{" "}
          {companyName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}@support.com
        </div>

        {qrVerificationUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Scan to verify
              <br />
              authenticity
            </div>
            <div
              style={{
                padding: "8px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid #f3f4f6",
              }}
            >
              <QRCodeSVG value={qrVerificationUrl} size={60} level="M" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
