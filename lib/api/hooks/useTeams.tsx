"use client";

import { useCallback } from "react";
import { useApiQuery } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import type { Team, TeamsResponse } from "@/lib/api/helper/types";

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

interface UseTeamsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Hook to fetch all teams with pagination and search.
 * 
 * Uses wire-axon `useApiQuery` so the request flows through the
 * admin `RefreshTokenStrategy` (access token attach + auto 401 refresh).
 */
export function useTeams(options: UseTeamsOptions = {}) {
  const { page = 1, limit = 20, search = "" } = options;

  // Build query params
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) {
    params.set("search", search);
  }

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<TeamsResponse>({
      queryKey: ["admin-teams", String(page), String(limit), search],
      url: `/admin/teams?${params.toString()}`,
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

  const teams: Team[] = data?.teams ?? [];
  const pagination: PaginationInfo = data?.pagination ?? {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const refetchTeams = useCallback(() => refetch(), [refetch]);

  return {
    teams,
    pagination,
    isLoading,
    isError,
    error,
    refetch: refetchTeams,
  };
}

export type { Team, TeamsResponse, PaginationInfo };
