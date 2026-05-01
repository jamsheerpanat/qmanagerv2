"use client";

import { useEffect, useState, useRef, use } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, XCircle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { format } from "date-fns";

export default function QuotationPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [acceptForm, setAcceptForm] = useState({
    acceptedByName: "",
    designation: "",
    email: "",
    phone: "",
    acceptanceNote: "",
  });

  const [rejectForm, setRejectForm] = useState({
    rejectedByName: "",
    reason: "",
    note: "",
  });

  const sigCanvas = useRef<any>(null);

  useEffect(() => {
    fetchQuotation();
  }, [token]);

  const fetchQuotation = async () => {
    try {
      const res = await api.get(`/portal/quotations/${token}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      const signature = sigCanvas.current?.isEmpty()
        ? null
        : sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      await api.post(`/portal/quotations/${token}/accept`, {
        ...acceptForm,
        digitalSignatureData: signature,
      });
      alert("Quotation accepted successfully! Thank you.");
      setShowAcceptModal(false);
      fetchQuotation();
    } catch (e) {
      console.error(e);
      alert("Failed to accept quotation.");
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/portal/quotations/${token}/reject`, rejectForm);
      alert("Quotation has been rejected.");
      setShowRejectModal(false);
      fetchQuotation();
    } catch (e) {
      console.error(e);
      alert("Failed to reject quotation.");
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

  const q = data.quotation;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Modals */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Accept
              Quotation
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    required
                    value={acceptForm.acceptedByName}
                    onChange={(e) =>
                      setAcceptForm({
                        ...acceptForm,
                        acceptedByName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={acceptForm.designation}
                    onChange={(e) =>
                      setAcceptForm({
                        ...acceptForm,
                        designation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border rounded p-2"
                    value={acceptForm.email}
                    onChange={(e) =>
                      setAcceptForm({ ...acceptForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={acceptForm.phone}
                    onChange={(e) =>
                      setAcceptForm({ ...acceptForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Note (Optional)
                </label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={2}
                  value={acceptForm.acceptanceNote}
                  onChange={(e) =>
                    setAcceptForm({
                      ...acceptForm,
                      acceptanceNote: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex justify-between">
                  <span>Digital Signature</span>
                  <button
                    type="button"
                    className="text-blue-600 text-xs"
                    onClick={() => sigCanvas.current?.clear()}
                  >
                    Clear
                  </button>
                </label>
                <div className="border rounded bg-gray-50">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ className: "w-full h-32" }}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAcceptModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleAccept}
                  disabled={!acceptForm.acceptedByName}
                >
                  Confirm Acceptance
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-red-600" /> Reject Quotation
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  required
                  value={rejectForm.rejectedByName}
                  onChange={(e) =>
                    setRejectForm({
                      ...rejectForm,
                      rejectedByName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  className="w-full border rounded p-2"
                  value={rejectForm.reason}
                  onChange={(e) =>
                    setRejectForm({ ...rejectForm, reason: e.target.value })
                  }
                >
                  <option value="">Select a reason</option>
                  <option value="PRICE_TOO_HIGH">Price too high</option>
                  <option value="WENT_WITH_COMPETITOR">
                    Went with competitor
                  </option>
                  <option value="PROJECT_CANCELLED">Project cancelled</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={2}
                  value={rejectForm.note}
                  onChange={(e) =>
                    setRejectForm({ ...rejectForm, note: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleReject}
                  disabled={!rejectForm.rejectedByName}
                >
                  Confirm Rejection
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
            {q.company?.name || "Company Portal"}
          </div>
          <Badge
            variant={
              q.status === "ACCEPTED"
                ? "default"
                : q.status === "REJECTED"
                  ? "destructive"
                  : "secondary"
            }
            className={
              q.status === "ACCEPTED" ? "bg-green-100 text-green-800" : ""
            }
          >
            {q.status}
          </Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => {}}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          {(q.status === "APPROVED" || q.status === "SENT_TO_CUSTOMER") && (
            <>
              <Button
                variant="destructive"
                onClick={() => setShowRejectModal(true)}
              >
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowAcceptModal(true)}
              >
                Accept Quotation
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6 max-w-5xl mx-auto w-full flex flex-col h-[calc(100vh-73px)]">
        <Card className="flex-1 shadow-2xl border-none overflow-hidden flex flex-col relative">
          <div className="bg-gray-800 p-2 text-center text-white text-xs font-mono">
            Document No: {q.quotationNumber} • Rev: {q.revisionNumber} • Valid
            until:{" "}
            {q.validUntil
              ? format(new Date(q.validUntil), "MMM d, yyyy")
              : "N/A"}
          </div>
          <iframe
            src={`/render-pdf/quotation-standard?quotationId=${q.id}&hideButtons=true`}
            className="w-full flex-1 border-0 bg-gray-100"
            title="Quotation Document"
          />
        </Card>
      </main>
    </div>
  );
}
