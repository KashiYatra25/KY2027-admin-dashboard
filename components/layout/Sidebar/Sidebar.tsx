"use client";
import { LayoutDashboard, Users, Users2, GraduationCap, Settings, LogOut, X, Zap, Calendar, Ticket, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { useAdminSession, type RoleLevel } from "@/lib/auth";
import { useAdminLogout } from "@/lib/api/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION CONFIG WITH ROLE-BASED ACCESS
// ═══════════════════════════════════════════════════════════════════

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  /** Roles that can access this route. If undefined, all roles can access. */
  allowedRoles?: RoleLevel[];
}

// Main navigation - filtered by role
const mainNavConfig: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  // Users: MASTER_ADMIN and MANAGER only
  { icon: Users2, label: "Users", href: "/users", allowedRoles: ["MASTER_ADMIN", "MANAGER"] },
  // CA Applications: MASTER_ADMIN and MANAGER only
  { icon: GraduationCap, label: "CA Applications", href: "/campus-ambassadors", allowedRoles: ["MASTER_ADMIN", "MANAGER"] },
  // Teams: MASTER_ADMIN and MANAGER only
  { icon: Users, label: "Teams", href: "/teams", allowedRoles: ["MASTER_ADMIN", "MANAGER"] },
  // Registrations: MASTER_ADMIN and MANAGER only
  { icon: ClipboardList, label: "Registrations", href: "/registrations", allowedRoles: ["MASTER_ADMIN", "MANAGER"] },
  // Schedule: MASTER_ADMIN and MANAGER only
  { icon: Calendar, label: "Schedule", href: "/schedule", allowedRoles: ["MASTER_ADMIN", "MANAGER"] },
  // Coupons: MASTER_ADMIN only
  { icon: Ticket, label: "Coupons", href: "/coupons", allowedRoles: ["MASTER_ADMIN"] },
];

// Admin navigation - filtered by role
const adminNavConfig: NavItem[] = [
  // Admin Users: MASTER_ADMIN and MANAGER only
  { icon: Users, label: "Admin Users", href: "/admin-users", allowedRoles: ["MASTER_ADMIN", "MANAGER"] },
  // Settings: All roles can access their own settings
  { icon: Settings, label: "Settings", href: "/settings" },
];

// Filter nav items based on user role
function filterNavByRole(navItems: NavItem[], userRole: RoleLevel | undefined): NavItem[] {
  if (!userRole) return [];
  return navItems.filter(item => {
    // If no allowedRoles specified, all roles can access
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  });
}

export default function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { session: admin } = useAdminSession();
  const { logout, isPending: isLoggingOut } = useAdminLogout();

  const email = admin?.email ?? "";
  const displayName = email ? email.split("@")[0] : "Guest";
  const initials = (email ? email.slice(0, 2) : "GU").toUpperCase();
  const role = admin?.role ?? "Admin";

  // Filter navigation based on user role
  const mainNav = useMemo(() => filterNavByRole(mainNavConfig, admin?.role), [admin?.role]);
  const adminNav = useMemo(() => filterNavByRole(adminNavConfig, admin?.role), [admin?.role]);

  const handleLogout = () => {
    logout();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Full nav link (desktop/mobile drawer)
  const NavLink = ({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          active
            ? "bg-sidebar-active text-sidebar"
            : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover"
        )}
      >
        <Icon className="size-[18px]" />
        <span>{label}</span>
      </Link>
    );
  };

  // Icon-only link (tablet rail)
  const IconLink = ({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        title={label}
        className={cn(
          "flex items-center justify-center size-10 rounded-lg transition-all duration-200",
          active
            ? "bg-sidebar-active text-sidebar"
            : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover"
        )}
      >
        <Icon className="size-[18px]" />
      </Link>
    );
  };

  // Logo component
  const Logo = ({ full }: { full: boolean }) => (
    <div className={cn("flex items-center", full ? "gap-3 px-4 py-5" : "justify-center py-5")}>
      <div className="size-9 rounded-lg bg-sidebar-active flex items-center justify-center">
        <Zap className="size-5 text-sidebar" />
      </div>
      {full && (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-sidebar-foreground tracking-tight">Kashiyatra</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sidebar-hover text-sidebar-muted uppercase">
            Admin
          </span>
        </div>
      )}
    </div>
  );

  // User section
  const UserSection = ({ full }: { full: boolean }) => (
    <div className={cn("border-t border-sidebar-border", full ? "p-3" : "p-2")}>
      {full ? (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-hover transition-colors">
          <Avatar className="size-9">
            <AvatarFallback className="bg-sidebar-active text-sidebar text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
            <p className="text-xs text-sidebar-muted truncate">{role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="size-8 text-sidebar-muted hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className={cn("size-4", isLoggingOut && "animate-pulse")} />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="size-10 mx-auto text-sidebar-muted hover:text-red-400 hover:bg-red-500/10"
          title="Logout"
        >
          <LogOut className={cn("size-4", isLoggingOut && "animate-pulse")} />
        </Button>
      )}
    </div>
  );

  // Section label
  const SectionLabel = ({ label }: { label: string }) => (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted/60 px-3 mb-2 mt-5">
      {label}
    </p>
  );

  const fullNav = (
    <>
      <Logo full />
      <Separator className="bg-sidebar-border" />
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
      <Separator className="bg-sidebar-border mx-2" />
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto flex flex-col items-center">
        {mainNav.map((item) => (
          <IconLink key={item.label} {...item} />
        ))}
        <Separator className="bg-sidebar-border my-2 w-6" />
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
          "fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col border-r border-sidebar-border z-50 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-3 size-8 text-sidebar-muted hover:text-sidebar-foreground"
        >
          <X className="size-4" />
        </Button>
        {fullNav}
      </aside>

      {/* Tablet icon rail */}
      <aside className="hidden md:flex lg:hidden fixed left-0 top-0 h-screen w-16 bg-sidebar flex-col border-r border-sidebar-border z-40">
        {iconNav}
      </aside>

      {/* Desktop full sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-sidebar flex-col border-r border-sidebar-border z-40">
        {fullNav}
      </aside>
    </>
  );
}
