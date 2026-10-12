"use client";
import { Menu } from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import { useAdminSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "../ThemeToggle";

export default function Topbar() {
  const { setOpen } = useSidebar();
  const { session: admin } = useAdminSession();

  const email = admin?.email ?? "";
  const displayName = admin?.firstName || (email ? email.split("@")[0] : "Guest");
  const initials = admin?.firstName 
    ? admin.firstName.slice(0, 2).toUpperCase()
    : (email ? email.slice(0, 2) : "GU").toUpperCase();
  const avatarUrl = admin?.googleAvatarUrl;

  return (
    <header 
      className="h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 border-b border-sidebar-border bg-sidebar sticky top-0 z-30"
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="lg:hidden h-9 w-9 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden sm:block">
          <p className="text-sm text-sidebar-muted">
            Welcome back, <span className="font-medium text-sidebar-foreground">{displayName}</span> 👋
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Divider */}
        <div className="h-8 w-px mx-1 bg-sidebar-border" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none text-sidebar-foreground">
              {displayName}
            </p>
            <p className="text-xs mt-1 text-sidebar-muted">
              {admin?.role || "Admin"}
            </p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-sidebar-border">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-sm font-semibold bg-sidebar-hover text-sidebar-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
