"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9 rounded-lg bg-[var(--secondary)] border border-[var(--border)]" />;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 overflow-hidden"
      style={{
        background: "var(--secondary)",
        borderColor: "var(--border)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--gold-mid)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "translateY(0) rotate(0deg)" : "translateY(-12px) rotate(-90deg)",
        }}
      >
        <Moon className="w-4 h-4" style={{ color: "var(--gold-mid)" }} />
      </span>
      <span
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "translateY(12px) rotate(90deg)" : "translateY(0) rotate(0deg)",
        }}
      >
        <Sun className="w-4 h-4" style={{ color: "var(--orange-vivid)" }} />
      </span>
    </button>
  );
}
