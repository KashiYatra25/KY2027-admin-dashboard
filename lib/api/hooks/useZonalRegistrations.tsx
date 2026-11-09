"use client";

import { useCallback } from "react";
import { useApiQuery } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import type {
  ZonalRegistration,
  ZonalRegistrationsResponse,
  ZonalStats,
  ZonalPassType,
  ZonalPaymentStatus,
  CollegeBreakdown,
} from "@/lib/api/helper/types";

// Local type for pagination (matches backend response)
interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════

interface UseZonalRegistrationsOptions {
  page?: number;
  limit?: number;
  collegeSlug?: string;
  passType?: ZonalPassType | ZonalPassType[] | "";
  paymentStatus?: ZonalPaymentStatus | ZonalPaymentStatus[] | "";
  search?: string;
}

/**
 * Hook to fetch all zonal registrations/passes with pagination and filters.
 * 
 * Supports multi-select filters (pass arrays for passType/paymentStatus).
 * Uses wire-axon `useApiQuery` so the request flows through the
 * admin `RefreshTokenStrategy` (access token attach + auto 401 refresh).
 */
export function useZonalRegistrations(options: UseZonalRegistrationsOptions = {}) {
  const { 
    page = 1, 
    limit = 20, 
    collegeSlug = "", 
    passType = "", 
    paymentStatus = "",
    search = "",
  } = options;

  // Build query params
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (collegeSlug) {
    params.set("collegeSlug", collegeSlug);
  }
  // Support arrays for multi-select (send as comma-separated)
  if (passType) {
    const passTypeValue = Array.isArray(passType) ? passType.join(",") : passType;
    if (passTypeValue) params.set("passType", passTypeValue);
  }
  if (paymentStatus) {
    const statusValue = Array.isArray(paymentStatus) ? paymentStatus.join(",") : paymentStatus;
    if (statusValue) params.set("paymentStatus", statusValue);
  }
  if (search) {
    params.set("search", search);
  }

  // Build query key with stringified arrays for proper caching
  const passTypeKey = Array.isArray(passType) ? passType.sort().join(",") : passType;
  const statusKey = Array.isArray(paymentStatus) ? paymentStatus.sort().join(",") : paymentStatus;

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<ZonalRegistrationsResponse>({
      queryKey: ["admin-zonal-registrations", String(page), String(limit), collegeSlug, passTypeKey, statusKey, search],
      url: `/admin/zonals/registrations?${params.toString()}`,
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        staleTime: 1000 * 60 * 2, // 2 minutes - data considered fresh
        gcTime: 1000 * 60 * 15, // 15 minutes - cache garbage collection
        retry: (failureCount, error: any) => {
          const statusCode = error?.response?.status ?? error?.status;
          if (statusCode === 401 || statusCode === 403 || statusCode === 429) return false;
          return failureCount < 3;
        },
      },
    });

  const registrations: ZonalRegistration[] = data?.registrations ?? [];
  const pagination: PaginationInfo = data?.pagination ?? {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const stats: ZonalStats = data?.stats ?? {
    totalPasses: 0,
    uniqueUsers: 0,
    singleEvent: 0,
    multiEvent: 0,
    completed: 0,
    pending: 0,
    totalRegisteredEvents: 0,
    totalRevenue: 0,
    avgAmount: 0,
  };
  const collegeBreakdown: CollegeBreakdown[] = data?.collegeBreakdown ?? [];

  const refetchZonalRegistrations = useCallback(() => refetch(), [refetch]);

  return {
    registrations,
    pagination,
    stats,
    collegeBreakdown,
    isLoading,
    isError,
    error,
    refetch: refetchZonalRegistrations,
  };
}

export type {
  ZonalRegistration,
  ZonalRegistrationsResponse,
  ZonalStats,
  ZonalPassType,
  ZonalPaymentStatus,
  CollegeBreakdown,
};
