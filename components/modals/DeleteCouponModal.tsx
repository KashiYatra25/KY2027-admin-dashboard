"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import type { Coupon } from "@/lib/api/helper/types";

interface DeleteCouponModalProps {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteCouponModal({ isOpen, coupon, onClose, onConfirm, isPending }: DeleteCouponModalProps) {
  if (!isOpen || !coupon) return null;

  const hasUsage = coupon.currentUsageCount > 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
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
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle>Delete Coupon</CardTitle>
              <CardDescription>This action cannot be undone</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasUsage ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Cannot delete this coupon
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This coupon has been used {coupon.currentUsageCount} time(s) and cannot be deleted to preserve the audit trail.
                    Consider disabling it instead.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete the coupon{" "}
                <code className="font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">{coupon.code}</code>?
              </p>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-medium">{coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₹${coupon.value}`}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium">{coupon.status}</span>
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            {!hasUsage && (
              <Button 
                type="button" 
                variant="destructive" 
                className="flex-1" 
                onClick={onConfirm}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Coupon
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
