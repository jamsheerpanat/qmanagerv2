"use client";

import { useSearchParams } from "next/navigation";
import {
  CoverPage,
  StandardPage,
  CommercialOfferPage,
  VerificationPage,
  TermsAndConditionsPage,
} from "@qmanager/pdf-templates";
import { use } from "react";

const getTemplateData = (templateId: string) => {
  if (templateId === "smart-home") {
    return {
      title: "Smart Home Automation Proposal",
      subtitle: "Complete KNX & DALI Integrated System",
      intro:
        "We propose a state-of-the-art smart home integration featuring KNX infrastructure, DALI lighting control, and RTI visualization. This ensures maximum comfort, energy efficiency, and security.\n\n" +
        "KNX System Overview\n" +
        "KNX is the worldwide standard for home and building control. It offers a unified ecosystem where lighting, HVAC, and security systems communicate seamlessly. Our proposed topology ensures a decentralized architecture, meaning there is no single point of failure.\n\n" +
        "Lighting & Scene Control\n" +
        'Using DALI gateways, we provide granular control over every luminaire. This includes dimming, tunable white control, and pre-configured mood scenes (e.g., "Welcome Home", "Movie Time", "Goodnight").\n\n' +
        "Climate Management\n" +
        "The KNX HVAC controllers will interface directly with your VRF/FCU indoor units, providing precise temperature control and energy savings by automatically adjusting based on occupancy.\n\n" +
        "Security & Access\n" +
        "Integration with IP intercoms and biometric access control guarantees that you have full visibility of who is entering the premises, directly from your mobile device.\n\n" +
        "User Interface & Experience\n" +
        "An RTI XP-8v processor will sit at the core of the AV and user interface experience, providing intuitive control via wall-mounted iPads and handheld remotes.",
      terms: [
        {
          title: "1. Scope of Work",
          content:
            "The Contractor shall provide all necessary labor, materials, tools, and equipment to complete the Smart Home Integration as described in this proposal.",
        },
        {
          title: "2. Payment Terms",
          content:
            "A 50% advance payment is required upon acceptance. 40% upon delivery of equipment. 10% upon successful testing and commissioning.",
        },
        {
          title: "3. Warranty",
          content:
            "All hardware is covered by a 2-year manufacturer warranty. The Contractor provides a 1-year workmanship warranty from the date of commissioning.",
        },
        {
          title: "4. Intellectual Property",
          content:
            "All programming files, source code, and configurations remain the property of the Contractor until full payment is received.",
        },
        {
          title: "5. Limitation of Liability",
          content:
            "The Contractor shall not be liable for any indirect, incidental, special, or consequential damages arising out of the performance of this agreement.",
        },
      ],
      items: [
        { description: "KNX Switch Actuators", qty: 8, price: 450 },
        { description: "DALI Gateways", qty: 2, price: 850 },
        { description: "RTI Control Processor XP-8v", qty: 1, price: 2500 },
        { description: "HVAC Control Interface", qty: 3, price: 300 },
        { description: "Testing & Commissioning", qty: 1, price: 4000 },
      ],
    };
  } else if (templateId === "software") {
    return {
      title: "Software Development Proposal",
      subtitle: "Digital Transformation & Cloud Native App",
      intro:
        "This proposal outlines the delivery of a scalable, cloud-native software application. It includes modules for user management, real-time data processing, and secure API gateways.",
      items: [
        { description: "UI/UX Design Phase", qty: 1, price: 8000 },
        { description: "Frontend Development (Next.js)", qty: 1, price: 15000 },
        { description: "Backend Architecture (NestJS)", qty: 1, price: 18000 },
        { description: "DevOps & CI/CD Setup", qty: 1, price: 5000 },
      ],
    };
  } else if (templateId === "it-infra") {
    return {
      title: "IT Infrastructure Proposal",
      subtitle: "Secure Networking & Data Center",
      intro:
        "We will design and implement a robust IT infrastructure featuring enterprise-grade routing, firewall security, structured cabling, and redundant NAS backups to ensure 99.9% uptime.",
      items: [
        { description: "Enterprise Firewall Appliance", qty: 2, price: 4500 },
        { description: "Managed Layer 3 Switch", qty: 4, price: 1200 },
        { description: "Wi-Fi 6 Access Points", qty: 15, price: 350 },
        { description: "Rack Mount NAS Storage 32TB", qty: 1, price: 5500 },
      ],
    };
  }
  return {
    title: "Standard Proposal",
    subtitle: "Services & Solutions",
    intro: "Thank you for giving us the opportunity to present this proposal.",
    items: [{ description: "Consulting", qty: 10, price: 150 }],
  };
};

export default function RenderPdfPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId") || "UNKNOWN";

  const data = getTemplateData(templateId);
  const total = data.items.reduce(
    (acc, curr) => acc + curr.price * curr.qty,
    0,
  );

  // URL that will be placed in the QR code.
  // In production, this should be the public domain.
  const verifyUrl = `http://localhost:3000/verify/SCAN-ME-LATER-${docId}`;

  return (
    <div className="pdf-container print:bg-white bg-gray-100 flex flex-col items-center py-10 print:py-0 print:block">
      <CoverPage
        title={data.title}
        subtitle={data.subtitle}
        date={new Date().toLocaleDateString()}
        customerName="Sample Customer LLC"
      />

      <StandardPage
        title="Proposed Solution"
        description="Overview of our strategic approach"
      >
        <p className="text-lg whitespace-pre-wrap">{data.intro}</p>
        <div className="mt-8">
          <h3 className="font-bold text-gray-900 mb-2">Scope of Work</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Comprehensive requirement analysis.</li>
            <li>Procurement and staging of all equipment.</li>
            <li>On-site deployment and integration.</li>
            <li>System testing, tuning, and commissioning.</li>
            <li>Staff training and project handover.</li>
          </ul>
        </div>
      </StandardPage>

      <CommercialOfferPage items={data.items} total={total} />

      <TermsAndConditionsPage terms={data.terms || []} />

      <VerificationPage
        verifyUrl={verifyUrl}
        docId={docId}
        date={new Date().toLocaleDateString()}
        hash="Hash will be generated by the backend and saved to metadata upon render completion."
      />
    </div>
  );
}
