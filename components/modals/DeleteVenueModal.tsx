"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useDeleteVenue, type Venue } from "@/lib/api/hooks";

interface DeleteVenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
}

export function DeleteVenueModal({ open, onOpenChange, venue }: DeleteVenueModalProps) {
  const { deleteVenue, isPending, isSuccess, reset } = useDeleteVenue(venue?._id ?? "");

  // Close modal on success
  useEffect(() => {
    if (isSuccess) {
      reset();
      onOpenChange(false);
    }
  }, [isSuccess, reset, onOpenChange]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleConfirm = () => {
    if (venue) {
      deleteVenue({});
    }
  };

  if (!venue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center ring-1 ring-red-500/30">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="flex-1 space-y-1 pt-1">
              <DialogTitle className="text-lg">Deactivate Venue</DialogTitle>
              <DialogDescription className="text-sm">
                This will deactivate <span className="font-medium text-foreground">{venue.name}</span> and 
                hide it from the campus map. The venue data will be preserved.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono">{venue.slug}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{venue.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Label</span>
            <span>{venue.label.replace(/\n/g, " ")}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Deactivate Venue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
