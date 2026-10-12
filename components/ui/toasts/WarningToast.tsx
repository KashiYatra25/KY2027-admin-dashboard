"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WarningToastProps {
  title?: string;
  description?: string;
  className?: string;
}

export function WarningToast({ 
  title = "Warning", 
  description,
  className 
}: WarningToastProps) {
  return (
    <div className={cn(
      "group relative flex items-center gap-3 w-[380px] px-4 py-4 rounded-2xl overflow-hidden",
      "bg-[#0c0c0c] border border-white/[0.08]",
      "shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_16px_40px_-8px_rgba(0,0,0,0.7),0_0_20px_-5px_rgba(245,158,11,0.15)]",
      className
    )}>
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] via-transparent to-transparent" />
      
      {/* Left accent line */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
      
      {/* Icon */}
      <div className="relative ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/25">
        <AlertTriangle className="h-4 w-4 text-amber-400" strokeWidth={2.5} />
      </div>
      
      {/* Content */}
      <div className="relative flex-1 min-w-0 pr-2">
        <p className="text-[14px] font-medium text-white/95 tracking-[-0.01em]">{title}</p>
        {description && (
          <p className="text-[13px] text-white/50 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
    </div>
  );
}
