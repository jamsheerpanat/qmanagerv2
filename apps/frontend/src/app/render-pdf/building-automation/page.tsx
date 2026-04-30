"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  BuildingAutomationCoverPage,
  BuildingAutomationAboutPage,
  BuildingAutomationScopePage,
  BuildingAutomationQuotationPage,
  BuildingAutomationFinalPage,
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


function BuildingAutomationRenderPageInner() {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("quotationId");
  const docId = searchParams.get("docId") || "UNKNOWN";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!quotationId) {
        setData(getSampleData(docId));
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/internal/quotations/${quotationId}`,
          { headers: { "x-internal-pdf-render": "1" } }
        );
        setData(res.ok ? transformQuotation(await res.json(), docId) : getSampleData(docId));
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
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏗️</div>
          <div>Generating Building Automation Proposal...</div>
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
        <BuildingAutomationCoverPage
          projectName={data.projectName}
          customerName={data.customerName}
          customerCompany={data.customerCompany}
          proposalDate={data.proposalDate}
          proposalReference={data.proposalReference}
          revisionNumber={data.revisionNumber}
          projectLocation={data.projectLocation}
        />
        <BuildingAutomationAboutPage />
        <BuildingAutomationScopePage />
        <OctonicsProductsPage accentColor="#0ea5e9" headerLabel="BUILDING AUTOMATION PROPOSAL" />
        <BuildingAutomationQuotationPage
          items={data.items}
          subtotal={data.subtotal}
          discount={data.discount}
          tax={data.tax}
          grandTotal={data.grandTotal}
          currency={data.currency}
        />
        <BuildingAutomationFinalPage
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

export default function BuildingAutomationRenderPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: "32px", marginBottom: "12px" }}>🏗️</div><div>Loading...</div></div>
      </div>
    }>
      <BuildingAutomationRenderPageInner />
    </Suspense>
  );
}

function transformQuotation(q: any, docId: string) {
  const terms = q.terms || [];
  const find = (kw: string) => terms.find((t: any) => t.category?.name?.toLowerCase().includes(kw))?.content;
  return {
    projectName: q.projectTitle || "Building Automation Project",
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
    paymentTerms: find("payment") || "50% advance upon order confirmation. 40% upon equipment delivery. 10% upon commissioning.",
    validityPeriod: find("validity") || "This proposal is valid for 30 days from the date of issue.",
    deliveryTimeline: find("delivery") || find("timeline") || "To be confirmed upon order acceptance and advance payment.",
  };
}

function getSampleData(docId: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  return {
    projectName: "Al Fajr Commercial Tower — BMS Installation",
    customerName: "Mr. Ahmed Al-Sabah",
    customerCompany: "Al Fajr Real Estate Co.",
    proposalDate: today,
    proposalReference: `OC-BA-${new Date().getFullYear()}-0017`,
    revisionNumber: "0",
    projectLocation: "Salmiya, Kuwait",
    currency: "KWD",
    subtotal: 38500.0,
    discount: 1925.0,
    tax: 0,
    grandTotal: 36575.0,
    paymentTerms: "50% advance upon order confirmation.\n40% upon delivery of equipment to site.\n10% upon successful testing and commissioning.",
    validityPeriod: `This proposal is valid for 30 days from ${today}.`,
    deliveryTimeline: "Estimated 10–14 weeks from order confirmation and advance payment receipt.",
    terms: [],
    items: [
      { itemType: "SECTION_HEADING", sectionTitle: "1. BMS CONTROLLER & BACKBONE", sortOrder: 1 },
      { itemType: "LINE_ITEM", sectionTitle: "KNX IP Router", description: "KNX IP router for BACnet / KNX integration backbone. DIN rail mount.", brand: "Schneider", quantity: 2, unit: "Nos", unitPrice: 850, discountAmount: 0, lineTotal: 1700, sortOrder: 2 },
      { itemType: "LINE_ITEM", sectionTitle: "BMS Central Software License", description: "Centralized BMS monitoring and control software — 500 point license.", brand: "Siemens", quantity: 1, unit: "Lot", unitPrice: 5500, discountAmount: 0, lineTotal: 5500, sortOrder: 3 },
      { itemType: "SECTION_HEADING", sectionTitle: "2. LIGHTING CONTROL", sortOrder: 4 },
      { itemType: "LINE_ITEM", sectionTitle: "KNX Switch Actuator — 8CH", description: "8-channel switch actuator for lighting zone control. DIN mounted.", brand: "ABB", quantity: 8, unit: "Nos", unitPrice: 420, discountAmount: 0, lineTotal: 3360, sortOrder: 5 },
      { itemType: "LINE_ITEM", sectionTitle: "DALI Dimmer Gateway — 64 devices", description: "KNX-DALI gateway for DALI lighting bus. 64 addressable ballasts.", brand: "Schneider", quantity: 4, unit: "Nos", unitPrice: 680, discountAmount: 0, lineTotal: 2720, sortOrder: 6 },
      { itemType: "LINE_ITEM", sectionTitle: "PIR Presence Sensor — Ceiling Mount", description: "KNX PIR presence sensor for occupancy-based lighting control.", brand: "ABB", quantity: 24, unit: "Nos", unitPrice: 95, discountAmount: 0, lineTotal: 2280, sortOrder: 7 },
      { itemType: "SECTION_HEADING", sectionTitle: "3. HVAC AUTOMATION", sortOrder: 8 },
      { itemType: "LINE_ITEM", sectionTitle: "CoolMaster AC Gateway", description: "Multi-protocol AC gateway — KNX, BACnet, Modbus. Supports 64 FCUs.", brand: "CoolAutomation", quantity: 2, unit: "Nos", unitPrice: 1200, discountAmount: 0, lineTotal: 2400, sortOrder: 9 },
      { itemType: "LINE_ITEM", sectionTitle: "Room Temperature Controller", description: "KNX room thermostat with setpoint and mode control. Flush-mount.", brand: "ABB", quantity: 16, unit: "Nos", unitPrice: 180, discountAmount: 0, lineTotal: 2880, sortOrder: 10 },
      { itemType: "SECTION_HEADING", sectionTitle: "4. ENERGY MONITORING", sortOrder: 11 },
      { itemType: "LINE_ITEM", sectionTitle: "Multi-function Energy Meter", description: "3-phase energy meter with Modbus RS485 for panel-wise metering.", brand: "Schneider", quantity: 6, unit: "Nos", unitPrice: 320, discountAmount: 0, lineTotal: 1920, sortOrder: 12 },
      { itemType: "SECTION_HEADING", sectionTitle: "5. ENGINEERING & COMMISSIONING", sortOrder: 13 },
      { itemType: "LINE_ITEM", sectionTitle: "KNX ETS Programming", description: "Full KNX ETS5/6 programming, group addressing, and scene configuration.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 5800, discountAmount: 0, lineTotal: 5800, sortOrder: 14 },
      { itemType: "LINE_ITEM", sectionTitle: "BMS Dashboard Configuration", description: "Custom floor-plan dashboard, equipment widgets, alarm configuration.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 3800, discountAmount: 0, lineTotal: 3800, sortOrder: 15 },
      { itemType: "LINE_ITEM", sectionTitle: "Testing, Commissioning & Training", description: "Full system testing, punch-list resolution, and facility team handover.", brand: "Octonics", quantity: 1, unit: "Lot", unitPrice: 2640, discountAmount: 0, lineTotal: 2640, sortOrder: 16 },
      { itemType: "LINE_ITEM", sectionTitle: "Extended Maintenance Contract (1yr)", description: "Annual preventive maintenance and remote support contract.", brand: "Octonics", quantity: 1, unit: "Year", unitPrice: 3500, discountAmount: 0, lineTotal: 3500, isOptional: true, sortOrder: 17 },
    ],
  };
}
