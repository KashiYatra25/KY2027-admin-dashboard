"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/lib/auth";
import { FullPageLoader } from "@/components/ui/Loader";
import { SuspendedOverlay } from "./SuspendedOverlay";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface AuthGuardProps {
  children: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════
// AuthGuard
//
// Protects routes that require an authenticated admin.
//
// Behaviour:
// 1. Loading → Show loader
// 2. Authenticated → Render children
// 3. Suspended → Show SuspendedOverlay (blur with lock)
// 4. Expired or No Access → Redirect to /login
// ═══════════════════════════════════════════════════════════════════

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isExpired, hasNoAccess, isSuspended } = useAdminSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if expired or no access
    if (isExpired || hasNoAccess) {
      router.replace("/login");
    }
  }, [isExpired, hasNoAccess, router]);

  // Still validating session with server
  if (isLoading) {
    return <FullPageLoader text="Validating session..." />;
  }

  // Account is suspended - show suspended overlay
  if (isSuspended) {
    return (
      <>
        {/* Render children blurred behind the overlay */}
        <div className="pointer-events-none select-none blur-sm opacity-50">
          {children}
        </div>
        <SuspendedOverlay />
      </>
    );
  }

  // Not authenticated — show loader while the redirect effect runs
  if (!isAuthenticated) {
    return <FullPageLoader text="Redirecting to login..." />;
  }

  // Authenticated — render protected content
  return <>{children}</>;
}
