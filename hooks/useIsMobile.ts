"use client";

import { useState, useEffect, useLayoutEffect } from "react";

/**
 * Isomorphic layout effect.
 *
 * `useLayoutEffect` runs synchronously after DOM mutations but before the
 * browser paints — ideal for reading viewport size without a visible flash.
 * On the server it would warn, so we fall back to `useEffect` during SSR.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Hook to detect if viewport is below a breakpoint (mobile).
 *
 * Hydration note: the initial state is `false` so the client's first render
 * matches the server-rendered HTML (where `window` is undefined), avoiding a
 * React hydration mismatch. The real value is resolved via an isomorphic
 * layout effect that runs before the browser paints, so there is no visible
 * flash for mobile users.
 *
 * @param breakpoint - Width threshold in pixels (default: 768 = md breakpoint)
 * @returns boolean - true if viewport width < breakpoint
 *
 * @example
 * const isMobile = useIsMobile(); // < 768px
 * const isSmall = useIsMobile(640); // < 640px (sm breakpoint)
 * const isTablet = useIsMobile(1024); // < 1024px (lg breakpoint)
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  // Must match the server render (window undefined -> false) to keep
  // hydration consistent. Corrected before paint in the layout effect below.
  const [isMobile, setIsMobile] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);

    // Resolve the real value before the first paint.
    checkMobile();

    // Keep it in sync on resize.
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Breakpoint utilities for responsive design
 */
export const BREAKPOINTS = {
  sm: 640,  // Small phones
  md: 768,  // Tablets portrait
  lg: 1024, // Tablets landscape / small laptops
  xl: 1280, // Desktops
  "2xl": 1536, // Large desktops
} as const;

/**
 * Hook to get current device type
 */
export function useDeviceType() {
  const isPhone = useIsMobile(BREAKPOINTS.sm);
  const isTablet = useIsMobile(BREAKPOINTS.lg) && !useIsMobile(BREAKPOINTS.sm);
  const isDesktop = !useIsMobile(BREAKPOINTS.lg);

  return {
    isPhone,
    isTablet,
    isDesktop,
    isMobile: isPhone || isTablet,
  };
}
