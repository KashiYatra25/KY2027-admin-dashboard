"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Ticket, Loader2, Percent, IndianRupee } from "lucide-react";
import type { CreateCouponData } from "@/lib/api/helper/types";

// Local form schema (simplified for the form)
const FormSchema = z.object({
  code: z.string().min(3, "Min 3 characters").max(20, "Max 20 characters"),
  description: z.string().max(500).optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("Must be positive"),
  maxUsageCount: z.number().int().positive().optional(),
  maxUsagePerUser: z.number().int().positive().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCouponData) => void;
  isPending: boolean;
}

export function CreateCouponModal({ isOpen, onClose, onSubmit, isPending }: CreateCouponModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: "",
      description: "",
      type: "PERCENTAGE",
      value: 10,
      maxUsageCount: undefined,
      maxUsagePerUser: 1,
      validFrom: undefined,
      validUntil: undefined,
    },
  });

  const couponType = watch("type");

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onFormSubmit = (data: FormData) => {
    const submitData: CreateCouponData = {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      description: data.description,
      maxUsageCount: data.maxUsageCount,
      maxUsagePerUser: data.maxUsagePerUser || 1,
      validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : undefined,
      validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
      applicablePassIds: [],
    };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle>Create Coupon</CardTitle>
              <CardDescription>Add a new discount coupon</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="KASHIYATRA2027"
                className="uppercase font-mono"
              />
              {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
              <p className="text-xs text-muted-foreground">
                Letters, numbers, underscores, and hyphens only
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Special discount for early birds"
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Discount Type *</Label>
              <Tabs value={couponType} onValueChange={(v) => setValue("type", v as "PERCENTAGE" | "FIXED")}>
                <TabsList className="w-full bg-muted/50">
                  <TabsTrigger value="PERCENTAGE" className="flex-1 gap-2">
                    <Percent className="w-4 h-4" />
                    Percentage
                  </TabsTrigger>
                  <TabsTrigger value="FIXED" className="flex-1 gap-2">
                    <IndianRupee className="w-4 h-4" />
                    Fixed Amount
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Discount Value * {couponType === "PERCENTAGE" ? "(0-100%)" : "(₹)"}
              </Label>
              <Input
                id="value"
                type="number"
                {...register("value", { valueAsNumber: true })}
                placeholder={couponType === "PERCENTAGE" ? "10" : "100"}
              />
              {errors.value && <p className="text-xs text-red-500">{errors.value.message}</p>}
            </div>

            {/* Usage limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsageCount">Max Total Uses</Label>
                <Input
                  id="maxUsageCount"
                  type="number"
                  {...register("maxUsageCount", { valueAsNumber: true })}
                  placeholder="Unlimited"
                />
                {errors.maxUsageCount && <p className="text-xs text-red-500">{errors.maxUsageCount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsagePerUser">Per User Limit</Label>
                <Input
                  id="maxUsagePerUser"
                  type="number"
                  {...register("maxUsagePerUser", { valueAsNumber: true })}
                  placeholder="1"
                />
                {errors.maxUsagePerUser && <p className="text-xs text-red-500">{errors.maxUsagePerUser.message}</p>}
              </div>
            </div>

            {/* Validity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  {...register("validFrom")}
                />
                {errors.validFrom && <p className="text-xs text-red-500">{errors.validFrom.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  {...register("validUntil")}
                />
                {errors.validUntil && <p className="text-xs text-red-500">{errors.validUntil.message}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4 mr-2" />
                    Create Coupon
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
