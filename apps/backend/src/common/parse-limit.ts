/** Largest page a list endpoint will return, whatever the caller asks for. */
const MAX_LIST_LIMIT = 500;

/**
 * Reads a `?limit=` query value. Returns undefined for anything missing or
 * malformed, which callers treat as "no cap" so existing clients — including
 * the iOS app, which decodes these endpoints as plain arrays — are unaffected.
 */
export function parseLimit(raw?: string): number | undefined {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return Math.min(parsed, MAX_LIST_LIMIT);
}
