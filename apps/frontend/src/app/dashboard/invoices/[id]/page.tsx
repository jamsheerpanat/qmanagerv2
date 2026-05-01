"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Download,
  ArrowLeft,
  Send,
  Play,
  CheckCircle,
  CreditCard,
  History,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "",
    notes: "",
  });

  const router = useRouter();

  async function fetchInvoice() {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data);
      setPaymentForm((prev) => ({ ...prev, amount: data.balanceAmount }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);


  async function handleAction(action: string) {
    try {
      if (action === "issue") {
        await api.post(`/invoices/${id}/issue`);
        alert("Invoice Issued!");
      }
      fetchInvoice();
    } catch (e) {
      console.error(e);
      alert("Action failed.");
    }
  };

  async function handleRecordPayment() {
    try {
      await api.post(`/invoices/${id}/payments`, paymentForm);
      alert("Payment recorded successfully!");
      setShowPaymentModal(false);
      fetchInvoice();
    } catch (e) {
      console.error(e);
      alert("Failed to record payment. Check amount.");
    }
  };

  async function generatePdf() {
    setIsGenerating(true);
    try {
      const response = await api.post(`/invoices/${id}/generate-pdf`, {}, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${invoice.invoiceNumber || "invoice"}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="p-8">Loading invoice details...</div>;
  if (!invoice) return <div className="p-8">Invoice not found</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Payment Modal overlay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Balance: {invoice.balanceAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Method</label>
                <select
                  className="w-full border rounded p-2"
                  value={paymentForm.paymentMethod}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="KNET">KNET</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={paymentForm.referenceNumber}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      referenceNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={2}
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleRecordPayment}
                >
                  Save Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/invoices")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {invoice.invoiceNumber || "Draft Invoice"}
              <Badge
                variant={
                  invoice.invoiceStatus === "PAID" ? "default" : "secondary"
                }
                className={
                  invoice.invoiceStatus === "PAID"
                    ? "bg-green-100 text-green-800"
                    : ""
                }
              >
                {invoice.invoiceStatus.replace(/_/g, " ")}
              </Badge>
            </h1>
            <p className="text-sm text-gray-500">
              {invoice.customer?.displayName} • Type:{" "}
              {invoice.invoiceType.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.invoiceStatus === "DRAFT" && (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleAction("issue")}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Issue Invoice
            </Button>
          )}

          {invoice.invoiceStatus !== "DRAFT" &&
            invoice.invoiceStatus !== "CANCELLED" &&
            invoice.balanceAmount > 0 && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowPaymentModal(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" /> Record Payment
              </Button>
            )}

          <Button
            variant="secondary"
            onClick={() =>
              setActiveTab(activeTab === "preview" ? "details" : "preview")
            }
          >
            {activeTab === "preview" ? (
              "View Details"
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> Live Preview
              </>
            )}
          </Button>

          <Button onClick={generatePdf} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" /> Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          {activeTab === "details" ? (
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Invoice Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Invoice Date</p>
                      <p className="font-medium">
                        {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium">
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), "MMM d, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reference Quotation</p>
                      <p className="font-medium">
                        {invoice.quotation?.quotationNumber || "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment Status</p>
                      <Badge
                        variant="outline"
                        className={
                          invoice.paymentStatus === "PAID"
                            ? "text-green-600 border-green-200 bg-green-50"
                            : "text-red-600 border-red-200 bg-red-50"
                        }
                      >
                        {invoice.paymentStatus.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                    Line Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="p-3">Description</th>
                          <th className="p-3">Qty</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Tax</th>
                          <th className="p-3 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invoice.items?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">
                              {item.description}
                            </td>
                            <td className="p-3">{item.quantity}</td>
                            <td className="p-3">
                              {item.unitPrice?.toLocaleString()}
                            </td>
                            <td className="p-3">
                              {item.taxAmount?.toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-bold">
                              {item.lineTotal?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-gray-50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">
                      Financial Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium">
                          {invoice.subtotal?.toLocaleString()}{" "}
                          {invoice.currency}
                        </span>
                      </div>
                      {invoice.discountAmount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Discount</span>
                          <span>
                            -{invoice.discountAmount?.toLocaleString()}{" "}
                            {invoice.currency}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax</span>
                        <span className="font-medium">
                          {invoice.taxAmount?.toLocaleString()}{" "}
                          {invoice.currency}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t mt-3">
                        <span className="text-gray-900 font-bold text-base">
                          Grand Total
                        </span>
                        <span className="font-bold text-lg text-gray-900">
                          {invoice.grandTotal?.toLocaleString()}{" "}
                          {invoice.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Paid Amount</span>
                        <span className="font-medium text-green-600">
                          {invoice.paidAmount?.toLocaleString()}{" "}
                          {invoice.currency}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t mt-3">
                        <span className="text-red-600 font-bold text-base">
                          Balance Due
                        </span>
                        <span className="font-bold text-xl text-red-600">
                          {invoice.balanceAmount?.toLocaleString()}{" "}
                          {invoice.currency}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-none shadow-sm overflow-hidden h-[800px]">
              <iframe
                src={`/render-pdf/invoice-standard?invoiceId=${invoice.id}`}
                className="w-full h-full border-0 bg-gray-100"
                title="Invoice Live Preview"
              />
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <History className="w-4 h-4 mr-2" /> Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.payments?.length > 0 ? (
                <div className="space-y-4">
                  {invoice.payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="text-sm border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between font-bold text-green-700">
                        <span>
                          {payment.amount?.toLocaleString()} {invoice.currency}
                        </span>
                        <span>
                          {format(new Date(payment.paymentDate), "MMM d")}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        Method: {payment.paymentMethod.replace(/_/g, " ")}
                      </p>
                      {payment.referenceNumber && (
                        <p className="text-gray-500 text-xs">
                          Ref: {payment.referenceNumber}
                        </p>
                      )}
                      {payment.receipt && (
                        <a
                          href="#"
                          className="text-blue-600 text-xs flex items-center mt-2 hover:underline"
                        >
                          <FileText className="w-3 h-3 mr-1" />{" "}
                          {payment.receipt.receiptNumber}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No payments recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
