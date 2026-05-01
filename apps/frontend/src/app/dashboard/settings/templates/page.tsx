"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit, FileText } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "link",
  "image",
];

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coverPageStyle: "MODERN",
    qrVerificationPlacement: "LAST_PAGE",
    defaultServiceIntroduction: "",
    isActive: true,
  });

  async function fetchTemplates() {
    try {
      const { data } = await api.get("/settings/templates");
      setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);


  const handleEdit = (tmpl: any) => {
    setFormData({
      name: tmpl.name,
      description: tmpl.description || "",
      coverPageStyle: tmpl.coverPageStyle || "MODERN",
      qrVerificationPlacement: tmpl.qrVerificationPlacement || "LAST_PAGE",
      defaultServiceIntroduction: tmpl.defaultServiceIntroduction || "",
      isActive: tmpl.isActive,
    });
    setEditingId(tmpl.id);
    setShowModal(true);
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      coverPageStyle: "MODERN",
      qrVerificationPlacement: "LAST_PAGE",
      defaultServiceIntroduction: "",
      isActive: true,
    });
    setEditingId(null);
    setShowModal(true);
  };

  async function handleSave() {
    try {
      if (editingId) {
        await api.patch(`/settings/templates/${editingId}`, formData);
      } else {
        await api.post("/settings/templates", formData);
      }
      setShowModal(false);
      fetchTemplates();
    } catch (e) {
      console.error(e);
      alert("Failed to save template. Name might be duplicate.");
    }
  };

  if (loading) return <div className="p-8">Loading templates...</div>;

  // ── Built-in PDF proposal template gallery ─────────────────────────────
  const PDF_TEMPLATES = [
    {
      slug: "home-automation",
      name: "Home Automation",
      desc: "Smart home systems — lighting, curtains, HVAC, security & AV control.",
      accent: "#0ea5e9",
      gradient: "linear-gradient(135deg,#0c2340,#0369a1)",
      icon: "🏠",
      badges: ["KNX", "HDL", "Lutron", "Crestron"],
    },
    {
      slug: "building-automation",
      name: "Building Automation",
      desc: "Commercial BMS — HVAC, lighting, access, energy monitoring & SCADA.",
      accent: "#06b6d4",
      gradient: "linear-gradient(135deg,#0c2340,#0369a1,#0891b2)",
      icon: "🏢",
      badges: ["BACnet", "KNX", "Modbus", "DALI"],
    },
    {
      slug: "software-development",
      name: "Software Development",
      desc: "Web apps, mobile apps, ERP, CRM, dashboards & custom business systems.",
      accent: "#818cf8",
      gradient: "linear-gradient(135deg,#1e1b4b,#4f46e5)",
      icon: "💻",
      badges: ["React", "Next.js", "NestJS", "PostgreSQL"],
    },
    {
      slug: "it-infrastructure",
      name: "IT Infrastructure",
      desc: "Network, firewall, structured cabling, Wi-Fi, servers & IT support.",
      accent: "#38bdf8",
      gradient: "linear-gradient(135deg,#0c1a2e,#0c2d50)",
      icon: "🖥️",
      badges: ["Cisco", "Fortinet", "Ubiquiti", "HPE"],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page header */}
      <div className="page-header animate-fade-in-up">
        <div>
          <h1 className="page-title">PDF Proposal Templates</h1>
          <p className="page-subtitle">
            Manage built-in PDF templates and custom quotation template settings
          </p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 20px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#1a56db,#3b82f6)",
            color: "white",
            fontWeight: "600",
            fontSize: "13px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(26,86,219,0.35)",
          }}
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* ── Built-in PDF template gallery ─────────────────────────── */}
      <div className="animate-fade-in-up delay-50">
        <h2
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontSize: "14px",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "14px",
            letterSpacing: "0.3px",
          }}
        >
          🎨 Built-in Proposal Templates
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "16px",
          }}
        >
          {PDF_TEMPLATES.map((t) => (
            <div
              key={t.slug}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 10px 30px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 16px rgba(0,0,0,0.07)";
              }}
            >
              {/* Cover */}
              <div
                style={{
                  background: t.gradient,
                  padding: "24px 20px 20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.04,
                    backgroundImage:
                      "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                  {t.icon}
                </div>
                <h3
                  style={{
                    color: "white",
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: "700",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  {t.name}
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "11px",
                    lineHeight: "1.5",
                  }}
                >
                  {t.desc}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    flexWrap: "wrap",
                    marginTop: "10px",
                  }}
                >
                  {t.badges.map((b) => (
                    <span
                      key={b}
                      style={{
                        fontSize: "9px",
                        fontWeight: "700",
                        color: t.accent,
                        background: `${t.accent}18`,
                        border: `1px solid ${t.accent}30`,
                        padding: "2px 7px",
                        borderRadius: "10px",
                      }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              {/* Actions */}
              <div
                style={{
                  background: "white",
                  padding: "14px 16px",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <a
                  href={`/render-pdf/${t.slug}?docId=PREVIEW`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "8px",
                    borderRadius: "8px",
                    background: t.gradient,
                    color: "white",
                    fontWeight: "600",
                    fontSize: "12px",
                    textDecoration: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Preview
                </a>
                <a
                  href={`/render-pdf/${t.slug}?docId=PREVIEW`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    color: "#64748b",
                    fontWeight: "600",
                    fontSize: "12px",
                    textDecoration: "none",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                  }}
                  title="Open in new tab"
                >
                  ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Custom templates from DB ────────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-100">
        <h2
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontSize: "14px",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "14px",
          }}
        >
          ⚙️ Custom Template Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl: any) => (
            <Card
              key={tmpl.id}
              className="border-none shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {tmpl.name}
                  </CardTitle>
                  <div
                    className={`px-2 py-1 text-xs rounded-full ${tmpl.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {tmpl.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {tmpl.description || "No description provided."}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">Cover Style:</span>
                    <span>{tmpl.coverPageStyle || "Default"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">QR Location:</span>
                    <span>{tmpl.qrVerificationPlacement || "Default"}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => handleEdit(tmpl)}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Configuration
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Edit Template" : "Create Template"}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Enterprise Software Proposal"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cover Page Style
                  </label>
                  <select
                    className="w-full border rounded-md p-2 bg-white"
                    value={formData.coverPageStyle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coverPageStyle: e.target.value,
                      })
                    }
                  >
                    <option value="MODERN">Modern (Blue Theme)</option>
                    <option value="CLASSIC">Classic (Minimalist)</option>
                    <option value="BOLD">Bold (Dark Accent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    QR Verification Code
                  </label>
                  <select
                    className="w-full border rounded-md p-2 bg-white"
                    value={formData.qrVerificationPlacement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qrVerificationPlacement: e.target.value,
                      })
                    }
                  >
                    <option value="LAST_PAGE">Bottom of Last Page</option>
                    <option value="COVER_PAGE">Bottom of Cover Page</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                </div>
                <div className="col-span-2 mb-12">
                  <label className="block text-sm font-medium mb-1">
                    Default Introduction Text
                  </label>
                  <div className="h-64">
                    <ReactQuill
                      theme="snow"
                      value={formData.defaultServiceIntroduction}
                      onChange={(content) =>
                        setFormData({
                          ...formData,
                          defaultServiceIntroduction: content,
                        })
                      }
                      modules={quillModules}
                      formats={quillFormats}
                      className="bg-white rounded-md h-full pb-10"
                      placeholder="Dear {customer_name}, thank you for the opportunity to present this proposal..."
                    />
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Template is Active
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-8 border-t pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
