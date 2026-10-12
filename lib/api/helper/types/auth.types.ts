// ═══════════════════════════════════════════════════════════════════
// ADMIN AUTH TYPES
// ═══════════════════════════════════════════════════════════════════

export type RoleLevel = "MASTER_ADMIN" | "MANAGER" | "OPERATOR";

/**
 * Admin data returned from backend after authentication
 * 
 * SECURITY NOTE: Backend intentionally does NOT return IDs.
 * - adminId / userId are sensitive internal identifiers
 * - They would be vulnerable to XSS if stored in localStorage
 * - Frontend doesn't need them for display or routing
 * - All authorization happens server-side using JWT claims
 */
export interface AdminAuthData {
  email: string;      // For display in UI (sidebar, welcome message)
  role: RoleLevel;    // For role-based UI rendering (NOT authorization!)
}

/**
 * Alias for AdminAuthData - what we store in localStorage (display only)
 */
export type AdminDisplayData = AdminAuthData;

export interface VerifyAdminCredsResponse {
  info: string;
  admin: AdminAuthData;
  // Access token returned in body for localStorage persistence.
  accessToken: string;
  accessTokenExpiry: number;
  // Note: Refresh token is set as an HttpOnly cookie automatically.
}
