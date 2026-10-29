// Auth hooks
export { useVerifyAdminCreds } from "./useVerifyAdminCreds";
export { useAdminLogout } from "./useAdminLogout";
export { useRefreshToken } from "./useRefreshToken";
export { useForgotPassword } from "./useForgotPassword";
export { useChangePassword } from "./useChangePassword";

// Admin Users hooks
export { useAdminUsers, useInviteAdmin } from "./useAdminUsers";
export { useChangeAdminRole, type ChangeAdminRoleResponse } from "./useChangeAdminRole";
export { useDemoteAdminToUser, type DemoteAdminToUserResponse } from "./useDemoteAdminToUser";

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

// Zonal Registration hooks
export {
  useZonalRegistrations,
  type ZonalRegistration,
  type ZonalRegistrationsResponse,
  type ZonalStats,
  type ZonalPassType,
  type ZonalPaymentStatus,
  type CollegeBreakdown,
} from "./useZonalRegistrations";

// Revenue analytics hooks
export {
  useRevenue,
  type RevenueResponse,
  type RevenueTotals,
  type RevenueByDatePoint,
  type RevenueByPassPoint,
} from "./useRevenue";

// Cache management hooks (MASTER_ADMIN only)
export { useInvalidateCaches } from "./useInvalidateCaches";
export { useInvalidateUserCache } from "./useInvalidateUserCache";
export { useToggleUserPaidStatus } from "./useToggleUserPaidStatus";

// Manual Payments hooks
export {
  useBulkUserLookup,
  useManualPaymentRequests,
  useCreateManualPaymentRequest,
  useApproveManualPayment,
  useRejectManualPayment,
  MANUAL_PASS_TYPES,
  PAYMENT_METHODS,
  REQUEST_STATUS_COLORS,
  type ManualPassType,
  type PaymentMethod,
  type RequestStatus,
  type ManualPaymentRequest,
  type ManualPaymentUser,
  type BulkUserLookupResponse,
} from "./useManualPayments";
