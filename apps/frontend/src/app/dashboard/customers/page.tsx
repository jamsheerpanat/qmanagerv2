"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Plus, Search, Mail, Phone, Building2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

function getInitials(name: string) {
  return name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "??";
}
function avatarColor(name: string) {
  const colors = ["#1a56db","#7c3aed","#0369a1","#059669","#d97706","#dc2626","#9333ea","#0891b2"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchCustomers(); }, []);
  const fetchCustomers = async () => {
    try {
      const { data } = await api.get("/customers");
      setCustomers(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const types = ["ALL", ...Array.from(new Set(customers.map((c: any) => c.customerType).filter(Boolean)))];
  const filtered = customers.filter((c: any) => {
    const matchSearch =
      c.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || c.customerType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Customer Master</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/customers/new")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 20px", borderRadius: "10px",
            background: "linear-gradient(135deg,#059669,#34d399)",
            color: "white", fontWeight: "600", fontSize: "13px",
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
          }}
        >
          <Plus size={14} /> Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="animate-fade-in-up delay-50" style={{ background: "white", borderRadius: "14px", padding: "16px 20px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            placeholder="Search by name, code, email, company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: "36px", paddingRight: "12px", paddingTop: "9px", paddingBottom: "9px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none" }}
            onFocus={e => (e.target.style.borderColor = "#059669")}
            onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: "5px 12px", borderRadius: "20px", border: "1px solid", fontSize: "11.5px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s", background: typeFilter === t ? "#059669" : "transparent", color: typeFilter === t ? "white" : "#64748b", borderColor: typeFilter === t ? "#059669" : "#e2e8f0" }}>
              {t === "ALL" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-in-up delay-100" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px", color: "#94a3b8" }}>Loading customers...</div>
        ) : (
          <table className="qm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Code</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => {
                const bg = avatarColor(c.displayName || "?");
                return (
                  <tr key={c.id} onClick={() => router.push(`/dashboard/customers/${c.id}`)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
                          {getInitials(c.displayName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "13.5px" }}>{c.displayName}</div>
                          {c.email && <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}><Mail size={10} />{c.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "11.5px", fontFamily: "monospace", background: "#f8fafc", color: "#475569", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>{c.customerCode}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "11.5px", background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "20px", fontWeight: "600", border: "1px solid #bfdbfe" }}>{c.customerType || "—"}</span>
                    </td>
                    <td>
                      {c.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12.5px", color: "#475569" }}>
                          <Phone size={11} color="#94a3b8" /> {c.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      {c.company && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12.5px", color: "#475569" }}>
                          <Building2 size={11} color="#94a3b8" /> {c.company}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", display: "inline-block", ...(c.status === "ACTIVE" ? { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" } : { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }) }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "52px", color: "#94a3b8" }}>
                    <Users size={32} style={{ margin: "0 auto 12px", opacity: 0.25 }} />
                    <p style={{ fontWeight: "600", fontSize: "14px", color: "#64748b" }}>No customers found</p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>Add your first customer to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <p style={{ textAlign: "right", fontSize: "12px", color: "#94a3b8" }}>
          Showing {filtered.length} of {customers.length} customers
        </p>
      )}
    </div>
  );
}
