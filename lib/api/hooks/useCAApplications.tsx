"use client";

import { useApiQuery, useApiMutation } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { ApproveCASchema } from "@/lib/api/utils/ca.schema";
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
          // Don't retry on auth errors (401, 403)
          const status = error?.response?.status ?? error?.status;
          if (status === 401 || status === 403) return false;
          return failureCount < 3;
        },
      },
    });

  const applications: CAApplication[] = data?.applications ?? [];

  return {
    applications,
    isLoading,
    isError,
    error,
    refetch,
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
      mutationOptions: { retry: 3 },
    });

  return {
    approveCA: mutate,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
