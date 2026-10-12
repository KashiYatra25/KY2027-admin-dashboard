"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoToastProps {
  title?: string;
  description?: string;
  className?: string;
}

export function InfoToast({ 
  title = "Info", 
  description,
  className 
}: InfoToastProps) {
  return (
    <div className={cn(
      "group relative flex items-center gap-3 w-[380px] px-4 py-4 rounded-2xl overflow-hidden",
      "bg-[#0c0c0c] border border-white/[0.08]",
      "shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_16px_40px_-8px_rgba(0,0,0,0.7),0_0_20px_-5px_rgba(59,130,246,0.15)]",
      className
    )}>
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] via-transparent to-transparent" />
      
      {/* Left accent line */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
      
      {/* Icon */}
      <div className="relative ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-500/25">
        <Info className="h-4 w-4 text-blue-400" strokeWidth={2.5} />
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
