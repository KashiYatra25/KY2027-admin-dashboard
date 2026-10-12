"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL, API_TIMEOUT } from "@/lib/api/constants";
import { extractErrorMessage } from "@/lib/api/helper/functions/error.functions";
import {
  VerifyAdminCredsSchema,
  type VerifyAdminCredsSchemaType,
} from "@/lib/api/utils/auth.schema";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import type { VerifyAdminCredsResponse } from "@/lib/api/helper/types";
import type { AdminSession } from "@/lib/auth";

// ═══════════════════════════════════════════════════════════════════
// NOTE: RAW AXIOS EXCEPTION
//
// This is a login endpoint that intentionally sits OUTSIDE the authed
// `RefreshTokenStrategy` — you cannot refresh an access token before a
// session exists. Raw axios (not wire-axon's useApiMutation) is the
// deliberate, documented exception here. It still follows the project's
// toast + `.tsx` + `extractErrorMessage` conventions.
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface UseVerifyAdminCredsOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
  /** Called with admin session data and access token on success */
  onSuccess?: (data: { admin: AdminSession; accessToken: string }) => void;
}

// ═══════════════════════════════════════════════════════════════════
// API Function
// ═══════════════════════════════════════════════════════════════════

async function verifyAdminCredsApi(
  credentials: VerifyAdminCredsSchemaType
): Promise<{ admin: AdminSession; accessToken: string }> {
  // Validate input with Zod
  const validated = VerifyAdminCredsSchema.parse(credentials);

  const response = await axios.post<VerifyAdminCredsResponse>(
    `${BACKEND_URL}/admin/confirm-onboarding`,
    validated,
    {
      withCredentials: true, // Receive HttpOnly refresh token cookie
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return {
    admin: response.data.admin,
    accessToken: response.data.accessToken,
  };
}

// ═══════════════════════════════════════════════════════════════════
// useVerifyAdminCreds Hook
//
// Verifies admin credentials (loginToken from email + password)
// and establishes a session.
//
// Flow:
// 1. User clicks email verification link → lands on /admin-verification/[token]
// 2. User enters temporary password
// 3. Call this hook with { adminPassword, loginToken }
// 4. On success:
//    - Refresh token is set as HttpOnly cookie automatically
//    - Access token returned in body → store in localStorage
//    - Admin session data ({ email, role }) for UI
// 5. Call setSession(admin, accessToken) to update React state + localStorage
// ═══════════════════════════════════════════════════════════════════

export function useVerifyAdminCreds(options?: UseVerifyAdminCredsOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset, data } =
    useMutation({
      mutationFn: verifyAdminCredsApi,
      onSuccess: (result) => {
        toast.custom(() => options?.successToast ?? (
          <SuccessToast 
            title="Welcome!" 
            description="Redirecting to dashboard..." 
          />
        ));
        options?.onSuccess?.(result);
      },
      onError: () => {
        toast.custom(() => options?.errorToast ?? (
          <ErrorToast 
            title="Verification failed" 
            description="Please check your password and try again" 
          />
        ));
      },
      retry: 3, // Always use 3 retries
    });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setErrorMessage(
        extractErrorMessage(error, "Failed to verify admin credentials")
      );
    } else {
      setErrorMessage(null);
    }
  }, [error]);

  const verifyCredentials = (credentials: VerifyAdminCredsSchemaType) => {
    mutate(credentials);
  };

  return {
    verifyCredentials,
    reset,
    isPending,
    isSuccess,
    isError,
    errorMessage,
    admin: data?.admin ?? null,
    accessToken: data?.accessToken ?? null,
  };
}
