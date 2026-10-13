"use client";

import { useEffect, useState } from "react";

const WEB_SHA = process.env.NEXT_PUBLIC_BUILD_SHA || "unknown";
const WEB_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || "unknown";

interface BuildInfo {
  sha: string;
  builtAt: string;
}

/**
 * Shows which build is actually serving the page.
 *
 * The web app and the API are built and restarted independently, so a deploy
 * can update one and leave the other on the previous build. Both are shown,
 * and the API line only appears once it has answered — an unreachable or
 * older API should be visible rather than quietly assumed to match.
 */
export function BuildLabel() {
  const [api, setApi] = useState<BuildInfo | null>(null);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    let cancelled = false;

    fetch(`${base}/version`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((info: BuildInfo) => {
        if (!cancelled) setApi(info);
      })
      .catch(() => {
        if (!cancelled) setApiFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const mismatch = api !== null && api.sha !== WEB_SHA && WEB_SHA !== "unknown";

  return (
    <div className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
      <div>
        Web <span className="font-mono">{WEB_SHA}</span> · {WEB_TIME}
      </div>
      {api && (
        <div>
          API <span className="font-mono">{api.sha}</span> · {api.builtAt}
        </div>
      )}
      {apiFailed && <div>API version unavailable</div>}
      {mismatch && (
        <div className="mt-1 text-amber-600">
          Web and API are on different builds
        </div>
      )}
    </div>
  );
}
