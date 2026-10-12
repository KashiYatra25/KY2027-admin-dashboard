import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// COUPON REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Body schema for creating a coupon.
 */
export const CreateCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code must be at most 20 characters")
      .toUpperCase()
      .regex(
        /^[A-Z0-9_-]+$/,
        "Coupon code can only contain letters, numbers, underscores, and hyphens"
      ),
    description: z.string().max(500).optional(),
    type: z.enum(["PERCENTAGE", "FIXED"], {
      message: "Type must be either PERCENTAGE or FIXED",
    }),
    value: z.number().positive("Value must be positive"),
    maxUsageCount: z.number().int().positive().optional(),
    maxUsagePerUser: z.number().int().positive().default(1),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    applicablePassIds: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (data.validFrom && data.validUntil) {
        return new Date(data.validUntil) > new Date(data.validFrom);
      }
      return true;
    },
    {
      message: "Valid until date must be after valid from date",
      path: ["validUntil"],
    }
  );

export type CreateCouponSchemaType = z.infer<typeof CreateCouponSchema>;

/**
 * Body schema for updating a coupon.
 * Note: code and type are immutable.
 */
export const UpdateCouponSchema = z
  .object({
    description: z.string().max(500).nullable().optional(),
    value: z.number().positive("Value must be positive").optional(),
    maxUsageCount: z.number().int().positive().nullable().optional(),
    maxUsagePerUser: z.number().int().positive().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().nullable().optional(),
    applicablePassIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided to update" }
  );

export type UpdateCouponSchemaType = z.infer<typeof UpdateCouponSchema>;

/**
 * Body schema for changing coupon status.
 */
export const ChangeCouponStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"], {
    message: "Status must be either ACTIVE or DISABLED",
  }),
});

export type ChangeCouponStatusSchemaType = z.infer<typeof ChangeCouponStatusSchema>;
