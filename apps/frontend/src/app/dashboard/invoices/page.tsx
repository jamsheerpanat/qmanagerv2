"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get("/invoices");
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "secondary";
      case "ISSUED": return "default";
      case "SENT": return "outline";
      case "PARTIALLY_PAID": return "secondary";
      case "PAID": return "default";
      case "OVERDUE": return "destructive";
      default: return "secondary";
    }
  };

  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.balanceAmount || 0), 0);
  const totalOverdue = invoices.filter(i => i.invoiceStatus === 'OVERDUE').reduce((acc, inv) => acc + (inv.balanceAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Invoices</h1>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard/invoices/new")}>
          <Plus className="w-4 h-4 mr-2" /> Direct Invoice
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Outstanding</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">${totalOutstanding.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-none shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-red-600 text-sm font-medium">Overdue</h3>
            <p className="text-3xl font-bold mt-2 text-red-700">${totalOverdue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-none shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-green-600 text-sm font-medium">Collected (30d)</h3>
            <p className="text-3xl font-bold mt-2 text-green-700">Coming Soon</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-4 rounded-tl-lg">Invoice #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No invoices found.</td></tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-blue-600 cursor-pointer" onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
                      {invoice.invoiceNumber || 'Draft'}
                    </td>
                    <td className="p-4">{invoice.customer?.displayName}</td>
                    <td className="p-4">{format(new Date(invoice.invoiceDate), "MMM d, yyyy")}</td>
                    <td className="p-4 font-bold">{invoice.grandTotal?.toLocaleString()} {invoice.currency}</td>
                    <td className="p-4 font-bold text-red-600">{invoice.balanceAmount > 0 ? invoice.balanceAmount?.toLocaleString() : '0'}</td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(invoice.invoiceStatus)} className={invoice.invoiceStatus === 'PAID' ? 'bg-green-100 text-green-800' : ''}>
                        {invoice.invoiceStatus}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
