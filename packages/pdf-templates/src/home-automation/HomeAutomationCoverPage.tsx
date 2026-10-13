import React from "react";
import { LightCoverPage } from "../shared/LightCoverPage";

export const HomeAutomationCoverPage = (props: any) => (
  <LightCoverPage
    {...props}
    id="cover-home"
    theme={{ accent: "#1d4ed8", bright: "#3b82f6", secondary: "#06b6d4" }}
    badge="Smart Home Automation"
    titleLead="SMART HOME"
    titleHighlight="AUTOMATION"
    tagline="A premium intelligent living solution designed for comfort, luxury, security, and effortless control."
    highlights={[
      "Lighting",
      "Climate",
      "Security",
      "Audio & Video",
      "Scenes",
      "App Control",
    ]}
    showCertifications
  />
);
