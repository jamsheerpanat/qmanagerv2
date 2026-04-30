import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@qmanager/pdf-templates"],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
