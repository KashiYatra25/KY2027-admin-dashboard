"use client";

import { cn } from "cn";

interface DataTableEmptyProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function DataTableEmpty({
  icon,
  title,
  description,
  action,
  className,
}: DataTableEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-lg font-medium mb-1">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
