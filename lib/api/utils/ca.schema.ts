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
