"use client";

import { useCallback, useState } from "react";
import { useApiQuery, useApiMutation } from "wire-axon/hooks";
import { z } from "zod";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface RegularUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  slugName: string;
  googleAvatarUrl?: string | null;
  phone?: string | null;
  college?: string | null;
  kyId?: string | null;
  isFromIITBhu: boolean;
  isPaidUser: boolean;
  isSuspended: boolean;
  createdAt: string;
  role?: {
    level: string;
  } | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserStats {
  totalUsers: number;
  iitbhuUsers: number;
  externalUsers: number;
  paidUsers: number;
  freeUsers: number;
  suspendedUsers: number;
  verifiedProfiles: number;
  phoneVerified: number;
  phoneUnverified: number;
}

interface AllUsersResponse {
  info: string;
  users: RegularUser[];
  pagination: PaginationInfo;
  stats: UserStats;
}

interface UpgradeToAdminResponse {
  info: string;
  adminId: string;
  userId: string;
  role: string;
  emailJobId: string;
}

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════

const UpgradeToAdminSchema = z.object({
  targetEmail: z.string().email(),
  role: z.enum(["MANAGER", "OPERATOR"]),
});

const ChangeAccountStatusSchema = z.object({
  targetEmail: z.string().email(),
  action: z.enum(["SUSPEND", "REACTIVATE"]),
  reason: z.string().min(10).optional(),
});

// ═══════════════════════════════════════════════════════════════════
// SORT TYPES
// ═══════════════════════════════════════════════════════════════════

export type UserSortField = "createdAt" | "firstName" | "email" | "college" | "kyId";
export type SortDirection = "asc" | "desc";

// ═══════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════

interface UseAllUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  // Server-side filters
  isFromIITBhu?: boolean;
  isPaidUser?: boolean;
  isSuspended?: boolean;
  hasPhone?: boolean;
  // Server-side sorting
  sortBy?: UserSortField;
  sortDir?: SortDirection;
}

/**
 * Hook to fetch all regular users (paginated with server-side filters).
 * Only fetches users with role "USER" (not admins).
 * 
 * Filters and sorting are applied server-side for accurate pagination.
 */
export function useAllUsers(options?: UseAllUsersOptions) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const search = options?.search ?? "";
  const isFromIITBhu = options?.isFromIITBhu;
  const isPaidUser = options?.isPaidUser;
  const isSuspended = options?.isSuspended;
  const hasPhone = options?.hasPhone;
  const sortBy = options?.sortBy ?? "createdAt";
  const sortDir = options?.sortDir ?? "desc";

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  if (search) {
    queryParams.set("search", search);
  }
  // Add filters (only when explicitly set)
  if (isFromIITBhu !== undefined) {
    queryParams.set("isFromIITBhu", String(isFromIITBhu));
  }
  if (isPaidUser !== undefined) {
    queryParams.set("isPaidUser", String(isPaidUser));
  }
  if (isSuspended !== undefined) {
    queryParams.set("isSuspended", String(isSuspended));
  }
  if (hasPhone !== undefined) {
    queryParams.set("hasPhone", String(hasPhone));
  }
  // Add sorting
  queryParams.set("sortBy", sortBy);
  queryParams.set("sortDir", sortDir);

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<AllUsersResponse>({
      // Query key includes all parameters for proper caching/invalidation
      queryKey: [
        "all-users",
        `page:${page}`,
        `limit:${limit}`,
        `search:${search}`,
        `iitbhu:${isFromIITBhu ?? "any"}`,
        `paid:${isPaidUser ?? "any"}`,
        `suspended:${isSuspended ?? "any"}`,
        `hasPhone:${hasPhone ?? "any"}`,
        `sortBy:${sortBy}`,
        `sortDir:${sortDir}`,
      ],
      url: `/admin/get-all-users?${queryParams.toString()}`,
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        staleTime: 1000 * 60 * 2, // 2 minutes - users change more frequently
        gcTime: 1000 * 60 * 15, // 15 minutes
        retry: (failureCount, error: any) => {
          const status = error?.response?.status ?? error?.status;
          if (status === 401 || status === 403 || status === 429) return false;
          return failureCount < 3;
        },
      },
    });

  const users: RegularUser[] = data?.users ?? [];
  const pagination: PaginationInfo = data?.pagination ?? {
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const stats: UserStats = data?.stats ?? {
    totalUsers: 0,
    iitbhuUsers: 0,
    externalUsers: 0,
    paidUsers: 0,
    freeUsers: 0,
    suspendedUsers: 0,
    verifiedProfiles: 0,
    phoneVerified: 0,
    phoneUnverified: 0,
  };

  const refetchUsers = useCallback(() => refetch(), [refetch]);

  return {
    users,
    pagination,
    stats,
    isLoading,
    isError,
    error,
    refetch: refetchUsers,
  };
}

/**
 * Hook to upgrade a user to admin role.
 */
interface UseUpgradeToAdminOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

export function useUpgradeToAdmin(options?: UseUpgradeToAdminOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<UpgradeToAdminResponse>({
      url: "/admin/convert-to-admin",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: UpgradeToAdminSchema },
      invalidateQueryName: ["all-users", "admin-users"],
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast
              title="User upgraded"
              description="Admin invite has been sent to the user"
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast
              title="Upgrade failed"
              description="Please try again later"
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

  const upgradeToAdmin = useCallback(
    (
      data: { targetEmail: string; role: "MANAGER" | "OPERATOR" },
      mutationOptions?: Parameters<typeof mutate>[1]
    ) => mutate(data, mutationOptions),
    [mutate]
  );

  return {
    upgradeToAdmin,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}

// ═══════════════════════════════════════════════════════════════════
// CHANGE ACCOUNT STATUS HOOK (SUSPEND / REACTIVATE)
// ═══════════════════════════════════════════════════════════════════

interface ChangeAccountStatusResponse {
  info: string;
  userId: string;
  role: string;
  action: "SUSPEND" | "REACTIVATE";
  performedBy: string;
  performedAt: string;
}

interface UseChangeAccountStatusOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

/**
 * Hook to change account status (suspend or reactivate).
 * Hierarchy:
 * - MASTER_ADMIN can change: MANAGER, OPERATOR, USER
 * - MANAGER can change: OPERATOR, USER
 */
export function useChangeAccountStatus(options?: UseChangeAccountStatusOptions) {
  const [lastAction, setLastAction] = useState<"SUSPEND" | "REACTIVATE" | null>(null);

  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<ChangeAccountStatusResponse>({
      url: "/admin/change-account-status",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: ChangeAccountStatusSchema },
      invalidateQueryName: ["all-users", "admin-users"],
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast
              title={lastAction === "SUSPEND" ? "Account suspended" : "Account reactivated"}
              description="User has been notified via email"
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast
              title={lastAction === "SUSPEND" ? "Suspension failed" : "Reactivation failed"}
              description="Please try again later"
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

  const changeAccountStatus = useCallback(
    (
      data: { targetEmail: string; action: "SUSPEND" | "REACTIVATE"; reason?: string },
      mutationOptions?: Parameters<typeof mutate>[1]
    ) => {
      setLastAction(data.action);
      mutate(data, mutationOptions);
    },
    [mutate]
  );

  // Convenience methods
  const suspendAccount = useCallback(
    (targetEmail: string, reason?: string, mutationOptions?: Parameters<typeof mutate>[1]) => {
      changeAccountStatus({ targetEmail, action: "SUSPEND", reason }, mutationOptions);
    },
    [changeAccountStatus]
  );

  const reactivateAccount = useCallback(
    (targetEmail: string, reason?: string, mutationOptions?: Parameters<typeof mutate>[1]) => {
      changeAccountStatus({ targetEmail, action: "REACTIVATE", reason }, mutationOptions);
    },
    [changeAccountStatus]
  );

  return {
    changeAccountStatus,
    suspendAccount,
    reactivateAccount,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
