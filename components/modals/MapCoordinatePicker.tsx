"use client";

import { useRef, useState } from "react";
import { MapPin, Tag } from "lucide-react";
import { cn } from "cn";

// ═══════════════════════════════════════════════════════════════════
// MAP COORDINATE PICKER
//
// The schedule page uses a custom illustrated campus map (NOT GPS).
// Positions are stored as a percentage (0-100) of the map image.
// This lets an admin click on the actual map to set a venue's pin and
// its label anchor, instead of guessing raw numbers.
// ═══════════════════════════════════════════════════════════════════

// Public campus map image (served from the project's ImageKit CDN).
const MAP_IMAGE_URL = "https://ik.imagekit.io/bi3ktgt58/schedule-map/campus-day.jpg";
// Map artwork aspect ratio (width / height) — matches frontend MAP_ASPECT.
const MAP_ASPECT = 1332 / 1252;

type PickMode = "pin" | "anchor";

interface MapCoordinatePickerProps {
  x: number | null;
  y: number | null;
  anchorX: number | null;
  anchorY: number | null;
  /** Called with values rounded to 1 decimal place. */
  onChange: (coords: {
    x?: number;
    y?: number;
    anchorX?: number;
    anchorY?: number;
  }) => void;
  /** Optional label text to preview at the anchor position. */
  labelText?: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number) => Math.min(100, Math.max(0, n));

export function MapCoordinatePicker({
  x,
  y,
  anchorX,
  anchorY,
  onChange,
  labelText,
}: MapCoordinatePickerProps) {
  const [mode, setMode] = useState<PickMode>("pin");
  const imgWrapRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clamp(((e.clientX - rect.left) / rect.width) * 100);
    const py = clamp(((e.clientY - rect.top) / rect.height) * 100);

    if (mode === "pin") {
      onChange({ x: round1(px), y: round1(py) });
    } else {
      onChange({ anchorX: round1(px), anchorY: round1(py) });
    }
  };

  const hasPin = x !== null && y !== null;
  const hasAnchor = anchorX !== null && anchorY !== null;

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("pin")}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            mode === "pin"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
          )}
        >
          <MapPin className="h-3.5 w-3.5" /> Set Pin
        </button>
        <button
          type="button"
          onClick={() => setMode("anchor")}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            mode === "anchor"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
          )}
        >
          <Tag className="h-3.5 w-3.5" /> Set Label Anchor
        </button>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Click the map to place the {mode === "pin" ? "pin" : "label"}
        </span>
      </div>

      {/* Map */}
      <div
        ref={imgWrapRef}
        onClick={handleClick}
        className="relative w-full cursor-crosshair overflow-hidden rounded-lg border border-muted-foreground/20 select-none"
        style={{ aspectRatio: String(MAP_ASPECT) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MAP_IMAGE_URL}
          alt="Campus map — click to place venue"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        {/* Pin marker */}
        {hasPin && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
          </div>
        )}

        {/* Anchor / label marker */}
        {hasAnchor && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded border border-amber-300 bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-black shadow"
            style={{ left: `${anchorX}%`, top: `${anchorY}%` }}
          >
            {labelText || "LABEL"}
          </div>
        )}

        {/* Connector line between pin and anchor */}
        {hasPin && hasAnchor && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <line
              x1={`${x}%`}
              y1={`${y}%`}
              x2={`${anchorX}%`}
              y2={`${anchorY}%`}
              stroke="rgba(251,191,36,0.6)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          </svg>
        )}
      </div>

      {/* Readout */}
      <p className="text-[11px] text-muted-foreground">
        Pin: {hasPin ? `${x}, ${y}` : "—"}
        {"  ·  "}
        Anchor: {hasAnchor ? `${anchorX}, ${anchorY}` : "— (optional)"}
      </p>
    </div>
  );
}
