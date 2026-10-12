// Auth hooks
export { useVerifyAdminCreds } from "./useVerifyAdminCreds";
export { useAdminLogout } from "./useAdminLogout";
export { useRefreshToken } from "./useRefreshToken";
export { useForgotPassword } from "./useForgotPassword";
export { useChangePassword } from "./useChangePassword";

// Admin Users hooks
export { useAdminUsers, useInviteAdmin } from "./useAdminUsers";

// All Users hooks (regular users, not admins)
export { useAllUsers, useUpgradeToAdmin, type RegularUser, type PaginationInfo } from "./useAllUsers";

// CA Application hooks
export { useCAApplications, useApproveCA, useUpdateCAStatus } from "./useCAApplications";

// Coupon hooks
export { useCoupons, useCreateCoupon } from "./useCoupons";

// Schedule hooks
export {
  useVenues,
  useCreateVenue,
  useUpdateVenue,
  useDeleteVenue,
  useFestDays,
  useCreateFestDay,
  useUpdateFestDay,
  useDeleteFestDay,
  useScheduleEntries,
  useCreateScheduleEntry,
  useUpdateScheduleEntry,
  useDeleteScheduleEntry,
  CreateVenueSchema,
  type Venue,
  type FestDay,
  type ScheduleEntry,
} from "./useSchedule";
