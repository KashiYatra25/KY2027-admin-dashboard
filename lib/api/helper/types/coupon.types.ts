// ═══════════════════════════════════════════════════════════════════
// COUPON TYPES
// ═══════════════════════════════════════════════════════════════════

export type CouponType = "PERCENTAGE" | "FIXED";
export type CouponStatus = "ACTIVE" | "EXPIRED" | "DISABLED";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  maxUsageCount?: number;
  maxUsagePerUser: number;
  currentUsageCount: number;
  validFrom: string;
  validUntil?: string;
  status: CouponStatus;
  applicablePassIds: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  maxUsageCount?: number;
  maxUsagePerUser?: number;
  validFrom?: string;
  validUntil?: string;
  applicablePassIds?: string[];
}

export interface CouponResponse {
  info: string;
  coupon: Coupon;
}

export interface CouponsListResponse {
  info: string;
  coupons: Coupon[];
}
