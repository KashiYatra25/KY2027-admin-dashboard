// ═══════════════════════════════════════════════════════════════════
// ZONAL REGISTRATION TYPES
// ═══════════════════════════════════════════════════════════════════

export type ZonalPassType = "SINGLE_EVENT" | "MULTI_EVENT";
export type ZonalPaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type ZonalPaymentSource = "konfhub" | "razorpay" | "manual" | "complimentary";

export interface ZonalPass {
  id?: string;
  passType: ZonalPassType;
  amount: number;
  paymentStatus: ZonalPaymentStatus;
  paymentId?: string;
  paymentSource?: ZonalPaymentSource;
  ticketUrl?: string;
  invoiceUrl?: string;
  purchasedAt?: Date;
}

export interface ZonalUser {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  googleAvatarUrl?: string;
  candidatePhotoUrl?: string;
  college?: string;
  isPaidUser?: boolean;
  kyId?: string;
  phone?: string;
}

export interface ZonalRegistration {
  id: string;
  userId: string;
  collegeSlug: string;
  eventLimit: number;
  registeredEventsCount: number;
  registeredEvents: string[];
  passes: ZonalPass[];
  totalPasses: number;
  completedPasses: number;
  totalAmount: number;
  latestPassType: ZonalPassType | null;
  latestPaymentStatus: ZonalPaymentStatus | null;
  user: ZonalUser | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZonalStats {
  totalPasses: number;
  uniqueUsers: number;
  singleEvent: number;
  multiEvent: number;
  completed: number;
  pending: number;
  totalRegisteredEvents: number;
  totalRevenue: number;
  avgAmount: number;
}

export interface CollegeBreakdown {
  collegeSlug: string;
  passCount: number;
  registeredEvents: number;
}

export interface ZonalPaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ZonalRegistrationsResponse {
  info: string;
  registrations: ZonalRegistration[];
  pagination: ZonalPaginationInfo;
  stats: ZonalStats;
  collegeBreakdown: CollegeBreakdown[];
}
