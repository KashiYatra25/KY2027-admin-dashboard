"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Loader2, 
  XCircle, 
  CheckCircle2, 
  Info,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "cn";
import type { CAApplicationStatus } from "@/lib/api/helper/types";

// ═══════════════════════════════════════════════════════════════════
// UPDATE STATUS MODAL
//
// Used to change status of already-processed CA applications.
// Valid transitions:
//   ACCEPTED → REJECTED (requires reason)
//   REJECTED → ACCEPTED (no reason needed)
// ═══════════════════════════════════════════════════════════════════

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: "ACCEPTED" | "REJECTED", reason?: string) => void;
  isLoading?: boolean;
  applicantName?: string;
  currentStatus: CAApplicationStatus;
  referralId?: string;
}

const MIN_CHARS = 10;
const MAX_CHARS = 500;

export function UpdateStatusModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  applicantName,
  currentStatus,
  referralId,
}: UpdateStatusModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Determine the target status (opposite of current)
  const targetStatus = currentStatus === "ACCEPTED" ? "REJECTED" : "ACCEPTED";
  const isChangingToRejected = targetStatus === "REJECTED";

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
      setTouched(false);
    }
  }, [isOpen]);

  const charCount = reason.length;
  const charsRemaining = MIN_CHARS - charCount;
  const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;

  // For approval, no reason needed
  const canSubmit = isChangingToRejected ? isValidLength : true;

  const handleConfirm = () => {
    if (isChangingToRejected) {
      setTouched(true);
      if (reason.trim().length < MIN_CHARS) {
        setError(`Please provide at least ${MIN_CHARS} characters`);
        return;
      }
      if (reason.trim().length > MAX_CHARS) {
        setError(`Reason cannot exceed ${MAX_CHARS} characters`);
        return;
      }
      setError(null);
      onConfirm("REJECTED", reason.trim());
    } else {
      onConfirm("ACCEPTED");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setError(null);
      setTouched(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start gap-4">
            {/* Icon based on action */}
            <div className="relative flex-shrink-0">
              {isChangingToRejected ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                  <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center ring-1 ring-amber-500/30">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                </>
              ) : (
                <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1 pt-1">
              <DialogTitle className="text-lg">Update Application Status</DialogTitle>
              <DialogDescription className="text-sm">
                {applicantName ? (
                  <>
                    Change <span className="font-medium text-foreground">{applicantName}&apos;s</span> status from{" "}
                    <span className={cn(
                      "font-medium",
                      currentStatus === "ACCEPTED" ? "text-emerald-600" : "text-red-600"
                    )}>
                      {currentStatus.toLowerCase()}
                    </span>{" "}
                    to{" "}
                    <span className={cn(
                      "font-medium",
                      targetStatus === "ACCEPTED" ? "text-emerald-600" : "text-red-600"
                    )}>
                      {targetStatus.toLowerCase()}
                    </span>
                  </>
                ) : (
                  `Change application status to ${targetStatus.toLowerCase()}`
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Change Visualization */}
          <div className="flex items-center justify-center gap-3 py-4 px-4 bg-muted/50 rounded-lg">
            <div className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium",
              currentStatus === "ACCEPTED" 
                ? "bg-emerald-500/10 text-emerald-600" 
                : "bg-red-500/10 text-red-600"
            )}>
              {currentStatus}
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium",
              targetStatus === "ACCEPTED" 
                ? "bg-emerald-500/10 text-emerald-600" 
                : "bg-red-500/10 text-red-600"
            )}>
              {targetStatus}
            </div>
          </div>

          {/* Warning for revoking approval */}
          {isChangingToRejected && referralId && (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600 dark:text-amber-400">This will revoke their CA status</p>
                <p className="text-muted-foreground mt-1">
                  Their referral ID <span className="font-mono font-medium">{referralId}</span> will be deactivated. 
                  Users who already registered using this code will keep their registration.
                </p>
              </div>
            </div>
          )}

          {/* Approval encouragement */}
          {!isChangingToRejected && (
            <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-emerald-600 dark:text-emerald-400">Reinstating as Campus Ambassador</p>
                <p className="text-muted-foreground mt-1">
                  A new referral ID will be generated for them. They will receive an email notification with their new referral code.
                </p>
              </div>
            </div>
          )}

          {/* Reason field (only for rejection) */}
          {isChangingToRejected && (
            <div className="space-y-2">
              <Label htmlFor="update-reason" className="text-sm font-medium">
                Reason for status change
                <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="update-reason"
                  placeholder="Provide a reason for changing the status..."
                  value={reason}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setReason(newValue);
                    setTouched(true);
                    if (error && newValue.trim().length >= MIN_CHARS && newValue.trim().length <= MAX_CHARS) {
                      setError(null);
                    }
                  }}
                  onBlur={() => setTouched(true)}
                  aria-invalid={!!error || isOverLimit}
                  className={cn(
                    "min-h-[100px] resize-none pr-4 pb-8 transition-colors",
                    (error || isOverLimit) && "border-red-500 ring-2 ring-red-500/20"
                  )}
                  disabled={isLoading}
                  maxLength={MAX_CHARS + 50}
                />
                
                {/* Character counter */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span
                    className={cn(
                      "text-xs font-medium tabular-nums px-2 py-0.5 rounded-full transition-colors",
                      isOverLimit
                        ? "bg-red-500/15 text-red-500"
                        : isValidLength
                          ? "bg-green-500/15 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              {/* Status message */}
              <div className="flex items-center gap-2 min-h-[20px]">
                {error ? (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                ) : isOverLimit ? (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs font-medium">
                      {charCount - MAX_CHARS} characters over limit
                    </span>
                  </div>
                ) : isValidLength ? (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs font-medium">Ready to submit</span>
                  </div>
                ) : touched ? (
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs font-medium">
                      {charsRemaining} more character{charsRemaining !== 1 ? "s" : ""} needed
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Minimum {MIN_CHARS} characters required
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            variant={isChangingToRejected ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading || !canSubmit}
            className={cn(
              "flex-1 sm:flex-none min-w-[160px] gap-2",
              !isChangingToRejected && "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Change to {targetStatus.toLowerCase()}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
