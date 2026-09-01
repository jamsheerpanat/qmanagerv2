"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./axios";

/**
 * Shared query keys. Pages that show the same collection must use the same key
 * so they share one cache entry rather than each fetching their own copy.
 */
export const queryKeys = {
  customers: ["customers"] as const,
  /** Prefix covering every limit variant; use this to invalidate them all. */
  quotationsAll: ["quotations"] as const,
  quotations: (limit?: number) => ["quotations", limit ?? "all"] as const,
  invoices: ["invoices"] as const,
  /** Prefix shared by both catalogue variants; invalidating it clears both. */
  productsAll: ["catalog/products"] as const,
  products: (lite: boolean) =>
    ["catalog/products", lite ? "lite" : "full"] as const,
  serviceTypes: ["catalog/service-types"] as const,
  serviceItems: ["catalog/service-items"] as const,
  categories: ["catalog/categories"] as const,
  termsTemplates: ["terms/templates"] as const,
  dashboardKpis: ["reports/dashboard"] as const,
  dashboardCharts: ["reports/charts"] as const,
};

async function get<T>(path: string): Promise<T> {
  const { data } = await api.get(path);
  return data;
}

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: () => get<any[]>("/customers"),
  });
}

export function useQuotations(limit?: number) {
  return useQuery({
    queryKey: queryKeys.quotations(limit),
    queryFn: () =>
      get<any[]>(limit ? `/quotations?limit=${limit}` : "/quotations"),
  });
}

/**
 * `lite` omits the base64 image and long-text columns. Pickers that only need
 * names and prices should pass true; the catalogue page needs the full row.
 */
export function useProducts(lite = false) {
  return useQuery({
    queryKey: queryKeys.products(lite),
    queryFn: () => get<any[]>(`/catalog/products${lite ? "?lite=1" : ""}`),
  });
}

export function useServiceTypes() {
  return useQuery({
    queryKey: queryKeys.serviceTypes,
    queryFn: () => get<any[]>("/catalog/service-types"),
    // Reference data that changes very rarely.
    staleTime: 10 * 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => get<any[]>("/catalog/categories"),
    staleTime: 10 * 60_000,
  });
}

/** Invalidates a collection after a mutation so the next read refetches. */
export function useInvalidate() {
  const queryClient = useQueryClient();
  return (key: readonly unknown[]) =>
    queryClient.invalidateQueries({ queryKey: key });
}
