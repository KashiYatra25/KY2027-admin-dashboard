"use client";

import { useCallback } from "react";
import { useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// INVALIDATE ALL CACHES HOOK
//
// MASTER_ADMIN only - invalidates all application caches.
// Useful after seeding data or debugging stale cache issues.
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
 * This clears:
 * - Schedule cache (venues, days, entries)
 * - Events cache (list, by-slug)
 * - Passes cache
 * - Per-user caches (myAccount, teams, registrations)
 *
 * Does NOT clear:
 * - Rate limiter state
 * - OTP state
 * - Admin tokens
 */
export function useInvalidateCaches() {
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
              title="Caches invalidated"
              description="All application caches have been cleared"
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
