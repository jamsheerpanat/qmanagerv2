import React from "react";
import { LightCoverPage } from "../shared/LightCoverPage";

export const BuildingAutomationCoverPage = (props: any) => (
  <LightCoverPage
    {...props}
    id="cover-bms"
    theme={{ accent: "#0e7490", bright: "#06b6d4", secondary: "#3b82f6" }}
    badge="Building Management System"
    titleLead="BUILDING"
    titleHighlight="AUTOMATION"
    tagline="A centralized intelligent building solution designed for efficiency, control, monitoring, energy optimization, and operational excellence."
    highlights={[
      "Lighting",
      "HVAC",
      "Sensors",
      "Energy",
      "Access",
      "BMS",
    ]}
    showCertifications
    defaultReference="OC-BA-2025-0001"
  />
);
