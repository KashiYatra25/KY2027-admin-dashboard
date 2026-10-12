"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock } from "lucide-react";
import { useCreateScheduleEntry, useVenues } from "@/lib/api/hooks";
import { cn } from "cn";

const CATEGORIES = ["NATRAJ", "CROSSWINDZ", "BANDISH", "ABHINAY", "MIRAGE", "TOOLIKA", "ENQUIZTA", "SAMWAAD", "ZAIKA"] as const;

const FormSchema = z.object({
  eventSlug: z.string().min(1, "Required").regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
  categorySlug: z.enum(CATEGORIES),
  venueSlug: z.string().min(1, "Required"),
  day: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "Min 1"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  sortOrder: z.string(),
  active: z.boolean(),
});

type FormData = z.infer<typeof FormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddScheduleEntryModal({ open, onOpenChange }: Props) {
  const { createEntry, isPending, isSuccess, reset: resetMutation } = useCreateScheduleEntry();
  const { venues } = useVenues();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { eventSlug: "", categorySlug: "NATRAJ", venueSlug: "", day: "1", startTime: "", endTime: "", sortOrder: "0", active: true },
  });

  const categorySlug = watch("categorySlug");
  const venueSlug = watch("venueSlug");
  const active = watch("active");

  useEffect(() => {
    if (isSuccess) { reset(); resetMutation(); onOpenChange(false); }
  }, [isSuccess, reset, resetMutation, onOpenChange]);

  useEffect(() => {
    if (!open) { reset(); resetMutation(); }
  }, [open, reset, resetMutation]);

  const onSubmit = (data: FormData) => {
    createEntry({
      eventSlug: data.eventSlug,
      categorySlug: data.categorySlug,
      venueSlug: data.venueSlug,
      day: parseInt(data.day),
      startTime: data.startTime || undefined,
      endTime: data.endTime || undefined,
      sortOrder: parseInt(data.sortOrder) || 0,
      active: data.active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Add Schedule Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Event Slug *</Label>
              <Input placeholder="nritya" {...register("eventSlug")} className={cn("h-9 text-sm", errors.eventSlug && "border-destructive")} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Category *</Label>
              <Select value={categorySlug} onValueChange={(v) => setValue("categorySlug", v as typeof categorySlug)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Venue *</Label>
              <Select value={venueSlug} onValueChange={(v) => setValue("venueSlug", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select venue" /></SelectTrigger>
                <SelectContent>
                  {venues.filter(v => v.active).map((v) => <SelectItem key={v._id} value={v.slug}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Day *</Label>
              <Input type="number" min="1" {...register("day")} className={cn("h-9 text-sm", errors.day && "border-destructive")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Start Time</Label>
              <Input type="time" {...register("startTime")} className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">End Time</Label>
              <Input type="time" {...register("endTime")} className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Order</Label>
              <Input type="number" {...register("sortOrder")} className="h-9 text-sm" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center", active ? "bg-primary border-primary" : "border-muted-foreground/40")} onClick={() => setValue("active", !active)}>
              {active && <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-sm">Active</span>
          </label>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Creating...</> : "Create Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
