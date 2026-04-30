"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuotationComparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState<any>(null);
  const [diff, setDiff] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: qData } = await api.get(`/quotations/${id}`);
      setQuotation(qData);
      
      if (qData.parentQuotation?.id) {
        const { data: diffData } = await api.get(`/quotations/${id}/compare/${qData.parentQuotation.id}`);
        setDiff(diffData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading comparison...</div>;
  if (!quotation?.parentQuotation?.id) return <div className="p-8">No parent revision to compare against.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/quotations/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quotation
        </Button>
        <h1 className="text-xl font-bold">Comparing Revision {quotation.revisionNumber} vs {quotation.parentQuotation.revisionNumber}</h1>
      </div>

      {diff ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-red-100 bg-red-50/20">
            <CardHeader><CardTitle className="text-red-700">Previous (Rev {diff.toRevision})</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Grand Total</span>
                <span className="font-medium">{diff.totalChanges.to?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Line Items</span>
                <span className="font-medium">{diff.itemCountChanges.to} items</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-100 bg-green-50/20">
            <CardHeader><CardTitle className="text-green-700">Current (Rev {diff.fromRevision})</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Grand Total</span>
                <span className="font-medium">{diff.totalChanges.from?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Line Items</span>
                <span className="font-medium">{diff.itemCountChanges.from} items</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 border-blue-100 bg-blue-50/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-blue-900 mb-2">Net Financial Impact</h3>
              <p className={`text-2xl font-bold ${diff.totalChanges.diff >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {diff.totalChanges.diff > 0 ? '+' : ''}{(-diff.totalChanges.diff)?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                (Negative diff means the new revision is more expensive than the old one)
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>Could not load diff.</div>
      )}
    </div>
  );
}
