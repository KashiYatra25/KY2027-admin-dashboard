"use client";

import { useCallback } from "react";
import { useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// TOGGLE USER PAID STATUS HOOK
//
// MASTER_ADMIN only - toggles a user's isPaidUser status.
// Useful for manually marking users as paid/unpaid.
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────

const ToggleUserPaidStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface ToggleUserPaidStatusResponse {
  info: string;
  user: {
    id: string;
    email: string;
    isPaidUser: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

/**
 * Hook to toggle a user's paid status (isPaidUser).
 * Only available to MASTER_ADMIN role.
 */
export function useToggleUserPaidStatus() {
  const { mutate, isPending, isSuccess, isError, error, data, reset } =
    useApiMutation<ToggleUserPaidStatusResponse>({
      url: "/admin/toggle-user-paid-status",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: ToggleUserPaidStatusSchema },
      toastConfig: {
        successConfig: {
          customToast: (
            <SuccessToast
              title="Paid status updated"
              description="User's paid status has been toggled"
            />
          ),
        },
        errorConfig: {
          customToast: (
            <ErrorToast
              title="Update failed"
              description="Could not update user's paid status"
            />
          ),
        },
      },
      mutationOptions: {
        retry: false,
      },
    });

  const toggleUserPaidStatus = useCallback(
    (userId: string, options?: Parameters<typeof mutate>[1]) =>
      mutate({ userId }, options),
    [mutate]
  );

  return {
    toggleUserPaidStatus,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  };
}
