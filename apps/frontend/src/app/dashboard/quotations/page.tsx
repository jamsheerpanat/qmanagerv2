"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Clock, Filter, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  DRAFT:          { label: "Draft",           cls: "status-draft" },
  PENDING_REVIEW: { label: "Pending Review",  cls: "status-pending" },
  APPROVED:       { label: "Approved",        cls: "status-approved" },
  REJECTED:       { label: "Rejected",        cls: "status-rejected" },
  CONVERTED:      { label: "Converted",       cls: "status-converted" },
  EXPIRED:        { label: "Expired",         cls: "status-expired" },
  SENT:           { label: "Sent",            cls: "status-review" },
};

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] || { label: status, cls: "status-draft" };
  return (
    <span className={m.cls} style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", display: "inline-block", whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchQuotations(); }, []);

  const fetchQuotations = async () => {
    try {
      const { data } = await api.get("/quotations");
      setQuotations(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = quotations.filter((q: any) => {
    const matchSearch =
      q.quotationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      q.projectTitle?.toLowerCase().includes(search.toLowerCase()) ||
      q.customer?.displayName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const STATUSES = ["ALL", "DRAFT", "PENDING_REVIEW", "APPROVED", "SENT", "CONVERTED", "REJECTED", "EXPIRED"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">{quotations.length} total quotations in the system</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/quotations/new")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 20px", borderRadius: "10px",
            background: "linear-gradient(135deg,#1a56db,#3b82f6)",
            color: "white", fontWeight: "600", fontSize: "13px",
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(26,86,219,0.35)",
          }}
        >
          <Plus size={14} /> New Quotation
        </button>
      </div>

      {/* Filters bar */}
      <div className="animate-fade-in-up delay-50" style={{ background: "white", borderRadius: "14px", padding: "16px 20px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            placeholder="Search by number, project, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", paddingLeft: "36px", paddingRight: "12px", paddingTop: "9px", paddingBottom: "9px",
              borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155",
              background: "#f8fafc", outline: "none", transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "#1a56db")}
            onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
        {/* Status filter pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "5px 12px", borderRadius: "20px", border: "1px solid",
                fontSize: "11.5px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s",
                background: statusFilter === s ? "#1a56db" : "transparent",
                color: statusFilter === s ? "white" : "#64748b",
                borderColor: statusFilter === s ? "#1a56db" : "#e2e8f0",
              }}
            >
              {s === "ALL" ? "All" : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-in-up delay-100" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px", color: "#94a3b8" }}>Loading quotations...</div>
        ) : (
          <table className="qm-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Project</th>
                <th>Service Type</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q: any) => (
                <tr key={q.id} onClick={() => router.push(`/dashboard/quotations/${q.id}`)}>
                  <td>
                    <div style={{ fontWeight: "700", color: "#1a56db", fontSize: "13px" }}>{q.quotationNumber}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>Rev {q.revisionNumber}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "8px",
                        background: "linear-gradient(135deg,#1a56db22,#1a56db44)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#1a56db", fontWeight: "700", fontSize: "11px", flexShrink: 0
                      }}>
                        {q.customer?.displayName?.substring(0, 2).toUpperCase() || "??"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "13px" }}>{q.customer?.displayName || "—"}</div>
                        {q.customer?.company && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{q.customer.company}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#475569", fontSize: "13px", maxWidth: "160px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {q.projectTitle || "—"}
                    </div>
                  </td>
                  <td>
                    {q.serviceType?.name && (
                      <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontWeight: "500" }}>
                        {q.serviceType.name}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "12px" }}>
                      <Clock size={11} />
                      {q.createdAt ? format(new Date(q.createdAt), "MMM d, yyyy") : "—"}
                    </div>
                  </td>
                  <td><StatusPill status={q.status} /></td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                      {q.grandTotal?.toLocaleString("en-US", { style: "currency", currency: q.currency || "KWD", maximumFractionDigits: 0 }) || "—"}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "52px", color: "#94a3b8" }}>
                    <FileText size={32} style={{ margin: "0 auto 12px", opacity: 0.25 }} />
                    <p style={{ fontWeight: "600", fontSize: "14px", color: "#64748b" }}>No quotations found</p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p style={{ textAlign: "right", fontSize: "12px", color: "#94a3b8" }}>
          Showing {filtered.length} of {quotations.length} quotations
        </p>
      )}
    </div>
  );
}
