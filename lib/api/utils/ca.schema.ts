import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// CAMPUS AMBASSADOR REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Body schema for approving / rejecting a CA application.
 * Used as the `bodyValidator` for the useApproveCA mutation.
 */
export const ApproveCASchema = z.object({
  applicationId: z.string().min(1, "applicationId is required"),
  action: z.enum(["ACCEPTED", "REJECTED"]),
  rejectionReason: z.string().min(10, "Rejection reason must be at least 10 characters").optional(),
}).refine(
  (data) => {
    if (data.action === "REJECTED") {
      return !!data.rejectionReason;
    }
    return true;
  },
  {
    message: "Rejection reason is required when rejecting an application",
    path: ["rejectionReason"],
  }
);

export type ApproveCASchemaType = z.infer<typeof ApproveCASchema>;

/**
 * Body schema for updating status of already-processed CA applications.
 * Only ACCEPTED or REJECTED allowed (not PENDING).
 * Used as the `bodyValidator` for the useUpdateCAStatus mutation.
 */
export const UpdateCAStatusSchema = z.object({
  applicationId: z.string().min(1, "applicationId is required"),
  newStatus: z.enum(["ACCEPTED", "REJECTED"]),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters")
    .optional(),
}).refine(
  (data) => {
    if (data.newStatus === "REJECTED") {
      return !!data.reason && data.reason.trim().length >= 10;
    }
    return true;
  },
  {
    message: "Reason is required when changing status to REJECTED (minimum 10 characters)",
    path: ["reason"],
  }
);

export type UpdateCAStatusSchemaType = z.infer<typeof UpdateCAStatusSchema>;
