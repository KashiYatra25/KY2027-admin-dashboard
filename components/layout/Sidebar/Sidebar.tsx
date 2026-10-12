"use client";
import { LayoutDashboard, Users, GraduationCap, Settings, LogOut, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { useAdminSession } from "@/lib/auth";
import { useAdminLogout } from "@/lib/api/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ═══════════════════════════════════════════════════════════════════

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: GraduationCap, label: "CA Applications", href: "/campus-ambassadors" },
];

const adminNav = [
  { icon: Users, label: "Admin Users", href: "/admin-users" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { session: admin } = useAdminSession();
  const { logout, isPending: isLoggingOut } = useAdminLogout();

  const email = admin?.email ?? "";
  const displayName = email ? email.split("@")[0] : "Guest";
  const initials = (email ? email.slice(0, 2) : "GU").toUpperCase();
  const role = admin?.role ?? "Admin";

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Full nav link (desktop/mobile drawer)
  const NavLink = ({ icon: Icon, label, href }: { icon: any; label: string; href: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          active
            ? "bg-white text-zinc-900"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        )}
      >
        <Icon className="w-[18px] h-[18px]" />
        <span>{label}</span>
      </Link>
    );
  };

  // Icon-only link (tablet rail)
  const IconLink = ({ icon: Icon, label, href }: { icon: any; label: string; href: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        title={label}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
          active
            ? "bg-white text-zinc-900"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        )}
      >
        <Icon className="w-[18px] h-[18px]" />
      </Link>
    );
  };

  // Logo component
  const Logo = ({ full }: { full: boolean }) => (
    <div className={cn("flex items-center", full ? "gap-3 px-4 py-5" : "justify-center py-5")}>
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
        <Zap className="w-5 h-5 text-zinc-900" />
      </div>
      {full && (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-white tracking-tight">Kashiyatra</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
            Admin
          </span>
        </div>
      )}
    </div>
  );

  // User section
  const UserSection = ({ full }: { full: boolean }) => (
    <div className={cn("border-t border-zinc-800", full ? "p-3" : "p-2")}>
      {full ? (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-white text-zinc-900 text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-zinc-500 truncate">{role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className={cn("w-4 h-4", isLoggingOut && "animate-pulse")} />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-10 h-10 mx-auto text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
          title="Logout"
        >
          <LogOut className={cn("w-4 h-4", isLoggingOut && "animate-pulse")} />
        </Button>
      )}
    </div>
  );

  // Section label
  const SectionLabel = ({ label }: { label: string }) => (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-3 mb-2 mt-5">
      {label}
    </p>
  );

  const fullNav = (
    <>
      <Logo full />
      <Separator className="bg-zinc-800" />
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <SectionLabel label="Menu" />
        {mainNav.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
        <SectionLabel label="Admin" />
        {adminNav.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </nav>
      <UserSection full />
    </>
  );

  const iconNav = (
    <>
      <Logo full={false} />
      <Separator className="bg-zinc-800 mx-2" />
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto flex flex-col items-center">
        {mainNav.map((item) => (
          <IconLink key={item.label} {...item} />
        ))}
        <Separator className="bg-zinc-800 my-2 w-6" />
        {adminNav.map((item) => (
          <IconLink key={item.label} {...item} />
        ))}
      </nav>
      <UserSection full={false} />
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setOpen(false)} 
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-zinc-950 flex flex-col border-r border-zinc-800 z-50 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-3 h-8 w-8 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
        {fullNav}
      </aside>

      {/* Tablet icon rail */}
      <aside className="hidden md:flex lg:hidden fixed left-0 top-0 h-screen w-16 bg-zinc-950 flex-col border-r border-zinc-800 z-40">
        {iconNav}
      </aside>

      {/* Desktop full sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-zinc-950 flex-col border-r border-zinc-800 z-40">
        {fullNav}
      </aside>
    </>
  );
}
