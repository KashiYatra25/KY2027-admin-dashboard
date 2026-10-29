import type { RoleLevel } from "@/lib/auth";

// ═══════════════════════════════════════════════════════════════════
// PERMISSIONS CONFIGURATION
//
// Defines which roles can access which features.
// MASTER_ADMIN has all permissions.
// MANAGER has most permissions except user management.
// OPERATOR has read-only access to most features.
// ═══════════════════════════════════════════════════════════════════

export type Permission =
  | "view_users"
  | "manage_users"
  | "view_admin_users"
  | "manage_admin_users"
  | "view_ca_applications"
  | "manage_ca_applications"
  | "view_partners"
  | "manage_partners"
  | "view_settings"
  | "manage_settings"
  | "view_manual_payments"
  | "create_manual_payments"
  | "process_manual_payments";

/**
 * Role hierarchy (higher = more permissions)
 */
export const ROLE_HIERARCHY: Record<RoleLevel, number> = {
  MASTER_ADMIN: 3,
  MANAGER: 2,
  OPERATOR: 1,
};

/**
 * Permissions matrix - which roles have which permissions
 */
export const ROLE_PERMISSIONS: Record<RoleLevel, Permission[]> = {
  MASTER_ADMIN: [
    "view_users",
    "manage_users",
    "view_admin_users",
    "manage_admin_users",
    "view_ca_applications",
    "manage_ca_applications",
    "view_partners",
    "manage_partners",
    "view_settings",
    "manage_settings",
    "view_manual_payments",
    "create_manual_payments",
    "process_manual_payments",
  ],
  MANAGER: [
    "view_users",
    "manage_users",
    "view_admin_users",
    "view_ca_applications",
    "manage_ca_applications",
    "view_partners",
    "manage_partners",
    "view_settings",
    "view_manual_payments",
    "create_manual_payments",
  ],
  OPERATOR: [
    "view_users",
    "view_settings",
    "view_manual_payments",
    "create_manual_payments",
  ],
};

/**
 * Human-readable permission descriptions
 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  view_users: "View users",
  manage_users: "Suspend/promote users",
  view_admin_users: "View admin users",
  manage_admin_users: "Manage admin users",
  view_ca_applications: "View CA applications",
  manage_ca_applications: "Approve/reject CA applications",
  view_partners: "View sponsors & partners",
  manage_partners: "Create/edit/delete partners",
  view_settings: "View settings",
  manage_settings: "Modify settings",
  view_manual_payments: "View manual payment requests",
  create_manual_payments: "Create manual payment requests",
  process_manual_payments: "Approve/reject manual payment requests",
};

/**
 * Minimum role required for each permission
 */
export const PERMISSION_MIN_ROLE: Record<Permission, RoleLevel> = {
  view_users: "OPERATOR",
  manage_users: "MANAGER",
  view_admin_users: "MANAGER",
  manage_admin_users: "MASTER_ADMIN",
  view_ca_applications: "MANAGER",
  manage_ca_applications: "MANAGER",
  view_partners: "MANAGER",
  manage_partners: "MANAGER",
  view_settings: "OPERATOR",
  manage_settings: "MASTER_ADMIN",
  view_manual_payments: "OPERATOR",
  create_manual_payments: "OPERATOR",
  process_manual_payments: "MASTER_ADMIN",
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: RoleLevel | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role meets minimum role requirement
 */
export function meetsMinRole(role: RoleLevel | undefined, minRole: RoleLevel): boolean {
  if (!role) return false;
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: RoleLevel | undefined): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}
