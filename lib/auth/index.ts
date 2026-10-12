// ═══════════════════════════════════════════════════════════════════
// ADMIN AUTH — PUBLIC EXPORTS
//
// Session-based auth backed by wire-axon's RefreshTokenStrategy:
// - Access token in localStorage (adminTokenStorage)
// - Refresh token in HttpOnly cookie (auto-refresh on 401)
// ═══════════════════════════════════════════════════════════════════

export {
  AdminSessionProvider,
  useAdminSession,
  adminTokenStorage,
  refreshAdminAccessToken,
  type AdminSession,
  type RoleLevel,
} from "./AdminSessionProvider";
