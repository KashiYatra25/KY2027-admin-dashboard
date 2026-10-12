"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Pencil, Loader2, Percent, IndianRupee } from "lucide-react";
import { UpdateCouponSchema, type UpdateCouponSchemaType } from "@/lib/api/utils/coupon.schema";
import type { Coupon } from "@/lib/api/helper/types";

interface EditCouponModalProps {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onSubmit: (data: UpdateCouponSchemaType) => void;
  isPending: boolean;
}

export function EditCouponModal({ isOpen, coupon, onClose, onSubmit, isPending }: EditCouponModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCouponSchemaType>({
    resolver: zodResolver(UpdateCouponSchema),
  });

  // Reset form when coupon changes
  useEffect(() => {
    if (coupon) {
      reset({
        description: coupon.description || "",
        value: coupon.value,
        maxUsageCount: coupon.maxUsageCount || undefined,
        maxUsagePerUser: coupon.maxUsagePerUser,
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : undefined,
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : undefined,
      });
    }
  }, [coupon, reset]);

  if (!isOpen || !coupon) return null;

  const handleClose = () => {
    reset();
    onClose();
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
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Edit Coupon</CardTitle>
              <CardDescription>Update coupon details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Immutable fields display */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Code</span>
              <code className="font-mono font-semibold bg-background px-2 py-1 rounded">{coupon.code}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="secondary" className="gap-1">
                {coupon.type === "PERCENTAGE" ? <Percent className="w-3 h-3" /> : <IndianRupee className="w-3 h-3" />}
                {coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Code and type cannot be changed after creation
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Discount Value {coupon.type === "PERCENTAGE" ? "(0-100%)" : "(₹)"}
              </Label>
              <Input
                id="value"
                type="number"
                {...register("value", { valueAsNumber: true })}
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

            {/* Current usage info */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Current usage: <span className="font-semibold text-foreground">{coupon.currentUsageCount}</span>
                {coupon.maxUsageCount && ` / ${coupon.maxUsageCount}`}
              </p>
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
