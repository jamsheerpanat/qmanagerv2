"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  Hash,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export default function DocumentVerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchVerification() {
    try {
      const res = await api.get(`/portal/verify/${token}`);
      setData(res.data);
    } catch (e: any) {
      console.error(e);
      setError("Invalid or Expired Document Token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerification();
  }, [token]);


  if (loading)
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">
          Verifying Document Integrity...
        </p>
      </div>
    );

  if (error || !data)
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-xl border-red-100">
          <CardContent className="pt-6">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Badge variant="destructive" className="px-4 py-1 text-sm">
              INVALID DOCUMENT
            </Badge>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-green-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Document Verified
          </CardTitle>
          <p className="text-gray-500 mt-1">
            This document is authentic and originated from{" "}
            {data.companyName || "our system"}.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 flex items-center">
                <FileText className="w-3 h-3 mr-1" /> Document Type
              </p>
              <p className="font-bold text-gray-900">{data.documentType}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 flex items-center">
                <Hash className="w-3 h-3 mr-1" /> Reference No
              </p>
              <p className="font-bold text-gray-900">{data.referenceId}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> Generated On
              </p>
              <p className="font-bold text-gray-900">
                {format(new Date(data.generatedAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" /> Current Status
              </p>
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                {data.status}
              </Badge>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 text-slate-300 font-mono text-xs overflow-hidden break-all">
            <p className="text-slate-500 mb-2 font-sans text-xs uppercase tracking-wider">
              Cryptographic Signature
            </p>
            {data.fileHash || "SHA-256 Signature Pending"}
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              This verification link guarantees that the document contents match
              exactly with our internal records at the time of generation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
