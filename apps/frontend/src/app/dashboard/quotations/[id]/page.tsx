"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Download,
  Edit,
  ArrowLeft,
  Send,
  Play,
  CheckCircle,
  XCircle,
  History,
  Lock,
  FilePlus,
  Receipt,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store";
import { TrendingUp, AlertOctagon, Sparkles } from "lucide-react";

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState("FINAL");
  const [readiness, setReadiness] = useState<any>(null);
  const [diffData, setDiffData] = useState<any>(null);

  // Terms Management State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [editingTerms, setEditingTerms] = useState<any[]>([]);
  const [isSavingTerms, setIsSavingTerms] = useState(false);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isEditingScope, setIsEditingScope] = useState(false);
  const [editScopeValue, setEditScopeValue] = useState("");

  const router = useRouter();

  async function fetchQuotation() {
    try {
      const [{ data: qData }, { data: rData }] = await Promise.all([
        api.get(`/quotations/${id}`),
        api.get(`/quotations/${id}/readiness`),
      ]);
      setQuotation(qData);
      setReadiness(rData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "diff" && quotation?.parentQuotationId && !diffData) {
      api
        .get(`/quotations/${id}/compare/${quotation.parentQuotationId}`)
        .then((res) => setDiffData(res.data))
        .catch((err) => console.error(err));
    }
  }, [activeTab, quotation?.parentQuotationId, id, diffData]);


  async function handleAction(action: string, payload: any = {}) {
    try {
      if (action === "submit") {
        await api.post(`/quotations/${id}/submit-for-approval`);
        alert("Submitted for approval!");
      } else if (action === "approve") {
        await api.post(`/quotations/${id}/approve`, {
          comments: "Approved via UI",
        });
        alert("Quotation approved and locked!");
      } else if (action === "reject") {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        await api.post(`/quotations/${id}/reject`, { comments: reason });
        alert("Quotation rejected!");
      } else if (action === "revise") {
        const { data } = await api.post(`/quotations/${id}/create-revision`);
        alert(`Revision ${data.revisionNumber} created!`);
        router.push(`/dashboard/quotations/${data.id}`);
        return;
      } else if (action === "send") {
        const email = prompt(
          "Enter customer email:",
          quotation.customer?.email,
        );
        if (!email) return;
        const { data } = await api.post(`/quotations/${id}/send`, {
          recipientEmail: email,
        });
        alert(`Sent! Secure Link Token: ${data.token}`);
      }
      fetchQuotation();
    } catch (e) {
      console.error(e);
      alert("Action failed. Please check permissions and rules.");
    }
  };

  async function handleGenerateInvoice() {
    try {
      const { data } = await api.post(`/invoices/from-quotation/${id}`, {
        invoiceType,
      });
      alert(`Invoice Draft created! ID: ${data.id}`);
      setShowInvoiceModal(false);
      router.push(`/dashboard/invoices/${data.id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate invoice.");
    }
  };

  async function handleAiSummarize() {
    setIsSummarizing(true);
    try {
      await api.post(`/quotations/${id}/ai-summarize`);
      alert("AI Summary generated successfully!");
      fetchQuotation();
    } catch (e) {
      console.error(e);
      alert("Failed to generate AI summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  async function handleSaveScope() {
    try {
      await api.patch(`/quotations/${id}`, { scopeSummary: editScopeValue });
      setIsEditingScope(false);
      fetchQuotation();
    } catch (e) {
      console.error(e);
      alert("Failed to save scope.");
    }
  };

  async function generatePdf() {
    setIsGenerating(true);
    try {
      const response = await api.post(`/quotations/${id}/generate-pdf`, {}, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${quotation.quotationNumber || "quotation"}.pdf`,
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

  const openTermsModal = () => {
    setEditingTerms(quotation.terms ? [...quotation.terms] : []);
    setShowTermsModal(true);
  };

  async function handleSaveTerms() {
    setIsSavingTerms(true);
    try {
      const payload = editingTerms.map((t, idx) => ({
        categoryId: t.categoryId || "custom",
        content: t.content,
        sortOrder: idx,
      }));
      await api.post(`/quotations/${id}/terms`, payload);
      setShowTermsModal(false);
      fetchQuotation();
    } catch (e) {
      console.error(e);
      alert("Failed to save terms");
    } finally {
      setIsSavingTerms(false);
    }
  };

  if (loading) return <div className="p-8">Loading quotation details...</div>;
  if (!quotation) return <div className="p-8">Quotation not found</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Convert to Invoice</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Invoice Type
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                >
                  <option value="ADVANCE_PAYMENT">Advance Payment</option>
                  <option value="MILESTONE">Milestone</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleGenerateInvoice}
                >
                  Create Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/quotations")}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="whitespace-nowrap">
                {quotation.quotationNumber}
              </span>
              {quotation.isLocked && (
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <Badge
                variant={
                  quotation.status === "APPROVED" ||
                  quotation.status === "SENT_TO_CUSTOMER"
                    ? "default"
                    : "secondary"
                }
                className="shrink-0"
              >
                {quotation.status.replace(/_/g, " ")}
              </Badge>
            </h1>
            <p className="text-sm text-gray-500">
              {quotation.customer?.displayName} • Revision{" "}
              {quotation.revisionNumber}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          {!quotation.isLocked &&
            (quotation.status === "DRAFT" ||
              quotation.status === "REVISED") && (
              <>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => {
                    if (readiness && readiness.warnings.length > 0) {
                      if (
                        !confirm(
                          `Quotation has ${readiness.warnings.length} warnings. Are you sure you want to submit?\n\n- ` +
                            readiness.warnings.join("\n- "),
                        )
                      )
                        return;
                    }
                    handleAction("submit");
                  }}
                >
                  Submit for Approval
                </Button>
              </>
            )}

          {quotation.status === "PENDING_APPROVAL" && (
            <>
              <Button
                variant="outline"
                className="text-red-600 border-red-200"
                onClick={() => handleAction("reject")}
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction("approve")}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approve
              </Button>
            </>
          )}

          {quotation.isLocked && (
            <Button variant="outline" onClick={() => handleAction("revise")}>
              <FilePlus className="w-4 h-4 mr-2" /> Create Rev{" "}
              {quotation.revisionNumber + 1}
            </Button>
          )}

          <div className="flex bg-gray-100 p-1 rounded-md">
            <button
              className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${activeTab === "details" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${activeTab === "preview" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              onClick={() => setActiveTab("preview")}
            >
              Live Preview
            </button>
            {quotation.parentQuotationId && (
              <button
                className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors flex items-center ${activeTab === "diff" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                onClick={() => setActiveTab("diff")}
              >
                <History className="w-4 h-4 mr-1" /> Compare Revisions
              </button>
            )}
          </div>

          <Button onClick={generatePdf} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" /> Generate PDF
          </Button>

          {(quotation.status === "APPROVED" ||
            quotation.status === "SENT_TO_CUSTOMER" ||
            quotation.status === "ACCEPTED") && (
            <>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleAction("send")}
              >
                <Send className="w-4 h-4 mr-2" /> Send to Customer
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowInvoiceModal(true)}
              >
                <Receipt className="w-4 h-4 mr-2" /> Convert to Invoice
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          {readiness &&
            readiness.warnings.length > 0 &&
            !quotation.isLocked && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <h4 className="font-bold flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Quotation Readiness
                  Warnings
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {readiness.warnings.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
                <div className="mt-3 text-xs font-semibold">
                  Readiness Score: {readiness.score.toFixed(0)}%
                </div>
              </div>
            )}

          {activeTab === "details" ? (
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">Project Information</h3>
                    {!quotation.isLocked && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAiSummarize}
                        disabled={
                          isSummarizing || quotation.items?.length === 0
                        }
                      >
                        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                        {isSummarizing ? "Generating..." : "AI Summarize Scope"}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-gray-500">Project Title</p>
                      <p className="font-medium">
                        {quotation.projectTitle || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">
                        {quotation.projectLocation || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Service Type</p>
                      <p className="font-medium">
                        {quotation.serviceType?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valid Until</p>
                      <p className="font-medium">
                        {quotation.validUntil
                          ? format(
                              new Date(quotation.validUntil),
                              "MMM d, yyyy",
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {isEditingScope ? (
                    <div>
                      <p className="text-gray-500 text-sm mb-1">
                        Edit Scope Summary
                      </p>
                      <Textarea
                        className="min-h-[120px] text-sm mb-2"
                        value={editScopeValue}
                        onChange={(e) => setEditScopeValue(e.target.value)}
                        placeholder="Briefly describe the overall scope of this project..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveScope}>
                          Save Scope
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingScope(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-gray-500 text-sm">
                          Executive Scope Summary
                        </p>
                        {!quotation.isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-blue-600 px-2"
                            onClick={() => {
                              setEditScopeValue(quotation.scopeSummary || "");
                              setIsEditingScope(true);
                            }}
                          >
                            Edit Scope
                          </Button>
                        )}
                      </div>
                      {quotation.scopeSummary ? (
                        <div className="p-4 bg-purple-50 text-purple-900 border border-purple-100 rounded-md text-sm whitespace-pre-wrap">
                          {quotation.scopeSummary}
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm">
                          No scope summary added yet. This is required before
                          approval.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                    Line Items
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {quotation.items.length} Items
                    </span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="p-3">Description</th>
                          <th className="p-3">Qty</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Discount</th>
                          <th className="p-3 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {quotation.items.map((item: any) => {
                          if (item.itemType === "SECTION_HEADING") {
                            return (
                              <tr
                                key={item.id}
                                className="bg-blue-50 border-b border-blue-100"
                              >
                                <td colSpan={5} className="p-3">
                                  <span className="text-blue-600 font-bold mr-2">
                                    ▸
                                  </span>
                                  <span className="font-bold text-blue-900">
                                    {item.sectionTitle}
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="p-3 flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="w-10 h-10 object-cover rounded-md border bg-gray-50"
                                  />
                                )}
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {item.sectionTitle || item.description}
                                  </div>
                                  {item.sectionTitle &&
                                    item.sectionTitle !== item.description && (
                                      <div className="text-xs text-gray-500 max-w-sm truncate mt-0.5 font-normal">
                                        {item.description}
                                      </div>
                                    )}
                                </div>
                              </td>
                              <td className="p-3">{item.quantity}</td>
                              <td className="p-3">
                                {item.unitPrice?.toLocaleString()}
                              </td>
                              <td className="p-3">
                                {item.discountAmount?.toLocaleString()}
                              </td>
                              <td className="p-3 text-right font-bold">
                                {item.lineTotal?.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-gray-50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">
                      Commercial Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium">
                          {quotation.subtotal?.toLocaleString()}{" "}
                          {quotation.currency}
                        </span>
                      </div>
                      {quotation.discountAmount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Discount</span>
                          <span>
                            -{quotation.discountAmount?.toLocaleString()}{" "}
                            {quotation.currency}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax</span>
                        <span className="font-medium">
                          {quotation.taxAmount?.toLocaleString()}{" "}
                          {quotation.currency}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t mt-3">
                        <span className="text-gray-900 font-bold text-base">
                          Grand Total
                        </span>
                        <span className="font-bold text-lg text-blue-600">
                          {quotation.grandTotal?.toLocaleString()}{" "}
                          {quotation.currency}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profitability Analyzer - Visible to Internal Staff */}
                <Card className="border-none shadow-sm bg-indigo-50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 border-b border-indigo-200 pb-2 flex items-center text-indigo-900">
                      <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />{" "}
                      Profit Margin Analyzer
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-indigo-800">
                        <span>Total Est. Cost</span>
                        <span className="font-medium">
                          {quotation.totalCost?.toLocaleString()}{" "}
                          {quotation.currency}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-indigo-200 mt-3">
                        <span className="text-indigo-900 font-bold text-base">
                          Gross Margin
                        </span>
                        <div className="text-right">
                          <span
                            className={`font-bold text-lg ${quotation.grossMargin < 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {quotation.grossMargin?.toLocaleString()}{" "}
                            {quotation.currency}
                          </span>
                          <p className="text-xs text-indigo-600 font-medium mt-1">
                            {quotation.subtotal > 0
                              ? (
                                  (quotation.grossMargin / quotation.subtotal) *
                                  100
                                ).toFixed(1)
                              : 0}
                            % Margin
                          </p>
                        </div>
                      </div>
                      {quotation.grossMargin < 0 && (
                        <div className="mt-4 p-2 bg-red-100 border border-red-200 text-red-800 text-xs rounded flex items-start">
                          <AlertOctagon className="w-4 h-4 mr-1 shrink-0" />
                          <span>
                            Warning: This quotation is currently priced below
                            cost. Approval may be required.
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm md:col-span-2">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Terms</h3>
                      {quotation.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openTermsModal}
                        >
                          Manage Terms
                        </Button>
                      )}
                    </div>
                    <ul className="space-y-1 text-sm text-gray-600 list-disc pl-4">
                      {quotation.terms?.map((t: any) => (
                        <li key={t.id} className="truncate">
                          {t.content}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : activeTab === "preview" ? (
            <Card className="border-none shadow-sm overflow-hidden h-[800px] flex flex-col relative">
              <div className="absolute top-0 w-full bg-gray-800 p-2 text-center text-white text-xs font-mono z-10 opacity-0 hover:opacity-100 transition-opacity">
                Live PDF Render Preview (A4 Size)
              </div>
              <iframe
                src={`/render-pdf/${
                  (
                    {
                      "smart-home-automation": "home-automation",
                      "smart-home": "home-automation",
                      bms: "building-automation",
                      software: "software-development",
                      "it-infra": "it-infrastructure",
                      network: "it-infrastructure",
                    } as Record<string, string>
                  )[quotation.serviceType?.slug] ||
                  quotation.serviceType?.slug ||
                  "home-automation"
                }?quotationId=${quotation.id}`}
                className="w-full h-full border-0 bg-gray-100"
                title="PDF Live Preview"
              />
            </Card>
          ) : activeTab === "diff" ? (
            <div className="space-y-6">
              {!diffData ? (
                <div className="p-8 text-center text-gray-500">
                  Analyzing changes between revisions...
                </div>
              ) : (
                <>
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle>
                        Comparison: Rev {diffData.fromRevision} vs Rev{" "}
                        {diffData.toRevision} (Current)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-500 mb-1">
                            Previous Grand Total
                          </p>
                          <p className="text-xl font-bold">
                            {diffData.totalChanges?.from?.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-500 mb-1">
                            Current Grand Total
                          </p>
                          <p className="text-xl font-bold">
                            {diffData.totalChanges?.to?.toLocaleString()}
                          </p>
                          <p
                            className={`text-sm mt-1 font-bold ${diffData.totalChanges?.diff > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {diffData.totalChanges?.diff > 0 ? "+" : ""}
                            {diffData.totalChanges?.diff?.toLocaleString()}{" "}
                            difference
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {diffData.addedItems?.length > 0 && (
                    <Card className="border-none shadow-sm border-green-200">
                      <CardHeader className="bg-green-50 border-b border-green-100 pb-3">
                        <CardTitle className="text-green-800 text-base">
                          Items Added in this Revision
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <table className="w-full text-sm text-left">
                          <tbody className="divide-y divide-green-100">
                            {diffData.addedItems.map((item: any, i: number) => (
                              <tr key={i} className="bg-green-50/50">
                                <td className="p-3 pl-6 font-medium text-green-900">
                                  + {item.description}
                                </td>
                                <td className="p-3 text-green-800">
                                  Qty: {item.quantity}
                                </td>
                                <td className="p-3 text-right pr-6 font-bold text-green-700">
                                  {item.lineTotal?.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  )}

                  {diffData.removedItems?.length > 0 && (
                    <Card className="border-none shadow-sm border-red-200">
                      <CardHeader className="bg-red-50 border-b border-red-100 pb-3">
                        <CardTitle className="text-red-800 text-base">
                          Items Removed from Previous Revision
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <table className="w-full text-sm text-left">
                          <tbody className="divide-y divide-red-100">
                            {diffData.removedItems.map(
                              (item: any, i: number) => (
                                <tr key={i} className="bg-red-50/50">
                                  <td className="p-3 pl-6 font-medium text-red-900 line-through">
                                    - {item.description}
                                  </td>
                                  <td className="p-3 text-red-800">
                                    Qty: {item.quantity}
                                  </td>
                                  <td className="p-3 text-right pr-6 font-bold text-red-700">
                                    {item.lineTotal?.toLocaleString()}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  )}

                  {diffData.addedItems?.length === 0 &&
                    diffData.removedItems?.length === 0 && (
                      <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">
                        No line items were added or removed between these
                        revisions. (Changes may be limited to pricing,
                        discounts, or terms).
                      </div>
                    )}
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <History className="w-4 h-4 mr-2" /> Lifecycle Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-gray-500">Created At</p>
                <p className="font-medium">
                  {format(new Date(quotation.createdAt), "PPp")}
                </p>
              </div>
              {quotation.approvals?.length > 0 && (
                <div className="text-sm">
                  <p className="text-gray-500">Latest Approval</p>
                  <p className="font-medium capitalize">
                    {quotation.approvals[0].status.toLowerCase()}
                  </p>
                  {quotation.approvals[0].approver && (
                    <p className="text-xs text-gray-400">
                      by {quotation.approvals[0].approver.name}
                    </p>
                  )}
                </div>
              )}
              {quotation.shares?.length > 0 && (
                <div className="text-sm">
                  <p className="text-gray-500">Customer Shares</p>
                  <p className="font-medium">{quotation.shares.length} times</p>
                  {quotation.shares[0].viewedAt ? (
                    <Badge
                      variant="secondary"
                      className="mt-1 bg-green-100 text-green-800"
                    >
                      Viewed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1">
                      Sent, Unviewed
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {quotation.parentQuotation && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  Revision History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() =>
                    router.push(
                      `/dashboard/quotations/${quotation.parentQuotation.id}`,
                    )
                  }
                >
                  &larr; View Parent (Rev{" "}
                  {quotation.parentQuotation.revisionNumber})
                </Button>
                <Button
                  variant="link"
                  className="p-0 h-auto text-orange-600 block"
                  onClick={() =>
                    router.push(`/dashboard/quotations/${quotation.id}/compare`)
                  }
                >
                  Compare with Parent
                </Button>
              </CardContent>
            </Card>
          )}

          {quotation.childQuotations?.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  Newer Revisions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quotation.childQuotations.map((child: any) => (
                  <Button
                    key={child.id}
                    variant="link"
                    className="p-0 h-auto block"
                    onClick={() =>
                      router.push(`/dashboard/quotations/${child.id}`)
                    }
                  >
                    Rev {child.revisionNumber} ({child.status})
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Manage Terms Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Quotation Terms</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
            {editingTerms.map((term, index) => (
              <div
                key={index}
                className="flex gap-3 items-start border p-3 rounded-md bg-gray-50"
              >
                <div className="flex-1">
                  <Textarea
                    className="min-h-[80px]"
                    value={term.content}
                    onChange={(e) => {
                      const newTerms = [...editingTerms];
                      newTerms[index].content = e.target.value;
                      setEditingTerms(newTerms);
                    }}
                    placeholder="Enter legal clause here..."
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="mt-1"
                  onClick={() => {
                    const newTerms = [...editingTerms];
                    newTerms.splice(index, 1);
                    setEditingTerms(newTerms);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {editingTerms.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No terms added to this quotation yet.
              </p>
            )}

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => {
                setEditingTerms([
                  ...editingTerms,
                  { content: "", categoryId: "" },
                ]);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Term
            </Button>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowTermsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTerms} disabled={isSavingTerms}>
              {isSavingTerms ? "Saving..." : "Save Terms"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
