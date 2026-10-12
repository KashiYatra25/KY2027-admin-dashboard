"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL, API_TIMEOUT } from "@/lib/api/constants";
import { useAdminSession } from "@/lib/auth";

// ═══════════════════════════════════════════════════════════════════
// useRefreshToken Hook
//
// NOTE: RAW AXIOS / SESSION EXCEPTION
// Session refresh sits outside the authed `RefreshTokenStrategy` by
// design — it is the mechanism that renews the session, so it cannot
// itself depend on a valid access token. This hook delegates to the
// AdminSessionProvider's `refreshSession`, which performs the raw call.
//
// With session-based auth, the HttpOnly cookie handles most of the
// session persistence. This hook provides a way to manually refresh
// the session if needed (e.g., after a long idle period).
//
// In most cases, the session is automatically validated by 
// AdminSessionProvider on mount, so this hook is rarely needed.
// ═══════════════════════════════════════════════════════════════════

interface UseRefreshTokenOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useRefreshToken(options?: UseRefreshTokenOptions) {
  const { refreshSession } = useAdminSession();

  const { mutateAsync, isPending, isSuccess, isError, error, reset } = useMutation({
    mutationFn: async () => {
      // Just refresh the session from server
      await refreshSession();
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (err) => {
      options?.onError?.(err);
    },
    retry: 3, // Always use 3 retries
  });

  const refresh = useCallback(() => mutateAsync(), [mutateAsync]);

  return {
    refresh,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
