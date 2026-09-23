import React from "react";
import { LightCoverPage } from "../shared/LightCoverPage";

export const SoftwareDevCoverPage = (props: any) => (
  <LightCoverPage
    {...props}
    id="cover-software"
    theme={{ accent: "#4f46e5", bright: "#818cf8", secondary: "#06b6d4" }}
    badge="Software Development"
    titleLead="SOFTWARE"
    titleHighlight="DEVELOPMENT"
    tagline="A modern digital solution designed to automate operations, improve visibility, reduce manual work, and support business growth."
    highlights={[
      "React",
      "Next.js",
      "Node.js",
      "NestJS",
      "PostgreSQL",
      "React Native",
      "REST API",
      "Cloud",
    ]}
    defaultReference="OC-SD-2025-0001"
  />
);
