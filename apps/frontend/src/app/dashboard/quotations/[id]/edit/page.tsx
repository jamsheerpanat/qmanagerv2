"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STEPS = [
  "Customer & Lead",
  "Service & Details",
  "Products/Services",
  "Scope & Terms",
  "Review",
];

export default function EditQuotationWizard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { user } = useAuthStore();

  const [customers, setCustomers] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [termsTemplates, setTermsTemplates] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  const filteredProducts = products.filter((p: any) =>
    (p.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.productCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brand || "").toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50);

  const handleAddProduct = (product: any) => {
    const newItem = {
      itemType: "PRODUCT",
      productId: product.id,
      sectionTitle: product.productName,
      description: product.shortDescription || product.productName,
      quantity: 1,
      unitPrice: product.sellingPrice,
      taxRate: product.taxRate,
      image: product.productImage,
      brand: product.brand,
    };
    
    const newItems = [...formData.items];
    if (insertIndex !== null) {
      newItems.splice(insertIndex + 1, 0, newItem);
    } else {
      newItems.push(newItem);
    }
    updateForm("items", newItems);
    setInsertIndex(null);
  };

  const handleDownloadSample = () => {
    const csvContent = "Type,Description,Quantity,Price,Tax Rate\nPRODUCT,Sample Product A,2,150.00,0\nSECTION_HEADING,Installation Phase,,,\nSERVICE,Installation Labor,10,25.00,5";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample-quotation-items.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      const lines = csvData.split('\n');
      const newItems = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        const type = cols[0]?.trim();
        const description = cols[1]?.trim();
        const quantity = cols[2]?.trim();
        const price = cols[3]?.trim();
        const taxRate = cols[4]?.trim();
        
        if (type === 'SECTION_HEADING') {
          newItems.push({
            itemType: "SECTION_HEADING",
            sectionTitle: description,
          });
        } else if (type === 'PRODUCT' || type === 'SERVICE' || type === 'CUSTOM') {
          newItems.push({
            itemType: type,
            sectionTitle: description,
            description: description,
            quantity: Number(quantity) || 1,
            unitPrice: Number(price) || 0,
            taxRate: Number(taxRate) || 0,
          });
        }
      }
      
      if (newItems.length > 0) {
        updateForm("items", [...formData.items, ...newItems]);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const [formData, setFormData] = useState<any>({
    customerId: "",
    serviceTypeId: "",
    projectTitle: "",
    projectLocation: "",
    items: [],
    scopes: [],
    terms: [],
    scopeSummary: "",
  });

  async function fetchData() {
    try {
      const [custRes, servRes, prodRes, servItemRes, termsRes, quoteRes] =
        await Promise.all([
          api.get("/customers"),
          api.get("/catalog/service-types"),
          api.get("/catalog/products"),
          api.get("/catalog/service-items"),
          api.get("/terms/templates"),
          api.get(`/quotations/${id}`),
        ]);
      setCustomers(custRes.data);
      setServiceTypes(servRes.data);
      setProducts(prodRes.data);
      setServiceItems(servItemRes.data);
      setTermsTemplates(termsRes.data);
      
      const q = quoteRes.data;
      setFormData({
        customerId: q.customerId || "",
        serviceTypeId: q.serviceTypeId || "",
        projectTitle: q.projectTitle || "",
        projectLocation: q.projectLocation || "",
        items: q.items?.map((i: any) => ({
          itemType: i.itemType,
          productId: i.productId,
          sectionTitle: i.sectionTitle,
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxRate: i.taxRate,
          image: i.image,
          brand: i.product?.brand,
        })) || [],
        scopes: q.scopes || [],
        terms: q.terms || [],
        scopeSummary: q.scopeSummary || "",
      });
    } catch (e) {
      console.error("Failed to load initial data", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const updateForm = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

  async function handleSaveDraft() {
    setIsSaving(true);
    try {
      await api.patch(`/quotations/${id}`, {
        customerId: formData.customerId,
        serviceTypeId: formData.serviceTypeId,
        projectTitle: formData.projectTitle,
        projectLocation: formData.projectLocation,
        scopeSummary: formData.scopeSummary,
      });

      const itemsPayload = formData.items.map((i: any) => {
        const { brand, image, taxRate, ...rest } = i;
        return { ...rest, image: image || undefined, taxRate: taxRate || 0 };
      });

      await api.post(`/quotations/${id}/items`, itemsPayload);

      if (formData.terms.length > 0) {
        const payload = formData.terms.map((t: any, idx: number) => {
          const res: any = { content: t.content, sortOrder: idx };
          if (t.categoryId) res.categoryId = t.categoryId;
          return res;
        });
        await api.post(`/quotations/${id}/terms`, payload);
      } else {
        await api.post(`/quotations/${id}/terms`, []);
      }

      router.push(`/dashboard/quotations/${id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to save quotation");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Select Customer</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                className="w-full border rounded-md p-2 bg-white"
                value={formData.customerId}
                onChange={(e) => updateForm("customerId", e.target.value)}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName} ({c.customerCode})
                  </option>
                ))}
              </select>
            </div>
            {/* Leads could be loaded based on selected customer */}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">
              Service & Project Details
            </h3>
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100"
                disabled
                title="AI Configuration Pending - Coming Soon"
              >
                ✨ AI Suggest Introduction
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Service Type
              </label>
              <select
                className="w-full border rounded-md p-2 bg-white"
                value={formData.serviceTypeId}
                onChange={(e) => updateForm("serviceTypeId", e.target.value)}
              >
                <option value="">-- Select Service Type --</option>
                {serviceTypes.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecting a service type will auto-load relevant terms and
                templates.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Project Title
              </label>
              <Input
                value={formData.projectTitle}
                onChange={(e) => updateForm("projectTitle", e.target.value)}
                placeholder="e.g. Server Migration Project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Project Location
              </label>
              <Input
                value={formData.projectLocation}
                onChange={(e) => updateForm("projectLocation", e.target.value)}
                placeholder="e.g. Dubai Main Branch"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Add Items</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500 mb-4">
                Select items to add to your quotation.
              </p>
              <div className="flex flex-wrap gap-2 justify-between w-full">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateForm("items", [
                        ...formData.items,
                        {
                          itemType: "SECTION_HEADING",
                          sectionTitle: "New Section Title",
                        },
                      ]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Section
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInsertIndex(null);
                      setSearchQuery("");
                      setShowProductModal(true);
                    }}
                  >
                    <Search className="w-4 h-4 mr-2" /> Search Product
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleDownloadSample}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" /> Sample CSV
                  </Button>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleImportCSV}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Import CSV"
                    />
                    <Button variant="outline" className="pointer-events-none bg-white">
                      <Upload className="w-4 h-4 mr-2" /> Import CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {showProductModal && (
              <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Search Products</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Search by product name, code, or brand..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex-1 overflow-auto border rounded-md">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="p-3 text-left font-semibold w-1/4">Code</th>
                          <th className="p-3 text-left font-semibold w-1/3">Product</th>
                          <th className="p-3 text-left font-semibold w-1/6">Brand</th>
                          <th className="p-3 text-right font-semibold w-1/6">Price</th>
                          <th className="p-3 text-center font-semibold w-24">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {filteredProducts.map((p: any) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="p-3">{p.productCode}</td>
                            <td className="p-3">{p.productName}</td>
                            <td className="p-3">{p.brand || "-"}</td>
                            <td className="p-3 text-right">{p.sellingPrice}</td>
                            <td className="p-3 text-center">
                              <Button
                                size="sm"
                                onClick={() => {
                                  handleAddProduct(p);
                                  setShowProductModal(false);
                                }}
                              >
                                Add
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No products found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <div className="mt-6 border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 w-20">Qty</th>
                    <th className="p-3 w-32">Unit Price</th>
                    <th className="p-3 w-20">Tax %</th>
                    <th className="p-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {formData.items.map((item: any, idx: number) => {
                    if (item.itemType === "SECTION_HEADING") {
                      return (
                        <tr
                          key={idx}
                          className="bg-blue-50 border-b border-blue-100"
                        >
                          <td colSpan={4} className="p-3">
                            <div className="flex items-center">
                              <span className="text-blue-600 font-bold mr-2">
                                ▸
                              </span>
                              <Input
                                className="font-bold text-blue-900 bg-transparent border-none p-0 h-auto rounded-none focus-visible:ring-0 shadow-none text-sm"
                                value={item.sectionTitle}
                                onChange={(e) => {
                                  const newItems = [...formData.items];
                                  newItems[idx].sectionTitle = e.target.value;
                                  updateForm("items", newItems);
                                }}
                                placeholder="Enter Section Title"
                              />
                            </div>
                          </td>
                          <td className="p-3 flex gap-1 justify-end items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 px-2 mr-2"
                              onClick={() => {
                                setInsertIndex(idx);
                                setSearchQuery("");
                                setShowProductModal(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Product
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={idx === 0}
                              onClick={() => {
                                const newItems = [...formData.items];
                                [newItems[idx - 1], newItems[idx]] = [
                                  newItems[idx],
                                  newItems[idx - 1],
                                ];
                                updateForm("items", newItems);
                              }}
                            >
                              <ArrowUp className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={idx === formData.items.length - 1}
                              onClick={() => {
                                const newItems = [...formData.items];
                                [newItems[idx + 1], newItems[idx]] = [
                                  newItems[idx],
                                  newItems[idx + 1],
                                ];
                                updateForm("items", newItems);
                              }}
                            >
                              <ArrowDown className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                              onClick={() => {
                                const newItems = [...formData.items];
                                newItems.splice(idx, 1);
                                updateForm("items", newItems);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-gray-500" />
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={idx} className="bg-white">
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
                                <div className="text-xs text-gray-500 max-w-sm truncate mt-0.5">
                                  {item.description}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="h-8 p-1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].quantity = Number(e.target.value);
                              updateForm("items", newItems);
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="h-8 p-1"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].unitPrice = Number(e.target.value);
                              updateForm("items", newItems);
                            }}
                          />
                        </td>
                        <td className="p-3 text-gray-600">{item.taxRate}%</td>
                        <td className="p-3 flex gap-1 justify-end items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={idx === 0}
                            onClick={() => {
                              const newItems = [...formData.items];
                              [newItems[idx - 1], newItems[idx]] = [
                                newItems[idx],
                                newItems[idx - 1],
                              ];
                              updateForm("items", newItems);
                            }}
                          >
                            <ArrowUp className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={idx === formData.items.length - 1}
                            onClick={() => {
                              const newItems = [...formData.items];
                              [newItems[idx + 1], newItems[idx]] = [
                                newItems[idx],
                                newItems[idx + 1],
                              ];
                              updateForm("items", newItems);
                            }}
                          >
                            <ArrowDown className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                            onClick={() => {
                              const newItems = [...formData.items];
                              newItems.splice(idx, 1);
                              updateForm("items", newItems);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {formData.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No items added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Scope & Terms</h3>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Scope of Work Summary <span className="text-red-500">*</span>
              </label>
              <Textarea
                className="min-h-[100px] text-sm"
                value={formData.scopeSummary || ""}
                onChange={(e) => updateForm("scopeSummary", e.target.value)}
                placeholder="Briefly describe the overall scope of this project..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This summary is required before the quotation can be approved.
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Add specific terms for this quotation. Any terms you leave blank
              here will be auto-populated by the system if the selected Service
              Type has defaults.
            </p>

            <div className="flex gap-2 mb-4 bg-gray-50 p-4 border rounded-lg">
              <select
                className="border rounded-md p-2 bg-white flex-1"
                id="template-select"
              >
                <option value="">-- Add from Template --</option>
                {termsTemplates.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.category?.name || "Uncategorized"})
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                onClick={() => {
                  const select = document.getElementById(
                    "template-select",
                  ) as HTMLSelectElement;
                  const tmplId = select.value;
                  if (!tmplId) return;
                  const tmpl = termsTemplates.find((t: any) => t.id === tmplId);
                  if (tmpl) {
                    updateForm("terms", [
                      ...formData.terms,
                      { content: tmpl.content, categoryId: tmpl.categoryId },
                    ]);
                  }
                  select.value = "";
                }}
              >
                Add Template
              </Button>
            </div>

            <div className="space-y-3">
              {formData.terms.map((term: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-3 items-start border p-3 rounded-md bg-white shadow-sm"
                >
                  <div className="flex-1">
                    <Textarea
                      className="min-h-[80px]"
                      value={term.content}
                      onChange={(e) => {
                        const newTerms = [...formData.terms];
                        newTerms[idx].content = e.target.value;
                        updateForm("terms", newTerms);
                      }}
                      placeholder="Enter legal clause here..."
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="mt-1"
                    onClick={() => {
                      const newTerms = [...formData.terms];
                      newTerms.splice(idx, 1);
                      updateForm("terms", newTerms);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {formData.terms.length === 0 && (
                <p className="text-center text-gray-500 py-4 border border-dashed rounded-md bg-gray-50">
                  No manual terms added. Backend defaults will apply.
                </p>
              )}

              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => {
                  updateForm("terms", [
                    ...formData.terms,
                    { content: "", categoryId: "" },
                  ]);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Custom Term
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Review Summary</h3>
            <div className="bg-blue-50 p-6 rounded-lg space-y-2">
              <p>
                <strong>Customer:</strong>{" "}
                {
                  customers.find((c: any) => c.id === formData.customerId)
                    ?.displayName
                }
              </p>
              <p>
                <strong>Service Type:</strong>{" "}
                {
                  serviceTypes.find((s: any) => s.id === formData.serviceTypeId)
                    ?.name
                }
              </p>
              <p>
                <strong>Project:</strong> {formData.projectTitle}
              </p>
              <p>
                <strong>Total Items:</strong> {formData.items.length}
              </p>

              <div className="pt-4 mt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600">
                  Calculations will be finalized on the backend upon saving.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Edit Quotation
        </h1>
      </div>

      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center text-sm font-medium">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step > i
                  ? "bg-blue-600 border-blue-600 text-white"
                  : step === i
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-300 text-gray-400"
              }`}
            >
              {step > i ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`ml-2 hidden sm:block ${step >= i ? "text-gray-900" : "text-gray-400"}`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 h-1 mx-4 rounded ${step > i ? "bg-blue-600" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="shadow-lg border-none rounded-xl">
        <CardContent className="p-8 min-h-[400px]">
          {renderStepContent()}
        </CardContent>
        <div className="bg-gray-50 px-8 py-4 border-t flex justify-between rounded-b-xl">
          <Button variant="outline" onClick={handlePrev} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 0 && !formData.customerId) ||
                (step === 1 &&
                  (!formData.serviceTypeId || !formData.projectTitle))
              }
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? "Saving..." : "Save Changes"}{" "}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
