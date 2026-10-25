"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, DollarSign, AlertCircle } from "lucide-react";
import type { RegularUser } from "@/lib/api/hooks";

// ═══════════════════════════════════════════════════════════════════
// TOGGLE PAID STATUS MODAL
// ═══════════════════════════════════════════════════════════════════

interface TogglePaidStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RegularUser | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function TogglePaidStatusModal({
  isOpen,
  onClose,
  user,
  onConfirm,
  isPending,
}: TogglePaidStatusModalProps) {
  if (!isOpen || !user) return null;

  const userName =
    user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user.slugName;

  const isCurrentlyPaid = user.isPaidUser;
  const newStatus = !isCurrentlyPaid;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                newStatus
                  ? "bg-green-500/10"
                  : "bg-amber-500/10"
              }`}
            >
              <DollarSign
                className={`h-5 w-5 ${
                  newStatus
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
            </div>
            <div>
              <CardTitle>
                {newStatus ? "Mark as Paid" : "Mark as Unpaid"}
              </CardTitle>
              <CardDescription>
                {newStatus
                  ? "Grant paid access to this user"
                  : "Revoke paid access from this user"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* User info */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{userName}</p>
              <div className="flex gap-2">
                {user.isFromIITBhu && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 text-xs"
                  >
                    IIT BHU
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={`border-0 text-xs ${
                    isCurrentlyPaid
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {isCurrentlyPaid ? "Currently Paid" : "Not Paid"}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.kyId && (
              <p className="text-xs text-muted-foreground font-mono">{user.kyId}</p>
            )}
          </div>

          {/* Info box */}
          <div
            className={`p-3 rounded-lg border flex gap-3 ${
              newStatus
                ? "bg-green-500/10 border-green-500/20"
                : "bg-amber-500/10 border-amber-500/20"
            }`}
          >
            <AlertCircle
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                newStatus
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            />
            <div className="space-y-1">
              <p
                className={`text-sm font-medium ${
                  newStatus
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {newStatus ? "What happens?" : "Warning"}
              </p>
              <ul
                className={`text-xs space-y-0.5 list-disc list-inside ${
                  newStatus
                    ? "text-green-600/80 dark:text-green-400/80"
                    : "text-amber-600/80 dark:text-amber-400/80"
                }`}
              >
                {newStatus ? (
                  <>
                    <li>User will gain access to paid features</li>
                    <li>No payment record will be created</li>
                    <li>Use for offline payments or VIP access</li>
                  </>
                ) : (
                  <>
                    <li>User will lose access to paid features</li>
                    <li>Existing registrations remain intact</li>
                    <li>User can still purchase a pass later</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={`flex-1 ${
                newStatus
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
              onClick={onConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  {newStatus ? "Mark as Paid" : "Mark as Unpaid"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
