"use client";
import { createContext, useContext, useState, ReactNode, createElement } from "react";

interface SidebarContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const SidebarCtx = createContext<SidebarContextValue>({
  open: false,
  setOpen: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return createElement(SidebarCtx.Provider, { value: { open, setOpen } }, children);
}

export const useSidebar = () => useContext(SidebarCtx);
