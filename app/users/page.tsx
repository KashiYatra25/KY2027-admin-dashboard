"use client";

import { useState, useMemo, useEffect } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard, RoleGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAllUsers, useUpgradeToAdmin, useChangeAccountStatus, useInvalidateUserCache, useToggleUserPaidStatus, type RegularUser } from "@/lib/api/hooks";
import { useAdminSession } from "@/lib/auth";
import { SuspendAccountModal, ReactivateAccountModal } from "@/components/modals";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import {
  DataTableSearch,
  DataTablePagination,
  DataTableFilter,
  DataTableToolbar,
  DataTableEmpty,
} from "@/components/ui/data-table";
import {
  RefreshCw,
  Users2,
  UserCog,
  Loader2,
  Building2,
  CreditCard,
  AlertCircle,
  X,
  XCircle,
  Download,
  Search,
  ShieldCheck,
  User,
  ChevronLeft,
  ChevronRight,
  Ban,
  Trash2,
  DollarSign,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconClassName: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, iconClassName, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg hover:border-foreground/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl ${iconClassName} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TABLE SKELETON
// ═══════════════════════════════════════════════════════════════════

function TableSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border/50">
        <Skeleton className="h-9 w-[300px]" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// UPGRADE MODAL
// ═══════════════════════════════════════════════════════════════════

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RegularUser | null;
  onUpgrade: (role: "MANAGER" | "OPERATOR") => void;
  isPending: boolean;
  currentAdminRole?: "MASTER_ADMIN" | "MANAGER" | "OPERATOR";
}

function UpgradeModal({ isOpen, onClose, user, onUpgrade, isPending, currentAdminRole }: UpgradeModalProps) {
  // Only MASTER_ADMIN can create Managers, others can only create Operators
  const canCreateManager = currentAdminRole === "MASTER_ADMIN";
  const [role, setRole] = useState<"MANAGER" | "OPERATOR">("OPERATOR");

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpgrade(role);
  };

  const handleClose = () => {
    setRole("OPERATOR");
    onClose();
  };

  const userName = user.firstName || user.lastName
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : user.slugName;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Upgrade to Admin</CardTitle>
              <CardDescription>Promote user to administrator</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User info */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {user.college && (
                <p className="text-xs text-muted-foreground">{user.college}</p>
              )}
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <Label>Admin Role</Label>
              {canCreateManager ? (
                <Tabs value={role} onValueChange={(v) => setRole(v as "MANAGER" | "OPERATOR")}>
                  <TabsList className="w-full bg-muted/50">
                    <TabsTrigger value="MANAGER" className="flex-1 gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Manager
                    </TabsTrigger>
                    <TabsTrigger value="OPERATOR" className="flex-1 gap-2">
                      <User className="w-4 h-4" />
                      Operator
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                  <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm font-medium">Operator</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {canCreateManager && role === "MANAGER"
                  ? "Managers can invite operators and manage most resources."
                  : "Operators have limited permissions for day-to-day tasks."}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> The user will receive an email with login credentials and must complete onboarding before accessing the admin panel.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <UserCog className="w-4 h-4 mr-2" />
                    Upgrade User
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function UsersPage() {
  const { session: currentAdmin } = useAdminSession();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [iitbhuFilter, setIitbhuFilter] = useState<string[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { users, pagination, isLoading, isError, refetch } = useAllUsers({
    page,
    limit: 20,
    search: debouncedSearch,
  });

  const { upgradeToAdmin, isPending: isUpgrading } = useUpgradeToAdmin();
  const { suspendAccount, reactivateAccount, isPending: isChangingStatus } = useChangeAccountStatus();
  const { invalidateUserCache, isPending: isInvalidatingCache } = useInvalidateUserCache();
  const { toggleUserPaidStatus, isPending: isTogglingPaidStatus } = useToggleUserPaidStatus();
  
  // Only MASTER_ADMIN can clear user cache and toggle paid status
  const isMasterAdmin = currentAdmin?.role === "MASTER_ADMIN";
  
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    user: RegularUser | null;
  }>({ isOpen: false, user: null });

  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    user: RegularUser | null;
  }>({ isOpen: false, user: null });

  const [reactivateModal, setReactivateModal] = useState<{
    isOpen: boolean;
    user: RegularUser | null;
  }>({ isOpen: false, user: null });

  // Filter by IIT BHU status (client-side for current page)
  const filteredUsers = useMemo(() => {
    let result = users;
    
    // Filter by IIT BHU status
    if (iitbhuFilter.length > 0) {
      result = result.filter((user) => {
        if (iitbhuFilter.includes("iitbhu") && user.isFromIITBhu) return true;
        if (iitbhuFilter.includes("external") && !user.isFromIITBhu) return true;
        if (iitbhuFilter.includes("suspended") && user.isSuspended) return true;
        return false;
      });
    }
    
    return result;
  }, [users, iitbhuFilter]);

  // Stats (from current page - for accurate stats, backend should provide totals)
  const iitbhuCount = users.filter((u) => u.isFromIITBhu).length;
  const paidCount = users.filter((u) => u.isPaidUser).length;
  const suspendedCount = users.filter((u) => u.isSuspended).length;

  // Filter options
  const iitbhuFilterOptions = [
    { label: "IIT BHU", value: "iitbhu", icon: <Building2 className="w-4 h-4 text-blue-500" />, count: iitbhuCount },
    { label: "External", value: "external", icon: <User className="w-4 h-4 text-gray-500" />, count: users.length - iitbhuCount },
    { label: "Suspended", value: "suspended", icon: <Ban className="w-4 h-4 text-red-500" />, count: suspendedCount },
  ];

  const activeFiltersCount = (searchQuery ? 1 : 0) + (iitbhuFilter.length > 0 ? 1 : 0);

  const handleResetFilters = () => {
    setIitbhuFilter([]);
    setSearchQuery("");
    setPage(1);
  };

  // Can current admin upgrade users?
  const canUpgrade = currentAdmin?.role === "MASTER_ADMIN" || currentAdmin?.role === "MANAGER";

  const openUpgradeModal = (user: RegularUser) => {
    setUpgradeModal({ isOpen: true, user });
  };

  const openSuspendModal = (user: RegularUser) => {
    setSuspendModal({ isOpen: true, user });
  };

  const openReactivateModal = (user: RegularUser) => {
    setReactivateModal({ isOpen: true, user });
  };

  const handleUpgrade = (role: "MANAGER" | "OPERATOR") => {
    if (!upgradeModal.user) return;
    upgradeToAdmin(
      { targetEmail: upgradeModal.user.email, role },
      {
        onSuccess: () => {
          setUpgradeModal({ isOpen: false, user: null });
          refetch();
        },
      }
    );
  };

  const handleSuspend = (reason: string) => {
    if (!suspendModal.user) return;
    suspendAccount(
      suspendModal.user.email,
      reason,
      {
        onSuccess: () => {
          setSuspendModal({ isOpen: false, user: null });
          refetch();
        },
      }
    );
  };

  const handleReactivate = (reason: string) => {
    if (!reactivateModal.user) return;
    reactivateAccount(
      reactivateModal.user.email,
      reason,
      {
        onSuccess: () => {
          setReactivateModal({ isOpen: false, user: null });
          refetch();
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (user: RegularUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["Name", "Email", "College", "KY ID", "IIT BHU", "Paid", "Joined"];
    const rows = users.map((user) => [
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.slugName,
      user.email,
      user.college || "",
      user.kyId || "",
      user.isFromIITBhu ? "Yes" : "No",
      user.isPaidUser ? "Yes" : "No",
      formatDate(user.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["MASTER_ADMIN", "MANAGER", "OPERATOR"]}>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-0 md:ml-16 lg:ml-60 min-w-0">
              <Topbar />
              <main className="flex-1 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Users2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                      <p className="text-muted-foreground text-sm">Manage registered users</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isLoading || users.length === 0}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Total Users"
                  value={pagination.totalCount}
                  icon={Users2}
                  iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  isLoading={isLoading}
                />
                <StatCard
                  title="IIT BHU Users"
                  value={iitbhuCount}
                  icon={Building2}
                  iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Paid Users"
                  value={paidCount}
                  icon={CreditCard}
                  iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Suspended"
                  value={suspendedCount}
                  icon={AlertCircle}
                  iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
                  isLoading={isLoading}
                />
              </div>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <TableSkeleton />
                  ) : isError ? (
                    <DataTableEmpty
                      icon={<XCircle className="w-8 h-8 text-red-500" />}
                      title="Failed to load users"
                      description="There was an error fetching the data. Please try again."
                      action={
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </Button>
                      }
                    />
                  ) : users.length === 0 && !debouncedSearch ? (
                    <DataTableEmpty
                      icon={<Users2 className="w-8 h-8 text-muted-foreground" />}
                      title="No users yet"
                      description="No users have registered yet."
                    />
                  ) : (
                    <>
                      {/* Toolbar */}
                      <DataTableToolbar activeFiltersCount={activeFiltersCount} onResetFilters={handleResetFilters}>
                        <DataTableSearch
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="Search by name, email, or KY ID..."
                        />
                        <DataTableFilter
                          title="Type"
                          options={iitbhuFilterOptions}
                          selectedValues={iitbhuFilter}
                          onChange={setIitbhuFilter}
                        />
                      </DataTableToolbar>

                      {/* Table content */}
                      {filteredUsers.length === 0 ? (
                        <DataTableEmpty
                          icon={<Search className="w-8 h-8 text-muted-foreground" />}
                          title="No results found"
                          description="Try adjusting your search or filters to find what you're looking for."
                          action={
                            <Button variant="outline" size="sm" onClick={handleResetFilters}>
                              Clear filters
                            </Button>
                          }
                        />
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="min-w-[280px]">User</TableHead>
                                <TableHead className="hidden md:table-cell min-w-[180px]">College</TableHead>
                                <TableHead className="min-w-[100px]">Status</TableHead>
                                <TableHead className="hidden lg:table-cell min-w-[100px]">Joined</TableHead>
                                <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="group border-border/50">
                                  <TableCell>
                                    <div className="flex items-center gap-4">
                                      <Avatar className="h-10 w-10 border border-border/50">
                                        {user.googleAvatarUrl && (
                                          <AvatarImage src={user.googleAvatarUrl} alt={user.slugName} />
                                        )}
                                        <AvatarFallback className="text-sm bg-muted font-medium">
                                          {getInitials(user)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                          {user.firstName || user.lastName
                                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                            : user.slugName}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                        {user.kyId && (
                                          <p className="text-xs text-muted-foreground font-mono">{user.kyId}</p>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <p className="text-sm text-foreground/80 max-w-[200px] truncate">
                                      {user.college || "—"}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      {user.isSuspended && (
                                        <Badge variant="destructive" className="gap-1 text-xs w-fit">
                                          <Ban className="w-3 h-3" />
                                          Suspended
                                        </Badge>
                                      )}
                                      {user.isFromIITBhu && (
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 gap-1 text-xs w-fit">
                                          <Building2 className="w-3 h-3" />
                                          IIT BHU
                                        </Badge>
                                      )}
                                      {user.isPaidUser && (
                                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0 gap-1 text-xs w-fit">
                                          <CreditCard className="w-3 h-3" />
                                          Paid
                                        </Badge>
                                      )}
                                      {!user.isFromIITBhu && !user.isPaidUser && !user.isSuspended && (
                                        <span className="text-xs text-muted-foreground">Free user</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {canUpgrade && !user.isSuspended && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openUpgradeModal(user)}
                                          className="gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:text-blue-400 border-border/50"
                                        >
                                          <UserCog className="w-4 h-4" />
                                          <span className="hidden sm:inline">Upgrade</span>
                                        </Button>
                                      )}
                                      {canUpgrade && !user.isSuspended && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openSuspendModal(user)}
                                          className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400 border-border/50"
                                        >
                                          <Ban className="w-4 h-4" />
                                          <span className="hidden sm:inline">Suspend</span>
                                        </Button>
                                      )}
                                      {canUpgrade && user.isSuspended && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openReactivateModal(user)}
                                          className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:text-emerald-400 border-border/50"
                                        >
                                          <RefreshCw className="w-4 h-4" />
                                          <span className="hidden sm:inline">Reactivate</span>
                                        </Button>
                                      )}
                                      {isMasterAdmin && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => invalidateUserCache(user.id)}
                                          disabled={isInvalidatingCache}
                                          className="gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-500/10 dark:text-orange-400 border-border/50"
                                          title="Clear cached data for this user"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          <span className="hidden sm:inline">Clear Cache</span>
                                        </Button>
                                      )}
                                      {isMasterAdmin && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => toggleUserPaidStatus(user.id, {
                                            onSuccess: () => refetch(),
                                          })}
                                          disabled={isTogglingPaidStatus}
                                          className={`gap-1.5 border-border/50 ${
                                            user.isPaidUser
                                              ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10 dark:text-green-400"
                                              : "text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500/10 dark:text-gray-400"
                                          }`}
                                          title={user.isPaidUser ? "Mark as unpaid" : "Mark as paid"}
                                        >
                                          <DollarSign className="w-4 h-4" />
                                          <span className="hidden sm:inline">{user.isPaidUser ? "Paid ✓" : "Mark Paid"}</span>
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Pagination */}
                      {filteredUsers.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
                          <p className="text-sm text-muted-foreground">
                            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} users
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={!pagination.hasPrevPage}
                            >
                              <ChevronLeft className="w-4 h-4" />
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-2">
                              Page {page} of {pagination.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage((p) => p + 1)}
                              disabled={!pagination.hasNextPage}
                            >
                              Next
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </main>
          </div>
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={upgradeModal.isOpen}
          onClose={() => setUpgradeModal({ isOpen: false, user: null })}
          user={upgradeModal.user}
          onUpgrade={handleUpgrade}
          isPending={isUpgrading}
          currentAdminRole={currentAdmin?.role}
        />

        {/* Suspend Modal */}
        <SuspendAccountModal
          isOpen={suspendModal.isOpen}
          onClose={() => setSuspendModal({ isOpen: false, user: null })}
          user={suspendModal.user}
          onSuspend={handleSuspend}
          isPending={isChangingStatus}
        />

        {/* Reactivate Modal */}
        <ReactivateAccountModal
          isOpen={reactivateModal.isOpen}
          onClose={() => setReactivateModal({ isOpen: false, user: null })}
          user={reactivateModal.user}
          onReactivate={handleReactivate}
          isPending={isChangingStatus}
        />
        </SidebarProvider>
      </RoleGuard>
    </AuthGuard>
  );
}
