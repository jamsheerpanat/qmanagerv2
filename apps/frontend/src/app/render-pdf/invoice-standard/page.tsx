"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ModernInvoicePage } from "@qmanager/pdf-templates";
import { format } from "date-fns";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #e5e7eb; font-family: 'Inter', sans-serif; }
    @media print { body { background: white; } }
    .pdf-container { width: 210mm; min-height: 297mm; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    @media print {
      .pdf-container { width: 100%; height: auto; box-shadow: none; margin: 0; }
      @page { size: A4; margin: 0; }
    }
  `}</style>
);

function InvoiceStandardRenderPageInner() {
  const searchParams = useSearchParams();
  const invoiceId =
    searchParams.get("invoiceId") || searchParams.get("quotationId");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!invoiceId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/internal/invoices/${invoiceId}`,
          { headers: { "x-internal-pdf-render": "1" } },
        );
        if (res.ok) {
          const invData = await res.json();
          setData(invData);
        } else {
          console.error("Failed to fetch invoice data");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoiceId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen font-sans text-slate-500">
        <div className="text-center">
          <div className="text-3xl mb-3">📄</div>
          <div>Generating Invoice...</div>
        </div>
      </div>
    );

  if (!data && !loading) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load invoice data.
      </div>
    );
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portal/invoice/${data.token || data.id}`;

  const formattedDate = data.invoiceDate
    ? format(new Date(data.invoiceDate), "dd MMM yyyy")
    : format(new Date(), "dd MMM yyyy");

  const formattedDueDate = data.dueDate
    ? format(new Date(data.dueDate), "dd MMM yyyy")
    : "";

  return (
    <>
      <FontLoader />
      <div className="pdf-container print:bg-white bg-gray-200 flex flex-col">
        <ModernInvoicePage
          invoiceNumber={data.invoiceNumber || "DRAFT"}
          invoiceDate={formattedDate}
          dueDate={formattedDueDate}
          companyName={data.company?.name || "Octonics Co. W.L.L."}
          companyAddress={data.company?.address || ""}
          customerName={data.customer?.displayName}
          customerCompany={data.customer?.company}
          customerAddress={data.customer?.address}
          items={data.items || []}
          subtotal={data.subtotal}
          discount={data.discountAmount}
          tax={data.taxAmount}
          grandTotal={data.grandTotal}
          paidAmount={data.paidAmount}
          balanceAmount={data.balanceAmount}
          currency={data.currency}
          notes={data.notes}
          qrVerificationUrl={verifyUrl}
        />
      </div>
    </>
  );
}

export default function InvoiceStandardRenderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen font-sans text-slate-500">
          <div className="text-center">
            <div className="text-3xl mb-3">📄</div>
            <div>Loading...</div>
          </div>
        </div>
      }
    >
      <InvoiceStandardRenderPageInner />
    </Suspense>
  );
}
