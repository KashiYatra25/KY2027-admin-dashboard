"use client";

import { useCallback } from "react";
import { useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// CHANGE PASSWORD HOOK
//
// Protected endpoint - requires admin JWT.
// Allows authenticated admin to change their password.
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface ChangePasswordResponse {
  info: string;
}

interface UseChangePasswordOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

/**
 * Hook to change password for the authenticated admin.
 *
 * Uses wire-axon `useApiMutation` with sharedFeatureConfig
 * so the request flows through the admin RefreshTokenStrategy.
 */
export function useChangePassword(options?: UseChangePasswordOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<ChangePasswordResponse>({
      url: "/admin/change-password",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: ChangePasswordSchema },
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast
              title="Password changed"
              description="Your password has been updated successfully"
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast
              title="Password change failed"
              description="Please check your current password and try again"
            />
          ),
        },
      },
      mutationOptions: { 
        retry: (failureCount, error: any) => {
          const status = error?.response?.status ?? error?.status;
          if (status === 401 || status === 403 || status === 429) return false;
          return failureCount < 3;
        },
      },
    });

  const changePassword = useCallback(
    (data: { currentPassword: string; newPassword: string }, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return {
    changePassword,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
