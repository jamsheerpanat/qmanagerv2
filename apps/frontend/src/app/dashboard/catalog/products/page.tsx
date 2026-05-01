"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function CatalogProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  async function fetchProducts() {
    try {
      const { data } = await api.get("/catalog/products");
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  const filtered = products.filter(
    (p: any) =>
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Catalog</h1>
        <Button onClick={() => router.push("/dashboard/catalog/products/new")}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
              <tr>
                <th className="px-6 py-3 w-16">Image</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Brand</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/catalog/products/${p.id}`)
                  }
                >
                  <td className="px-6 py-4">
                    {p.productImage ? (
                      <img
                        src={p.productImage}
                        alt={p.productName}
                        className="w-10 h-10 object-cover rounded-md border bg-white"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400 text-xs">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600">
                    {p.productCode}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {p.productName}
                    </div>
                    <div
                      className="text-xs text-gray-500 mt-1 max-w-[200px] truncate"
                      title={p.shortDescription}
                    >
                      {p.shortDescription || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4">{p.brand || "-"}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.category?.name || "-"}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {p.sellingPrice} KWD
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.unit}</td>
                  <td className="px-6 py-4">
                    <Badge variant={p.isActive ? "default" : "secondary"}>
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No products found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
