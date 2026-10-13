"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, AlertTriangle, Ban } from "lucide-react";
import type { RegularUser } from "@/lib/api/hooks";

// ═══════════════════════════════════════════════════════════════════
// SUSPEND ACCOUNT MODAL
// ═══════════════════════════════════════════════════════════════════

interface SuspendAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RegularUser | null;
  onSuspend: (reason: string) => void;
  isPending: boolean;
}

export function SuspendAccountModal({
  isOpen,
  onClose,
  user,
  onSuspend,
  isPending,
}: SuspendAccountModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters long");
      return;
    }

    onSuspend(reason.trim());
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  const userName =
    user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user.slugName;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle>Suspend Account</CardTitle>
              <CardDescription>This action can be reversed later</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User info */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{userName}</p>
                {user.isFromIITBhu && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 text-xs"
                  >
                    IIT BHU
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {user.college && (
                <p className="text-xs text-muted-foreground">{user.college}</p>
              )}
              {user.kyId && (
                <p className="text-xs text-muted-foreground font-mono">{user.kyId}</p>
              )}
            </div>

            {/* Warning */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  What happens when you suspend?
                </p>
                <ul className="text-xs text-amber-600/80 dark:text-amber-400/80 space-y-0.5 list-disc list-inside">
                  <li>User will be logged out immediately</li>
                  <li>User cannot access their account</li>
                  <li>User will receive an email notification</li>
                  <li>All existing registrations remain intact</li>
                </ul>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for suspension <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Please provide a detailed reason for suspending this account (min 10 characters)..."
                className="min-h-[100px] resize-none"
                disabled={isPending}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <p className="text-xs text-muted-foreground">
                {reason.length}/10 characters minimum
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="flex-1"
                disabled={isPending || reason.trim().length < 10}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suspending...
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
