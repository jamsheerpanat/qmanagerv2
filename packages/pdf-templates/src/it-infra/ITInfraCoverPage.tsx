import React from "react";
import { LightCoverPage } from "../shared/LightCoverPage";

export const ITInfraCoverPage = (props: any) => (
  <LightCoverPage
    {...props}
    id="cover-it"
    theme={{ accent: "#0369a1", bright: "#0ea5e9", secondary: "#6366f1" }}
    badge="IT Infrastructure"
    titleLead="IT"
    titleHighlight="INFRASTRUCTURE"
    tagline="A secure, reliable, and scalable IT infrastructure solution designed to support modern business operations."
    highlights={[
      "Firewall",
      "Network",
      "Wi-Fi",
      "Cabling",
      "Servers",
      "Backup",
      "Support",
    ]}
    defaultReference="OC-IT-2025-0001"
  />
);
