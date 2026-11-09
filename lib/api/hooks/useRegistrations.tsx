"use client";

import { useCallback } from "react";
import { useApiQuery } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import type {
  Registration,
  RegistrationsResponse,
  RegistrationStats,
  ParticipationType,
  RegistrationStatus,
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

interface UseRegistrationsOptions {
  page?: number;
  limit?: number;
  eventSlug?: string;
  status?: RegistrationStatus | RegistrationStatus[] | "";
  participationType?: ParticipationType | ParticipationType[] | "";
}

/**
 * Hook to fetch all event registrations with pagination and filters.
 * 
 * Supports multi-select filters (pass arrays for status/participationType).
 * Uses wire-axon `useApiQuery` so the request flows through the
 * admin `RefreshTokenStrategy` (access token attach + auto 401 refresh).
 */
export function useRegistrations(options: UseRegistrationsOptions = {}) {
  const { page = 1, limit = 20, eventSlug = "", status = "", participationType = "" } = options;

  // Build query params
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (eventSlug) {
    params.set("eventSlug", eventSlug);
  }
  // Support arrays for multi-select (send as comma-separated)
  if (status) {
    const statusValue = Array.isArray(status) ? status.join(",") : status;
    if (statusValue) params.set("status", statusValue);
  }
  if (participationType) {
    const typeValue = Array.isArray(participationType) ? participationType.join(",") : participationType;
    if (typeValue) params.set("participationType", typeValue);
  }

  // Build query key with stringified arrays for proper caching
  const statusKey = Array.isArray(status) ? status.sort().join(",") : status;
  const typeKey = Array.isArray(participationType) ? participationType.sort().join(",") : participationType;

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<RegistrationsResponse>({
      queryKey: ["admin-registrations", String(page), String(limit), eventSlug, statusKey, typeKey],
      url: `/admin/registrations?${params.toString()}`,
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

  const registrations: Registration[] = data?.registrations ?? [];
  const pagination: PaginationInfo = data?.pagination ?? {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const stats: RegistrationStats = data?.stats ?? {
    total: 0,
    individual: 0,
    duo: 0,
    team: 0,
    confirmed: 0,
    pending: 0,
  };

  const refetchRegistrations = useCallback(() => refetch(), [refetch]);

  return {
    registrations,
    pagination,
    stats,
    isLoading,
    isError,
    error,
    refetch: refetchRegistrations,
  };
}

export type {
  Registration,
  RegistrationsResponse,
  RegistrationStats,
  ParticipationType,
  RegistrationStatus,
};
