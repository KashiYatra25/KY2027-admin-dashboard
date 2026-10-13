"use client";

import { useState, useMemo } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard, MasterAdminGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useChangeCouponStatus, useDeleteCoupon } from "@/lib/api/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
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
  Ticket,
  Plus,
  Loader2,
  XCircle,
  Search,
  Percent,
  IndianRupee,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Copy,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Coupon, CouponStatus, CouponType } from "@/lib/api/helper/types";
import { CreateCouponModal } from "@/components/modals/CreateCouponModal";
import { EditCouponModal } from "@/components/modals/EditCouponModal";
import { DeleteCouponModal } from "@/components/modals/DeleteCouponModal";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type ExtendedCoupon = Coupon & {
  _searchCode: string;
  _searchDescription: string;
};

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const statusConfig: Record<CouponStatus, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: "Active", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-500/10" },
  EXPIRED: { label: "Expired", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/10" },
  DISABLED: { label: "Disabled", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500/10" },
};

const typeConfig: Record<CouponType, { label: string; icon: React.ElementType }> = {
  PERCENTAGE: { label: "Percentage", icon: Percent },
  FIXED: { label: "Fixed", icon: IndianRupee },
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
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border/50">
        <Skeleton className="h-9 w-[300px]" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48 flex-1" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-24 hidden md:block" />
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
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function CouponsPage() {
  const { coupons, isLoading, isError, refetch } = useCoupons();
  const { createCoupon, isPending: isCreating } = useCreateCoupon();
  const { updateCoupon, isPending: isUpdating } = useUpdateCoupon();
  const { changeCouponStatus, isPending: isChangingStatus } = useChangeCouponStatus();
  const { deleteCoupon, isPending: isDeleting } = useDeleteCoupon();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Prepare data with searchable fields
  const preparedData = useMemo(() => {
    return coupons.map((coupon): ExtendedCoupon => ({
      ...coupon,
      _searchCode: coupon.code.toLowerCase(),
      _searchDescription: (coupon.description || "").toLowerCase(),
    }));
  }, [coupons]);

  // Apply filters
  const filteredData = useMemo(() => {
    let data = preparedData;
    if (statusFilter.length > 0) {
      data = data.filter((c) => statusFilter.includes(c.status));
    }
    if (typeFilter.length > 0) {
      data = data.filter((c) => typeFilter.includes(c.type));
    }
    return data;
  }, [preparedData, statusFilter, typeFilter]);

  // Table state
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
  } = useTableState<ExtendedCoupon>({
    data: filteredData,
    initialPageSize: 10,
    searchableFields: ["_searchCode", "_searchDescription"],
    sortableFields: ["createdAt", "_searchCode", "value"],
  });

  // Stats
  const activeCount = coupons.filter((c) => c.status === "ACTIVE").length;
  const expiredCount = coupons.filter((c) => c.status === "EXPIRED").length;
  const disabledCount = coupons.filter((c) => c.status === "DISABLED").length;

  // Filter options
  const statusFilterOptions = [
    { label: "Active", value: "ACTIVE", count: activeCount },
    { label: "Expired", value: "EXPIRED", count: expiredCount },
    { label: "Disabled", value: "DISABLED", count: disabledCount },
  ];

  const typeFilterOptions = [
    { label: "Percentage", value: "PERCENTAGE", icon: <Percent className="w-4 h-4" /> },
    { label: "Fixed Amount", value: "FIXED", icon: <IndianRupee className="w-4 h-4" /> },
  ];

  const activeFiltersCount = (searchQuery ? 1 : 0) + (statusFilter.length > 0 ? 1 : 0) + (typeFilter.length > 0 ? 1 : 0);

  const handleResetFilters = () => {
    setStatusFilter([]);
    setTypeFilter([]);
    resetAll();
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = (coupon: Coupon) => {
    const newStatus = coupon.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    changeCouponStatus({ couponId: coupon.id, status: newStatus });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatValue = (coupon: Coupon) => {
    if (coupon.type === "PERCENTAGE") {
      return `${coupon.value}%`;
    }
    return `₹${coupon.value}`;
  };

  return (
    <AuthGuard>
      <MasterAdminGuard>
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
                      <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
                        <p className="text-muted-foreground text-sm">Manage discount coupons</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                  <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Coupon
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard
                  title="Active Coupons"
                  value={activeCount}
                  icon={Ticket}
                  iconClassName="bg-green-500/10 text-green-600 dark:text-green-400"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Expired"
                  value={expiredCount}
                  icon={Ticket}
                  iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Disabled"
                  value={disabledCount}
                  icon={Ticket}
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
                      title="Failed to load coupons"
                      description="There was an error fetching the data. Please try again."
                      action={
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </Button>
                      }
                    />
                  ) : coupons.length === 0 ? (
                    <DataTableEmpty
                      icon={<Ticket className="w-8 h-8 text-muted-foreground" />}
                      title="No coupons found"
                      description="Get started by creating your first coupon."
                      action={
                        <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Create Coupon
                        </Button>
                      }
                    />
                  ) : (
                    <>
                      {/* Toolbar */}
                      <DataTableToolbar activeFiltersCount={activeFiltersCount} onResetFilters={handleResetFilters}>
                        <DataTableSearch
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="Search by code or description..."
                        />
                        <DataTableFilter
                          title="Status"
                          options={statusFilterOptions}
                          selectedValues={statusFilter}
                          onChange={setStatusFilter}
                        />
                        <DataTableFilter
                          title="Type"
                          options={typeFilterOptions}
                          selectedValues={typeFilter}
                          onChange={setTypeFilter}
                        />
                      </DataTableToolbar>

                      {paginatedData.length === 0 ? (
                        <DataTableEmpty
                          icon={<Search className="w-8 h-8 text-muted-foreground" />}
                          title="No results found"
                          description="Try adjusting your search or filters."
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
                                <TableHead className="min-w-[140px]">
                                  <DataTableColumnHeader
                                    label="Code"
                                    sortKey="_searchCode"
                                    currentSortKey={sortKey}
                                    currentSortDirection={sortDirection}
                                    onSort={handleSort}
                                  />
                                </TableHead>
                                <TableHead className="min-w-[200px]">Description</TableHead>
                                <TableHead className="min-w-[100px]">Type</TableHead>
                                <TableHead className="min-w-[100px]">
                                  <DataTableColumnHeader
                                    label="Value"
                                    sortKey="value"
                                    currentSortKey={sortKey}
                                    currentSortDirection={sortDirection}
                                    onSort={handleSort}
                                  />
                                </TableHead>
                                <TableHead className="min-w-[120px]">Usage</TableHead>
                                <TableHead className="min-w-[100px]">Status</TableHead>
                                <TableHead className="hidden lg:table-cell min-w-[120px]">Valid Until</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedData.map((coupon) => {
                                const status = statusConfig[coupon.status];
                                const type = typeConfig[coupon.type];
                                const TypeIcon = type.icon;

                                return (
                                  <TableRow key={coupon.id} className="group border-border/50">
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <code className="font-mono font-semibold text-sm bg-muted px-2 py-1 rounded">
                                          {coupon.code}
                                        </code>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => handleCopyCode(coupon.code)}
                                        >
                                          {copiedCode === coupon.code ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                        {coupon.description || "—"}
                                      </p>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1.5">
                                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{type.label}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <span className="font-semibold">{formatValue(coupon)}</span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm text-muted-foreground">
                                        {coupon.currentUsageCount}
                                        {coupon.maxUsageCount ? ` / ${coupon.maxUsageCount}` : ""}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="secondary"
                                        className={`${status.bgColor} ${status.color} border-0 font-medium`}
                                      >
                                        {status.label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                      <span className="text-sm text-muted-foreground">
                                        {formatDate(coupon.validUntil)}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => setEditingCoupon(coupon)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          {coupon.status !== "EXPIRED" && (
                                            <DropdownMenuItem 
                                              onClick={() => handleToggleStatus(coupon)}
                                              disabled={isChangingStatus}
                                            >
                                              {coupon.status === "ACTIVE" ? (
                                                <>
                                                  <PowerOff className="h-4 w-4 mr-2" />
                                                  Disable
                                                </>
                                              ) : (
                                                <>
                                                  <Power className="h-4 w-4 mr-2" />
                                                  Activate
                                                </>
                                              )}
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => setDeletingCoupon(coupon)}
                                            className="text-red-600 dark:text-red-400"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}

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

        {/* Modals */}
        <CreateCouponModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createCoupon(data, { onSuccess: () => setShowCreateModal(false) })}
          isPending={isCreating}
        />

        <EditCouponModal
          isOpen={!!editingCoupon}
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onSubmit={(data) => updateCoupon({ couponId: editingCoupon!.id, ...data }, { onSuccess: () => setEditingCoupon(null) })}
          isPending={isUpdating}
        />

        <DeleteCouponModal
          isOpen={!!deletingCoupon}
          coupon={deletingCoupon}
          onClose={() => setDeletingCoupon(null)}
          onConfirm={() => deleteCoupon({ couponId: deletingCoupon!.id }, { onSuccess: () => setDeletingCoupon(null) })}
          isPending={isDeleting}
        />
        </SidebarProvider>
      </MasterAdminGuard>
    </AuthGuard>
  );
}
