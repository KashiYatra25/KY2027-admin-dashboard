"use client";

import { useCallback } from "react";
import { useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// INVALIDATE USER CACHE HOOK
//
// MASTER_ADMIN only - clears all cached data for a specific user.
// Useful when user reports stale data or after manual DB updates.
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────

const InvalidateUserCacheSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface InvalidateUserCacheResponse {
  info: string;
  userId: string;
  results: {
    myAccount: boolean;
    teams: boolean;
    registrations: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

/**
 * Hook to invalidate all cached data for a specific user.
 * Only available to MASTER_ADMIN role.
 */
export function useInvalidateUserCache() {
  const { mutate, isPending, isSuccess, isError, error, data, reset } =
    useApiMutation<InvalidateUserCacheResponse>({
      url: "/admin/cache/invalidate-user",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: InvalidateUserCacheSchema },
      toastConfig: {
        successConfig: {
          customToast: (
            <SuccessToast
              title="Cache cleared"
              description="User's cached data has been invalidated"
            />
          ),
        },
        errorConfig: {
          customToast: (
            <ErrorToast
              title="Cache invalidation failed"
              description="Could not clear user cache"
            />
          ),
        },
      },
      mutationOptions: {
        retry: false,
      },
    });

  const invalidateUserCache = useCallback(
    (userId: string, options?: Parameters<typeof mutate>[1]) =>
      mutate({ userId }, options),
    [mutate]
  );

  return {
    invalidateUserCache,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  };
}
