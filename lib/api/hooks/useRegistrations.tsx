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
  status?: RegistrationStatus | "";
  participationType?: ParticipationType | "";
}

/**
 * Hook to fetch all event registrations with pagination and filters.
 * 
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
  if (status) {
    params.set("status", status);
  }
  if (participationType) {
    params.set("participationType", participationType);
  }

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<RegistrationsResponse>({
      queryKey: ["admin-registrations", String(page), String(limit), eventSlug, status, participationType],
      url: `/admin/registrations?${params.toString()}`,
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        staleTime: 1000 * 60 * 2, // 2 minutes - data considered fresh
        gcTime: 1000 * 60 * 15, // 15 minutes - cache garbage collection
        retry: (failureCount, error: any) => {
          const status = error?.response?.status ?? error?.status;
          if (status === 401 || status === 403 || status === 429) return false;
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
