"use client";

import { useCallback } from "react";
import { useApiQuery, useApiMutation } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { CreateCouponSchema } from "@/lib/api/utils/coupon.schema";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import type {
  Coupon,
  CouponsListResponse,
  CouponResponse,
} from "@/lib/api/helper/types";

// ═══════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook to fetch all coupons.
 *
 * Uses wire-axon `useApiQuery` so the request flows through the
 * admin `RefreshTokenStrategy` (access token attach + auto 401 refresh),
 * matching useAdminUsers / useCAApplications. Previously this bypassed
 * the strategy by using raw axios.
 */
export function useCoupons() {
  const { data, isLoading, isError, error, refetch } =
    useApiQuery<CouponsListResponse>({
      queryKey: ["coupons"],
      url: "/admin/coupons",
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

  const coupons: Coupon[] = data?.coupons ?? [];

  const refetchCoupons = useCallback(() => refetch(), [refetch]);

  return {
    coupons,
    isLoading,
    isError,
    error,
    refetch: refetchCoupons,
  };
}

/**
 * Hook to create a new coupon.
 */
interface UseCreateCouponOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

export function useCreateCoupon(options?: UseCreateCouponOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<CouponResponse>({
      url: "/admin/create-coupon",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: CreateCouponSchema },
      invalidateQueryName: "coupons",
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast 
              title="Coupon created" 
              description="The coupon is now available" 
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast 
              title="Coupon creation failed" 
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

  const createCoupon = useCallback(
    (data: { code: string; discountType: string; discountValue: number; maxUses?: number; expiresAt?: string }, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return {
    createCoupon,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}
