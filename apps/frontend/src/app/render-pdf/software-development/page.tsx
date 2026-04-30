"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  SoftwareDevCoverPage,
  SoftwareDevAboutPage,
  SoftwareDevScopePage,
  SoftwareDevQuotationPage,
  SoftwareDevFinalPage,
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


function SoftwareDevRenderPageInner() {
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
      <div style={{ textAlign: "center" }}><div style={{ fontSize: "32px", marginBottom: "12px" }}>💻</div><div>Generating Software Proposal...</div></div>
    </div>
  );
  if (!data) return null;

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${docId}`;

  return (
    <>
      <FontLoader />
      <div className="pdf-container print:bg-white bg-gray-200 flex flex-col items-center py-10 print:py-0 print:block">
        <SoftwareDevCoverPage
          projectName={data.projectName} customerName={data.customerName}
          customerCompany={data.customerCompany} proposalDate={data.proposalDate}
          proposalReference={data.proposalReference} revisionNumber={data.revisionNumber}
          projectLocation={data.projectLocation}
        />
        <SoftwareDevAboutPage />
        <SoftwareDevScopePage />
        <OctonicsProductsPage accentColor="#6366f1" headerLabel="SOFTWARE DEVELOPMENT PROPOSAL" />
        <SoftwareDevQuotationPage
          items={data.items} subtotal={data.subtotal} discount={data.discount}
          tax={data.tax} grandTotal={data.grandTotal} currency={data.currency}
        />
        <SoftwareDevFinalPage
          terms={data.terms} paymentTerms={data.paymentTerms}
          validityPeriod={data.validityPeriod} deliveryTimeline={data.deliveryTimeline}
          customerName={data.customerName} qrVerificationUrl={verifyUrl}
          proposalReference={data.proposalReference} proposalDate={data.proposalDate}
        />
      </div>
    </>
  );
}

export default function SoftwareDevRenderPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: "32px", marginBottom: "12px" }}>💻</div><div>Loading...</div></div>
      </div>
    }>
      <SoftwareDevRenderPageInner />
    </Suspense>
  );
}

function transformQuotation(q: any, docId: string) {
  const terms = q.terms || [];
  const find = (kw: string) => terms.find((t: any) => t.category?.name?.toLowerCase().includes(kw))?.content;
  return {
    projectName: q.projectTitle || "Software Development Project",
    customerName: q.customer?.displayName || "Valued Customer",
    customerCompany: q.customer?.company || "",
    proposalDate: q.issueDate ? new Date(q.issueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    proposalReference: q.quotationNumber || docId,
    revisionNumber: String(q.revisionNumber ?? 0),
    projectLocation: q.projectLocation || "",
    items: q.items || [],
    subtotal: q.subtotal || 0, discount: q.discountAmount || 0, tax: q.taxAmount || 0, grandTotal: q.grandTotal || 0,
    currency: q.currency || "KWD", terms: q.terms || [],
    paymentTerms: find("payment") || "50% advance upon project confirmation.\n40% upon completion of development and UAT.\n10% upon final deployment and handover.",
    validityPeriod: find("validity") || "This proposal is valid for 30 days from the date of issue.",
    deliveryTimeline: find("delivery") || find("timeline") || "To be confirmed upon project kickoff and advance payment receipt.",
  };
}

function getSampleData(docId: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  return {
    projectName: "QManager Pro — Business Management Platform",
    customerName: "Mr. Faisal Al-Mutairi",
    customerCompany: "Tamkeen Trading Co. W.L.L.",
    proposalDate: today,
    proposalReference: `OC-SD-${new Date().getFullYear()}-0031`,
    revisionNumber: "0",
    projectLocation: "Kuwait City, Kuwait",
    currency: "KWD",
    subtotal: 19800.0,
    discount: 990.0,
    tax: 0,
    grandTotal: 18810.0,
    paymentTerms: "50% advance upon project confirmation.\n40% upon completion of development & UAT approval.\n10% upon final deployment and system handover.",
    validityPeriod: `This proposal is valid for 30 days from ${today}.`,
    deliveryTimeline: "Estimated 12–16 weeks from project kickoff and advance payment receipt. Timeline is subject to scope confirmation and timely client feedback.",
    terms: [],
    items: [
      { itemType: "SECTION_HEADING", sectionTitle: "1. REQUIREMENT ANALYSIS & UI/UX DESIGN", sortOrder: 1 },
      { itemType: "LINE_ITEM", sectionTitle: "Requirement Analysis & Documentation", description: "Full business requirement review, workflow mapping, user stories, and project specification document.", brand: "Web", quantity: 1, unit: "Lot", unitPrice: 800, discountAmount: 0, lineTotal: 800, sortOrder: 2 },
      { itemType: "LINE_ITEM", sectionTitle: "UI/UX Design — Web & Mobile", description: "High-fidelity Figma designs for all web modules and mobile screens. Design system included.", brand: "Web", quantity: 1, unit: "Lot", unitPrice: 1200, discountAmount: 0, lineTotal: 1200, sortOrder: 3 },
      { itemType: "SECTION_HEADING", sectionTitle: "2. WEB APPLICATION (BACKEND + FRONTEND)", sortOrder: 4 },
      { itemType: "LINE_ITEM", sectionTitle: "Backend API Development (NestJS)", description: "REST API with JWT auth, role management, business logic, and PostgreSQL database.", brand: "Web", quantity: 1, unit: "Lot", unitPrice: 3500, discountAmount: 0, lineTotal: 3500, sortOrder: 5 },
      { itemType: "LINE_ITEM", sectionTitle: "Frontend Web Application (Next.js)", description: "Responsive web app with dashboard, all CRUD modules, reports, and PDF export.", brand: "Web", quantity: 1, unit: "Lot", unitPrice: 3000, discountAmount: 0, lineTotal: 3000, sortOrder: 6 },
      { itemType: "SECTION_HEADING", sectionTitle: "3. BUSINESS MODULES", sortOrder: 7 },
      { itemType: "LINE_ITEM", sectionTitle: "Quotation & Invoice Management Module", description: "Full quotation lifecycle, revision tracking, approval workflows, PDF generation, and email sending.", brand: "Module", quantity: 1, unit: "Lot", unitPrice: 2200, discountAmount: 0, lineTotal: 2200, sortOrder: 8 },
      { itemType: "LINE_ITEM", sectionTitle: "Customer & CRM Module", description: "Customer database, contact management, lead tracking, follow-up reminders, and pipeline view.", brand: "Module", quantity: 1, unit: "Lot", unitPrice: 1500, discountAmount: 0, lineTotal: 1500, sortOrder: 9 },
      { itemType: "LINE_ITEM", sectionTitle: "Product & Inventory Management Module", description: "Product catalog, stock management, purchase orders, and inventory movement tracking.", brand: "Module", quantity: 1, unit: "Lot", unitPrice: 1600, discountAmount: 0, lineTotal: 1600, sortOrder: 10 },
      { itemType: "LINE_ITEM", sectionTitle: "Reports & Dashboard Module", description: "Management dashboard with KPIs, sales reports, customer reports, and Excel/PDF export.", brand: "Module", quantity: 1, unit: "Lot", unitPrice: 1000, discountAmount: 0, lineTotal: 1000, sortOrder: 11 },
      { itemType: "SECTION_HEADING", sectionTitle: "4. DEPLOYMENT & HANDOVER", sortOrder: 12 },
      { itemType: "LINE_ITEM", sectionTitle: "Cloud Deployment & Configuration", description: "Application deployment on VPS/cloud, domain configuration, SSL certificate setup.", brand: "DevOps", quantity: 1, unit: "Lot", unitPrice: 500, discountAmount: 0, lineTotal: 500, sortOrder: 13 },
      { itemType: "LINE_ITEM", sectionTitle: "Testing, Bug Fixing & UAT Support", description: "Complete QA testing, bug fixing, and user acceptance testing support.", brand: "QA", quantity: 1, unit: "Lot", unitPrice: 700, discountAmount: 0, lineTotal: 700, sortOrder: 14 },
      { itemType: "LINE_ITEM", sectionTitle: "Training & System Handover", description: "User training sessions, admin training, and basic system documentation.", brand: "Support", quantity: 1, unit: "Lot", unitPrice: 500, discountAmount: 0, lineTotal: 500, sortOrder: 15 },
      { itemType: "LINE_ITEM", sectionTitle: "React Native Mobile App (iOS + Android)", description: "Cross-platform mobile app with login, dashboard, quotation view, and customer self-service.", brand: "Mobile", quantity: 1, unit: "Lot", unitPrice: 4000, discountAmount: 0, lineTotal: 4000, isOptional: true, sortOrder: 16 },
      { itemType: "LINE_ITEM", sectionTitle: "Annual Maintenance & Support Contract", description: "12-month post-deployment support, bug fixes, and minor enhancements.", brand: "Support", quantity: 1, unit: "Year", unitPrice: 2400, discountAmount: 0, lineTotal: 2400, isOptional: true, sortOrder: 17 },
    ],
  };
}
