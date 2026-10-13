"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermission, type Permission, PERMISSION_MIN_ROLE } from "@/lib/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";
import { ROLE_DISPLAY_NAMES } from "./LockedOverlay";

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
