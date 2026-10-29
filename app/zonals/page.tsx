"use client";

import { useState, useCallback } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard, ManagerGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  useZonalRegistrations,
  type ZonalRegistration,
  type ZonalPassType,
  type ZonalPaymentStatus,
} from "@/lib/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import {
  DataTableToolbar,
  DataTableEmpty,
  DataTableFilter,
  DataTableSearch,
} from "@/components/ui/data-table";
import {
  RefreshCw,
  MapPin,
  XCircle,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Users2,
  CheckCircle2,
  Clock,
  CreditCard,
  Ticket,
  TrendingUp,
  IndianRupee,
  Calendar,
  ExternalLink,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  iconClassName: string;
  isLoading?: boolean;
  suffix?: string;
}

function StatCard({ title, value, icon: Icon, iconClassName, isLoading, suffix }: StatCardProps) {
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
            <p className="text-3xl font-bold tracking-tight">
              {value}
              {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
            </p>
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
// ZONAL REGISTRATION DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════

interface ZonalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: ZonalRegistration | null;
}

function ZonalDetailModal({ isOpen, onClose, registration }: ZonalDetailModalProps) {
  if (!isOpen || !registration) return null;

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-amber-500/10 text-amber-600";
      case "failed": return "bg-red-500/10 text-red-600";
      case "refunded": return "bg-blue-500/10 text-blue-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const getPassTypeColor = (type: string) => {
    switch (type) {
      case "SINGLE_EVENT": return "bg-blue-500/10 text-blue-600";
      case "MULTI_EVENT": return "bg-violet-500/10 text-violet-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const formatCollegeSlug = (slug: string) => {
    return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle>Zonal Pass Details</CardTitle>
              <CardDescription>ID: {registration.id}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          {registration.user && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Avatar className="h-12 w-12 border border-border/50">
                {registration.user.googleAvatarUrl && (
                  <AvatarImage src={registration.user.googleAvatarUrl} />
                )}
                <AvatarFallback className="text-sm bg-muted font-medium">
                  {getInitials(registration.user.firstName, registration.user.lastName, registration.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {registration.user.firstName || registration.user.lastName
                    ? `${registration.user.firstName || ""} ${registration.user.lastName || ""}`.trim()
                    : "Unknown User"}
                </p>
                <p className="text-sm text-muted-foreground truncate">{registration.user.email}</p>
                {registration.user.college && (
                  <p className="text-xs text-muted-foreground truncate">{registration.user.college}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                {registration.user.kyId && (
                  <Badge variant="outline" className="text-xs font-mono">{registration.user.kyId}</Badge>
                )}
                {registration.user.isPaidUser && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0 text-xs">
                    KY Paid
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* College & Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-border/50">
            <div>
              <p className="text-sm text-muted-foreground">College</p>
              <p className="font-semibold">{formatCollegeSlug(registration.collegeSlug)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Event Limit</p>
              <p className="font-semibold">
                {registration.eventLimit === -1 ? "Unlimited" : registration.eventLimit}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered Events</p>
              <p className="font-semibold">{registration.registeredEventsCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Passes</p>
              <p className="font-semibold">{registration.totalPasses}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-semibold">₹{registration.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-sm">{formatDate(registration.createdAt)}</p>
            </div>
          </div>

          {/* Registered Events */}
          {registration.registeredEvents.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3">Registered Events</p>
              <div className="flex flex-wrap gap-2">
                {registration.registeredEvents.map((event) => (
                  <Badge key={event} variant="secondary" className="text-xs">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Passes */}
          {registration.passes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                Passes ({registration.passes.length})
              </p>
              <div className="space-y-3">
                {registration.passes.map((pass, idx) => (
                  <div key={pass.id || idx} className="p-3 rounded-lg border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getPassTypeColor(pass.passType)} border-0`}>
                        {pass.passType.replace("_", " ")}
                      </Badge>
                      <Badge className={`${getPaymentStatusColor(pass.paymentStatus)} border-0`}>
                        {pass.paymentStatus}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">₹{pass.amount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Source</p>
                        <p className="font-medium capitalize">{pass.paymentSource || "—"}</p>
                      </div>
                      {pass.paymentId && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Payment ID</p>
                          <p className="font-mono text-xs truncate">{pass.paymentId}</p>
                        </div>
                      )}
                      {pass.purchasedAt && (
                        <div>
                          <p className="text-muted-foreground">Purchased At</p>
                          <p className="font-medium text-xs">{formatDate(pass.purchasedAt)}</p>
                        </div>
                      )}
                    </div>
                    {(pass.ticketUrl || pass.invoiceUrl) && (
                      <div className="flex gap-2 pt-2">
                        {pass.ticketUrl && (
                          <a
                            href={pass.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 text-xs h-8 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          >
                            <Ticket className="w-3 h-3" />
                            Ticket
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {pass.invoiceUrl && (
                          <a
                            href={pass.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 text-xs h-8 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          >
                            <CreditCard className="w-3 h-3" />
                            Invoice
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COLLEGE BREAKDOWN CARD
// ═══════════════════════════════════════════════════════════════════

interface CollegeBreakdownCardProps {
  collegeBreakdown: { collegeSlug: string; passCount: number; registeredEvents: number }[];
  isLoading: boolean;
}

function CollegeBreakdownCard({ collegeBreakdown, isLoading }: CollegeBreakdownCardProps) {
  const formatCollegeSlug = (slug: string) => {
    return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">College Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (collegeBreakdown.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-violet-500" />
          College Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {collegeBreakdown.map((college) => (
            <div key={college.collegeSlug} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{formatCollegeSlug(college.collegeSlug)}</p>
                <p className="text-xs text-muted-foreground">{college.registeredEvents} event registrations</p>
              </div>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 border-0">
                {college.passCount} passes
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function ZonalsPage() {
  const [page, setPage] = useState(1);
  const [passTypeFilter, setPassTypeFilter] = useState<string[]>([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState<ZonalRegistration | null>(null);

  // Convert filter arrays to single values for API
  const passTypeValue = passTypeFilter.length === 1 ? passTypeFilter[0] as ZonalPassType : "";
  const paymentStatusValue = paymentStatusFilter.length === 1 ? paymentStatusFilter[0] as ZonalPaymentStatus : "";

  const { registrations, pagination, stats, collegeBreakdown, isLoading, isError, refetch } = useZonalRegistrations({
    page,
    limit: 20,
    passType: passTypeValue,
    paymentStatus: paymentStatusValue,
    search: searchQuery,
  });

  const activeFiltersCount = (passTypeFilter.length > 0 ? 1 : 0) + (paymentStatusFilter.length > 0 ? 1 : 0);

  const handleResetFilters = () => {
    setPassTypeFilter([]);
    setPaymentStatusFilter([]);
    setSearchQuery("");
    setPage(1);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "??";
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-amber-500/10 text-amber-600";
      case "failed": return "bg-red-500/10 text-red-600";
      case "refunded": return "bg-blue-500/10 text-blue-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const getPassTypeColor = (type: string) => {
    switch (type) {
      case "SINGLE_EVENT": return "bg-blue-500/10 text-blue-600";
      case "MULTI_EVENT": return "bg-violet-500/10 text-violet-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const formatCollegeSlug = (slug: string) => {
    return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  // Filter options
  const passTypeFilterOptions = [
    { label: "Single Event", value: "SINGLE_EVENT", icon: <Ticket className="w-4 h-4 text-blue-500" />, count: stats.singleEvent },
    { label: "Multi Event", value: "MULTI_EVENT", icon: <Calendar className="w-4 h-4 text-violet-500" />, count: stats.multiEvent },
  ];

  const paymentStatusFilterOptions = [
    { label: "Completed", value: "completed", icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, count: stats.completed },
    { label: "Pending", value: "pending", icon: <Clock className="w-4 h-4 text-amber-500" />, count: stats.pending },
    { label: "Failed", value: "failed", icon: <XCircle className="w-4 h-4 text-red-500" /> },
    { label: "Refunded", value: "refunded", icon: <CreditCard className="w-4 h-4 text-blue-500" /> },
  ];

  // Export to CSV
  const handleExport = () => {
    const headers = ["ID", "User", "Email", "College", "Pass Type", "Payment Status", "Amount", "Events Registered", "Created At"];
    const rows = registrations.map((reg) => [
      reg.id,
      reg.user
        ? `${reg.user.firstName || ""} ${reg.user.lastName || ""}`.trim() || reg.user.email
        : "Unknown",
      reg.user?.email || "",
      formatCollegeSlug(reg.collegeSlug),
      reg.latestPassType || "",
      reg.latestPaymentStatus || "",
      reg.totalAmount,
      reg.registeredEventsCount,
      formatDate(reg.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zonal-registrations-${new Date().toISOString().split("T")[0]}.csv`;
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
                      <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight">Zonal Registrations</h1>
                        <p className="text-muted-foreground text-sm">View zonal passes and event registrations</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={isLoading || registrations.length === 0}
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

                {/* Stats Row 1 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  <StatCard
                    title="Total Passes"
                    value={stats.totalPasses}
                    icon={Ticket}
                    iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Unique Users"
                    value={stats.uniqueUsers}
                    icon={Users2}
                    iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Single Event"
                    value={stats.singleEvent}
                    icon={User}
                    iconClassName="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Multi Event"
                    value={stats.multiEvent}
                    icon={Calendar}
                    iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Event Registrations"
                    value={stats.totalRegisteredEvents}
                    icon={TrendingUp}
                    iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    isLoading={isLoading}
                  />
                </div>

                {/* Stats Row 2 - Revenue */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle2}
                    iconClassName="bg-green-500/10 text-green-600 dark:text-green-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={IndianRupee}
                    iconClassName="bg-green-500/10 text-green-600 dark:text-green-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Avg. Amount"
                    value={`₹${stats.avgAmount.toLocaleString()}`}
                    icon={CreditCard}
                    iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    isLoading={isLoading}
                  />
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Main Table */}
                  <div className="lg:col-span-3">
                    <Card>
                      <CardContent className="p-0">
                        {isLoading ? (
                          <TableSkeleton />
                        ) : isError ? (
                          <DataTableEmpty
                            icon={<XCircle className="w-8 h-8 text-red-500" />}
                            title="Failed to load zonal registrations"
                            description="There was an error fetching the data. Please try again."
                            action={
                              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                              </Button>
                            }
                          />
                        ) : registrations.length === 0 && activeFiltersCount === 0 && !searchQuery ? (
                          <DataTableEmpty
                            icon={<MapPin className="w-8 h-8 text-muted-foreground" />}
                            title="No zonal registrations yet"
                            description="No zonal pass purchases have been made yet."
                          />
                        ) : (
                          <>
                            {/* Toolbar */}
                            <DataTableToolbar activeFiltersCount={activeFiltersCount + (searchQuery ? 1 : 0)} onResetFilters={handleResetFilters}>
                              <DataTableSearch
                                placeholder="Search by email, name, KY ID..."
                                value={searchQuery}
                                onChange={handleSearch}
                              />
                              <DataTableFilter
                                title="Pass Type"
                                options={passTypeFilterOptions}
                                selectedValues={passTypeFilter}
                                onChange={setPassTypeFilter}
                              />
                              <DataTableFilter
                                title="Payment"
                                options={paymentStatusFilterOptions}
                                selectedValues={paymentStatusFilter}
                                onChange={setPaymentStatusFilter}
                              />
                            </DataTableToolbar>

                            {/* Table content */}
                            {registrations.length === 0 ? (
                              <DataTableEmpty
                                icon={<Search className="w-8 h-8 text-muted-foreground" />}
                                title="No results found"
                                description="Try adjusting your filters to find what you're looking for."
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
                                      <TableHead className="min-w-[200px]">User</TableHead>
                                      <TableHead className="min-w-[120px]">College</TableHead>
                                      <TableHead className="min-w-[100px]">Pass Type</TableHead>
                                      <TableHead className="min-w-[100px]">Status</TableHead>
                                      <TableHead className="min-w-[80px]">Events</TableHead>
                                      <TableHead className="hidden lg:table-cell min-w-[100px]">Amount</TableHead>
                                      <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {registrations.map((reg) => (
                                      <TableRow key={reg.id} className="group border-border/50">
                                        <TableCell>
                                          {reg.user ? (
                                            <div className="flex items-center gap-3">
                                              <Avatar className="h-8 w-8 border border-border/50">
                                                {reg.user.googleAvatarUrl && (
                                                  <AvatarImage src={reg.user.googleAvatarUrl} />
                                                )}
                                                <AvatarFallback className="text-xs bg-muted font-medium">
                                                  {getInitials(reg.user.firstName, reg.user.lastName, reg.user.email)}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                  {reg.user.firstName || reg.user.lastName
                                                    ? `${reg.user.firstName || ""} ${reg.user.lastName || ""}`.trim()
                                                    : "Unknown"}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">{reg.user.email}</p>
                                              </div>
                                            </div>
                                          ) : (
                                            <span className="text-muted-foreground">Unknown User</span>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <p className="text-sm font-medium">
                                            {formatCollegeSlug(reg.collegeSlug)}
                                          </p>
                                        </TableCell>
                                        <TableCell>
                                          {reg.latestPassType && (
                                            <Badge variant="secondary" className={`${getPassTypeColor(reg.latestPassType)} border-0 text-xs`}>
                                              {reg.latestPassType === "SINGLE_EVENT" ? "Single" : "Multi"}
                                            </Badge>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {reg.latestPaymentStatus && (
                                            <Badge variant="secondary" className={`${getPaymentStatusColor(reg.latestPaymentStatus)} border-0 text-xs`}>
                                              {reg.latestPaymentStatus}
                                            </Badge>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-sm font-medium">{reg.registeredEventsCount}</span>
                                          <span className="text-xs text-muted-foreground ml-1">
                                            / {reg.eventLimit === -1 ? "∞" : reg.eventLimit}
                                          </span>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                          <p className="text-sm font-medium">₹{reg.totalAmount.toLocaleString()}</p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedRegistration(reg)}
                                            className="gap-1.5"
                                          >
                                            View
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}

                            {/* Pagination */}
                            {registrations.length > 0 && (
                              <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
                                <p className="text-sm text-muted-foreground">
                                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
                                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{" "}
                                  {pagination.totalCount} results
                                </p>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrevPage}
                                    className="gap-1"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                    Prev
                                  </Button>
                                  <span className="text-sm px-2">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="gap-1"
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
                  </div>

                  {/* Sidebar - College Breakdown */}
                  <div className="lg:col-span-1">
                    <CollegeBreakdownCard
                      collegeBreakdown={collegeBreakdown}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </main>
            </div>
          </div>

          {/* Detail Modal */}
          <ZonalDetailModal
            isOpen={!!selectedRegistration}
            onClose={() => setSelectedRegistration(null)}
            registration={selectedRegistration}
          />
        </SidebarProvider>
      </ManagerGuard>
    </AuthGuard>
  );
}
