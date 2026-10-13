"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import type { RegularUser } from "@/lib/api/hooks";

// ═══════════════════════════════════════════════════════════════════
// REACTIVATE ACCOUNT MODAL
// ═══════════════════════════════════════════════════════════════════

interface ReactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RegularUser | null;
  onReactivate: (reason: string) => void;
  isPending: boolean;
}

export function ReactivateAccountModal({
  isOpen,
  onClose,
  user,
  onReactivate,
  isPending,
}: ReactivateAccountModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReactivate(reason.trim() || "Account reactivated by admin");
  };

  const handleClose = () => {
    setReason("");
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
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle>Reactivate Account</CardTitle>
              <CardDescription>Restore access to this user's account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User info */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{userName}</p>
                <Badge
                  variant="destructive"
                  className="text-xs"
                >
                  Suspended
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {user.college && (
                <p className="text-xs text-muted-foreground">{user.college}</p>
              )}
              {user.kyId && (
                <p className="text-xs text-muted-foreground font-mono">{user.kyId}</p>
              )}
            </div>

            {/* Info */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  What happens when you reactivate?
                </p>
                <ul className="text-xs text-emerald-600/80 dark:text-emerald-400/80 space-y-0.5 list-disc list-inside">
                  <li>User can log in again</li>
                  <li>Full account access is restored</li>
                  <li>User will receive an email notification</li>
                  <li>All previous data remains intact</li>
                </ul>
              </div>
            </div>

            {/* Reason (optional) */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for reactivation <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optionally provide a reason for reactivating this account..."
                className="min-h-[80px] resize-none"
                disabled={isPending}
              />
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
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reactivate Account
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
