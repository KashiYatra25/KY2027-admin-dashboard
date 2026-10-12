"use client";

import { useState, useMemo } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useCAApplications, useApproveCA } from "@/lib/api/hooks";
import { RejectionModal } from "@/components/modals";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import {
  DataTableSearch,
  DataTablePagination,
  DataTableColumnHeader,
  DataTableFilter,
  DataTableToolbar,
  DataTableEmpty,
  useTableState,
  type SortDirection,
} from "@/components/ui/data-table";
import {
  Check,
  X,
  Loader2,
  RefreshCw,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Search,
} from "lucide-react";
import type { CAApplication, CAApplicationStatus } from "@/lib/api/helper/types";

// ═══════════════════════════════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════════════════════════════

const statusConfig: Record<CAApplicationStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/10", icon: Clock },
  ACCEPTED: { label: "Accepted", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/10", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500/10", icon: XCircle },
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
              <Skeleton className="h-4 w-20" />
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
            <Skeleton className="h-4 w-32 hidden md:block" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-24 hidden lg:block" />
            <Skeleton className="h-8 w-36" />
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
// EXTENDED APPLICATION TYPE FOR TABLE
// ═══════════════════════════════════════════════════════════════════

type ExtendedCAApplication = CAApplication & {
  _searchName: string;
  _searchEmail: string;
  _searchCollege: string;
};

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function CAApplicationsPage() {
  const { applications, isLoading, isError, refetch } = useCAApplications();
  const { approveCA, isPending: isApproving } = useApproveCA();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Rejection modal state
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    applicationId: string | null;
    applicantName: string | null;
  }>({ isOpen: false, applicationId: null, applicantName: null });

  // Prepare data with searchable fields
  const preparedData = useMemo(() => {
    return applications.map((app): ExtendedCAApplication => ({
      ...app,
      _searchName: `${app.user?.firstName || ""} ${app.user?.lastName || ""}`.trim().toLowerCase(),
      _searchEmail: (app.user?.email || "").toLowerCase(),
      _searchCollege: (app.user?.college || "").toLowerCase(),
    }));
  }, [applications]);

  // Apply status filter before table state
  const statusFilteredData = useMemo(() => {
    if (statusFilter.length === 0) return preparedData;
    return preparedData.filter((app) => statusFilter.includes(app.status));
  }, [preparedData, statusFilter]);

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
  } = useTableState<ExtendedCAApplication>({
    data: statusFilteredData,
    initialPageSize: 10,
    searchableFields: ["_searchName", "_searchEmail", "_searchCollege"],
    sortableFields: ["createdAt", "_searchName", "_searchCollege"],
  });

  // Stats
  const pendingCount = applications.filter((app) => app.status === "PENDING").length;
  const acceptedCount = applications.filter((app) => app.status === "ACCEPTED").length;
  const rejectedCount = applications.filter((app) => app.status === "REJECTED").length;
  const acceptanceRate =
    applications.length > 0 ? Math.round((acceptedCount / applications.length) * 100) : 0;

  // Filter options for status
  const statusFilterOptions = [
    { label: "Pending", value: "PENDING", icon: <Clock className="w-4 h-4 text-amber-500" />, count: pendingCount },
    { label: "Accepted", value: "ACCEPTED", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, count: acceptedCount },
    { label: "Rejected", value: "REJECTED", icon: <XCircle className="w-4 h-4 text-red-500" />, count: rejectedCount },
  ];

  // Count active filters
  const activeFiltersCount = (searchQuery ? 1 : 0) + (statusFilter.length > 0 ? 1 : 0);

  const handleResetFilters = () => {
    setStatusFilter([]);
    resetAll();
  };

  const handleApprove = (applicationId: string) => {
    setProcessingId(applicationId);
    approveCA({ applicationId, action: "ACCEPTED" }, { onSettled: () => setProcessingId(null) });
  };

  const openRejectionModal = (app: CAApplication) => {
    const name =
      app.user?.firstName || app.user?.lastName
        ? `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim()
        : null;
    setRejectionModal({
      isOpen: true,
      applicationId: app.id,
      applicantName: name,
    });
  };

  const handleReject = (reason: string) => {
    if (!rejectionModal.applicationId) return;

    setProcessingId(rejectionModal.applicationId);
    approveCA(
      {
        applicationId: rejectionModal.applicationId,
        action: "REJECTED",
        rejectionReason: reason,
      },
      {
        onSettled: () => {
          setProcessingId(null);
          setRejectionModal({ isOpen: false, applicationId: null, applicantName: null });
        },
      }
    );
  };

  const closeRejectionModal = () => {
    if (!isApproving) {
      setRejectionModal({ isOpen: false, applicationId: null, applicantName: null });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (app: CAApplication) => {
    if (app.user?.firstName && app.user?.lastName) {
      return `${app.user.firstName[0]}${app.user.lastName[0]}`.toUpperCase();
    }
    if (app.user?.email) {
      return app.user.email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["Name", "Email", "College", "Status", "Applied On"];
    const rows = applications.map((app) => [
      `${app.user?.firstName || ""} ${app.user?.lastName || ""}`.trim() || "Unknown",
      app.user?.email || "",
      app.user?.college || "",
      app.status,
      formatDate(app.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ca-applications-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard>
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
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Campus Ambassadors</h1>
                      <p className="text-muted-foreground text-sm">Review and manage CA applications</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isLoading || applications.length === 0}
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
                  title="Pending Review"
                  value={pendingCount}
                  icon={Clock}
                  iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Accepted"
                  value={acceptedCount}
                  icon={CheckCircle2}
                  iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  isLoading={isLoading}
                />
                <StatCard
                  title="Rejected"
                  value={rejectedCount}
                  icon={XCircle}
                  iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
                  isLoading={isLoading}
                />
                {isLoading ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="w-12 h-12 rounded-xl" />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="hover:shadow-lg hover:border-foreground/10 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold tracking-tight">{acceptanceRate}%</p>
                          <p className="text-sm text-muted-foreground mt-1">Acceptance Rate</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <TableSkeleton />
                  ) : isError ? (
                    <DataTableEmpty
                      icon={<XCircle className="w-8 h-8 text-red-500" />}
                      title="Failed to load applications"
                      description="There was an error fetching the data. Please try again."
                      action={
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </Button>
                      }
                    />
                  ) : applications.length === 0 ? (
                    <DataTableEmpty
                      icon={<GraduationCap className="w-8 h-8 text-muted-foreground" />}
                      title="No applications yet"
                      description="No CA applications have been submitted yet. Check back later."
                    />
                  ) : (
                    <>
                      {/* Toolbar */}
                      <DataTableToolbar activeFiltersCount={activeFiltersCount} onResetFilters={handleResetFilters}>
                        <DataTableSearch
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="Search by name, email, or college..."
                        />
                        <DataTableFilter
                          title="Status"
                          options={statusFilterOptions}
                          selectedValues={statusFilter}
                          onChange={setStatusFilter}
                        />
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
                                <TableHead className="min-w-[280px]">
                                  <DataTableColumnHeader
                                    label="Applicant"
                                    sortKey="_searchName"
                                    currentSortKey={sortKey}
                                    currentSortDirection={sortDirection}
                                    onSort={handleSort}
                                  />
                                </TableHead>
                                <TableHead className="hidden md:table-cell min-w-[200px]">
                                  <DataTableColumnHeader
                                    label="College"
                                    sortKey="_searchCollege"
                                    currentSortKey={sortKey}
                                    currentSortDirection={sortDirection}
                                    onSort={handleSort}
                                  />
                                </TableHead>
                                <TableHead className="min-w-[120px]">Status</TableHead>
                                <TableHead className="hidden lg:table-cell min-w-[120px]">
                                  <DataTableColumnHeader
                                    label="Applied On"
                                    sortKey="createdAt"
                                    currentSortKey={sortKey}
                                    currentSortDirection={sortDirection}
                                    onSort={handleSort}
                                  />
                                </TableHead>
                                <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedData.map((app) => {
                                const config = statusConfig[app.status];
                                const StatusIcon = config.icon;
                                const isProcessing = processingId === app.id;

                                return (
                                  <TableRow key={app.id} className="group border-border/50">
                                    <TableCell>
                                      <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border border-border/50">
                                          <AvatarFallback className="text-sm bg-muted font-medium">
                                            {getInitials(app)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                          <p className="font-medium text-foreground">
                                            {app.user?.firstName || app.user?.lastName
                                              ? `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim()
                                              : "Unknown"}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {app.user?.email || "—"}
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                      <p className="text-sm text-foreground/80 max-w-[220px] truncate">
                                        {app.user?.college || "—"}
                                      </p>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="secondary"
                                        className={`${config.bgColor} ${config.color} border-0 gap-1.5 font-medium`}
                                      >
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {config.label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                      <p className="text-sm text-muted-foreground">{formatDate(app.createdAt)}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {app.status === "PENDING" ? (
                                        <div className="flex gap-2 justify-end">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleApprove(app.id)}
                                            disabled={isApproving || isProcessing}
                                            className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:text-emerald-400 border-border/50"
                                          >
                                            {isProcessing ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <>
                                                <Check className="w-4 h-4" />
                                                <span className="hidden sm:inline">Accept</span>
                                              </>
                                            )}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openRejectionModal(app)}
                                            disabled={isApproving || isProcessing}
                                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400 border-border/50"
                                          >
                                            <X className="w-4 h-4" />
                                            <span className="hidden sm:inline">Reject</span>
                                          </Button>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
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

        {/* Rejection Modal */}
        <RejectionModal
          isOpen={rejectionModal.isOpen}
          onClose={closeRejectionModal}
          onConfirm={handleReject}
          isLoading={isApproving && processingId === rejectionModal.applicationId}
          applicantName={rejectionModal.applicantName ?? undefined}
        />
      </SidebarProvider>
    </AuthGuard>
  );
}
