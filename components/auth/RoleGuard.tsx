"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession, type RoleLevel } from "@/lib/auth";
import { FullPageLoader } from "@/components/ui/Loader";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface RoleGuardProps {
  children: ReactNode;
  /** Roles that are allowed to access this route */
  allowedRoles: RoleLevel[];
  /** Custom redirect path if unauthorized (defaults to /) */
  redirectTo?: string;
}

// ═══════════════════════════════════════════════════════════════════
// RoleGuard
//
// Protects routes that require specific admin roles.
// Should be used INSIDE AuthGuard (user must be authenticated first).
//
// Behaviour:
// 1. Loading → Show loader
// 2. Role allowed → Render children
// 3. Role not allowed → Redirect to redirectTo (default: /)
//
// Usage:
// <AuthGuard>
//   <RoleGuard allowedRoles={["MASTER_ADMIN", "MANAGER"]}>
//     <ProtectedContent />
//   </RoleGuard>
// </AuthGuard>
// ═══════════════════════════════════════════════════════════════════

export function RoleGuard({ children, allowedRoles, redirectTo = "/" }: RoleGuardProps) {
  const { session, isLoading, isAuthenticated } = useAdminSession();
  const router = useRouter();

  const userRole = session?.role;
  const hasRequiredRole = userRole ? allowedRoles.includes(userRole) : false;

  useEffect(() => {
    // Only check role after loading is complete and user is authenticated
    if (!isLoading && isAuthenticated && !hasRequiredRole) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, redirectTo, router]);

  // Still loading session
  if (isLoading) {
    return <FullPageLoader text="Checking permissions..." />;
  }

  // User doesn't have required role — show loader while redirect happens
  if (!hasRequiredRole) {
    return <FullPageLoader text="Insufficient permissions..." />;
  }

  // Has required role — render protected content
  return <>{children}</>;
}

// ═══════════════════════════════════════════════════════════════════
// CONVENIENCE GUARDS
// Pre-configured guards for common role combinations
// ═══════════════════════════════════════════════════════════════════

/** Only MASTER_ADMIN can access */
export function MasterAdminGuard({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={["MASTER_ADMIN"]}>{children}</RoleGuard>;
}

/** MASTER_ADMIN and MANAGER can access */
export function ManagerGuard({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={["MASTER_ADMIN", "MANAGER"]}>{children}</RoleGuard>;
}
