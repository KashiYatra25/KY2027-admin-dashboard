// Auth hooks
export { useVerifyAdminCreds } from "./useVerifyAdminCreds";
export { useAdminLogout } from "./useAdminLogout";
export { useRefreshToken } from "./useRefreshToken";
export { useForgotPassword } from "./useForgotPassword";
export { useChangePassword } from "./useChangePassword";

// Admin Users hooks
export { useAdminUsers, useInviteAdmin } from "./useAdminUsers";

// All Users hooks (regular users, not admins)
export { useAllUsers, useUpgradeToAdmin, useChangeAccountStatus, type RegularUser, type PaginationInfo } from "./useAllUsers";

// CA Application hooks
export { useCAApplications, useApproveCA, useUpdateCAStatus } from "./useCAApplications";

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

// Team hooks
export { useTeams, type Team, type TeamsResponse } from "./useTeams";

// Registration hooks
export {
  useRegistrations,
  type Registration,
  type RegistrationsResponse,
  type RegistrationStats,
  type ParticipationType,
  type RegistrationStatus,
} from "./useRegistrations";

// Revenue analytics hooks
export {
  useRevenue,
  type RevenueResponse,
  type RevenueTotals,
  type RevenueByDatePoint,
  type RevenueByPassPoint,
} from "./useRevenue";
