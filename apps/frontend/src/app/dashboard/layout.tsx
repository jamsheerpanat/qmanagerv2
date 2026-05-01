"use client";

import { useAuthStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  BookOpen,
  Package,
  Tag,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  FileSpreadsheet,
  ChevronRight,
  Search,
  Layers,
  Building2,
  Zap,
} from "lucide-react";

// ── Nav config ──────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/dashboard/reports",
        label: "Reports",
        icon: BarChart2,
        perm: "reports.view",
      },
      {
        href: "/dashboard/audit",
        label: "Audit Logs",
        icon: ClipboardList,
        perm: "audit.view",
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        href: "/dashboard/customers",
        label: "Customers",
        icon: Building2,
        perm: "customers.view",
      },
      {
        href: "/dashboard/catalog/products",
        label: "Products",
        icon: Package,
        perm: "products.view",
      },
      {
        href: "/dashboard/catalog/service-types",
        label: "Service Types",
        icon: Tag,
        perm: "products.view",
      },
      {
        href: "/dashboard/terms",
        label: "T&C Master",
        icon: BookOpen,
        perm: "terms.view",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        href: "/dashboard/leads",
        label: "Leads",
        icon: Zap,
        perm: "leads.view",
      },
      {
        href: "/dashboard/quotations",
        label: "Quotations",
        icon: FileText,
        perm: "quotations.view",
      },
      {
        href: "/dashboard/invoices",
        label: "Invoices",
        icon: FileSpreadsheet,
        perm: "invoices.view",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        href: "/dashboard/users",
        label: "Users",
        icon: Users,
        perm: "users.manage",
      },
      {
        href: "/dashboard/roles",
        label: "Roles & Permissions",
        icon: ShieldCheck,
        perm: "settings.manage",
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: Settings,
        perm: "settings.view",
      },
      {
        href: "/dashboard/settings/templates",
        label: "PDF Templates",
        icon: Layers,
        perm: "settings.manage",
      },
    ],
  },
];

// ── Avatar initials helper ──────────────────────────────────────────────────
function getInitials(name: string) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U"
  );
}

// ── Avatar colour based on name hash ───────────────────────────────────────
function avatarColor(name: string) {
  const colors = [
    "#1a56db",
    "#7c3aed",
    "#0369a1",
    "#059669",
    "#d97706",
    "#dc2626",
    "#9333ea",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── Sidebar Link ────────────────────────────────────────────────────────────
function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: any;
  active: boolean;
}) {
  return (
    <Link href={href} className={`qm-sidebar-link ${active ? "active" : ""}`}>
      <Icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
      <span>{label}</span>
      {active && (
        <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
      )}
    </Link>
  );
}

// ── Main Layout ─────────────────────────────────────────────────────────────
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const bg = avatarColor(user.name || "User");

  return (
    <div className="flex h-screen w-full" style={{ background: "#f1f5f9" }}>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="qm-sidebar w-60 flex flex-col shrink-0 overflow-y-auto">
        {/* Logo */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/qmanager-logo.jpeg"
              alt="Q-Manager Logo"
              style={{
                width: "auto",
                height: "54px",
                borderRadius: "4px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 10px 16px" }}>
          {NAV_SECTIONS.map((section) => {
            // filter by permissions
            const visible = section.items.filter(
              (item) => !item.perm || user.permissions?.includes(item.perm),
            );
            if (visible.length === 0) return null;
            return (
              <div key={section.label}>
                <div className="qm-sidebar-section">{section.label}</div>
                {visible.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActive(item.href, item.exact)}
                  />
                ))}
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          style={{
            padding: "12px 10px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "700",
                fontSize: "12px",
                flexShrink: 0,
              }}
            >
              {getInitials(user.name)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  color: "#f8fafc",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  color: "#475569",
                  fontSize: "10px",
                  textTransform: "capitalize",
                }}
              >
                {user.role?.toLowerCase() || "user"}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "7px 10px",
              borderRadius: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
              fontSize: "12.5px",
              fontWeight: "500",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(239,68,68,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Topbar */}
        <header
          className="qm-topbar"
          style={{
            height: "58px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Breadcrumb / page title area */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                letterSpacing: "0.5px",
              }}
            >
              {NAV_SECTIONS.flatMap((s) => s.items).find((i) =>
                i.exact
                  ? pathname === i.href
                  : pathname.startsWith(i.href) && i.href !== "/dashboard",
              )?.label || "Dashboard"}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Search trigger */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 14px",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#94a3b8",
                fontSize: "12.5px",
                cursor: "pointer",
                transition: "all 0.15s",
                minWidth: "180px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#3b82f6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e2e8f0")
              }
            >
              <Search size={13} />
              <span>Quick search…</span>
              <kbd
                style={{
                  marginLeft: "auto",
                  fontSize: "10px",
                  color: "#cbd5e1",
                  background: "#f1f5f9",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                }}
              >
                ⌘K
              </kbd>
            </button>

            <NotificationsDropdown />

            {/* User chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 10px 5px 5px",
                borderRadius: "24px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "11px",
                }}
              >
                {getInitials(user.name)}
              </div>
              <span
                style={{
                  fontSize: "12.5px",
                  color: "#334155",
                  fontWeight: "600",
                }}
              >
                {user.name?.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{ flex: 1, overflowY: "auto", padding: "28px 28px" }}
          className="animate-fade-in"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
