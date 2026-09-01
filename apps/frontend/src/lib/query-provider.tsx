"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Client-side cache for dashboard data.
 *
 * Every list page used to refetch from scratch on each visit, and pages that
 * load the same reference data (customers, the product catalogue, service
 * types) each fetched their own copy. Sharing a query cache makes navigating
 * back to a list instant and collapses duplicate in-flight requests into one.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState, not a module-level client: a single shared instance would leak
  // one user's data into the next session on the server.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Long enough that moving between pages is served from cache,
            // short enough that a record edited elsewhere shows up quickly.
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
