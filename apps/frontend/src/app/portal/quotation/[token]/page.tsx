"use client";

import { useEffect, useState, useRef, use } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, XCircle, FileText, Calendar, Hash, Shield } from "lucide-react";
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
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading secure document...
        </p>
      </div>
    );
  if (!data)
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Link Invalid</h2>
        <p className="text-gray-500">
          This quotation link is invalid or has expired.
        </p>
      </div>
    );

  const q = data.quotation;
  const canAct = q.status === "APPROVED" || q.status === "SENT_TO_CUSTOMER";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Accept Modal ── */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Accept
              Quotation
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 text-sm"
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
                    className="w-full border rounded-lg p-2.5 text-sm"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border rounded-lg p-2.5 text-sm"
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
                    className="w-full border rounded-lg p-2.5 text-sm"
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
                  className="w-full border rounded-lg p-2.5 text-sm"
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
                <div className="border rounded-lg bg-gray-50 overflow-hidden">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ className: "w-full h-32" }}
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-6">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setShowAcceptModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
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

      {/* ── Reject Modal ── */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 sm:p-6 w-full sm:max-w-sm shadow-2xl">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-red-600" /> Reject Quotation
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2.5 text-sm"
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
                  className="w-full border rounded-lg p-2.5 text-sm"
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
                  className="w-full border rounded-lg p-2.5 text-sm"
                  rows={2}
                  value={rejectForm.note}
                  onChange={(e) =>
                    setRejectForm({ ...rejectForm, note: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-6">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
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

      {/* ── Header ── */}
      <header className="bg-white border-b py-3 px-4 sm:py-4 sm:px-6 shrink-0">
        <div className="max-w-5xl mx-auto">
          {/* Top row: company name + status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="text-base sm:text-xl font-bold text-gray-900 truncate">
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
                className={`shrink-0 text-xs ${
                  q.status === "ACCEPTED" ? "bg-green-100 text-green-800" : ""
                }`}
              >
                {q.status?.replace(/_/g, " ")}
              </Badge>
            </div>

            {/* Desktop actions — hidden on mobile */}
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              {canAct && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRejectModal(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                    onClick={() => setShowAcceptModal(true)}
                  >
                    Accept Quotation
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Document Info Strip ── */}
      <div className="bg-slate-800 px-4 py-2">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-x-4 gap-y-1 items-center justify-center text-white text-[11px] sm:text-xs font-mono">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3 opacity-60" />
            {q.quotationNumber}
          </span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 opacity-60" />
            Rev {q.revisionNumber}
          </span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 opacity-60" />
            Valid until{" "}
            {q.validUntil
              ? format(new Date(q.validUntil), "MMM d, yyyy")
              : "N/A"}
          </span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <iframe
            src={`/render-pdf/quotation-standard?quotationId=${q.id}&hideButtons=true`}
            className="absolute inset-0 w-full h-full border-0 bg-gray-100"
            title="Quotation Document"
          />
        </div>
      </main>

      {/* ── Mobile Bottom Action Bar ── */}
      {canAct && (
        <div className="sm:hidden bg-white border-t px-4 py-3 flex gap-2 shrink-0 safe-area-bottom">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {}}
          >
            <Download className="w-3.5 h-3.5 mr-1" /> PDF
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setShowRejectModal(true)}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 flex-1 text-xs"
            size="sm"
            onClick={() => setShowAcceptModal(true)}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accept
          </Button>
        </div>
      )}

      {/* Mobile download-only bar when status isn't actionable */}
      {!canAct && (
        <div className="sm:hidden bg-white border-t px-4 py-3 flex gap-2 shrink-0 safe-area-bottom">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {}}
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
          </Button>
        </div>
      )}

      {/* ── Security Footer ── */}
      <div className="bg-gray-100 border-t px-4 py-2 text-center shrink-0 hidden sm:block">
        <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          This is a secure document portal. All interactions are tracked and
          recorded.
        </p>
      </div>
    </div>
  );
}
