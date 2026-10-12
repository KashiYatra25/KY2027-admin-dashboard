import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// ADMIN REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Body schema for inviting / converting a user to an admin.
 * Used as the `bodyValidator` for the useInviteAdmin mutation.
 */
export const InviteAdminSchema = z.object({
  targetEmail: z.string().email("A valid email is required"),
  role: z.enum(["MANAGER", "OPERATOR"]),
});

export type InviteAdminSchemaType = z.infer<typeof InviteAdminSchema>;
