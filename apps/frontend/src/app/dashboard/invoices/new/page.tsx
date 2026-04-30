"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import { Save, ArrowLeft, Plus } from "lucide-react";

export default function CreateDirectInvoicePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<any>({
    customerId: "",
    invoiceType: "DIRECT",
    dueDate: "",
    currency: "KWD",
    notes: "",
    terms: "",
    items: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get("/customers"),
        api.get("/catalog/products"),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (e) {
      console.error("Failed to load initial data", e);
    }
  };

  const updateForm = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (productId: string) => {
    if (!productId) return;
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;

    const newItem = {
      itemType: "PRODUCT",
      productId: product.id,
      description: product.productName,
      quantity: 1,
      unitPrice: product.sellingPrice,
      taxRate: product.taxRate,
    };
    updateForm("items", [...formData.items, newItem]);
  };

  const handleAddCustomItem = () => {
    const newItem = {
      itemType: "CUSTOM",
      description: "Custom Item",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
    };
    updateForm("items", [...formData.items, newItem]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    updateForm("items", newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    updateForm("items", newItems);
  };

  const handleSave = async () => {
    if (!formData.customerId) {
      alert("Please select a customer");
      return;
    }
    if (formData.items.length === 0) {
      alert("Please add at least one line item");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        companyId: user?.companyId,
        customerId: formData.customerId,
        invoiceType: formData.invoiceType,
        currency: formData.currency,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        notes: formData.notes,
        terms: formData.terms,
        items: formData.items.map((item: any) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate),
        }))
      };

      const { data } = await api.post("/invoices", payload);
      router.push(`/dashboard/invoices/${data.id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    formData.items.forEach((item: any) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const taxRate = Number(item.taxRate) || 0;
      
      const lineTotal = qty * price;
      subtotal += lineTotal;
      taxAmount += lineTotal * (taxRate / 100);
    });

    return {
      subtotal,
      taxAmount,
      grandTotal: subtotal + taxAmount
    };
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/invoices")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Direct Invoice</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
          {isSaving ? "Saving..." : "Save Invoice"} <Save className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-none">
            <CardHeader>
              <CardTitle className="text-lg">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6">
                <div className="flex gap-2 mb-2">
                  <select 
                    className="border rounded-md p-2 bg-white flex-1" 
                    id="product-select"
                    onChange={(e) => {
                      handleAddItem(e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="">-- Add Product from Catalog --</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.productName} ({p.currency} {p.sellingPrice})</option>
                    ))}
                  </select>
                  <Button variant="outline" onClick={handleAddCustomItem}>
                    <Plus className="w-4 h-4 mr-2" /> Custom Item
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-3 w-[40%]">Description</th>
                      <th className="p-3 w-[15%]">Qty</th>
                      <th className="p-3 w-[20%]">Price</th>
                      <th className="p-3 w-[15%]">Tax %</th>
                      <th className="p-3 w-[10%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formData.items.map((item: any, idx: number) => (
                      <tr key={idx} className="bg-white">
                        <td className="p-3">
                          <Input 
                            value={item.description} 
                            onChange={(e) => updateItem(idx, "description", e.target.value)} 
                            placeholder="Description"
                          />
                        </td>
                        <td className="p-3">
                          <Input 
                            type="number" 
                            className="p-2" 
                            value={item.quantity} 
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <Input 
                            type="number" 
                            className="p-2" 
                            value={item.unitPrice} 
                            onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <Input 
                            type="number" 
                            className="p-2" 
                            value={item.taxRate} 
                            onChange={(e) => updateItem(idx, "taxRate", e.target.value)}
                          />
                        </td>
                        <td className="p-3">
                          <Button variant="destructive" size="sm" onClick={() => removeItem(idx)}>Remove</Button>
                        </td>
                      </tr>
                    ))}
                    {formData.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">No items added to invoice.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none">
            <CardHeader>
              <CardTitle className="text-lg">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  className="w-full border rounded-md p-2" 
                  rows={3} 
                  value={formData.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Notes visible to the customer..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                <textarea 
                  className="w-full border rounded-md p-2" 
                  rows={3} 
                  value={formData.terms}
                  onChange={(e) => updateForm("terms", e.target.value)}
                  placeholder="Standard terms and conditions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-none bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer <span className="text-red-500">*</span></label>
                <select 
                  className="w-full border rounded-md p-2 bg-white"
                  value={formData.customerId}
                  onChange={(e) => updateForm("customerId", e.target.value)}
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.displayName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Type</label>
                <select 
                  className="w-full border rounded-md p-2 bg-white"
                  value={formData.invoiceType}
                  onChange={(e) => updateForm("invoiceType", e.target.value)}
                >
                  <option value="DIRECT">Direct (Standard)</option>
                  <option value="ADVANCE_PAYMENT">Advance Payment</option>
                  <option value="MILESTONE">Milestone</option>
                  <option value="FINAL">Final</option>
                  <option value="PROFORMA">Proforma</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select 
                  className="w-full border rounded-md p-2 bg-white"
                  value={formData.currency}
                  onChange={(e) => updateForm("currency", e.target.value)}
                >
                  <option value="KWD">KWD</option>
                  <option value="EUR">EUR</option>
                  <option value="AED">AED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <Input 
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateForm("dueDate", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{totals.subtotal.toLocaleString()} {formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">{totals.taxAmount.toLocaleString()} {formData.currency}</span>
                </div>
                <div className="flex justify-between pt-3 border-t mt-3">
                  <span className="text-gray-900 font-bold text-base">Grand Total</span>
                  <span className="font-bold text-lg text-gray-900">{totals.grandTotal.toLocaleString()} {formData.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
