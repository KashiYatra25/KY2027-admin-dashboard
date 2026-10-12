"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface DataTableToolbarProps {
  children: React.ReactNode;
  activeFiltersCount?: number;
  onResetFilters?: () => void;
}

export function DataTableToolbar({
  children,
  activeFiltersCount = 0,
  onResetFilters,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4 border-b border-border/50">
      <div className="flex flex-wrap items-center gap-2">
        {children}
        
        {activeFiltersCount > 0 && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
}
