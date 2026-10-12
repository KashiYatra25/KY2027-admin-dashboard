"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "rounded-md bg-zinc-800/50",
        "relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-zinc-700/30 before:to-transparent",
        "before:animate-[shimmer_1.5s_ease-in-out_infinite]",
        "before:-translate-x-full",
        className
      )}
      style={{
        backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// Pre-built skeleton variants for common use cases

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )} 
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  
  return <Skeleton className={cn("rounded-full", sizes[size])} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-24 rounded-md", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
}
