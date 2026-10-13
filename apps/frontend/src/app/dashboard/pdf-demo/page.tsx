"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PdfDemoPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async (templateId: string) => {
    setLoading(templateId);
    setResult(null);
    try {
      const { data } = await api.post("/pdf/sample-quotation", {
        templateId,
        customerName: "Premium Corp Ltd.",
        totalAmount:
          templateId === "smart-home"
            ? 9050
            : templateId === "software"
              ? 46000
              : 15400,
      });
      setResult({ ...data, templateId });
    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      // Create an anchor tag to trigger standard browser download from API
      // In production, you would fetch the blob with auth header, then create object URL
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `document-${docId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("PDF is still generating or failed. Please wait a few seconds.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">Premium PDF Engine Demo</h1>
      <p className="text-gray-500">
        Select a template below to trigger the Playwright generation worker.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Smart Home</CardTitle>
            <CardDescription>KNX, DALI, and Control</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerate("smart-home")}
              disabled={loading !== null}
            >
              {loading === "smart-home" ? "Generating..." : "Generate PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Software Dev</CardTitle>
            <CardDescription>Web, App, Cloud</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerate("software")}
              disabled={loading !== null}
            >
              {loading === "software" ? "Generating..." : "Generate PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IT Infra</CardTitle>
            <CardDescription>Network & Security</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerate("it-infra")}
              disabled={loading !== null}
            >
              {loading === "it-infra" ? "Generating..." : "Generate PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
          <h3 className="font-bold">Job Queued Successfully!</h3>
          <p className="text-sm mt-1">Doc ID: {result.documentId}</p>
          <p className="text-sm mt-2 text-gray-600">
            The backend BullMQ worker is currently rendering the React page
            using Playwright. Once completed, it will be uploaded to MinIO.
          </p>
          <div className="mt-4 flex gap-4 items-center">
            <a
              href={`/render-pdf/${result.templateId}?docId=${result.documentId}`}
              target="_blank"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Preview HTML Template
            </a>
            <Button
              variant="outline"
              onClick={() => handleDownload(result.documentId)}
            >
              Download PDF (Wait 5s)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
