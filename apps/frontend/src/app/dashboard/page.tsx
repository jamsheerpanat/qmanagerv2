"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Users, FileText, CheckCircle, AlertTriangle, TrendingUp,
  DollarSign, Plus, ArrowUpRight, ArrowDownRight, Clock,
  Zap, Activity
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// ── Status pill ──────────────────────────────────────────────────────────────
const STATUS_CLASS: Record<string, string> = {
  DRAFT: "status-draft", PENDING_REVIEW: "status-pending", APPROVED: "status-approved",
  REJECTED: "status-rejected", CONVERTED: "status-converted",
  EXPIRED: "status-expired", SENT: "status-review",
};
function StatusPill({ status }: { status: string }) {
  return (
    <span className={STATUS_CLASS[status] || "status-draft"} style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", display: "inline-block", letterSpacing: "0.2px" }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon: Icon, color, trend, delay }: any) {
  const iconBg: Record<string, string> = {
    blue:   "linear-gradient(135deg,#1a56db,#60a5fa)",
    green:  "linear-gradient(135deg,#059669,#34d399)",
    amber:  "linear-gradient(135deg,#d97706,#fbbf24)",
    red:    "linear-gradient(135deg,#dc2626,#f87171)",
    purple: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    cyan:   "linear-gradient(135deg,#0369a1,#38bdf8)",
  };
  return (
    <div className={`kpi-card ${color} animate-fade-in-up delay-${delay}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", letterSpacing: "0.3px", textTransform: "uppercase" }}>{title}</p>
          <h3 className="animate-count-up" style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "6px", fontFamily: "'Montserrat',sans-serif", lineHeight: 1 }}>{value}</h3>
          {sub && <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{sub}</p>}
        </div>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: iconBg[color], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          <Icon size={19} color="white" />
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "12px", fontSize: "12px" }}>
          {trend >= 0
            ? <><ArrowUpRight size={13} color="#10b981" /><span style={{ color: "#10b981", fontWeight: "600" }}>+{trend}%</span></>
            : <><ArrowDownRight size={13} color="#ef4444" /><span style={{ color: "#ef4444", fontWeight: "600" }}>{trend}%</span></>
          }
          <span style={{ color: "#94a3b8" }}>vs last month</span>
        </div>
      )}
    </div>
  );
}

// ── Quick action button ───────────────────────────────────────────────────────
function QuickAction({ label, href, icon: Icon, gradient }: any) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 16px", borderRadius: "12px",
        background: gradient, border: "none", cursor: "pointer",
        color: "white", fontWeight: "600", fontSize: "13px",
        transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        width: "100%", justifyContent: "flex-start",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.18)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"; }}
    >
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} />
      </div>
      {label}
    </button>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "white", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #f1f5f9", fontSize: "12px" }}>
        <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{typeof p.value === "number" && p.value > 1000 ? `${p.value.toLocaleString()} KWD` : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BRAND_COLORS = ["#1a56db", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [kpiRes, chartsRes, qtnsRes] = await Promise.all([
          api.get("/reports/dashboard"),
          api.get("/reports/charts"),
          api.get("/quotations"),
        ]);
        setKpis(kpiRes.data);
        setCharts(chartsRes.data);
        setQuotations((qtnsRes.data || []).slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "14px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#1a56db,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Activity size={20} color="white" />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1a56db", animation: `fadeInUp 0.6s ${i*0.15}s ease both` }} />
          ))}
        </div>
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading dashboard...</p>
      </div>
    );
  }

  const fmt = (n: number) => n?.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const fmtCurrency = (n: number) => `${fmt(n || 0)} KWD`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── Page Header ── */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's your business at a glance.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/dashboard/quotations/new" style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", borderRadius: "10px",
            background: "linear-gradient(135deg,#1a56db,#3b82f6)",
            color: "white", fontWeight: "600", fontSize: "13px",
            textDecoration: "none", boxShadow: "0 4px 12px rgba(26,86,219,0.35)",
            transition: "transform 0.15s",
          }}>
            <Plus size={14} /> New Quotation
          </Link>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <KpiCard title="Total Customers" value={fmt(kpis?.customers)} sub="All registered clients" icon={Users} color="blue" trend={8} delay={50} />
        <KpiCard title="Total Quotations" value={fmt(kpis?.quotations?.total)} sub={`${kpis?.quotations?.draft || 0} drafts pending`} icon={FileText} color="purple" trend={12} delay={100} />
        <KpiCard title="Pipeline Value" value={fmtCurrency(kpis?.quotations?.value)} sub="Open quotation value" icon={TrendingUp} color="cyan" trend={5} delay={150} />
        <KpiCard title="Total Invoiced" value={fmtCurrency(kpis?.invoices?.totalValue)} sub="Lifetime invoiced amount" icon={CheckCircle} color="green" trend={18} delay={200} />
        <KpiCard title="Amount Collected" value={fmtCurrency(kpis?.invoices?.paid)} sub="Payments received" icon={DollarSign} color="amber" trend={7} delay={250} />
        <KpiCard title="Overdue Amount" value={fmtCurrency(kpis?.invoices?.overdue)} sub="Requires follow-up" icon={AlertTriangle} color="red" trend={-3} delay={300} />
      </div>

      {/* ── Charts + Activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: "20px" }}>
        {/* Sales Funnel Bar */}
        <div className="animate-fade-in-up delay-200" style={{ background: "white", borderRadius: "16px", padding: "22px 24px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>Sales Funnel</h3>
            <span style={{ fontSize: "11px", color: "#94a3b8", background: "#f8fafc", padding: "3px 10px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>All time</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts?.funnel} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {charts?.funnel?.map((_: any, i: number) => (
                  <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status donut */}
        <div className="animate-fade-in-up delay-250" style={{ background: "white", borderRadius: "16px", padding: "22px 24px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>Quotation Statuses</h3>
          </div>
          {charts?.quotationStatusChart?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={charts.quotationStatusChart} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {charts.quotationStatusChart.map((_: any, i: number) => (
                    <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "220px", color: "#94a3b8", flexDirection: "column", gap: "8px" }}>
              <Activity size={28} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: "13px" }}>No data yet</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up delay-300" style={{ background: "white", borderRadius: "16px", padding: "22px 24px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: "700", fontSize: "14px", color: "#0f172a", marginBottom: "4px" }}>Quick Actions</h3>
          <QuickAction label="New Quotation" href="/dashboard/quotations/new" icon={FileText} gradient="linear-gradient(135deg,#1a56db,#3b82f6)" />
          <QuickAction label="Add Customer" href="/dashboard/customers/new" icon={Users} gradient="linear-gradient(135deg,#059669,#34d399)" />
          <QuickAction label="New Invoice" href="/dashboard/invoices/new" icon={DollarSign} gradient="linear-gradient(135deg,#d97706,#fbbf24)" />
          <QuickAction label="PDF Templates" href="/dashboard/settings/templates" icon={Zap} gradient="linear-gradient(135deg,#7c3aed,#a78bfa)" />

          {/* Pipeline summary */}
          <div style={{ marginTop: "8px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>Pipeline</p>
            {[
              { label: "Outstanding", value: fmtCurrency(kpis?.invoices?.outstanding), color: "#f59e0b" },
              { label: "Collected", value: fmtCurrency(kpis?.invoices?.paid), color: "#10b981" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{item.label}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Quotations ── */}
      <div className="animate-fade-in-up delay-400" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>Recent Quotations</h3>
          <Link href="/dashboard/quotations" style={{ fontSize: "12px", color: "#1a56db", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <table className="qm-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Project</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                  <FileText size={24} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                  <p>No quotations yet</p>
                </td>
              </tr>
            ) : quotations.map((q: any) => (
              <tr key={q.id}>
                <td>
                  <div style={{ fontWeight: "700", color: "#1a56db", fontSize: "13px" }}>{q.quotationNumber}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Rev {q.revisionNumber}</div>
                </td>
                <td style={{ fontWeight: "600", color: "#0f172a" }}>{q.customer?.displayName || "—"}</td>
                <td style={{ color: "#64748b", fontSize: "13px" }}>{q.projectTitle || "—"}</td>
                <td style={{ color: "#94a3b8", fontSize: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={11} />
                    {q.createdAt ? format(new Date(q.createdAt), "MMM d, yyyy") : "—"}
                  </div>
                </td>
                <td><StatusPill status={q.status} /></td>
                <td style={{ textAlign: "right", fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                  {q.grandTotal?.toLocaleString("en-US", { style: "currency", currency: q.currency || "KWD", maximumFractionDigits: 0 }) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
