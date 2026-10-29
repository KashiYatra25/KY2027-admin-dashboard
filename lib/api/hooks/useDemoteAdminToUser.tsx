"use client";

import { useCallback } from "react";
import { useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface DemoteAdminToUserResponse {
  info: string;
  userId: string;
  previousRole: "MANAGER" | "OPERATOR";
  newRole: "USER";
  performedBy: string;
}

// ═══════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════

const DemoteAdminToUserSchema = z.object({
  targetEmail: z.string().email(),
});

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

interface UseDemoteAdminToUserOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

/**
 * Hook to demote an admin back to a regular user.
 * Only MASTER_ADMIN can use this.
 * Completely removes admin privileges and deletes the admin record.
 */
export function useDemoteAdminToUser(options?: UseDemoteAdminToUserOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<DemoteAdminToUserResponse>({
      url: "/admin/demote-admin-to-user",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: DemoteAdminToUserSchema },
      invalidateQueryName: "admin-users",
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast
              title="Admin demoted"
              description="Admin has been demoted to regular user"
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast
              title="Demotion failed"
              description="Please try again later"
            />
          ),
        },
      },
      mutationOptions: {
        retry: (failureCount, error: unknown) => {
          const err = error as { response?: { status?: number }; status?: number };
          const status = err?.response?.status ?? err?.status;
          if (status === 401 || status === 403 || status === 429) return false;
          return failureCount < 3;
        },
      },
    });

  const demoteAdminToUser = useCallback(
    (
      data: { targetEmail: string },
      mutationOptions?: Parameters<typeof mutate>[1]
    ) => mutate(data, mutationOptions),
    [mutate]
  );

  return {
    demoteAdminToUser,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
