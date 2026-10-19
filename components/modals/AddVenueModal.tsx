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
import { Loader2, MapPin } from "lucide-react";
import { useCreateVenue } from "@/lib/api/hooks";
import { MapCoordinatePicker } from "./MapCoordinatePicker";
import { cn } from "cn";

// ═══════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════

const TONE_OPTIONS = ["blue", "red", "green", "white", "text"] as const;

const AddVenueFormSchema = z.object({
  slug: z.string().min(1, "Required").regex(/^[a-z0-9-]+$/, "Only lowercase, numbers, hyphens"),
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

type AddVenueFormData = z.infer<typeof AddVenueFormSchema>;

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface AddVenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TONE_CONFIG = [
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "white", label: "White" },
  { value: "text", label: "Text" },
] as const;

export function AddVenueModal({ open, onOpenChange }: AddVenueModalProps) {
  const { createVenue, isPending, isSuccess, reset: resetMutation } = useCreateVenue();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<AddVenueFormData>({
    resolver: zodResolver(AddVenueFormSchema),
    defaultValues: {
      slug: "",
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
  const xVal = watch("x");
  const yVal = watch("y");
  const anchorXVal = watch("anchorX");
  const anchorYVal = watch("anchorY");
  const labelVal = watch("label");

  // Parse a form string field into a number or null for the picker.
  const num = (v: string | undefined): number | null =>
    v !== undefined && v !== "" && !isNaN(Number(v)) ? Number(v) : null;

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

  const onSubmit = (data: AddVenueFormData) => {
    createVenue({
      slug: data.slug,
      name: data.name,
      label: data.label,
      tone: data.tone,
      x: parseFloat(data.x),
      y: parseFloat(data.y),
      anchorX: data.anchorX ? parseFloat(data.anchorX) : undefined,
      anchorY: data.anchorY ? parseFloat(data.anchorY) : undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Add New Venue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Row 1: Slug & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-medium">Slug *</Label>
              <Input
                id="slug"
                placeholder="lt-1"
                {...register("slug", { onChange: (e) => { e.target.value = e.target.value.toLowerCase(); }})}
                className={cn("h-9 text-sm", errors.slug && "border-destructive")}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
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
          </div>

          {/* Row 2: Label & Tone */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Map coordinate picker — click the map to auto-fill X/Y & anchor */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Position on Campus Map *</Label>
            <MapCoordinatePicker
              x={num(xVal)}
              y={num(yVal)}
              anchorX={num(anchorXVal)}
              anchorY={num(anchorYVal)}
              labelText={labelVal}
              onChange={(c) => {
                if (c.x !== undefined) setValue("x", String(c.x), { shouldValidate: true });
                if (c.y !== undefined) setValue("y", String(c.y), { shouldValidate: true });
                if (c.anchorX !== undefined) setValue("anchorX", String(c.anchorX));
                if (c.anchorY !== undefined) setValue("anchorY", String(c.anchorY));
              }}
            />
          </div>

          {/* Row 3: Position (auto-filled by the picker; editable for fine-tuning) */}
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
              {isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Creating...</> : "Create Venue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
