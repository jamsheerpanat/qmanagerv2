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
  products: ["catalog/products"] as const,
  serviceTypes: ["catalog/service-types"] as const,
  serviceItems: ["catalog/service-items"] as const,
  categories: ["catalog/categories"] as const,
  termsTemplates: ["terms/templates"] as const,
  termsGroups: ["terms/groups"] as const,
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
 * The list endpoint never returns the full `productImage` or the long text
 * columns; rows carry `productThumbnail` for display. Fetch a single product
 * when the full image is needed.
 */
export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => get<any[]>("/catalog/products"),
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

export function useServiceItems() {
  return useQuery({
    queryKey: queryKeys.serviceItems,
    queryFn: () => get<any[]>("/catalog/service-items"),
    staleTime: 10 * 60_000,
  });
}

export function useTermsTemplates() {
  return useQuery({
    queryKey: queryKeys.termsTemplates,
    queryFn: () => get<any[]>("/terms/templates"),
    staleTime: 10 * 60_000,
  });
}

export function useTermsGroups() {
  return useQuery({
    queryKey: queryKeys.termsGroups,
    queryFn: () => get<any[]>("/terms/groups"),
    staleTime: 10 * 60_000,
  });
}

/**
 * Puts a just-created product at the front of the cached catalogue.
 *
 * The wizards create products inline and previously prepended to their own
 * local state. Writing straight into the cache keeps that instant feedback,
 * and the follow-up invalidation re-syncs with the server.
 */
export function useAddProductToCache() {
  const queryClient = useQueryClient();
  return (product: any) => {
    queryClient.setQueryData(queryKeys.products, (old: any[] | undefined) =>
      old ? [product, ...old] : old,
    );
    void queryClient.invalidateQueries({ queryKey: queryKeys.products });
  };
}

/** Invalidates a collection after a mutation so the next read refetches. */
export function useInvalidate() {
  const queryClient = useQueryClient();
  return (key: readonly unknown[]) =>
    queryClient.invalidateQueries({ queryKey: key });
}
