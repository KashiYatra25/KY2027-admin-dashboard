"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "cn";

export type SortDirection = "asc" | "desc" | null;

interface DataTableColumnHeaderProps {
  label: string;
  sortKey?: string;
  currentSortKey?: string | null;
  currentSortDirection?: SortDirection;
  onSort?: (key: string) => void;
  className?: string;
}

export function DataTableColumnHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  className,
}: DataTableColumnHeaderProps) {
  const isSorted = sortKey && currentSortKey === sortKey;

  if (!sortKey || !onSort) {
    return <span className={cn("font-medium", className)}>{label}</span>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 hover:bg-muted/50 font-medium text-xs uppercase tracking-wider text-muted-foreground",
        isSorted && "text-foreground",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isSorted ? (
        currentSortDirection === "asc" ? (
          <ArrowUp className="ml-2 h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="ml-2 h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
      )}
    </Button>
  );
}
