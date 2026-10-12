"use client";

import { useCallback } from "react";
import { useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, API_TIMEOUT } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// FORGOT PASSWORD HOOK
//
// Public endpoint - no auth required.
// Sends a password reset email to the provided email address.
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface ForgotPasswordResponse {
  info: string;
}

interface UseForgotPasswordOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

/**
 * Hook to request a password reset email.
 *
 * This is a PUBLIC endpoint - no authentication required.
 * Does NOT use sharedFeatureConfig (no admin auth strategy).
 */
export function useForgotPassword(options?: UseForgotPasswordOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<ForgotPasswordResponse>({
      url: "/admin/forgot-password",
      method: "post",
      baseURL: BACKEND_URL,
      apiConfig: {
        timeout: API_TIMEOUT,
      },
      bodyValidator: { bodySchema: ForgotPasswordSchema },
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast
              title="Email sent"
              description="Check your inbox for the reset link"
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast
              title="Request failed"
              description="Something went wrong. Please try again."
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

  const sendResetLink = useCallback(
    (data: { email: string }, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return {
    sendResetLink,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
