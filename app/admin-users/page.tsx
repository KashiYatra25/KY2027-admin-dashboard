"use client";

import { useState, useMemo } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard, ManagerGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAdminUsers, useInviteAdmin, useInvalidateUserCache, useChangeAdminRole } from "@/lib/api/hooks";
import { useAdminSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import {
  DataTableSearch,
  DataTablePagination,
  DataTableColumnHeader,
  DataTableFilter,
  DataTableToolbar,
  DataTableEmpty,
  useTableState,
} from "@/components/ui/data-table";
import {
  RefreshCw,
  Users,
  UserPlus,
  Loader2,
  Crown,
  ShieldCheck,
  User,
  X,
  XCircle,
  Download,
  Search,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import type { RoleLevel } from "@/lib/api/helper/types";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: { level: RoleLevel };
  createdAt: string;
}

type ExtendedAdminUser = AdminUser & {
  _searchName: string;
  _searchEmail: string;
  _roleLevel: string;
};

// ═══════════════════════════════════════════════════════════════════
// ROLE CONFIG
// ═══════════════════════════════════════════════════════════════════

const roleConfig: Record<RoleLevel, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  MASTER_ADMIN: { label: "Master Admin", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/10", icon: Crown },
  MANAGER: { label: "Manager", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10", icon: ShieldCheck },
  OPERATOR: { label: "Operator", color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-500/10", icon: User },
};

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
      {/* Toolbar skeleton */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border/50">
        <Skeleton className="h-9 w-[300px]" />
        <Skeleton className="h-9 w-24" />
      </div>
      {/* Rows skeleton */}
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-4 w-24 hidden md:block" />
          </div>
        ))}
      </div>
      {/* Pagination skeleton */}
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
// INVITE MODAL
// ═══════════════════════════════════════════════════════════════════

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: "MANAGER" | "OPERATOR") => void;
  isPending: boolean;
  currentAdminRole?: "MASTER_ADMIN" | "MANAGER" | "OPERATOR";
}

function InviteModal({ isOpen, onClose, onInvite, isPending, currentAdminRole }: InviteModalProps) {
  // Only MASTER_ADMIN can invite Managers, others can only invite Operators
  const canInviteManager = currentAdminRole === "MASTER_ADMIN";
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MANAGER" | "OPERATOR">("OPERATOR");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim(), role);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("OPERATOR");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <CardTitle>Invite Admin</CardTitle>
              <CardDescription>Add a new administrator to your team</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                User must already have an account on Kashiyatra
              </p>
            </div>
            
            {canInviteManager && (
              <div className="space-y-3">
                <Label>Role</Label>
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
                <p className="text-xs text-muted-foreground">
                  {role === "MANAGER" 
                    ? "Managers can invite operators and manage most resources."
                    : "Operators have limited permissions for day-to-day tasks."}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending || !email.trim()}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Invite
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
// CHANGE ROLE MODAL
// ═══════════════════════════════════════════════════════════════════

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminUser | null;
  onChangeRole: (newRole: "MANAGER" | "OPERATOR") => void;
  isPending: boolean;
}

function ChangeRoleModal({ isOpen, onClose, admin, onChangeRole, isPending }: ChangeRoleModalProps) {
  const currentRole = admin?.role?.level;
  const newRole: "MANAGER" | "OPERATOR" = currentRole === "MANAGER" ? "OPERATOR" : "MANAGER";
  const isPromotion = newRole === "MANAGER";

  if (!isOpen || !admin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeRole(newRole);
  };

  const adminName = admin.firstName || admin.lastName
    ? `${admin.firstName || ""} ${admin.lastName || ""}`.trim()
    : admin.email?.split("@")[0] || "Unknown";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isPromotion ? "bg-blue-500/10" : "bg-violet-500/10"}`}>
              <ArrowUpDown className={`h-5 w-5 ${isPromotion ? "text-blue-600 dark:text-blue-400" : "text-violet-600 dark:text-violet-400"}`} />
            </div>
            <div>
              <CardTitle>{isPromotion ? "Promote" : "Demote"} Admin</CardTitle>
              <CardDescription>
                {isPromotion ? "Upgrade to Manager role" : "Downgrade to Operator role"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Admin info */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarFallback className="text-sm bg-muted font-medium">
                    {(admin.email?.slice(0, 2) || "AD").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{adminName}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
              </div>
              
              {/* Role change visualization */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <Badge
                  variant="secondary"
                  className={`${roleConfig[currentRole as RoleLevel]?.bgColor || ""} ${roleConfig[currentRole as RoleLevel]?.color || ""} border-0 gap-1.5 font-medium`}
                >
                  {currentRole === "MANAGER" ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  {roleConfig[currentRole as RoleLevel]?.label || currentRole}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge
                  variant="secondary"
                  className={`${roleConfig[newRole]?.bgColor || ""} ${roleConfig[newRole]?.color || ""} border-0 gap-1.5 font-medium`}
                >
                  {newRole === "MANAGER" ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  {roleConfig[newRole]?.label || newRole}
                </Badge>
              </div>
            </div>

            {/* Warning/Info */}
            <div className={`p-3 rounded-lg border ${isPromotion ? "bg-blue-500/10 border-blue-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
              <p className={`text-xs ${isPromotion ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                {isPromotion ? (
                  <>
                    <strong>Promotion:</strong> This admin will gain Manager permissions, including the ability to invite Operators and manage more resources.
                  </>
                ) : (
                  <>
                    <strong>Demotion:</strong> This admin will lose Manager permissions and become an Operator with limited access.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                variant={isPromotion ? "default" : "destructive"}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isPromotion ? "Promoting..." : "Demoting..."}
                  </>
                ) : (
                  <>
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {isPromotion ? "Promote to Manager" : "Demote to Operator"}
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

export default function AdminUsersPage() {
  const { admins, isLoading, isError, refetch } = useAdminUsers();
  const { inviteAdmin, isPending: isInviting } = useInviteAdmin();
  const { invalidateUserCache, isPending: isInvalidatingCache } = useInvalidateUserCache();
  const { changeAdminRole, isPending: isChangingRole } = useChangeAdminRole();
  const { session: currentAdmin } = useAdminSession();
  const isMasterAdmin = currentAdmin?.role === "MASTER_ADMIN";
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [changeRoleModal, setChangeRoleModal] = useState<{
    isOpen: boolean;
    admin: AdminUser | null;
  }>({ isOpen: false, admin: null });
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  // Prepare data with searchable fields
  const preparedData = useMemo(() => {
    return admins.map((admin): ExtendedAdminUser => ({
      ...admin,
      _searchName: `${admin.firstName || ""} ${admin.lastName || ""}`.trim().toLowerCase(),
      _searchEmail: (admin.email || "").toLowerCase(),
      _roleLevel: admin.role?.level || "OPERATOR",
    }));
  }, [admins]);

  // Apply role filter before table state
  const roleFilteredData = useMemo(() => {
    if (roleFilter.length === 0) return preparedData;
    return preparedData.filter((admin) => roleFilter.includes(admin._roleLevel));
  }, [preparedData, roleFilter]);

  // Table state hook
  const {
    searchQuery,
    setSearchQuery,
    sortKey,
    sortDirection,
    handleSort,
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize,
    paginatedData,
    totalItems,
    resetAll,
  } = useTableState<ExtendedAdminUser>({
    data: roleFilteredData,
    initialPageSize: 10,
    searchableFields: ["_searchName", "_searchEmail"],
    sortableFields: ["createdAt", "_searchName", "_searchEmail"],
  });

  // Stats
  const masterAdminCount = admins.filter((a) => a.role?.level === "MASTER_ADMIN").length;
  const managerCount = admins.filter((a) => a.role?.level === "MANAGER").length;
  const operatorCount = admins.filter((a) => a.role?.level === "OPERATOR").length;

  // Filter options for role - only show roles the user can see
  const roleFilterOptions = useMemo(() => {
    if (currentAdmin?.role === "MASTER_ADMIN") {
      return [
        { label: "Master Admin", value: "MASTER_ADMIN", icon: <Crown className="w-4 h-4 text-amber-500" />, count: masterAdminCount },
        { label: "Manager", value: "MANAGER", icon: <ShieldCheck className="w-4 h-4 text-blue-500" />, count: managerCount },
        { label: "Operator", value: "OPERATOR", icon: <User className="w-4 h-4 text-violet-500" />, count: operatorCount },
      ];
    }
    // Managers can only see Operators
    return [
      { label: "Operator", value: "OPERATOR", icon: <User className="w-4 h-4 text-violet-500" />, count: operatorCount },
    ];
  }, [currentAdmin?.role, masterAdminCount, managerCount, operatorCount]);

  // Count active filters
  const activeFiltersCount = (searchQuery ? 1 : 0) + (roleFilter.length > 0 ? 1 : 0);

  const handleResetFilters = () => {
    setRoleFilter([]);
    resetAll();
  };

  const canInvite = currentAdmin?.role === "MASTER_ADMIN" || currentAdmin?.role === "MANAGER";

  const handleInvite = (email: string, role: "MANAGER" | "OPERATOR") => {
    inviteAdmin(
      { targetEmail: email, role },
      { onSuccess: () => setShowInviteModal(false) }
    );
  };

  const handleChangeRole = (newRole: "MANAGER" | "OPERATOR") => {
    if (!changeRoleModal.admin) return;
    changeAdminRole(
      { targetEmail: changeRoleModal.admin.email, newRole },
      { onSuccess: () => setChangeRoleModal({ isOpen: false, admin: null }) }
    );
  };

  const openChangeRoleModal = (admin: AdminUser) => {
    setChangeRoleModal({ isOpen: true, admin });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["Name", "Email", "Role", "Added On"];
    const rows = admins.map((admin) => [
      `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || admin.email?.split("@")[0] || "Unknown",
      admin.email || "",
      admin.role?.level || "OPERATOR",
      formatDate(admin.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-users-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard>
      <ManagerGuard>
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
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Admin Users</h1>
                      <p className="text-muted-foreground text-sm">Manage administrator access</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isLoading || admins.length === 0}
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
                  {canInvite && (
                    <Button size="sm" onClick={() => setShowInviteModal(true)} className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Invite Admin
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats - Only show stats relevant to the user's role */}
              {currentAdmin?.role === "MASTER_ADMIN" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <StatCard
                    title="Master Admins"
                    value={masterAdminCount}
                    icon={Crown}
                    iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Managers"
                    value={managerCount}
                    icon={ShieldCheck}
                    iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Operators"
                    value={operatorCount}
                    icon={User}
                    iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <TableSkeleton />
                  ) : isError ? (
                    <DataTableEmpty
                      icon={<XCircle className="w-8 h-8 text-red-500" />}
                      title="Failed to load admins"
                      description="There was an error fetching the data. Please try again."
                      action={
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </Button>
                      }
                    />
                  ) : admins.length === 0 ? (
                    <DataTableEmpty
                      icon={<Users className="w-8 h-8 text-muted-foreground" />}
                      title="No admins found"
                      description="Get started by inviting your first administrator."
                      action={
                        canInvite ? (
                          <Button size="sm" onClick={() => setShowInviteModal(true)} className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Invite Admin
                          </Button>
                        ) : undefined
                      }
                    />
                  ) : (
                    <>
                      {/* Toolbar */}
                      <DataTableToolbar activeFiltersCount={activeFiltersCount} onResetFilters={handleResetFilters}>
                        <DataTableSearch
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="Search by name or email..."
                        />
                        {currentAdmin?.role === "MASTER_ADMIN" && (
                          <DataTableFilter
                            title="Role"
                            options={roleFilterOptions}
                            selectedValues={roleFilter}
                            onChange={setRoleFilter}
                          />
                        )}
                      </DataTableToolbar>

                      {/* Table content */}
                      {paginatedData.length === 0 ? (
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
                                <TableHead className="min-w-[320px]">
                                  <DataTableColumnHeader
                                    label="User"
                                    sortKey="_searchName"
                                    currentSortKey={sortKey}
                                    currentSortDirection={sortDirection}
                                    onSort={handleSort}
                                  />
                                </TableHead>
                                <TableHead className="min-w-[140px]">Role</TableHead>
                                <TableHead className="hidden md:table-cell min-w-[120px]">
                                  <DataTableColumnHeader
                                    label="Added On"
                                    sortKey="createdAt"
                                    currentSortKey={sortKey}
                                    currentSortDirection={sortDirection}
                                    onSort={handleSort}
                                  />
                                </TableHead>
                                {isMasterAdmin && (
                                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedData.map((adminUser) => {
                                const roleLevel = adminUser.role?.level as RoleLevel | undefined;
                                const config = roleLevel ? roleConfig[roleLevel] : roleConfig.OPERATOR;
                                const RoleIcon = config.icon;
                                const isCurrentUser = adminUser.email === currentAdmin?.email;

                                return (
                                  <TableRow key={adminUser.id} className="group border-border/50">
                                    <TableCell>
                                      <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border border-border/50">
                                          <AvatarFallback className="text-sm bg-muted font-medium">
                                            {(adminUser.email?.slice(0, 2) || "AD").toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium text-foreground">
                                              {adminUser.firstName || adminUser.lastName
                                                ? `${adminUser.firstName || ""} ${adminUser.lastName || ""}`.trim()
                                                : adminUser.email?.split("@")[0] || "Unknown"}
                                            </p>
                                            {isCurrentUser && (
                                              <Badge variant="secondary" className="text-xs shrink-0">
                                                You
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground">{adminUser.email || "—"}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="secondary"
                                        className={`${config.bgColor} ${config.color} border-0 gap-1.5 font-medium`}
                                      >
                                        <RoleIcon className="w-3.5 h-3.5" />
                                        {config.label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                      <p className="text-sm text-muted-foreground">{formatDate(adminUser.createdAt)}</p>
                                    </TableCell>
                                    {isMasterAdmin && (
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          {/* Change Role button - only for non-MASTER_ADMIN and non-self */}
                                          {roleLevel !== "MASTER_ADMIN" && !isCurrentUser && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => openChangeRoleModal(adminUser)}
                                              disabled={isChangingRole}
                                              className="gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:text-blue-400 border-border/50"
                                              title={roleLevel === "MANAGER" ? "Demote to Operator" : "Promote to Manager"}
                                            >
                                              <ArrowUpDown className="w-4 h-4" />
                                              <span className="hidden sm:inline">Change Role</span>
                                            </Button>
                                          )}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => invalidateUserCache(adminUser.id)}
                                            disabled={isInvalidatingCache}
                                            className="gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-500/10 dark:text-orange-400 border-border/50"
                                            title="Clear cached data for this admin"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Clear Cache</span>
                                          </Button>
                                        </div>
                                      </TableCell>
                                    )}
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Pagination */}
                      {paginatedData.length > 0 && (
                        <DataTablePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          pageSize={pageSize}
                          totalItems={totalItems}
                          onPageChange={setCurrentPage}
                          onPageSizeChange={setPageSize}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </main>
          </div>
        </div>

        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          isPending={isInviting}
          currentAdminRole={currentAdmin?.role}
        />

        <ChangeRoleModal
          isOpen={changeRoleModal.isOpen}
          onClose={() => setChangeRoleModal({ isOpen: false, admin: null })}
          admin={changeRoleModal.admin}
          onChangeRole={handleChangeRole}
          isPending={isChangingRole}
        />
        </SidebarProvider>
      </ManagerGuard>
    </AuthGuard>
  );
}
