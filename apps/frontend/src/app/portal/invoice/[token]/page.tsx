"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function InvoicePortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    amount: 0,
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "",
    notes: "",
    attachmentUrl: "", // In a real app, we'd handle file upload to minio here
  });

  useEffect(() => {
    fetchInvoice();
  }, [token]);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/portal/invoices/${token}`);
      setData(res.data);
      setUploadForm((prev) => ({
        ...prev,
        amount: res.data.invoice.balanceAmount,
      }));
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      await api.post(`/portal/invoices/${token}/payment-proof`, uploadForm);
      alert("Payment proof uploaded successfully! We will verify it shortly.");
      setShowUploadModal(false);
      fetchInvoice();
    } catch (e) {
      console.error(e);
      alert("Failed to upload payment proof.");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading secure document...</div>;
  if (!data)
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Invalid or Expired Link
      </div>
    );

  const inv = data.invoice;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-600" /> Upload Payment
              Proof
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount Paid
                </label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={uploadForm.amount}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      amount: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Outstanding Balance: {inv.balanceAmount?.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={uploadForm.paymentMethod}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reference Number / Transaction ID
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={uploadForm.referenceNumber}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      referenceNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Proof Attachment (URL for demo)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/receipt.jpg"
                  className="w-full border rounded p-2"
                  value={uploadForm.attachmentUrl}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      attachmentUrl: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleUpload}
                  disabled={uploadForm.amount <= 0}
                >
                  Submit Proof
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b py-4 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-gray-900">
            {inv.company?.name || "Company Portal"}
          </div>
          <Badge
            variant={inv.paymentStatus === "PAID" ? "default" : "secondary"}
            className={
              inv.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : ""
            }
          >
            {inv.paymentStatus.replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          {inv.balanceAmount > 0 && (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowUploadModal(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" /> Upload Payment Proof
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6 max-w-5xl mx-auto w-full flex flex-col h-[calc(100vh-73px)]">
        <Card className="flex-1 shadow-2xl border-none overflow-hidden flex flex-col relative">
          <div className="bg-gray-800 p-2 text-center text-white text-xs font-mono">
            Invoice No: {inv.invoiceNumber} • Due Date:{" "}
            {inv.dueDate ? format(new Date(inv.dueDate), "MMM d, yyyy") : "N/A"}
          </div>
          <iframe
            src={`/render-pdf/invoice-standard?invoiceId=${inv.id}&hideButtons=true`}
            className="w-full flex-1 border-0 bg-gray-100"
            title="Invoice Document"
          />
        </Card>
      </main>
    </div>
  );
}
