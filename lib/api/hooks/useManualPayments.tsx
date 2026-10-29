"use client";

import { useCallback, useState } from "react";
import { useApiQuery, useApiMutation } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type ManualPassType = "DARBAR" | "YATRI" | "SWARNIM" | "ZONAL_SINGLE" | "ZONAL_MULTI";
export type PaymentMethod = "UPI" | "NETBANKING" | "WALLET" | "CASH";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ManualPaymentUser {
  userId: string;
  kyId: string;
  email: string;
}

export interface ManualPaymentRequest {
  requestId: string;
  requestedBy: string;
  users: ManualPaymentUser[];
  numberOfPasses: number;
  passType: ManualPassType;
  collegeSlug: string | null;
  paymentMethod: PaymentMethod;
  amount: number;
  bonafides: string[];
  status: RequestStatus;
  processedBy: string | null;
  processedAt: string | null;
  processNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BulkUserLookupResponse {
  info: string;
  results: Array<{
    kyId: string;
    found: boolean;
    user?: {
      id: string;
      kyId: string;
      email: string;
      name: string | null;
      phone: string | null;
      college: string | null;
      isPaidUser: boolean;
      isIITBHU: boolean;
    };
  }>;
  summary: {
    total: number;
    found: number;
    notFound: number;
    notFoundKyIds: string[];
  };
}

export interface ManualPaymentRequestsResponse {
  info: string;
  requests: ManualPaymentRequest[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CreateManualPaymentResponse {
  info: string;
  request: {
    requestId: string;
    status: RequestStatus;
    numberOfPasses: number;
    passType: ManualPassType;
    amount: number;
    createdAt: string;
  };
}

export interface ApproveRejectResponse {
  info: string;
  request: {
    requestId: string;
    status: RequestStatus;
    processedAt: string;
    processNote?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════

export const CreateManualPaymentSchema = z.object({
  users: z.array(z.object({
    userId: z.string(),
    kyId: z.string(),
    email: z.string().email(),
  })).min(1, "At least one user is required"),
  paymentMethod: z.enum(["UPI", "NETBANKING", "WALLET", "CASH"]),
  amount: z.number().min(0),
  passType: z.enum(["DARBAR", "YATRI", "SWARNIM", "ZONAL_SINGLE", "ZONAL_MULTI"]),
  collegeSlug: z.string().optional(),
  bonafides: z.array(z.string()).optional(),
});

export const ApproveRequestSchema = z.object({
  note: z.string().optional(),
});

export const RejectRequestSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

// ═══════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook to lookup users by KY IDs (bulk)
 * Note: This uses useApiQuery with enabled=false so it's manually triggered
 */
export function useBulkUserLookup(kyIds: string[]) {
  const queryParams = new URLSearchParams();
  if (kyIds.length > 0) {
    queryParams.set("kyIds", kyIds.join(","));
  }

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<BulkUserLookupResponse>({
      queryKey: ["bulk-user-lookup", kyIds.join(",")],
      url: `/admin/users/bulk-lookup?${queryParams.toString()}`,
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        enabled: kyIds.length > 0, // Only fetch when we have IDs
        staleTime: 1000 * 60, // 1 minute
        retry: false,
      },
    });

  // Transform the response to the format the UI expects
  const users = (data?.results ?? [])
    .filter((r) => r.found && r.user)
    .map((r) => ({
      userId: r.user!.id,
      kyId: r.user!.kyId,
      email: r.user!.email,
      name: r.user!.name,
      phone: r.user!.phone,
      college: r.user!.college,
      isPaidUser: r.user!.isPaidUser,
    }));

  const notFound = data?.summary?.notFoundKyIds ?? [];

  return {
    users,
    notFound,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook to fetch all manual payment requests (MASTER_ADMIN only)
 */
interface UseManualPaymentRequestsParams {
  status?: RequestStatus;
  page?: number;
  limit?: number;
}

export function useManualPaymentRequests(params?: UseManualPaymentRequestsParams) {
  const { status, page = 1, limit = 20 } = params ?? {};
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (status) queryParams.set("status", status);
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<ManualPaymentRequestsResponse>({
      queryKey: ["manual-payment-requests", `status:${status ?? "all"}`, `page:${page}`, `limit:${limit}`],
      url: `/admin/manual-payment/requests?${queryParams.toString()}`,
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        staleTime: 1000 * 30, // 30 seconds - refresh frequently
        gcTime: 1000 * 60 * 5, // 5 minutes cache
        retry: (failureCount, error: any) => {
          const statusCode = error?.response?.status ?? error?.status;
          // Don't retry on any 4xx or 5xx errors
          if (statusCode >= 400) return false;
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff: 1s, 2s, 4s... max 10s
      },
    });

  const refetchRequests = useCallback(() => refetch(), [refetch]);

  return {
    requests: data?.requests ?? [],
    pagination: data?.pagination ?? { page: 1, limit: 20, totalCount: 0, totalPages: 0, hasMore: false },
    isLoading,
    isError,
    error,
    refetch: refetchRequests,
  };
}

/**
 * Hook to fetch current admin's own manual payment requests
 */
export function useMyPaymentRequests(params?: UseManualPaymentRequestsParams) {
  const { status, page = 1, limit = 20 } = params ?? {};
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (status) queryParams.set("status", status);
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));

  const { data, isLoading, isError, error, refetch } =
    useApiQuery<ManualPaymentRequestsResponse>({
      queryKey: ["my-payment-requests", `status:${status ?? "all"}`, `page:${page}`, `limit:${limit}`],
      url: `/admin/manual-payment/my-requests?${queryParams.toString()}`,
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      queryOptions: {
        staleTime: 1000 * 30, // 30 seconds - refresh frequently
        gcTime: 1000 * 60 * 5, // 5 minutes cache
        retry: (failureCount, error: any) => {
          const statusCode = error?.response?.status ?? error?.status;
          // Don't retry on any 4xx or 5xx errors
          if (statusCode >= 400) return false;
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff: 1s, 2s, 4s... max 10s
      },
    });

  const refetchRequests = useCallback(() => refetch(), [refetch]);

  return {
    requests: data?.requests ?? [],
    pagination: data?.pagination ?? { page: 1, limit: 20, totalCount: 0, totalPages: 0, hasMore: false },
    isLoading,
    isError,
    error,
    refetch: refetchRequests,
  };
}

/**
 * Hook to create a new manual payment request
 */
interface UseCreateManualPaymentRequestOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

export function useCreateManualPaymentRequest(options?: UseCreateManualPaymentRequestOptions) {
  const { mutate, isPending, isSuccess, isError, error, reset, data } =
    useApiMutation<CreateManualPaymentResponse>({
      url: "/admin/manual-payment/request",
      method: "post",
      baseURL: BACKEND_URL,
      featureConfig: sharedFeatureConfig,
      bodyValidator: { bodySchema: CreateManualPaymentSchema },
      invalidateQueryName: "manual-payment-requests",
      toastConfig: {
        successConfig: {
          customToast: options?.successToast ?? (
            <SuccessToast
              title="Request created"
              description="Manual payment request has been submitted for approval"
            />
          ),
        },
        errorConfig: {
          customToast: options?.errorToast ?? (
            <ErrorToast
              title="Failed to create request"
              description="Please check your input and try again"
            />
          ),
        },
      },
      mutationOptions: {
        retry: false,
      },
    });

  const createRequest = useCallback(
    (requestData: z.infer<typeof CreateManualPaymentSchema>, mutationOptions?: Parameters<typeof mutate>[1]) =>
      mutate(requestData, mutationOptions),
    [mutate]
  );

  return {
    createRequest,
    createdRequest: data?.request,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}

/**
 * Hook to approve a manual payment request (MASTER_ADMIN only)
 */
interface UseApproveManualPaymentOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

export function useApproveManualPayment(options?: UseApproveManualPaymentOptions) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const approveRequest = useCallback(
    async (requestId: string, note?: string, callbacks?: { onSuccess?: () => void; onError?: (err: Error) => void }) => {
      setIsPending(true);
      setIsError(false);
      setError(null);
      
      try {
        // Get access token from localStorage (same as wire-axon does)
        const accessToken = typeof window !== "undefined" 
          ? localStorage.getItem("admin_access_token") 
          : null;
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
        
        const response = await fetch(`${BACKEND_URL}/admin/manual-payment/requests/${requestId}/approve`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ note }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.info || errorData.message || "Failed to approve request");
        }
        
        setIsSuccess(true);
        callbacks?.onSuccess?.();
      } catch (err) {
        setIsError(true);
        setError(err as Error);
        callbacks?.onError?.(err as Error);
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsPending(false);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
  }, []);

  return {
    approveRequest,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}

/**
 * Hook to reject a manual payment request (MASTER_ADMIN only)
 */
interface UseRejectManualPaymentOptions {
  successToast?: React.ReactElement;
  errorToast?: React.ReactElement;
}

export function useRejectManualPayment(options?: UseRejectManualPaymentOptions) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const rejectRequest = useCallback(
    async (requestId: string, reason: string, callbacks?: { onSuccess?: () => void; onError?: (err: Error) => void }) => {
      setIsPending(true);
      setIsError(false);
      setError(null);
      
      try {
        // Get access token from localStorage (same as wire-axon does)
        const accessToken = typeof window !== "undefined" 
          ? localStorage.getItem("admin_access_token") 
          : null;
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
        
        const response = await fetch(`${BACKEND_URL}/admin/manual-payment/requests/${requestId}/reject`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ reason }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.info || errorData.message || "Failed to reject request");
        }
        
        setIsSuccess(true);
        callbacks?.onSuccess?.();
      } catch (err) {
        setIsError(true);
        setError(err as Error);
        callbacks?.onError?.(err as Error);
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsPending(false);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
  }, []);

  return {
    rejectRequest,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}

// ═══════════════════════════════════════════════════════════════════
// PRESIGNED URL HOOK
// ═══════════════════════════════════════════════════════════════════

interface PresignedUpload {
  filename: string;
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

interface GetPresignedUrlsResponse {
  info: string;
  uploads: PresignedUpload[];
}

/**
 * Get presigned URLs for uploading files to R2
 */
export async function getPresignedUploadUrls(
  files: Array<{ filename: string; contentType: string }>,
): Promise<PresignedUpload[]> {
  const accessToken = typeof window !== "undefined" 
    ? localStorage.getItem("admin_access_token") 
    : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  const response = await fetch(`${BACKEND_URL}/admin/uploads/presign`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ files }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.info || errorData.message || "Failed to get presigned URLs");
  }
  
  const data: GetPresignedUrlsResponse = await response.json();
  return data.uploads;
}

/**
 * Upload a file to R2 using a presigned URL
 */
export async function uploadFileToR2(file: File, uploadUrl: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload ${file.name}: ${response.statusText}`);
  }
}

/**
 * Upload multiple files to R2 and return their keys
 */
export async function uploadFilesToR2(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  
  // Get presigned URLs for all files
  const presignedUrls = await getPresignedUploadUrls(
    files.map((f) => ({ filename: f.name, contentType: f.type })),
  );
  
  // Upload each file
  const uploadPromises = files.map((file, index) => {
    const presigned = presignedUrls[index];
    return uploadFileToR2(file, presigned.uploadUrl).then(() => presigned.key);
  });
  
  return Promise.all(uploadPromises);
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const MANUAL_PASS_TYPES = {
  YATRI: { 
    name: "Yatri Pass", 
    benefits: "No add-ons", 
    description: "Standard festival pass with event access only",
    isZonal: false 
  },
  DARBAR: { 
    name: "Darbar Pass", 
    benefits: "Accommodation", 
    description: "Premium pass with accommodation included",
    isZonal: false 
  },
  SWARNIM: { 
    name: "Swarnim Pass", 
    benefits: "Food + Accommodation", 
    description: "Gold tier pass with food and accommodation",
    isZonal: false 
  },
  ZONAL_SINGLE: { 
    name: "Zonal Single Event", 
    benefits: "1 event access", 
    description: "Access to 1 event at zonal college",
    isZonal: true 
  },
  ZONAL_MULTI: { 
    name: "Zonal Multi Event", 
    benefits: "Unlimited events", 
    description: "Unlimited event access at zonal college",
    isZonal: true 
  },
} as const;

export const PAYMENT_METHODS = {
  UPI: "UPI",
  NETBANKING: "Net Banking",
  WALLET: "Wallet",
  CASH: "Cash",
} as const;

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};
