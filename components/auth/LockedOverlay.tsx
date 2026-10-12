"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermission, type Permission, PERMISSION_MIN_ROLE } from "@/lib/permissions";
import type { RoleLevel } from "@/lib/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

// ═══════════════════════════════════════════════════════════════════
// LOCKED OVERLAY
//
// Wraps content and shows a lock overlay if user lacks permission.
// Shows tooltip with required role on hover.
// ═══════════════════════════════════════════════════════════════════

const ROLE_DISPLAY_NAMES: Record<RoleLevel, string> = {
  MASTER_ADMIN: "Master Admin",
  MANAGER: "Manager",
  OPERATOR: "Operator",
};

interface LockedOverlayProps {
  /** Permission required to access this content */
  permission: Permission;
  /** Content to wrap */
  children: React.ReactNode;
  /** Additional className for the wrapper */
  className?: string;
  /** Show lock icon in corner (default: true) */
  showLockIcon?: boolean;
  /** Custom message to show in tooltip */
  customMessage?: string;
  /** Disable the blur effect (just show lock icon) */
  noBlur?: boolean;
}

export function LockedOverlay({
  permission,
  children,
  className,
  showLockIcon = true,
  customMessage,
  noBlur = false,
}: LockedOverlayProps) {
  const { can } = usePermission();
  const hasAccess = can(permission);

  if (hasAccess) {
    return <>{children}</>;
  }

  const minRole = PERMISSION_MIN_ROLE[permission];
  const message = customMessage || `Requires ${ROLE_DISPLAY_NAMES[minRole]} role`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn("relative cursor-not-allowed", className)}>
            {/* Content with optional blur */}
            <div
              className={cn(
                "pointer-events-none select-none",
                !noBlur && "blur-[2px] opacity-50"
              )}
            >
              {children}
            </div>

            {/* Lock overlay */}
            {showLockIcon && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-muted/80 backdrop-blur-sm flex items-center justify-center border border-border/50">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="flex items-center gap-2">
          <Lock className="h-3 w-3" />
          <span>{message}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

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

// ═══════════════════════════════════════════════════════════════════
// LOCKED BUTTON
//
// A button that shows lock icon and is disabled if user lacks permission.
// ═══════════════════════════════════════════════════════════════════

type ButtonProps = ComponentProps<typeof Button>;

interface LockedButtonProps extends ButtonProps {
  /** Permission required to enable this button */
  permission: Permission;
  /** Custom message for tooltip */
  customMessage?: string;
}

export function LockedButton({
  permission,
  children,
  customMessage,
  className,
  ...props
}: LockedButtonProps) {
  const { can } = usePermission();
  const hasAccess = can(permission);

  const minRole = PERMISSION_MIN_ROLE[permission];
  const message = customMessage || `Requires ${ROLE_DISPLAY_NAMES[minRole]} role`;

  if (hasAccess) {
    return (
      <Button className={className} {...props}>
        {children}
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button className={cn("gap-2", className)} disabled {...props}>
            <Lock className="h-3 w-3" />
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="flex items-center gap-2">
          <Lock className="h-3 w-3" />
          <span>{message}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
