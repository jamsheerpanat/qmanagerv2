import { useAuthStore } from "./store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Fetches a record from the backend's `/internal/*` render endpoints.
 *
 * Those endpoints have two legitimate callers and each authenticates
 * differently:
 *
 *  - The headless PDF renderer. Playwright attaches a short-lived
 *    `x-internal-render-token` header at the browser-context level, so it
 *    rides along on this request automatically and nothing is needed here.
 *  - The dashboard's Live Preview iframe, which runs in a signed-in browser.
 *    That case has no render token, so we forward the user's JWT.
 *
 * This replaces the old `x-internal-pdf-render: 1` header, which was a
 * hardcoded string anyone could send.
 */
export async function fetchForRender(path: string): Promise<Response> {
  const headers: Record<string, string> = {};

  const token = useAuthStore.getState().accessToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${API_BASE}${path}`, { headers, cache: "no-store" });
}
