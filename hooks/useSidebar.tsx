"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SidebarContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const SidebarCtx = createContext<SidebarContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);

  // Memoize setOpen to prevent unnecessary re-renders in consumers
  const setOpen = useCallback((v: boolean) => {
    setOpenState(v);
  }, []);

  // Memoize toggle for convenience
  const toggle = useCallback(() => {
    setOpenState((prev) => !prev);
  }, []);

  return (
    <SidebarCtx.Provider value={{ open, setOpen, toggle }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export const useSidebar = () => useContext(SidebarCtx);
