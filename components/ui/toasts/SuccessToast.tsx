"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessToastProps {
  title?: string;
  description?: string;
  className?: string;
}

export function SuccessToast({ 
  title = "Success", 
  description,
  className 
}: SuccessToastProps) {
  return (
    <div className={cn(
      "group relative flex items-center gap-3 w-[380px] px-4 py-4 rounded-2xl overflow-hidden",
      "bg-[#0c0c0c] border border-white/[0.08]",
      "shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_16px_40px_-8px_rgba(0,0,0,0.7),0_0_20px_-5px_rgba(16,185,129,0.15)]",
      className
    )}>
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] via-transparent to-transparent" />
      
      {/* Left accent line */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
      
      {/* Icon */}
      <div className="relative ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/25">
        <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
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
