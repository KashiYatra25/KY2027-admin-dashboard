"use client";

import { Shield } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD LOADER
//
// Professional loader matching black/white admin theme
// ═══════════════════════════════════════════════════════════════════

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function KashiyatraLoader({ size = "md", text }: LoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Animated spinner */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
      </div>

      {/* Optional text */}
      {text && (
        <p className="text-zinc-500 text-sm">{text}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FULL PAGE LOADER
// ═══════════════════════════════════════════════════════════════════

interface FullPageLoaderProps {
  text?: string;
}

export function FullPageLoader({ text = "Loading..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-[#09090b] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-8 max-w-sm text-center px-6">
        {/* Icon */}
        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Shield className="h-7 w-7 text-white" />
        </div>

        {/* Brand */}
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Kashiyatra 2027</p>
        </div>
        
        {/* Loader */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
          </div>
          <p className="text-zinc-400 text-sm">{text}</p>
        </div>

        {/* Footer hint */}
        <p className="text-zinc-600 text-xs">
          Securely verifying your credentials
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BUTTON LOADER
// ═══════════════════════════════════════════════════════════════════

export function ButtonLoader() {
  return (
    <svg 
      className="animate-spin h-5 w-5" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
