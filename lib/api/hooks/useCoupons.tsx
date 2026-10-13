"use client";

import { useCallback } from "react";
import { z } from "zod";
import { useApiQuery, useApiMutation } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { CreateCouponSchema, UpdateCouponSchema, ChangeCouponStatusSchema } from "@/lib/api/utils/coupon.schema";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import type {
  Coupon,
  CouponsListResponse,
  CreateCouponData,
} from "@/lib/api/helper/types";

// ═══════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════

interface CouponMutationResponse {
  info: string;
  id?: string;
  code?: string;
  [key: string]: unknown;
}

interface DeleteCouponResponse {
  info: string;
  deletedCouponId: string;
}

// ═══════════════════════════════════════════════════════════════════
// GET COUPONS HOOK
// ═══════════════════════════════════════════════════════════════════

export function useCoupons() {
  const { data, isLoading, isError, error, refetch } =
    useApiQuery<CouponsListResponse>({
      queryKey: ["coupons"],
      url: "/admin/coupons",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: (failureCount, error: any) => {
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

// ═══════════════════════════════════════════════════════════════════
// CREATE COUPON HOOK
// ═══════════════════════════════════════════════════════════════════

export function useCreateCoupon() {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<CouponMutationResponse>({
      url: "/admin/coupons",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: CreateCouponSchema },
      invalidateQueryName: "coupons",
      toastConfig: {
        successConfig: {
          customToast: (
            <SuccessToast 
              title="Coupon created" 
              description="The coupon is now available" 
            />
          ),
        },
        errorConfig: {
          customToast: (
            <ErrorToast 
              title="Creation failed" 
              description="Please check the form and try again" 
            />
          ),
        },
      },
    });

  const createCoupon = useCallback(
    (data: CreateCouponData, options?: Parameters<typeof mutate>[1]) => mutate(data as unknown as Record<string, unknown>, options),
    [mutate]
  );

  return { createCoupon, isPending, isSuccess, isError, error, reset };
}

// ═══════════════════════════════════════════════════════════════════
// UPDATE COUPON HOOK
// ═══════════════════════════════════════════════════════════════════

interface UpdateCouponData {
  couponId: string;
  description?: string | null;
  value?: number;
  maxUsageCount?: number | null;
  maxUsagePerUser?: number;
  validFrom?: string;
  validUntil?: string | null;
  applicablePassIds?: string[];
}

export function useUpdateCoupon() {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<CouponMutationResponse>({
      url: "/admin/coupons", // Will be appended with couponId
      method: "patch",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: UpdateCouponSchema },
      invalidateQueryName: "coupons",
      toastConfig: {
        successConfig: {
          customToast: (
            <SuccessToast 
              title="Coupon updated" 
              description="Changes saved successfully" 
            />
          ),
        },
        errorConfig: {
          customToast: (
            <ErrorToast 
              title="Update failed" 
              description="Please try again" 
            />
          ),
        },
      },
    });

  const updateCoupon = useCallback(
    (data: UpdateCouponData, options?: Parameters<typeof mutate>[1]) => {
      const { couponId, ...body } = data;
      mutate(body, {
        ...options,
        // @ts-ignore - wire-axon supports dynamic URL
        url: `/admin/coupons/${couponId}`,
      });
    },
    [mutate]
  );

  return { updateCoupon, isPending, isSuccess, isError, error, reset };
}

// ═══════════════════════════════════════════════════════════════════
// CHANGE COUPON STATUS HOOK
// ═══════════════════════════════════════════════════════════════════

interface ChangeCouponStatusData {
  couponId: string;
  status: "ACTIVE" | "DISABLED";
}

export function useChangeCouponStatus() {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<CouponMutationResponse>({
      url: "/admin/coupons", // Will be appended with couponId/status
      method: "patch",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: ChangeCouponStatusSchema },
      invalidateQueryName: "coupons",
      toastConfig: {
        successConfig: {
          customToast: (
            <SuccessToast 
              title="Status changed" 
              description="Coupon status updated successfully" 
            />
          ),
        },
        errorConfig: {
          customToast: (
            <ErrorToast 
              title="Status change failed" 
              description="Please try again" 
            />
          ),
        },
      },
    });

  const changeCouponStatus = useCallback(
    (data: ChangeCouponStatusData, options?: Parameters<typeof mutate>[1]) => {
      const { couponId, status } = data;
      mutate({ status }, {
        ...options,
        // @ts-ignore - wire-axon supports dynamic URL
        url: `/admin/coupons/${couponId}/status`,
      });
    },
    [mutate]
  );

  return { changeCouponStatus, isPending, isSuccess, isError, error, reset };
}

// ═══════════════════════════════════════════════════════════════════
// DELETE COUPON HOOK
// ═══════════════════════════════════════════════════════════════════

interface DeleteCouponData {
  couponId: string;
}

const EmptySchema = z.object({});

export function useDeleteCoupon() {
  const { mutate, isPending, isSuccess, isError, error, reset } =
    useApiMutation<DeleteCouponResponse>({
      url: "/admin/coupons",
      method: "delete",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: EmptySchema },
      invalidateQueryName: "coupons",
      toastConfig: {
        successConfig: {
          customToast: (
            <SuccessToast 
              title="Coupon deleted" 
              description="The coupon has been removed" 
            />
          ),
        },
        errorConfig: {
          customToast: (
            <ErrorToast 
              title="Delete failed" 
              description="Coupons that have been used cannot be deleted. Try disabling instead." 
            />
          ),
        },
      },
    });

  const deleteCoupon = useCallback(
    (data: DeleteCouponData, options?: Parameters<typeof mutate>[1]) => {
      mutate({}, {
        ...options,
        // @ts-ignore - wire-axon supports dynamic URL
        url: `/admin/coupons/${data.couponId}`,
      });
    },
    [mutate]
  );

  return { deleteCoupon, isPending, isSuccess, isError, error, reset };
}
