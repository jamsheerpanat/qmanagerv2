"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  ITInfraCoverPage,
  ITInfraAboutPage,
  ITInfraScopePage,
  ITInfraQuotationPage,
  ITInfraFinalPage,
  OctonicsProductsPage,
} from "@qmanager/pdf-templates";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #e5e7eb; }
    @media print { body { background: white; } }
  `}</style>
);


function ITInfraRenderPageInner() {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("quotationId");
  const docId = searchParams.get("docId") || "UNKNOWN";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!quotationId) { setData(getSampleData(docId)); setLoading(false); return; }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/internal/quotations/${quotationId}`,
          { headers: { "x-internal-pdf-render": "1" } }
        );
        setData(res.ok ? transformQuotation(await res.json(), docId) : getSampleData(docId));
      } catch { setData(getSampleData(docId)); }
      finally { setLoading(false); }
    };
    load();
  }, [quotationId, docId]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif", color: "#64748b" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "32px", marginBottom: "12px" }}>🖥️</div><div>Generating IT Infrastructure Proposal...</div></div>
    </div>
  );
  if (!data) return null;

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${docId}`;

  return (
    <>
      <FontLoader />
      <div className="pdf-container print:bg-white bg-gray-200 flex flex-col items-center py-10 print:py-0 print:block">
        <ITInfraCoverPage
          projectName={data.projectName} customerName={data.customerName}
          customerCompany={data.customerCompany} proposalDate={data.proposalDate}
          proposalReference={data.proposalReference} revisionNumber={data.revisionNumber}
          projectLocation={data.projectLocation}
        />
        <ITInfraAboutPage />
        <ITInfraScopePage />
        <OctonicsProductsPage accentColor="#38bdf8" headerLabel="IT INFRASTRUCTURE PROPOSAL" />
        <ITInfraQuotationPage
          items={data.items} subtotal={data.subtotal} discount={data.discount}
          tax={data.tax} grandTotal={data.grandTotal} currency={data.currency}
        />
        <ITInfraFinalPage
          terms={data.terms} paymentTerms={data.paymentTerms}
          validityPeriod={data.validityPeriod} deliveryTimeline={data.deliveryTimeline}
          customerName={data.customerName} qrVerificationUrl={verifyUrl}
          proposalReference={data.proposalReference} proposalDate={data.proposalDate}
        />
      </div>
    </>
  );
}

export default function ITInfraRenderPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: "32px", marginBottom: "12px" }}>🖥️</div><div>Loading...</div></div>
      </div>
    }>
      <ITInfraRenderPageInner />
    </Suspense>
  );
}

function transformQuotation(q: any, docId: string) {
  const terms = q.terms || [];
  const find = (kw: string) => terms.find((t: any) => t.category?.name?.toLowerCase().includes(kw))?.content;
  return {
    projectName: q.projectTitle || "IT Infrastructure Project",
    customerName: q.customer?.displayName || "Valued Customer",
    customerCompany: q.customer?.company || "",
    proposalDate: q.issueDate ? new Date(q.issueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    proposalReference: q.quotationNumber || docId,
    revisionNumber: String(q.revisionNumber ?? 0),
    projectLocation: q.projectLocation || "",
    items: q.items || [],
    subtotal: q.subtotal || 0, discount: q.discountAmount || 0, tax: q.taxAmount || 0, grandTotal: q.grandTotal || 0,
    currency: q.currency || "KWD", terms: q.terms || [],
    paymentTerms: find("payment") || "50% advance upon order confirmation.\n40% upon delivery of equipment to site.\n10% upon successful testing and commissioning.",
    validityPeriod: find("validity") || "This proposal is valid for 30 days from the date of issue.",
    deliveryTimeline: find("delivery") || find("timeline") || "To be confirmed upon order acceptance and advance payment.",
  };
}

function getSampleData(docId: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  return {
    projectName: "Al Baraka Head Office — IT Infrastructure",
    customerName: "Mr. Yousef Al-Hamdan",
    customerCompany: "Al Baraka Investment Group",
    proposalDate: today,
    proposalReference: `OC-IT-${new Date().getFullYear()}-0028`,
    revisionNumber: "0",
    projectLocation: "Sharq, Kuwait City",
    currency: "KWD",
    subtotal: 22450.0,
    discount: 1120.0,
    tax: 0,
    grandTotal: 21330.0,
    paymentTerms: "50% advance upon order confirmation.\n40% upon delivery of equipment to site.\n10% upon successful testing and commissioning.",
    validityPeriod: `This proposal is valid for 30 days from ${today}.`,
    deliveryTimeline: "Estimated 4–6 weeks from order confirmation and advance payment receipt.",
    terms: [],
    items: [
      { itemType: "SECTION_HEADING", sectionTitle: "1. FIREWALL & SECURITY", sortOrder: 1 },
      { itemType: "LINE_ITEM", sectionTitle: "Fortinet FortiGate 100F Firewall", description: "Next-gen firewall. 1Gbps throughput, IPS, web filtering, VPN. 1-yr UTM license included.", brand: "Fortinet", quantity: 1, unit: "Nos", unitPrice: 3200, discountAmount: 0, lineTotal: 3200, warranty: "1 Year", sortOrder: 2 },
      { itemType: "LINE_ITEM", sectionTitle: "Fortinet FortiAP 431G Wi-Fi AP", description: "Wi-Fi 6 access point, managed by FortiGate. Indoor ceiling mount.", brand: "Fortinet", quantity: 8, unit: "Nos", unitPrice: 320, discountAmount: 0, lineTotal: 2560, warranty: "1 Year", sortOrder: 3 },
      { itemType: "SECTION_HEADING", sectionTitle: "2. NETWORK SWITCHING", sortOrder: 4 },
      { itemType: "LINE_ITEM", sectionTitle: "Cisco Catalyst 9200L-24P Core Switch", description: "24-port PoE L3 managed switch, 4x10G uplinks. Core layer.", brand: "Cisco", quantity: 1, unit: "Nos", unitPrice: 2800, discountAmount: 0, lineTotal: 2800, warranty: "1 Year", sortOrder: 5 },
      { itemType: "LINE_ITEM", sectionTitle: "Cisco Catalyst 9200L-24T Access Switch", description: "24-port managed access switch. Floor-wise distribution.", brand: "Cisco", quantity: 3, unit: "Nos", unitPrice: 1400, discountAmount: 0, lineTotal: 4200, warranty: "1 Year", sortOrder: 6 },
      { itemType: "SECTION_HEADING", sectionTitle: "3. STRUCTURED CABLING", sortOrder: 7 },
      { itemType: "LINE_ITEM", sectionTitle: "Cat6A UTP Cabling (per point)", description: "Cat6A structured cabling, faceplate, patch panel termination, cable test report.", brand: "Panduit", quantity: 60, unit: "Points", unitPrice: 45, discountAmount: 0, lineTotal: 2700, sortOrder: 8 },
      { itemType: "LINE_ITEM", sectionTitle: "19\" Network Rack — 24U", description: "19\" floor-standing rack, 24U, with power distribution, cable managers, and blanks.", brand: "Legrand", quantity: 2, unit: "Nos", unitPrice: 380, discountAmount: 0, lineTotal: 760, sortOrder: 9 },
      { itemType: "SECTION_HEADING", sectionTitle: "4. SERVER & STORAGE", sortOrder: 10 },
      { itemType: "LINE_ITEM", sectionTitle: "HPE ProLiant ML350 Gen11 Server", description: "Tower server, Xeon Silver 4410Y, 32GB RAM, 2x 1.2TB SAS. OS not included.", brand: "HPE", quantity: 1, unit: "Nos", unitPrice: 4200, discountAmount: 0, lineTotal: 4200, warranty: "3 Year", sortOrder: 11 },
      { itemType: "LINE_ITEM", sectionTitle: "Synology RS1221+ NAS (8-bay)", description: "8-bay rackmount NAS. 4x 4TB IronWolf drives. Backup and file sharing.", brand: "Synology", quantity: 1, unit: "Nos", unitPrice: 1800, discountAmount: 0, lineTotal: 1800, warranty: "1 Year", sortOrder: 12 },
      { itemType: "SECTION_HEADING", sectionTitle: "5. IMPLEMENTATION", sortOrder: 13 },
      { itemType: "LINE_ITEM", sectionTitle: "Network Configuration & Commissioning", description: "Firewall, switch VLAN, routing, Wi-Fi, VPN configuration and testing.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 1200, discountAmount: 0, lineTotal: 1200, sortOrder: 14 },
      { itemType: "LINE_ITEM", sectionTitle: "Server & NAS Setup", description: "OS installation, shares, permissions, backup jobs, server hardening.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 800, discountAmount: 0, lineTotal: 800, sortOrder: 15 },
      { itemType: "LINE_ITEM", sectionTitle: "Documentation & Handover", description: "Network diagram, IP plan, credentials doc, rack diagram, and user handover.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 350, discountAmount: 0, lineTotal: 350, sortOrder: 16 },
      { itemType: "LINE_ITEM", sectionTitle: "Annual IT Support Contract", description: "12-month support contract — remote and on-site. Quarterly health checks.", brand: "Octonics", quantity: 1, unit: "Year", unitPrice: 2400, discountAmount: 0, lineTotal: 2400, isOptional: true, sortOrder: 17 },
    ],
  };
}
