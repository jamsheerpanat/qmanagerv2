"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  HomeAutomationCoverPage,
  HomeAutomationAboutPage,
  HomeAutomationScopePage,
  HomeAutomationQuotationPage,
  HomeAutomationFinalPage,
  OctonicsProductsPage,
} from "@qmanager/pdf-templates";

// Load fonts for print
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #e5e7eb; }
    @media print { body { background: white; } }
  `}</style>
);


function HomeAutomationRenderPageInner() {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("quotationId");
  const docId = searchParams.get("docId") || "UNKNOWN";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!quotationId) {
        // Use rich sample data for preview/testing
        setData(getSampleData(docId));
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/internal/quotations/${quotationId}`,
          { headers: { "x-internal-pdf-render": "1" } }
        );
        if (res.ok) {
          const json = await res.json();
          setData(transformQuotation(json, docId));
        } else {
          setData(getSampleData(docId));
        }
      } catch {
        setData(getSampleData(docId));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quotationId, docId]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚙️</div>
          <div>Generating Premium Proposal...</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${docId}`;

  return (
    <>
      <FontLoader />
      <div className="pdf-container print:bg-white bg-gray-200 flex flex-col items-center py-10 print:py-0 print:block">
        <HomeAutomationCoverPage
          projectName={data.projectName}
          customerName={data.customerName}
          customerCompany={data.customerCompany}
          proposalDate={data.proposalDate}
          proposalReference={data.proposalReference}
          revisionNumber={data.revisionNumber}
          projectLocation={data.projectLocation}
        />

        <HomeAutomationAboutPage />

        <HomeAutomationScopePage />

        <OctonicsProductsPage accentColor="#1a56db" headerLabel="SMART HOME AUTOMATION PROPOSAL" />

        <HomeAutomationQuotationPage
          items={data.items}
          subtotal={data.subtotal}
          discount={data.discount}
          tax={data.tax}
          grandTotal={data.grandTotal}
          currency={data.currency}
        />

        <HomeAutomationFinalPage
          terms={data.terms}
          paymentTerms={data.paymentTerms}
          validityPeriod={data.validityPeriod}
          deliveryTimeline={data.deliveryTimeline}
          customerName={data.customerName}
          qrVerificationUrl={verifyUrl}
          proposalReference={data.proposalReference}
          proposalDate={data.proposalDate}
        />
      </div>
    </>
  );
}

export default function HomeAutomationRenderPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: "32px", marginBottom: "12px" }}>⚙️</div><div>Loading...</div></div>
      </div>
    }>
      <HomeAutomationRenderPageInner />
    </Suspense>
  );
}

/** Map a live quotation record to template props */
function transformQuotation(q: any, docId: string) {
  const terms = q.terms || [];
  const paymentTerm = terms.find((t: any) =>
    t.category?.name?.toLowerCase().includes("payment")
  )?.content;
  const validityTerm = terms.find((t: any) =>
    t.category?.name?.toLowerCase().includes("validity")
  )?.content;
  const deliveryTerm = terms.find((t: any) =>
    t.category?.name?.toLowerCase().includes("delivery") ||
    t.category?.name?.toLowerCase().includes("timeline")
  )?.content;

  return {
    projectName: q.projectTitle || "Smart Home Automation Project",
    customerName: q.customer?.displayName || "Valued Customer",
    customerCompany: q.customer?.company || "",
    proposalDate: q.issueDate
      ? new Date(q.issueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    proposalReference: q.quotationNumber || docId,
    revisionNumber: String(q.revisionNumber ?? 0),
    projectLocation: q.projectLocation || "",
    items: q.items || [],
    subtotal: q.subtotal || 0,
    discount: q.discountAmount || 0,
    tax: q.taxAmount || 0,
    grandTotal: q.grandTotal || 0,
    currency: q.currency || "KWD",
    terms: q.terms || [],
    paymentTerms: paymentTerm || "50% advance upon order confirmation. 40% upon equipment delivery. 10% upon commissioning.",
    validityPeriod: validityTerm || `This proposal is valid for 30 days from the date of issue.`,
    deliveryTimeline: deliveryTerm || "To be confirmed upon order acceptance and advance payment.",
  };
}

/** Rich sample data for preview mode */
function getSampleData(docId: string) {
  return {
    projectName: "Villa Automation — Al Nuzha Residence",
    customerName: "Mr. Khalid Al-Rashidi",
    customerCompany: "Al-Rashidi Group",
    proposalDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    proposalReference: `OC-${new Date().getFullYear()}-0042`,
    revisionNumber: "1",
    projectLocation: "Al Nuzha, Kuwait City",
    currency: "KWD",
    subtotal: 24850.0,
    discount: 1485.0,
    tax: 0,
    grandTotal: 23365.0,
    paymentTerms: "50% advance upon order confirmation.\n40% upon delivery of equipment to site.\n10% upon successful testing and commissioning.",
    validityPeriod: "This proposal is valid for 30 days from the date of issue: " + new Date().toLocaleDateString("en-GB"),
    deliveryTimeline: "Estimated 8–12 weeks from order confirmation and advance payment receipt, subject to equipment availability.",
    terms: [],
    items: [
      { itemType: "SECTION_HEADING", sectionTitle: "1. LIGHTING AUTOMATION", sortOrder: 1 },
      { itemType: "LINE_ITEM", sectionTitle: "KNX Dimmer Actuator — 4CH", description: "4-channel dimmer actuator for lighting control. DIN rail mounted.", brand: "Schneider", quantity: 6, unit: "Nos", unitPrice: 320, discountAmount: 0, taxAmount: 0, lineTotal: 1920, sortOrder: 2 },
      { itemType: "LINE_ITEM", sectionTitle: "DALI Gateway — 64 devices", description: "KNX to DALI gateway for advanced lighting protocol integration.", brand: "Schneider", quantity: 2, unit: "Nos", unitPrice: 680, discountAmount: 0, taxAmount: 0, lineTotal: 1360, sortOrder: 3 },
      { itemType: "LINE_ITEM", sectionTitle: "KNX Push-button Interface 6-gang", description: "Flush-mounted 6-gang KNX push button with LED status indicator.", brand: "ABB", quantity: 12, unit: "Nos", unitPrice: 190, discountAmount: 0, taxAmount: 0, lineTotal: 2280, sortOrder: 4 },
      { itemType: "SECTION_HEADING", sectionTitle: "2. CURTAIN AUTOMATION", sortOrder: 5 },
      { itemType: "LINE_ITEM", sectionTitle: "KNX Blind Actuator — 4CH", description: "4-channel blind/curtain actuator for motorized curtain control.", brand: "Schneider", quantity: 4, unit: "Nos", unitPrice: 295, discountAmount: 0, taxAmount: 0, lineTotal: 1180, sortOrder: 6 },
      { itemType: "SECTION_HEADING", sectionTitle: "3. HVAC CONTROL", sortOrder: 7 },
      { itemType: "LINE_ITEM", sectionTitle: "CoolMaster AC Gateway", description: "Multi-protocol AC gateway — KNX, BACnet, Modbus integration.", brand: "CoolAutomation", quantity: 1, unit: "Nos", unitPrice: 1200, discountAmount: 0, taxAmount: 0, lineTotal: 1200, sortOrder: 8 },
      { itemType: "SECTION_HEADING", sectionTitle: "4. CONTROL INTERFACES", sortOrder: 9 },
      { itemType: "LINE_ITEM", sectionTitle: "RTI Control Processor XP-8v", description: "Central control processor for RTI visualization system.", brand: "RTI", quantity: 1, unit: "Nos", unitPrice: 2400, discountAmount: 0, taxAmount: 0, lineTotal: 2400, sortOrder: 10 },
      { itemType: "LINE_ITEM", sectionTitle: "RTI In-Wall Touch Panel 7\"", description: "7-inch in-wall touch panel for room-wise control dashboard.", brand: "RTI", quantity: 4, unit: "Nos", unitPrice: 980, discountAmount: 0, taxAmount: 0, lineTotal: 3920, sortOrder: 11 },
      { itemType: "SECTION_HEADING", sectionTitle: "5. PROGRAMMING & COMMISSIONING", sortOrder: 12 },
      { itemType: "LINE_ITEM", sectionTitle: "KNX System Programming", description: "Full KNX ETS programming, scene configuration, group addressing.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 4500, discountAmount: 0, taxAmount: 0, lineTotal: 4500, sortOrder: 13 },
      { itemType: "LINE_ITEM", sectionTitle: "RTI Interface Design & Programming", description: "Custom room UI design, floor plan integration, scene buttons.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 2800, discountAmount: 0, taxAmount: 0, lineTotal: 2800, sortOrder: 14 },
      { itemType: "LINE_ITEM", sectionTitle: "Testing, Commissioning & Training", description: "Full system testing, tuning, and user handover training session.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 1290, discountAmount: 0, taxAmount: 0, lineTotal: 1290, sortOrder: 15 },
      {
        itemType: "LINE_ITEM",
        sectionTitle: "Mobile App Setup & Remote Access",
        description: "Mobile app configuration for iOS & Android with remote access.",
        brand: "Octonics",
        quantity: 1,
        unit: "Lot",
        unitPrice: 0,
        discountAmount: 0,
        taxAmount: 0,
        lineTotal: 0,
        isOptional: true,
        remarks: "Included complimentary",
        sortOrder: 16,
      },
    ],
  };
}
