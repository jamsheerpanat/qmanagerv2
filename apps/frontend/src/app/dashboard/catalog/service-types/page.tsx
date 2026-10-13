"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Layers } from "lucide-react";

export default function ServiceTypesPage() {
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    defaultQuotationTemplateId: "",
    isActive: true,
  });

  async function fetchData() {
    try {
      const [stRes, tmplRes] = await Promise.all([
        api.get("/catalog/service-types"),
        api.get("/settings/templates"),
      ]);
      setServiceTypes(stRes.data);
      setTemplates(tmplRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleEdit = (st: any) => {
    setFormData({
      name: st.name,
      slug: st.slug,
      description: st.description || "",
      defaultQuotationTemplateId: st.defaultQuotationTemplateId || "",
      isActive: st.isActive,
    });
    setEditingId(st.id);
    setShowModal(true);
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      defaultQuotationTemplateId: "",
      isActive: true,
    });
    setEditingId(null);
    setShowModal(true);
  };

  async function handleSave() {
    try {
      if (editingId) {
        await api.patch(`/catalog/service-types/${editingId}`, formData);
      } else {
        await api.post("/catalog/service-types", formData);
      }
      setShowModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to save service type. Slug might be duplicate.");
    }
  };

  if (loading) return <div className="p-8">Loading service types...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-purple-600" /> Service Types Master
        </h1>
        <Button
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" /> New Service Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceTypes.map((st: any) => {
          const linkedTemplate = templates.find(
            (t) => t.id === st.defaultQuotationTemplateId,
          );
          return (
            <Card
              key={st.id}
              className="border-none shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">
                      {st.name}
                    </CardTitle>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      /{st.slug}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs rounded-full ${st.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {st.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden line-clamp-2">
                  {st.description || "No description provided."}
                </p>
                <div className="p-3 bg-purple-50 rounded-lg text-sm border border-purple-100 mb-4">
                  <span className="font-semibold text-purple-900 block mb-1">
                    Linked Template:
                  </span>
                  <span className="text-purple-700">
                    {linkedTemplate ? linkedTemplate.name : "None selected"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleEdit(st)}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit Configuration
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Edit Service Type" : "Create Service Type"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, ""),
                    })
                  }
                  placeholder="e.g. Smart Home Automation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Slug Identifier
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="font-mono bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used for system routing and PDF generation.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Default Quotation Template
                </label>
                <select
                  className="w-full border rounded-md p-2 bg-white"
                  value={formData.defaultQuotationTemplateId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultQuotationTemplateId: e.target.value,
                    })
                  }
                >
                  <option value="">-- No Default Template --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This template will be auto-loaded when creating a new
                  quotation for this service.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="isActiveST"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="isActiveST" className="text-sm font-medium">
                  Service Type is Active
                </label>
              </div>

              <div className="flex gap-2 justify-end mt-8 border-t pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSave}
                >
                  Save Service Type
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
