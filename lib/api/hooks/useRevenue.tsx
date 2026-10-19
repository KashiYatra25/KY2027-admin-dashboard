"use client";

import { useCallback } from "react";
import { useApiQuery } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";

// ═══════════════════════════════════════════════════════════════════
// TYPES (match backend getRevenueAnalytics response)
// ═══════════════════════════════════════════════════════════════════

export interface RevenueTotals {
  totalRevenue: number;
  totalPurchases: number;
  averageOrderValue: number;
}

export interface RevenueByDatePoint {
  date: string; // YYYY-MM-DD
  revenue: number;
  count: number;
}

export interface RevenueByPassPoint {
  passType: string;
  revenue: number;
  count: number;
}

export interface RevenueResponse {
  info: string;
  rangeDays: number;
  currency: string;
  totals: RevenueTotals;
  revenueByDate: RevenueByDatePoint[];
  revenueByPass: RevenueByPassPoint[];
}

const EMPTY_TOTALS: RevenueTotals = {
  totalRevenue: 0,
  totalPurchases: 0,
  averageOrderValue: 0,
};

// ═══════════════════════════════════════════════════════════════════
// HOOK: useRevenue
//
// Fetches revenue analytics from the admin-only /admin/revenue endpoint.
// Flows through the admin RefreshTokenStrategy (token attach + 401 refresh).
// ═══════════════════════════════════════════════════════════════════

interface UseRevenueOptions {
  /** Trend window in days (default 30, max 365). */
  days?: number;
}

export function useRevenue(options: UseRevenueOptions = {}) {
  const { days = 30 } = options;

  const { data, isLoading, isError, error, refetch } = useApiQuery<RevenueResponse>({
    queryKey: ["admin-revenue", String(days)],
    url: `/admin/revenue?days=${days}`,
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    queryOptions: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
      retry: (failureCount, err: unknown) => {
        const status =
          (err as { response?: { status?: number }; status?: number })?.response?.status ??
          (err as { status?: number })?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const refetchRevenue = useCallback(() => refetch(), [refetch]);

  return {
    totals: data?.totals ?? EMPTY_TOTALS,
    revenueByDate: data?.revenueByDate ?? [],
    revenueByPass: data?.revenueByPass ?? [],
    currency: data?.currency ?? "INR",
    rangeDays: data?.rangeDays ?? days,
    isLoading,
    isError,
    error,
    refetch: refetchRevenue,
  };
}
