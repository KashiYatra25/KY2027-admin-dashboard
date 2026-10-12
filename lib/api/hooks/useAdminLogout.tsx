"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL, API_TIMEOUT } from "@/lib/api/constants";
import { extractErrorMessage } from "@/lib/api/helper/functions/error.functions";
import { useAdminSession } from "@/lib/auth";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// NOTE: RAW AXIOS EXCEPTION
//
// Logout sits outside the authed `RefreshTokenStrategy` on purpose: it
// invalidates the session via the HttpOnly cookie and must still succeed
// (client-side) even when the access token is already gone. Raw axios is
// the deliberate, documented exception here — not a wire-axon violation.
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface UseAdminLogoutOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
  onSuccess?: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// API Function
// ═══════════════════════════════════════════════════════════════════

async function logoutAdminApi(): Promise<void> {
  await axios.post(
    `${BACKEND_URL}/admin/logout`,
    {},
    {
      withCredentials: true, // Send HttpOnly cookie for invalidation
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

// ═══════════════════════════════════════════════════════════════════
// useAdminLogout Hook
//
// Logs the admin out.
//
// Flow:
// 1. POST /admin/logout (sends the refresh token cookie so the
//    server can invalidate it).
// 2. On success: clear session via clearSession() and show a
//    success toast.
// 3. On error: still clear session (so the client ends up
//    logged out) and surface an error toast.
// ═══════════════════════════════════════════════════════════════════

export function useAdminLogout(options?: UseAdminLogoutOptions) {
  const { clearSession } = useAdminSession();

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } = useMutation({
    mutationFn: logoutAdminApi,
    onSuccess: () => {
      clearSession();
      toast.custom(() => options?.successToast ?? (
        <SuccessToast 
          title="Signed out" 
          description="You have been logged out successfully" 
        />
      ));
      options?.onSuccess?.();
    },
    onError: (err) => {
      // Even if the server call fails, clear session so the user is
      // effectively signed out on the client.
      clearSession();
      const message = extractErrorMessage(err, "Failed to log out");
      toast.custom(() => options?.errorToast ?? (
        <ErrorToast 
          title="Logout failed" 
          description={message} 
        />
      ));
    },
    retry: 3, // Always use 3 retries
  });

  return {
    logout: mutate,
    logoutAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
