"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { AlertTriangle, Loader2, XCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════

const MIN_CHARS = 10;
const MAX_CHARS = 500;

const RejectionFormSchema = z.object({
  reason: z
    .string()
    .min(MIN_CHARS, `Please provide at least ${MIN_CHARS} characters`)
    .max(MAX_CHARS, `Reason cannot exceed ${MAX_CHARS} characters`),
});

type RejectionFormData = z.infer<typeof RejectionFormSchema>;

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  applicantName?: string;
}

// Common rejection reasons for quick selection
const QUICK_REASONS = [
  "Incomplete application details",
  "Did not meet eligibility criteria",
  "Insufficient social media presence",
  "Duplicate application submitted",
];

export function RejectionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  applicantName,
}: RejectionModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, touchedFields },
  } = useForm<RejectionFormData>({
    resolver: zodResolver(RejectionFormSchema),
    defaultValues: {
      reason: "",
    },
    mode: "onChange",
  });

  const reason = watch("reason");
  const charCount = reason?.length || 0;
  const charsRemaining = MIN_CHARS - charCount;
  const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;
  const touched = touchedFields.reason;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({ reason: "" });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: RejectionFormData) => {
    onConfirm(data.reason.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      reset({ reason: "" });
      onClose();
    }
  };

  const handleQuickReason = (quickReason: string) => {
    setValue("reason", quickReason, { shouldValidate: true, shouldTouch: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {/* Header with warning styling */}
        <DialogHeader>
          <div className="flex items-start gap-4">
            {/* Animated warning icon */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center ring-1 ring-red-500/30">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="flex-1 space-y-1 pt-1">
              <DialogTitle className="text-lg">Reject Application</DialogTitle>
              <DialogDescription className="text-sm">
                {applicantName ? (
                  <>
                    This will reject <span className="font-medium text-foreground">{applicantName}&apos;s</span> CA application. 
                    They will be notified via email.
                  </>
                ) : (
                  "This will reject the CA application. The applicant will be notified via email."
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Quick reason chips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              <span>Quick select a reason or write your own</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_REASONS.map((quickReason) => (
                <button
                  key={quickReason}
                  type="button"
                  onClick={() => handleQuickReason(quickReason)}
                  disabled={isLoading}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    "border hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-600",
                    "focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-1",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    reason === quickReason
                      ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
                      : "border-border bg-muted/50 text-muted-foreground"
                  )}
                >
                  {quickReason}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea field */}
          <div className="space-y-2">
            <Label htmlFor="rejection-reason" className="text-sm font-medium">
              Rejection Reason
              <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <div className="relative">
              <Textarea
                id="rejection-reason"
                placeholder="Provide a clear reason that will help the applicant understand why their application was rejected..."
                {...register("reason")}
                aria-invalid={!!errors.reason || isOverLimit}
                className={cn(
                  "min-h-[140px] resize-none pr-4 pb-8 transition-colors",
                  "focus:ring-red-500/30 focus:border-red-500/50",
                  (errors.reason || isOverLimit) && "border-red-500 ring-2 ring-red-500/20"
                )}
                disabled={isLoading}
                maxLength={MAX_CHARS + 50} // Allow slight overflow for UX
              />
              
              {/* Character counter badge */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
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
              {errors.reason ? (
                <div className="flex items-center gap-1.5 text-red-500">
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-xs font-medium">{errors.reason.message}</span>
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

          {/* Footer with action buttons */}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || !isValid}
              className={cn(
                "flex-1 sm:flex-none min-w-[140px] gap-2",
                "bg-red-600 hover:bg-red-700 text-white",
                "dark:bg-red-600 dark:hover:bg-red-700",
                "disabled:bg-red-600/50 disabled:text-white/70"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
