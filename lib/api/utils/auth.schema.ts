import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
// ADMIN AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════════════

export const VerifyAdminCredsSchema = z.object({
  email: z.string().email("Invalid email address"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
  loginToken: z.string().min(32, "Invalid login token"),
});

export type VerifyAdminCredsSchemaType = z.infer<typeof VerifyAdminCredsSchema>;
