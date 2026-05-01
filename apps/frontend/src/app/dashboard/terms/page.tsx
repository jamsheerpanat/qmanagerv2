"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function TermsMasterPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ id: "", name: "", isActive: true });

  // Template Modal State
  const [showTmplModal, setShowTmplModal] = useState(false);
  const [tmplForm, setTmplForm] = useState({
    id: "",
    title: "",
    content: "",
    categoryId: "",
    isDefault: false,
    isActive: true,
  });

  async function fetchData() {
    try {
      const [catRes, tempRes] = await Promise.all([
        api.get("/terms/categories"),
        api.get("/terms/templates"),
      ]);
      setCategories(catRes.data);
      setTemplates(tempRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  async function handleSaveCategory() {
    try {
      if (catForm.id) {
        await api.patch(`/terms/categories/${catForm.id}`, catForm);
      } else {
        await api.post("/terms/categories", catForm);
      }
      setShowCatModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving category", error);
    }
  };

  async function handleSaveTemplate() {
    try {
      if (tmplForm.id) {
        await api.patch(`/terms/templates/${tmplForm.id}`, tmplForm);
      } else {
        await api.post("/terms/templates", tmplForm);
      }
      setShowTmplModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving template", error);
    }
  };

  const openCatModal = (cat?: any) => {
    if (cat) {
      setCatForm({ id: cat.id, name: cat.name, isActive: cat.isActive });
    } else {
      setCatForm({ id: "", name: "", isActive: true });
    }
    setShowCatModal(true);
  };

  const openTmplModal = (tmpl?: any) => {
    if (tmpl) {
      setTmplForm({
        id: tmpl.id,
        title: tmpl.title,
        content: tmpl.content,
        categoryId: tmpl.categoryId,
        isDefault: tmpl.isDefault,
        isActive: tmpl.isActive,
      });
    } else {
      setTmplForm({
        id: "",
        title: "",
        content: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        isDefault: false,
        isActive: true,
      });
    }
    setShowTmplModal(true);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading T&C Master...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Terms & Conditions Master</h1>
        <Button onClick={() => openTmplModal()}>
          <Plus className="w-4 h-4 mr-2" /> Add T&C Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-3 border-b mb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Categories</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => openCatModal()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">No categories found.</p>
            ) : (
              <ul className="space-y-2">
                {categories.map((c: any) => (
                  <li
                    key={c.id}
                    onClick={() => openCatModal(c)}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-medium text-sm">{c.name}</span>
                    <Badge
                      variant={c.isActive ? "outline" : "secondary"}
                      className="text-xs"
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-3 border-b mb-3">
            <CardTitle className="text-lg">Templates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Content Preview</th>
                  <th className="px-4 py-3 text-center">Default</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t: any) => (
                  <tr
                    key={t.id}
                    onClick={() => openTmplModal(t)}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-4 font-medium">{t.title}</td>
                    <td className="px-4 py-4">{t.category?.name || "-"}</td>
                    <td className="px-4 py-4 max-w-[200px] truncate text-gray-500">
                      {t.content}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {t.isDefault ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Yes
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={t.isActive ? "default" : "secondary"}>
                        {t.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {templates.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No templates found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Modal */}
      <Dialog open={showCatModal} onOpenChange={setShowCatModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {catForm.id ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Category Name</label>
              <Input
                value={catForm.name}
                onChange={(e) =>
                  setCatForm({ ...catForm, name: e.target.value })
                }
                placeholder="e.g. Payment Terms"
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="catActive"
                checked={catForm.isActive}
                onChange={(e) =>
                  setCatForm({ ...catForm, isActive: e.target.checked })
                }
              />
              <label htmlFor="catActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCatModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Modal */}
      <Dialog open={showTmplModal} onOpenChange={setShowTmplModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {tmplForm.id ? "Edit T&C Template" : "Add T&C Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={tmplForm.title}
                  onChange={(e) =>
                    setTmplForm({ ...tmplForm, title: e.target.value })
                  }
                  placeholder="e.g. 1. Scope of Work"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
                  value={tmplForm.categoryId}
                  onChange={(e) =>
                    setTmplForm({ ...tmplForm, categoryId: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Content / Clause</label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
                value={tmplForm.content}
                onChange={(e) =>
                  setTmplForm({ ...tmplForm, content: e.target.value })
                }
                placeholder="Enter the full legal text for this clause..."
              />
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="tmplDefault"
                  checked={tmplForm.isDefault}
                  onChange={(e) =>
                    setTmplForm({ ...tmplForm, isDefault: e.target.checked })
                  }
                />
                <label htmlFor="tmplDefault" className="text-sm font-medium">
                  Default Selection
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="tmplActive"
                  checked={tmplForm.isActive}
                  onChange={(e) =>
                    setTmplForm({ ...tmplForm, isActive: e.target.checked })
                  }
                />
                <label htmlFor="tmplActive" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTmplModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
