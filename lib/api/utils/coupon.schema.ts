import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// COUPON REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Body schema for creating a coupon.
 * Used as the `bodyValidator` for the useCreateCoupon mutation.
 * Mirrors the CreateCouponData type in helper/types/coupon.types.ts.
 */
export const CreateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("Value must be greater than 0"),
  minPurchaseAmount: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().nonnegative().optional(),
  maxUsageCount: z.number().int().nonnegative().optional(),
  maxUsagePerUser: z.number().int().positive().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  applicablePassIds: z.array(z.string()).optional(),
});

export type CreateCouponSchemaType = z.infer<typeof CreateCouponSchema>;
