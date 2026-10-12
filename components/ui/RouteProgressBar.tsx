"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  easing: "ease",
  speed: 300,
  trickleSpeed: 200,
});

function RouteProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Intercept link clicks to start progress bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor) {
        const href = anchor.getAttribute("href");
        const isInternal = href?.startsWith("/") || href?.startsWith(window.location.origin);
        const isNewTab = anchor.target === "_blank";
        const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
        
        if (href && isInternal && !isNewTab && !isModified && href !== pathname) {
          NProgress.start();
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}

export default function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <RouteProgressBarInner />
    </Suspense>
  );
}

// Hook to manually control progress bar (for async operations)
export function useProgress() {
  return {
    start: () => NProgress.start(),
    done: () => NProgress.done(),
    inc: () => NProgress.inc(),
  };
}
