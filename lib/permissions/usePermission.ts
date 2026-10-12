import { useAdminSession } from "@/lib/auth";
import {
  hasPermission,
  meetsMinRole,
  getPermissions,
  type Permission,
  PERMISSION_MIN_ROLE,
  PERMISSION_LABELS,
} from "./permissions.config";
import type { RoleLevel } from "@/lib/auth";

// ═══════════════════════════════════════════════════════════════════
// USE PERMISSION HOOK
//
// Provides permission checking utilities based on current user's role.
// ═══════════════════════════════════════════════════════════════════

export function usePermission() {
  const { session } = useAdminSession();
  const role = session?.role;

  return {
    /** Current user's role */
    role,

    /** Check if user has a specific permission */
    can: (permission: Permission): boolean => hasPermission(role, permission),

    /** Check if user meets minimum role requirement */
    meetsMinRole: (minRole: RoleLevel): boolean => meetsMinRole(role, minRole),

    /** Get all permissions for current user */
    permissions: getPermissions(role),

    /** Check multiple permissions (returns true if ALL are met) */
    canAll: (...permissions: Permission[]): boolean =>
      permissions.every((p) => hasPermission(role, p)),

    /** Check multiple permissions (returns true if ANY are met) */
    canAny: (...permissions: Permission[]): boolean =>
      permissions.some((p) => hasPermission(role, p)),

    /** Get the minimum role required for a permission */
    getMinRole: (permission: Permission): RoleLevel => PERMISSION_MIN_ROLE[permission],

    /** Get human-readable label for a permission */
    getLabel: (permission: Permission): string => PERMISSION_LABELS[permission],
  };
}

export type { Permission };
export { PERMISSION_LABELS, PERMISSION_MIN_ROLE };
