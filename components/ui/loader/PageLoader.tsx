"use client";

import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

interface PageLoaderProps {
  text?: string;
  className?: string;
}

export function PageLoader({ text, className }: PageLoaderProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] gap-4",
      className
    )}>
      <Spinner size="lg" />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Full screen loader for initial app loading
export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <span className="text-background font-bold text-lg">K</span>
          </div>
          <div>
            <span className="font-bold text-xl text-foreground tracking-tight">Kashiyatra</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
              Admin
            </span>
          </div>
        </div>
        
        {/* Spinner */}
        <Spinner size="lg" />
        
        {/* Text */}
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
