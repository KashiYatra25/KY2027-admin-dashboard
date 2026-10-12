"use client";

import { useCallback } from "react";
import { useApiQuery, useApiMutation } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { ApproveCASchema, UpdateCAStatusSchema } from "@/lib/api/utils/ca.schema";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import type {
  CAApplication,
  CAApplicationsResponse,
  ApproveCAResponse,
} from "@/lib/api/helper/types";

// ═══════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook to fetch all CA applications.
 *
 * Uses wire-axon `useApiQuery` so the request flows through the
 * admin `RefreshTokenStrategy` (access token attach + auto 401 refresh).
 */
export function useCAApplications() {
  const { data, isLoading, isError, error, refetch } =
    useApiQuery<CAApplicationsResponse>({
      queryKey: ["ca-applications"],
      url: "/admin/campus-ambassador/get-applications",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
        gcTime: 1000 * 60 * 30, // 30 minutes - cache garbage collection
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors (401, 403) or rate limiting (429)
          const status = error?.response?.status ?? error?.status;
          if (status === 401 || status === 403 || status === 429) return false;
          return failureCount < 3;
        },
      },
    });

  const applications: CAApplication[] = data?.applications ?? [];

  const refetchApplications = useCallback(() => refetch(), [refetch]);

  return {
    applications,
    isLoading,
    isError,
    error,
    refetch: refetchApplications,
  };
}

/**
 * Hook to approve / reject a CA application.
 */
interface UseApproveCAOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

export function useApproveCA(options?: UseApproveCAOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<ApproveCAResponse>({
      url: "/admin/campus-ambassador/approve-request",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: ApproveCASchema },
      invalidateQueryName: "ca-applications",
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast 
              title="Application updated" 
              description="The CA application status has been saved" 
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast 
              title="Update failed" 
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

  const approveCA = useCallback(
    (data: { applicationId: string; action: "ACCEPTED" | "REJECTED"; rejectionReason?: string }, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return {
    approveCA,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}

/**
 * Hook to update status of already-processed CA applications.
 * Used for ACCEPTED ↔ REJECTED transitions (not for PENDING applications).
 */
interface UseUpdateCAStatusOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

export function useUpdateCAStatus(options?: UseUpdateCAStatusOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<ApproveCAResponse>({
      url: "/admin/campus-ambassador/update-status",
      method: "patch",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: UpdateCAStatusSchema },
      invalidateQueryName: "ca-applications",
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast 
              title="Status updated" 
              description="The CA application status has been changed" 
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast 
              title="Update failed" 
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

  const updateCAStatus = useCallback(
    (data: { applicationId: string; newStatus: "ACCEPTED" | "REJECTED"; reason?: string }, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return {
    updateCAStatus,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
