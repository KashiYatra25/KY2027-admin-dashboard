"use client";

import { useCallback } from "react";
import { useApiQuery, useApiMutation } from "wire-axon/hooks";
import { BACKEND_URL, sharedFeatureConfig } from "@/lib/api/constants";
import { SuccessToast, ErrorToast } from "@/components/ui/toasts";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface Venue {
  _id: string;
  slug: string;
  name: string;
  label: string;
  tone: "blue" | "red" | "green" | "white" | "text";
  large?: boolean;
  x: number;
  y: number;
  anchorX?: number;
  anchorY?: number;
  clickable: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FestDay {
  _id: string;
  dayNumber: number;
  date: string;
  displayDate: string;
  name?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEntry {
  _id: string;
  eventSlug: string;
  categorySlug: string;
  venueId: Venue | string;
  venueSlug: string;
  day: number;
  startTime?: string;
  endTime?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface VenuesResponse {
  info: string;
  venues: Venue[];
  count: number;
}

interface FestDaysResponse {
  info: string;
  festDays: FestDay[];
  count: number;
}

interface ScheduleEntriesResponse {
  info: string;
  entries: ScheduleEntry[];
  count: number;
}

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════

const LABEL_TONES = ["blue", "red", "green", "white", "text"] as const;

export const CreateVenueSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(100),
  tone: z.enum(LABEL_TONES).default("blue"),
  large: z.boolean().optional(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  anchorX: z.number().min(0).max(100).optional(),
  anchorY: z.number().min(0).max(100).optional(),
  clickable: z.boolean().default(true),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const UpdateVenueSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  label: z.string().min(1).max(100).optional(),
  tone: z.enum(LABEL_TONES).optional(),
  large: z.boolean().optional(),
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
  anchorX: z.number().min(0).max(100).nullable().optional(),
  anchorY: z.number().min(0).max(100).nullable().optional(),
  clickable: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const CreateFestDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  date: z.string(),
  displayDate: z.string().min(1).max(20),
  name: z.string().max(50).optional(),
  active: z.boolean().default(true),
});

export const UpdateFestDaySchema = z.object({
  dayNumber: z.number().int().min(1).optional(),
  date: z.string().optional(),
  displayDate: z.string().min(1).max(20).optional(),
  name: z.string().max(50).nullable().optional(),
  active: z.boolean().optional(),
});

const EVENT_CATEGORIES = [
  "NATRAJ", "CROSSWINDZ", "BANDISH", "ABHINAY", "MIRAGE",
  "TOOLIKA", "ENQUIZTA", "SAMWAAD", "ZAIKA",
] as const;

export const CreateScheduleEntrySchema = z.object({
  eventSlug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  categorySlug: z.enum(EVENT_CATEGORIES),
  venueSlug: z.string().min(1),
  day: z.number().int().min(1),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const UpdateScheduleEntrySchema = z.object({
  eventSlug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  categorySlug: z.enum(EVENT_CATEGORIES).optional(),
  venueSlug: z.string().min(1).optional(),
  day: z.number().int().min(1).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable().optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// ═══════════════════════════════════════════════════════════════════
// VENUE HOOKS
// ═══════════════════════════════════════════════════════════════════

export function useVenues() {
  const { data, isLoading, isError, error, refetch } = useApiQuery<VenuesResponse>({
    queryKey: ["admin-venues"],
    url: "/admin/schedule/venues",
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

  const refetchVenues = useCallback(() => refetch(), [refetch]);

  return {
    venues: data?.venues ?? [],
    count: data?.count ?? 0,
    isLoading,
    isError,
    error,
    refetch: refetchVenues,
  };
}

export function useCreateVenue() {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ venue: Venue }>({
    url: "/admin/schedule/venues",
    method: "post",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: CreateVenueSchema },
    invalidateQueryName: "admin-venues",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Venue created" description="The venue has been added successfully" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to create venue" description="Please check the details and try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const createVenue = useCallback(
    (data: z.infer<typeof CreateVenueSchema>, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return { createVenue, isPending, isSuccess, isError, error, reset };
}

export function useUpdateVenue(venueId: string) {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ venue: Venue }>({
    url: `/admin/schedule/venues/${venueId}`,
    method: "patch",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: UpdateVenueSchema },
    invalidateQueryName: "admin-venues",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Venue updated" description="Changes have been saved" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to update venue" description="Please try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const updateVenue = useCallback(
    (data: z.infer<typeof UpdateVenueSchema>, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return { updateVenue, isPending, isSuccess, isError, error, reset };
}

export function useDeleteVenue(venueId: string) {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ deletedVenueId: string }>({
    url: `/admin/schedule/venues/${venueId}`,
    method: "delete",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: z.object({}) },
    invalidateQueryName: "admin-venues",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Venue deleted" description="The venue has been removed" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to delete venue" description="Please try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const deleteVenue = useCallback(
    (options?: Parameters<typeof mutate>[1]) => mutate({}, options),
    [mutate]
  );

  return { deleteVenue, isPending, isSuccess, isError, error, reset };
}

// ═══════════════════════════════════════════════════════════════════
// FEST DAY HOOKS
// ═══════════════════════════════════════════════════════════════════

export function useFestDays() {
  const { data, isLoading, isError, error, refetch } = useApiQuery<FestDaysResponse>({
    queryKey: ["admin-fest-days"],
    url: "/admin/schedule/fest-days",
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

  const refetchFestDays = useCallback(() => refetch(), [refetch]);

  return {
    festDays: data?.festDays ?? [],
    count: data?.count ?? 0,
    isLoading,
    isError,
    error,
    refetch: refetchFestDays,
  };
}

export function useCreateFestDay() {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ festDay: FestDay }>({
    url: "/admin/schedule/fest-days",
    method: "post",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: CreateFestDaySchema },
    invalidateQueryName: "admin-fest-days",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Fest day created" description="The day has been added successfully" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to create fest day" description="Please check the details and try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const createFestDay = useCallback(
    (data: z.infer<typeof CreateFestDaySchema>, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return { createFestDay, isPending, isSuccess, isError, error, reset };
}

export function useUpdateFestDay(festDayId: string) {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ festDay: FestDay }>({
    url: `/admin/schedule/fest-days/${festDayId}`,
    method: "patch",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: UpdateFestDaySchema },
    invalidateQueryName: "admin-fest-days",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Fest day updated" description="Changes have been saved" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to update fest day" description="Please try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const updateFestDay = useCallback(
    (data: z.infer<typeof UpdateFestDaySchema>, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return { updateFestDay, isPending, isSuccess, isError, error, reset };
}

export function useDeleteFestDay(festDayId: string) {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ deletedFestDayId: string }>({
    url: `/admin/schedule/fest-days/${festDayId}`,
    method: "delete",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: z.object({}) },
    invalidateQueryName: "admin-fest-days",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Fest day deleted" description="The day has been removed" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to delete fest day" description="Please try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const deleteFestDay = useCallback(
    (options?: Parameters<typeof mutate>[1]) => mutate({}, options),
    [mutate]
  );

  return { deleteFestDay, isPending, isSuccess, isError, error, reset };
}

// ═══════════════════════════════════════════════════════════════════
// SCHEDULE ENTRY HOOKS
// ═══════════════════════════════════════════════════════════════════

export function useScheduleEntries() {
  const { data, isLoading, isError, error, refetch } = useApiQuery<ScheduleEntriesResponse>({
    queryKey: ["admin-schedule-entries"],
    url: "/admin/schedule/entries",
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

  const refetchEntries = useCallback(() => refetch(), [refetch]);

  return {
    entries: data?.entries ?? [],
    count: data?.count ?? 0,
    isLoading,
    isError,
    error,
    refetch: refetchEntries,
  };
}

export function useCreateScheduleEntry() {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ entry: ScheduleEntry }>({
    url: "/admin/schedule/entries",
    method: "post",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: CreateScheduleEntrySchema },
    invalidateQueryName: "admin-schedule-entries",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Schedule entry created" description="The event has been scheduled successfully" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to create schedule entry" description="Please check the details and try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const createEntry = useCallback(
    (data: z.infer<typeof CreateScheduleEntrySchema>, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return { createEntry, isPending, isSuccess, isError, error, reset };
}

export function useUpdateScheduleEntry(entryId: string) {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ entry: ScheduleEntry }>({
    url: `/admin/schedule/entries/${entryId}`,
    method: "patch",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: UpdateScheduleEntrySchema },
    invalidateQueryName: "admin-schedule-entries",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Schedule entry updated" description="Changes have been saved" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to update schedule entry" description="Please try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const updateEntry = useCallback(
    (data: z.infer<typeof UpdateScheduleEntrySchema>, options?: Parameters<typeof mutate>[1]) => mutate(data, options),
    [mutate]
  );

  return { updateEntry, isPending, isSuccess, isError, error, reset };
}

export function useDeleteScheduleEntry(entryId: string) {
  const { mutate, isPending, isSuccess, isError, error, reset } = useApiMutation<{ deletedEntryId: string }>({
    url: `/admin/schedule/entries/${entryId}`,
    method: "delete",
    baseURL: BACKEND_URL,
    featureConfig: sharedFeatureConfig,
    bodyValidator: { bodySchema: z.object({}) },
    invalidateQueryName: "admin-schedule-entries",
    toastConfig: {
      successConfig: { customToast: <SuccessToast title="Schedule entry deleted" description="The entry has been removed" /> },
      errorConfig: { customToast: <ErrorToast title="Failed to delete schedule entry" description="Please try again" /> },
    },
    mutationOptions: { 
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 401 || status === 403 || status === 429) return false;
        return failureCount < 3;
      },
    },
  });

  const deleteEntry = useCallback(
    (options?: Parameters<typeof mutate>[1]) => mutate({}, options),
    [mutate]
  );

  return { deleteEntry, isPending, isSuccess, isError, error, reset };
}
