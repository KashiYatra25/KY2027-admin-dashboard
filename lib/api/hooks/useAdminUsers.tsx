"use client";

import { useApiQuery, useApiMutation } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { InviteAdminSchema } from "@/lib/api/utils/admin.schema";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import type {
  AdminUser,
  AdminUsersResponse,
  InviteAdminResponse,
} from "@/lib/api/helper/types";

// ═══════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook to fetch all admin users.
 *
 * Uses wire-axon `useApiQuery` so the request flows through the
 * admin `RefreshTokenStrategy` (access token attach + auto 401 refresh).
 */
export function useAdminUsers() {
  const { data, isLoading, isError, error, refetch } =
    useApiQuery<AdminUsersResponse>({
      queryKey: ["admin-users"],
      url: "/admin/get-admin-users",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
        gcTime: 1000 * 60 * 30, // 30 minutes - cache garbage collection
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors (401, 403)
          const status = error?.response?.status ?? error?.status;
          if (status === 401 || status === 403) return false;
          return failureCount < 3;
        },
      },
    });

  const admins: AdminUser[] = data?.adminUsers ?? [];

  return {
    admins,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook to invite / convert a user to an admin.
 */
interface UseInviteAdminOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

export function useInviteAdmin(options?: UseInviteAdminOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<InviteAdminResponse>({
      url: "/admin/convert-to-admin",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: InviteAdminSchema },
      invalidateQueryName: "admin-users",
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast 
              title="Admin invited" 
              description="The invitation has been sent successfully" 
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast 
              title="Invite failed" 
              description="Please try again later" 
            />
          ),
        },
      },
      mutationOptions: { retry: 3 },
    });

  return {
    inviteAdmin: mutate,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
