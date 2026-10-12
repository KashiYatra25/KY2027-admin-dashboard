"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useDeleteScheduleEntry, type ScheduleEntry } from "@/lib/api/hooks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: ScheduleEntry | null;
}

export function DeleteScheduleEntryModal({ open, onOpenChange, entry }: Props) {
  const { deleteEntry, isPending, isSuccess, reset } = useDeleteScheduleEntry(entry?._id ?? "");

  useEffect(() => {
    if (isSuccess) { reset(); onOpenChange(false); }
  }, [isSuccess, reset, onOpenChange]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <DialogTitle>Deactivate Entry</DialogTitle>
              <DialogDescription className="mt-1">
                This will deactivate <span className="font-medium text-foreground">{entry.eventSlug}</span> from the schedule.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Event</span><span className="font-mono">{entry.eventSlug}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Venue</span><span>{entry.venueSlug}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Day</span><span>Day {entry.day}</span></div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={() => deleteEntry({})} disabled={isPending}>
            {isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Deactivating...</> : <><Trash2 className="w-4 h-4 mr-1" />Deactivate</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
