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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil } from "lucide-react";
import { useUpdateVenue, type Venue } from "@/lib/api/hooks";
import { cn } from "cn";

// ═══════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════

const TONE_OPTIONS = ["blue", "red", "green", "white", "text"] as const;

const EditVenueFormSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  label: z.string().min(1, "Required").max(100),
  tone: z.enum(TONE_OPTIONS),
  x: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, "0-100"),
  y: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, "0-100"),
  anchorX: z.string().optional(),
  anchorY: z.string().optional(),
  sortOrder: z.string(),
  large: z.boolean(),
  clickable: z.boolean(),
  active: z.boolean(),
});

type EditVenueFormData = z.infer<typeof EditVenueFormSchema>;

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface EditVenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
}

const TONE_CONFIG = [
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "white", label: "White" },
  { value: "text", label: "Text" },
] as const;

export function EditVenueModal({ open, onOpenChange, venue }: EditVenueModalProps) {
  const { updateVenue, isPending, isSuccess, reset: resetMutation } = useUpdateVenue(venue?._id ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<EditVenueFormData>({
    resolver: zodResolver(EditVenueFormSchema),
    defaultValues: {
      name: "",
      label: "",
      tone: "blue",
      x: "50",
      y: "50",
      anchorX: "",
      anchorY: "",
      sortOrder: "0",
      large: false,
      clickable: true,
      active: true,
    },
  });

  const tone = watch("tone");
  const large = watch("large");
  const clickable = watch("clickable");
  const active = watch("active");

  useEffect(() => {
    if (venue && open) {
      resetForm({
        name: venue.name,
        label: venue.label,
        tone: venue.tone as typeof TONE_OPTIONS[number],
        x: venue.x.toString(),
        y: venue.y.toString(),
        anchorX: venue.anchorX?.toString() ?? "",
        anchorY: venue.anchorY?.toString() ?? "",
        sortOrder: (venue.sortOrder ?? 0).toString(),
        large: venue.large ?? false,
        clickable: venue.clickable ?? true,
        active: venue.active ?? true,
      });
    }
  }, [venue, open, resetForm]);

  useEffect(() => {
    if (isSuccess) {
      resetMutation();
      onOpenChange(false);
    }
  }, [isSuccess, resetMutation, onOpenChange]);

  useEffect(() => {
    if (!open) resetMutation();
  }, [open, resetMutation]);

  const onSubmit = (data: EditVenueFormData) => {
    updateVenue({
      name: data.name,
      label: data.label,
      tone: data.tone,
      x: parseFloat(data.x),
      y: parseFloat(data.y),
      anchorX: data.anchorX ? parseFloat(data.anchorX) : null,
      anchorY: data.anchorY ? parseFloat(data.anchorY) : null,
      sortOrder: parseInt(data.sortOrder) || 0,
      large: data.large,
      clickable: data.clickable,
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

  if (!venue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Pencil className="h-4 w-4 text-primary" />
            Edit Venue
            <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{venue.slug}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Row 1: Name & Label */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium">Full Name *</Label>
              <Input
                id="name"
                placeholder="Lecture Theatre 1"
                {...register("name")}
                className={cn("h-9 text-sm", errors.name && "border-destructive")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="label" className="text-xs font-medium">Map Label *</Label>
              <Input
                id="label"
                placeholder="LT-1"
                {...register("label")}
                className={cn("h-9 text-sm", errors.label && "border-destructive")}
              />
              {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
            </div>
          </div>

          {/* Row 2: Tone */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Tone</Label>
            <Select value={tone} onValueChange={(v) => setValue("tone", v as typeof tone)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_CONFIG.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 3: Position */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x" className="text-xs font-medium">X % *</Label>
              <Input id="x" type="number" step="0.1" {...register("x")} className={cn("h-9 text-sm", errors.x && "border-destructive")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="y" className="text-xs font-medium">Y % *</Label>
              <Input id="y" type="number" step="0.1" {...register("y")} className={cn("h-9 text-sm", errors.y && "border-destructive")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anchorX" className="text-xs font-medium">Anchor X</Label>
              <Input id="anchorX" type="number" step="0.1" placeholder="—" {...register("anchorX")} className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anchorY" className="text-xs font-medium">Anchor Y</Label>
              <Input id="anchorY" type="number" step="0.1" placeholder="—" {...register("anchorY")} className="h-9 text-sm" />
            </div>
          </div>

          {/* Row 4: Sort Order & Toggles */}
          <div className="flex items-end gap-6">
            <div className="space-y-2 w-24">
              <Label htmlFor="sortOrder" className="text-xs font-medium">Order</Label>
              <Input id="sortOrder" type="number" {...register("sortOrder")} className="h-9 text-sm" />
            </div>
            <div className="flex-1 flex items-center gap-5 pb-1">
              <Toggle label="Large" checked={large} onChange={(v) => setValue("large", v)} />
              <Toggle label="Clickable" checked={clickable} onChange={(v) => setValue("clickable", v)} />
              <Toggle label="Active" checked={active} onChange={(v) => setValue("active", v)} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
