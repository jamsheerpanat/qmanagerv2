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
}: any) => {
  return (
    <div className="pdf-page bg-white font-sans text-gray-800 relative flex flex-col h-full w-full">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

      {/* Header Section */}
      <div className="pt-12 px-12 flex justify-between items-start">
        <div>
          {/* Use a placeholder logo or text if no logo provided */}
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            INVOICE
          </h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            Octonics Co. W.L.L.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-900">
            {invoiceNumber || "INV-0000"}
          </div>
          <div className="text-sm text-gray-500 mt-1 flex gap-4 justify-end">
            <div>
              <span className="font-semibold text-gray-700">Date:</span>{" "}
              {invoiceDate}
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Company Details */}
      <div className="mt-12 px-12 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Billed To
          </h3>
          <div className="text-gray-900 font-semibold text-lg">
            {customerName || "Valued Customer"}
          </div>
          {customerCompany && (
            <div className="text-gray-600 mt-1">{customerCompany}</div>
          )}
          {customerAddress && (
            <div className="text-gray-500 text-sm mt-1 whitespace-pre-wrap">
              {customerAddress}
            </div>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Amount Due
          </h3>
          <div className="text-3xl font-bold text-blue-600">
            {balanceAmount.toLocaleString(undefined, {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })}{" "}
            {currency}
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="mt-12 px-12 flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 font-bold text-gray-600 text-sm uppercase tracking-wider w-1/2">
                Description
              </th>
              <th className="py-3 font-bold text-gray-600 text-sm uppercase tracking-wider text-center w-1/6">
                Qty
              </th>
              <th className="py-3 font-bold text-gray-600 text-sm uppercase tracking-wider text-right w-1/6">
                Price
              </th>
              <th className="py-3 font-bold text-gray-600 text-sm uppercase tracking-wider text-right w-1/6">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-4 text-gray-800 pr-4">
                  <div className="font-medium">
                    {item.sectionTitle || item.description || "Item"}
                  </div>
                  {item.sectionTitle && item.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="py-4 text-center text-gray-800">
                  {item.quantity || 1}
                </td>
                <td className="py-4 text-right text-gray-800">
                  {(item.unitPrice || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td className="py-4 text-right font-medium text-gray-900">
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
      <div className="mt-8 px-12 grid grid-cols-2 gap-8 avoid-break">
        {/* Notes Section */}
        <div>
          {notes && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          )}
        </div>

        {/* Totals Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600 font-medium">Subtotal</span>
            <span className="text-gray-900 font-medium">
              {subtotal.toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              {currency}
            </span>
          </div>
          {(discount || 0) > 0 && (
            <div className="flex justify-between items-center mb-3 text-red-600">
              <span className="text-sm font-medium">Discount</span>
              <span className="font-medium">
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
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600 font-medium">Tax</span>
              <span className="text-gray-900 font-medium">
                {tax.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                {currency}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-t border-b border-gray-200 mt-3 mb-3">
            <span className="font-bold text-gray-900">Grand Total</span>
            <span className="font-bold text-gray-900">
              {grandTotal.toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              {currency}
            </span>
          </div>

          {(paidAmount || 0) > 0 && (
            <div className="flex justify-between items-center mb-2 text-green-600">
              <span className="text-sm font-medium">Amount Paid</span>
              <span className="font-medium">
                {paidAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                {currency}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-bold text-gray-900">Balance Due</span>
            <span className="text-xl font-bold text-blue-600">
              {balanceAmount.toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Footer / QR Verification */}
      <div className="mt-auto px-12 pb-8 pt-8 flex items-end justify-between border-t border-gray-100">
        <div className="text-xs text-gray-400 max-w-sm">
          If you have any questions about this invoice, please contact us at
          support@octonics.com
        </div>

        {qrVerificationUrl && (
          <div className="flex items-center gap-4 text-right">
            <div className="text-xs text-gray-500">
              Scan to verify
              <br />
              authenticity
            </div>
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <QRCodeSVG value={qrVerificationUrl} size={60} level="M" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
