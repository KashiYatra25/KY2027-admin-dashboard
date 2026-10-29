"use client";

import { useCallback } from "react";
import { useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import { useQueryClientInstance } from "@/components/providers/QueryProvider";

// ═══════════════════════════════════════════════════════════════════
// INVALIDATE ALL CACHES HOOK
//
// MASTER_ADMIN only - invalidates all application caches.
// Useful after seeding data or debugging stale cache issues.
//
// This hook does TWO things on success:
// 1. Clears backend Redis caches (schedule, events, per-user caches)
// 2. Clears ALL frontend React Query caches (admin-users, ca-applications, etc.)
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// Schema (empty body — no parameters needed)
// ─────────────────────────────────────────────────────────────────

const EmptyBodySchema = z.object({});

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface InvalidateCachesResponse {
  info: string;
  results: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

/**
 * Hook to invalidate all application caches.
 * Only available to MASTER_ADMIN role.
 *
 * Backend clears:
 * - Schedule cache (venues, days, entries)
 * - Events cache (list, by-slug)
 * - Passes cache
 * - Per-user caches (myAccount, teams, registrations)
 *
 * Frontend clears (on success):
 * - ALL React Query caches (admin-users, ca-applications, all-users, etc.)
 *
 * Does NOT clear:
 * - Rate limiter state
 * - OTP state
 * - Admin tokens
 */
export function useInvalidateCaches() {
  const queryClient = useQueryClientInstance();

  const { mutate, isPending, isSuccess, isError, error, data, reset } =
    useApiMutation<InvalidateCachesResponse>({
      url: "/admin/cache/invalidate",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: EmptyBodySchema },
      toastConfig: {
        successConfig: {
          customToast: (
            <SuccessToast
              title="All caches invalidated"
              description="Backend Redis + frontend React Query caches cleared"
            />
          ),
        },
        errorConfig: {
          customToast: (
            <ErrorToast
              title="Cache invalidation failed"
              description="Something went wrong while clearing caches"
            />
          ),
        },
      },
      mutationOptions: {
        retry: false, // Don't retry admin operations
        onSuccess: () => {
          // ═══════════════════════════════════════════════════════════
          // CLEAR ALL REACT QUERY CACHES
          //
          // After backend Redis caches are cleared, also clear all
          // frontend React Query caches so the UI fetches fresh data.
          //
          // queryClient.clear() removes ALL cached data immediately.
          // Then invalidateQueries() marks everything as stale and
          // triggers refetches for any active queries.
          // ═══════════════════════════════════════════════════════════
          queryClient.clear();
          queryClient.invalidateQueries();
        },
      },
    });

  const invalidateCaches = useCallback(
    (options?: Parameters<typeof mutate>[1]) => mutate({}, options),
    [mutate]
  );

  return {
    invalidateCaches,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  };
}
