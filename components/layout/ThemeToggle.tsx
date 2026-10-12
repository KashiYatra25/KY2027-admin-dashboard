"use client";

import { useTheme } from "next-themes";
import { 
  Sun, 
  Moon, 
  Monitor, 
  Waves,
  TreePine,
  Sparkles,
  Sunset,
  Heart,
  Cloud,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "cn";

// ═══════════════════════════════════════════════════════════════════
// THEME CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

interface ThemeConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  description: string;
  accentColor: string; // For the icon highlight color
}

export const THEMES: ThemeConfig[] = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    description: "Bright and clean",
    accentColor: "#f59e0b", // amber
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes",
    accentColor: "#fbbf24", // amber
  },
  {
    id: "midnight",
    label: "Midnight",
    icon: Cloud,
    description: "Deep blue night",
    accentColor: "#22d3ee", // cyan
  },
  {
    id: "sunset",
    label: "Sunset",
    icon: Sunset,
    description: "Warm orange glow",
    accentColor: "#fb923c", // orange
  },
  {
    id: "forest",
    label: "Forest",
    icon: TreePine,
    description: "Nature green",
    accentColor: "#4ade80", // green
  },
  {
    id: "lavender",
    label: "Lavender",
    icon: Sparkles,
    description: "Soft purple",
    accentColor: "#a78bfa", // violet
  },
  {
    id: "ocean",
    label: "Ocean",
    icon: Waves,
    description: "Cool cyan",
    accentColor: "#22d3ee", // cyan
  },
  {
    id: "rose",
    label: "Rose",
    icon: Heart,
    description: "Romantic pink",
    accentColor: "#fb7185", // rose
  },
  {
    id: "system",
    label: "System",
    icon: Monitor,
    description: "Match device",
    accentColor: "#a1a1aa", // zinc
  },
];

// ═══════════════════════════════════════════════════════════════════
// THEME TOGGLE BUTTON (Dropdown)
// ═══════════════════════════════════════════════════════════════════

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleThemeSelect = useCallback((themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  }, [setTheme]);

  // Skeleton while not mounted
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />
    );
  }

  // Get current theme config
  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES.find((t) => t.id === "dark")!;
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change theme"
        aria-label="Change theme"
        aria-expanded={isOpen}
        className={cn(
          "relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200",
          "bg-muted/50 border-border hover:border-primary/50 hover:bg-muted",
          isOpen && "border-primary/50 bg-muted"
        )}
      >
        <CurrentIcon 
          className="w-4 h-4 transition-colors" 
          style={{ color: currentTheme.accentColor }} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 z-50",
            "w-56 rounded-xl border border-border bg-popover p-2 shadow-xl",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
            "max-h-[400px] overflow-y-auto"
          )}
        >
          <div className="px-2 py-1.5 mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</p>
          </div>
          
          <div className="space-y-0.5">
            {THEMES.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.id;
              
              return (
                <button
                  key={themeOption.id}
                  onClick={() => handleThemeSelect(themeOption.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-150",
                    "text-left text-sm",
                    isSelected
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
                      isSelected ? "bg-primary/20" : "bg-muted"
                    )}
                    style={isSelected ? { backgroundColor: `${themeOption.accentColor}20` } : undefined}
                  >
                    <div style={{ color: isSelected ? themeOption.accentColor : undefined }}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className={cn("font-medium", isSelected && "font-semibold")}
                      style={isSelected ? { color: themeOption.accentColor } : undefined}
                    >
                      {themeOption.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {themeOption.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse" 
                      style={{ backgroundColor: themeOption.accentColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// THEME OPTION CARD (for Settings page)
// ═══════════════════════════════════════════════════════════════════

interface ThemeOptionCardProps {
  themeId: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  accentColor: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ThemeOptionCard({
  themeId,
  label,
  icon,
  description,
  accentColor,
  isSelected,
  onClick,
}: ThemeOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        isSelected
          ? "shadow-lg"
          : "border-border hover:border-muted-foreground/30 bg-card hover:bg-muted/50"
      )}
      style={isSelected ? { 
        borderColor: accentColor, 
        backgroundColor: `${accentColor}10`,
        boxShadow: `0 4px 20px ${accentColor}20`
      } : undefined}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: accentColor }}
          />
        </div>
      )}
      
      {/* Icon */}
      <div
        className={cn(
          "p-3 rounded-xl transition-colors",
          !isSelected && "bg-muted group-hover:bg-muted-foreground/10"
        )}
        style={isSelected ? { backgroundColor: `${accentColor}20` } : undefined}
      >
        <div style={isSelected ? { color: accentColor } : undefined}>
          {icon}
        </div>
      </div>
      
      {/* Label */}
      <div className="text-center">
        <p
          className={cn("text-sm font-semibold", !isSelected && "text-foreground")}
          style={isSelected ? { color: accentColor } : undefined}
        >
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export type { ThemeConfig };
