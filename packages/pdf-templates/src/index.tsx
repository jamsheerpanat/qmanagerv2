import React from "react";
import { QRCodeSVG } from "qrcode.react";

// Home Automation Template
export {
  HomeAutomationCoverPage,
  HomeAutomationAboutPage,
  HomeAutomationScopePage,
  HomeAutomationQuotationPage,
  HomeAutomationFinalPage,
} from "./home-automation";

// Building Automation Template
export {
  BuildingAutomationCoverPage,
  BuildingAutomationAboutPage,
  BuildingAutomationScopePage,
  BuildingAutomationQuotationPage,
  BuildingAutomationFinalPage,
} from "./building-automation";

// Software Development Template
export {
  SoftwareDevCoverPage,
  SoftwareDevAboutPage,
  SoftwareDevScopePage,
  SoftwareDevQuotationPage,
  SoftwareDevFinalPage,
} from "./software-dev";

// IT Infrastructure Template
export {
  ITInfraCoverPage,
  ITInfraAboutPage,
  ITInfraScopePage,
  ITInfraQuotationPage,
  ITInfraFinalPage,
} from "./it-infra";

// Shared Components
export { OctonicsProductsPage } from "./shared/OctonicsProductsPage";

export const PdfPage = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`pdf-page bg-white ${className}`}>
    <div className="pdf-page-content h-full w-full flex flex-col">
      {children}
    </div>
  </div>
);

export const CoverPage = ({
  title,
  subtitle,
  date,
  customerName,
  companyName,
  logoUrl,
}: any) => (
  <PdfPage className="bg-gray-900 text-white flex items-center justify-center relative">
    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-900 to-black"></div>
    <div className="z-10 w-full px-20">
      {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 mb-24" />}
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">{title}</h1>
      <h2 className="text-2xl font-light text-gray-300 mb-12">{subtitle}</h2>

      <div className="mt-32 pt-8 border-t border-gray-700">
        <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">
          Prepared For
        </p>
        <p className="text-xl font-medium">{customerName}</p>

        <p className="text-sm text-gray-400 uppercase tracking-widest mt-8 mb-1">
          Date
        </p>
        <p className="text-lg">{date}</p>
      </div>
    </div>
  </PdfPage>
);

export const SectionHeader = ({ title, description }: any) => (
  <div className="mb-8 avoid-break">
    <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
    {description && <p className="text-gray-500">{description}</p>}
    <div className="w-16 h-1 bg-blue-600 mt-4"></div>
  </div>
);

export const StandardPage = ({ title, description, children }: any) => (
  <PdfPage>
    <div className="flex-1">
      <SectionHeader title={title} description={description} />
      <div className="text-gray-700 leading-relaxed space-y-4">{children}</div>
    </div>
    <div className="mt-auto pt-4 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
      <span>Q-Manager Proposal Document</span>
      <span className="page-number"></span>
    </div>
  </PdfPage>
);

export const CommercialOfferPage = ({ items, total }: any) => (
  <PdfPage>
    <SectionHeader
      title="Commercial Offer"
      description="Detailed breakdown of costs and services."
    />
    <table className="w-full text-sm text-left text-gray-700 mt-8">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b-2 border-gray-200">
        <tr>
          <th className="px-4 py-3">Description</th>
          <th className="px-4 py-3 text-center">Qty</th>
          <th className="px-4 py-3 text-right">Unit Price</th>
          <th className="px-4 py-3 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item: any, i: number) => (
          <tr key={i} className="border-b">
            <td className="px-4 py-4 font-medium text-gray-900">
              {item.description}
            </td>
            <td className="px-4 py-4 text-center">{item.qty}</td>
            <td className="px-4 py-4 text-right">
              ${item.price.toLocaleString()}
            </td>
            <td className="px-4 py-4 text-right">
              ${(item.qty * item.price).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="font-bold text-lg">
          <td colSpan={3} className="px-4 py-4 text-right">
            Grand Total:
          </td>
          <td className="px-4 py-4 text-right text-blue-700">
            ${total.toLocaleString()}
          </td>
        </tr>
      </tfoot>
    </table>
  </PdfPage>
);

export const VerificationPage = ({ verifyUrl, hash, docId, date }: any) => (
  <PdfPage className="flex items-center justify-center">
    <div className="max-w-md w-full text-center p-8 border-2 border-gray-100 rounded-2xl shadow-sm avoid-break">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">
        Document Verification
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        Scan this QR code to verify the authenticity and integrity of this
        document.
      </p>

      <div className="flex justify-center mb-8">
        <QRCodeSVG value={verifyUrl} size={180} level="H" />
      </div>

      <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg text-xs font-mono text-gray-600 break-all">
        <p>
          <span className="font-bold text-gray-900">Doc ID:</span> {docId}
        </p>
        <p>
          <span className="font-bold text-gray-900">Date:</span> {date}
        </p>
        <p>
          <span className="font-bold text-gray-900">SHA-256 Hash:</span>
          <br />
          {hash}
        </p>
      </div>
    </div>
  </PdfPage>
);

export const TermsAndConditionsPage = ({ terms }: any) => (
  <PdfPage>
    <div className="flex-1">
      <SectionHeader
        title="Terms and Conditions"
        description="Legal agreements and project conditions."
      />
      <div className="text-gray-700 text-xs leading-relaxed text-justify columns-2 gap-8">
        {terms?.map((term: any, i: number) => (
          <div key={i} className="avoid-break mb-4 break-inside-avoid">
            <h4 className="font-bold text-gray-900 mb-1">{term.title}</h4>
            <p>{term.content}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-auto pt-4 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
      <span>Q-Manager Proposal Document</span>
      <span className="page-number"></span>
    </div>
  </PdfPage>
);
