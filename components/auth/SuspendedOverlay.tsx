"use client";

import { Lock, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminSession } from "@/lib/auth";
import { useAdminLogout } from "@/lib/api/hooks";

// ═══════════════════════════════════════════════════════════════════
// SUSPENDED OVERLAY
//
// Full-page overlay shown when an admin's account is suspended.
// Blurs the background and shows a lock icon with suspension message.
// User can only logout from this state.
// ═══════════════════════════════════════════════════════════════════

export function SuspendedOverlay() {
  const { session } = useAdminSession();
  const { logout, isPending } = useAdminLogout();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 p-8 max-w-md text-center">
        {/* Lock icon */}
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30">
          <Lock className="h-10 w-10 text-red-500" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Account Suspended
          </h1>
          <p className="text-muted-foreground">
            Your admin account has been suspended. You no longer have access to the admin dashboard.
          </p>
        </div>

        {/* User info */}
        {session && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{session.email}</span>
          </div>
        )}

        {/* Info box */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <strong>What does this mean?</strong>
          </p>
          <ul className="mt-2 text-sm text-amber-600/80 dark:text-amber-400/80 space-y-1 list-disc list-inside">
            <li>You cannot access any admin features</li>
            <li>Your session will be logged out</li>
            <li>Contact your administrator to restore access</li>
          </ul>
        </div>

        {/* Logout button */}
        <Button
          variant="outline"
          onClick={() => logout()}
          disabled={isPending}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
