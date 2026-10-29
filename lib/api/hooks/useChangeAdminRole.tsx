"use client";

import { useCallback } from "react";
import { useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ChangeAdminRoleResponse {
  info: string;
  userId: string;
  previousRole: "MANAGER" | "OPERATOR";
  newRole: "MANAGER" | "OPERATOR";
  actionType: "PROMOTED" | "DEMOTED";
  performedBy: string;
}

// ═══════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════

const ChangeAdminRoleSchema = z.object({
  targetEmail: z.string().email(),
  newRole: z.enum(["MANAGER", "OPERATOR"]),
});

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

interface UseChangeAdminRoleOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

/**
 * Hook to change an existing admin's role (promote/demote).
 * Only MASTER_ADMIN can use this.
 * Valid transitions: MANAGER ↔ OPERATOR
 */
export function useChangeAdminRole(options?: UseChangeAdminRoleOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<ChangeAdminRoleResponse>({
      url: "/admin/change-admin-role",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: ChangeAdminRoleSchema },
      invalidateQueryName: "admin-users",
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast
              title="Role changed"
              description="Admin role has been updated successfully"
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast
              title="Role change failed"
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

  const changeAdminRole = useCallback(
    (
      data: { targetEmail: string; newRole: "MANAGER" | "OPERATOR" },
      mutationOptions?: Parameters<typeof mutate>[1]
    ) => mutate(data, mutationOptions),
    [mutate]
  );

  return {
    changeAdminRole,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
