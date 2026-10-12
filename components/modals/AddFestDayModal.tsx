"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar } from "lucide-react";
import { useCreateFestDay } from "@/lib/api/hooks";
import { cn } from "cn";

// ═══════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════

const AddFestDayFormSchema = z.object({
  dayNumber: z.string().min(1, "Required").refine((val) => !isNaN(Number(val)) && Number(val) >= 1, "Must be >= 1"),
  date: z.string().min(1, "Required"),
  displayDate: z.string().min(1, "Required").max(20),
  name: z.string().max(50).optional(),
  active: z.boolean(),
});

type AddFestDayFormData = z.infer<typeof AddFestDayFormSchema>;

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface AddFestDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFestDayModal({ open, onOpenChange }: AddFestDayModalProps) {
  const { createFestDay, isPending, isSuccess, reset: resetMutation } = useCreateFestDay();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<AddFestDayFormData>({
    resolver: zodResolver(AddFestDayFormSchema),
    defaultValues: {
      dayNumber: "1",
      date: "",
      displayDate: "",
      name: "",
      active: true,
    },
  });

  const active = watch("active");

  useEffect(() => {
    if (isSuccess) {
      resetForm();
      resetMutation();
      onOpenChange(false);
    }
  }, [isSuccess, resetForm, resetMutation, onOpenChange]);

  useEffect(() => {
    if (!open) {
      resetForm();
      resetMutation();
    }
  }, [open, resetForm, resetMutation]);

  const onSubmit = (data: AddFestDayFormData) => {
    createFestDay({
      dayNumber: parseInt(data.dayNumber),
      date: data.date,
      displayDate: data.displayDate,
      name: data.name || undefined,
      active: data.active,
    });
  };

  // Compact checkbox toggle
  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
          checked ? "bg-primary border-primary" : "border-muted-foreground/40"
        )}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            Add New Fest Day
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Row 1: Day Number & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayNumber" className="text-xs font-medium">Day Number *</Label>
              <Input
                id="dayNumber"
                type="number"
                min={1}
                placeholder="1"
                {...register("dayNumber")}
                className={cn("h-9 text-sm", errors.dayNumber && "border-destructive")}
              />
              {errors.dayNumber && <p className="text-xs text-destructive">{errors.dayNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-medium">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className={cn("h-9 text-sm", errors.date && "border-destructive")}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          {/* Row 2: Display Date & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayDate" className="text-xs font-medium">Display Date *</Label>
              <Input
                id="displayDate"
                placeholder="25 Jan"
                {...register("displayDate")}
                className={cn("h-9 text-sm", errors.displayDate && "border-destructive")}
              />
              {errors.displayDate && <p className="text-xs text-destructive">{errors.displayDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium">Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Opening Day"
                {...register("name")}
                className={cn("h-9 text-sm", errors.name && "border-destructive")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </div>

          {/* Row 3: Active Toggle */}
          <div className="flex items-center gap-5 pt-2">
            <Toggle label="Active" checked={active} onChange={(v) => setValue("active", v)} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Creating...</> : "Create Day"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
