"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [categories, setCategories] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    brand: "",
    modelNumber: "",
    categoryId: "",
    serviceTypeId: "",
    unit: "pcs",
    
    shortDescription: "",
    detailedDescription: "",
    technicalSpecification: "",
    
    costPrice: "",
    sellingPrice: "",
    minimumSellingPrice: "",
    currency: "KWD",
    taxable: true,
    taxRate: 0,
    
    warrantyPeriod: "",
    productImage: "",
    datasheetAttachment: "",
    installationNotes: "",
    internalNotes: "",
    isActive: true,
  });

  useEffect(() => {
    Promise.all([
      api.get("/catalog/categories"),
      api.get("/catalog/service-types"),
      api.get(`/catalog/products/${id}`)
    ]).then(([catRes, srvRes, prodRes]) => {
      setCategories(catRes.data);
      setServiceTypes(srvRes.data);
      const p = prodRes.data;
      setFormData({
        productCode: p.productCode || "",
        productName: p.productName || "",
        brand: p.brand || "",
        modelNumber: p.modelNumber || "",
        categoryId: p.categoryId || "",
        serviceTypeId: p.serviceTypeId || "",
        unit: p.unit || "pcs",
        
        shortDescription: p.shortDescription || "",
        detailedDescription: p.detailedDescription || "",
        technicalSpecification: p.technicalSpecification || "",
        
        costPrice: p.costPrice?.toString() || "0",
        sellingPrice: p.sellingPrice?.toString() || "0",
        minimumSellingPrice: p.minimumSellingPrice?.toString() || "0",
        currency: p.currency || "KWD",
        taxable: p.taxable ?? true,
        taxRate: p.taxRate || 0,
        
        warrantyPeriod: p.warrantyPeriod || "",
        productImage: p.productImage || "",
        datasheetAttachment: p.datasheetAttachment || "",
        installationNotes: p.installationNotes || "",
        internalNotes: p.internalNotes || "",
        isActive: p.isActive ?? true,
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      alert("Failed to load product data.");
      router.push("/dashboard/catalog/products");
    });
  }, [id, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        costPrice: parseFloat(formData.costPrice || "0"),
        sellingPrice: parseFloat(formData.sellingPrice || "0"),
        minimumSellingPrice: parseFloat(formData.minimumSellingPrice || "0"),
        taxRate: parseFloat(formData.taxRate as any || "0"),
      };
      await api.patch(`/catalog/products/${id}`, payload);
      alert("Product updated successfully!");
      router.push("/dashboard/catalog/products");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error updating product");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await api.delete(`/catalog/products/${id}`);
      router.push("/dashboard/catalog/products");
    } catch (e: any) {
      alert("Cannot delete product. It may be used in an existing quotation.");
    }
  }

  if (loading) return <div className="p-8 text-center">Loading product...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-500 mt-1">{formData.productCode} - {formData.productName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete}>Delete</Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Code <span className="text-red-500">*</span></Label>
                <Input required value={formData.productCode} onChange={(e) => setFormData({ ...formData, productCode: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Product Name <span className="text-red-500">*</span></Label>
                <Input required value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })} />
              </div>
              
              <div className="space-y-2">
                <Label>Service Type <span className="text-red-500">*</span></Label>
                <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.serviceTypeId} onChange={(e) => setFormData({ ...formData, serviceTypeId: e.target.value })}>
                  <option value="">Select...</option>
                  {serviceTypes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
                <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                  <option value="">Select...</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Model Number</Label>
                <Input value={formData.modelNumber} onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Unit of Measure</Label>
                <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="pcs, m, kg..." />
              </div>
              <div className="space-y-2 flex items-center pt-8">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="mr-2" />
                <Label htmlFor="isActive">Product is Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Tax */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost Price <span className="text-red-500">*</span></Label>
                <Input type="number" step="0.01" required value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Selling Price <span className="text-red-500">*</span></Label>
                <Input type="number" step="0.01" required value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Minimum Selling Price</Label>
                <Input type="number" step="0.01" value={formData.minimumSellingPrice} onChange={(e) => setFormData({ ...formData, minimumSellingPrice: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
              </div>
              <div className="space-y-2 flex items-center pt-8">
                <input type="checkbox" id="taxable" checked={formData.taxable} onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })} className="mr-2" />
                <Label htmlFor="taxable">Is Taxable?</Label>
              </div>
              {formData.taxable && (
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" step="0.1" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Descriptions & Specs */}
        <Card>
          <CardHeader>
            <CardTitle>Descriptions & Technical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Short Description (Used in Quotes)</Label>
                <Input value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Detailed Description</Label>
                <Textarea className="h-24" value={formData.detailedDescription} onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Technical Specification</Label>
                <Textarea className="h-24 font-mono text-sm" placeholder="Key: Value&#10;Key: Value" value={formData.technicalSpecification} onChange={(e) => setFormData({ ...formData, technicalSpecification: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Product Image</Label>
                <div className="flex gap-4 items-center">
                  {formData.productImage && (
                    <img src={formData.productImage} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                  )}
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, productImage: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }} 
                  />
                  {formData.productImage && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, productImage: "" })}>Clear</Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Datasheet URL</Label>
                <Input value={formData.datasheetAttachment} onChange={(e) => setFormData({ ...formData, datasheetAttachment: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Warranty Period</Label>
                <Input value={formData.warrantyPeriod} onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })} placeholder="e.g. 1 Year" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Installation Notes</Label>
                <Textarea value={formData.installationNotes} onChange={(e) => setFormData({ ...formData, installationNotes: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Internal Notes (Not shown to customers)</Label>
                <Textarea className="bg-yellow-50" value={formData.internalNotes} onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
