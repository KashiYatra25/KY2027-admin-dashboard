"use client";

import { usePermission, type Permission } from "@/lib/permissions";

// ═══════════════════════════════════════════════════════════════════
// PERMISSION GATE
//
// Conditionally renders children based on permission.
// Shows fallback if user lacks permission.
// ═══════════════════════════════════════════════════════════════════

interface PermissionGateProps {
  /** Permission required to render children */
  permission: Permission;
  /** Content to render if user has permission */
  children: React.ReactNode;
  /** Content to render if user lacks permission (optional) */
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermission();

  if (can(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
