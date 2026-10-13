import React from "react";

/**
 * A section that flows across several A4 pages. Chromium repeats a table's
 * <thead>/<tfoot> on every printed page, so the header and footer appear on
 * each page the content spills onto, not just the first and last. The page
 * margin is 0 (@page in globals.css), so the cells also carry the page padding.
 */
export const PageFlow = ({ header, footer, children }: { header: React.ReactNode; footer: React.ReactNode; children: React.ReactNode }) => (
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead><tr><td style={{ padding: "10mm 13mm 0" }}>{header}</td></tr></thead>
    <tfoot><tr><td style={{ padding: "6px 13mm 8mm" }}>{footer}</td></tr></tfoot>
    <tbody><tr><td style={{ padding: "0 13mm", verticalAlign: "top" }}>{children}</td></tr></tbody>
  </table>
);
