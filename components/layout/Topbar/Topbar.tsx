"use client";
import { Search, Bell, Menu } from "lucide-react";
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
    <header className="h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="lg:hidden h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden sm:block">
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="text-foreground font-medium">{displayName}</span> 👋
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 w-64 border border-transparent focus-within:border-border focus-within:bg-background transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
          />
          <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Search className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </Button>

        {/* Divider */}
        <div className="h-8 w-px bg-border mx-1" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground mt-1">{admin?.role || "Admin"}</p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-border">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-zinc-800 text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
