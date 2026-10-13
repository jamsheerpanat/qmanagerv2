import type { NextConfig } from "next";
import { execSync } from "node:child_process";

/**
 * Build stamp shown on the login page.
 *
 * Read at build time and inlined into the bundle, so what the browser displays
 * is a property of the deployed build rather than of the running server. The
 * timestamp is preformatted here as a fixed UTC string: formatting a date at
 * render time would differ between the server and the client and trip a
 * hydration mismatch.
 */
function gitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    // Building outside a git checkout (a container image, a tarball).
    return process.env.BUILD_SHA?.trim() || "unknown";
  }
}

function buildStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`
  );
}

const nextConfig: NextConfig = {
  transpilePackages: ["@qmanager/pdf-templates"],
  experimental: {
    externalDir: true,
  },
  env: {
    NEXT_PUBLIC_BUILD_SHA: gitSha(),
    NEXT_PUBLIC_BUILD_TIME: buildStamp(),
  },
};

export default nextConfig;
