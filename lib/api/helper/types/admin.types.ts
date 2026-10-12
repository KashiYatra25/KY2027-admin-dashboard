// ═══════════════════════════════════════════════════════════════════
// ADMIN USER TYPES
// ═══════════════════════════════════════════════════════════════════

import type { RoleLevel } from "./auth.types";

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: {
    id: string;
    level: RoleLevel;
  };
  createdAt: string;
}

export interface InviteAdminData {
  targetEmail: string;
  role: "MANAGER" | "OPERATOR";
}

export interface InviteAdminResponse {
  info: string;
  admin: AdminUser;
}

export interface AdminUsersResponse {
  info: string;
  adminUsers: AdminUser[];
  count: number;
}
