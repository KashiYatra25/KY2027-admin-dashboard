"use client";

import { useState, useEffect, useMemo } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard, ManagerGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useRegistrations, type Registration, type ParticipationType, type RegistrationStatus } from "@/lib/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import {
  DataTableSearch,
  DataTableToolbar,
  DataTableEmpty,
  DataTableFilter,
} from "@/components/ui/data-table";
import {
  RefreshCw,
  ClipboardList,
  XCircle,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Users2,
  UserCheck,
  Clock,
  CheckCircle2,
  XOctagon,
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
// REGISTRATION DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
}

function RegistrationDetailModal({ isOpen, onClose, registration }: RegistrationDetailModalProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-amber-500/10 text-amber-600";
      case "cancelled": return "bg-red-500/10 text-red-600";
      case "waitlisted": return "bg-blue-500/10 text-blue-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "individual": return "bg-blue-500/10 text-blue-600";
      case "duo": return "bg-violet-500/10 text-violet-600";
      case "team": return "bg-emerald-500/10 text-emerald-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
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
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle>Registration Details</CardTitle>
              <CardDescription>ID: {registration.registrationId}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Info */}
          {registration.event && (
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center gap-3">
                {registration.event.imageUrl && (
                  <img 
                    src={registration.event.imageUrl} 
                    alt={registration.event.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{registration.event.name}</p>
                  {registration.event.tagline && (
                    <p className="text-sm text-muted-foreground">{registration.event.tagline}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{registration.event.category}</Badge>
                    <Badge variant="secondary" className="text-xs">{registration.event.participationType}</Badge>
                  </div>
                </div>
              </div>
              {registration.event.venue && (
                <p className="text-sm text-muted-foreground">Venue: {registration.event.venue}</p>
              )}
            </div>
          )}

          {/* Registration Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-border/50">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={`${getStatusColor(registration.status)} border-0 mt-1`}>
                {registration.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge className={`${getTypeColor(registration.participationType)} border-0 mt-1`}>
                {registration.participationType}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered At</p>
              <p className="font-medium text-sm">{formatDate(registration.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Event Slug</p>
              <p className="font-medium text-sm font-mono">{registration.eventSlug}</p>
            </div>
          </div>

          {/* Individual User */}
          {registration.user && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3">Registered User</p>
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                <Avatar className="h-10 w-10 border border-border/50">
                  {registration.user.googleAvatarUrl && (
                    <AvatarImage src={registration.user.googleAvatarUrl} />
                  )}
                  <AvatarFallback className="text-sm bg-muted font-medium">
                    {getInitials(registration.user.firstName, registration.user.lastName, registration.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {registration.user.firstName || registration.user.lastName
                      ? `${registration.user.firstName || ""} ${registration.user.lastName || ""}`.trim()
                      : "Unknown"}
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
                      Paid
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Team */}
          {registration.team && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                Team: {registration.team.name} ({registration.team.memberCount} members)
              </p>
              <div className="space-y-2">
                {registration.team.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                    <Avatar className="h-10 w-10 border border-border/50">
                      {member.googleAvatarUrl && (
                        <AvatarImage src={member.googleAvatarUrl} />
                      )}
                      <AvatarFallback className="text-sm bg-muted font-medium">
                        {getInitials(member.firstName, member.lastName, member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {member.firstName || member.lastName
                          ? `${member.firstName || ""} ${member.lastName || ""}`.trim()
                          : "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      {member.college && (
                        <p className="text-xs text-muted-foreground truncate">{member.college}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {member.kyId && (
                        <Badge variant="outline" className="text-xs font-mono">{member.kyId}</Badge>
                      )}
                      {member.isPaidUser && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0 text-xs">
                          Paid
                        </Badge>
                      )}
                    </div>
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
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function RegistrationsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  // Convert filter arrays to single values for API
  const statusValue = statusFilter.length === 1 ? statusFilter[0] as RegistrationStatus : "";
  const typeValue = typeFilter.length === 1 ? typeFilter[0] as ParticipationType : "";

  const { registrations, pagination, stats, isLoading, isError, refetch } = useRegistrations({
    page,
    limit: 20,
    status: statusValue,
    participationType: typeValue,
  });

  const activeFiltersCount = (statusFilter.length > 0 ? 1 : 0) + (typeFilter.length > 0 ? 1 : 0);

  const handleResetFilters = () => {
    setStatusFilter([]);
    setTypeFilter([]);
    setPage(1);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-amber-500/10 text-amber-600";
      case "cancelled": return "bg-red-500/10 text-red-600";
      case "waitlisted": return "bg-blue-500/10 text-blue-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "individual": return "bg-blue-500/10 text-blue-600";
      case "duo": return "bg-violet-500/10 text-violet-600";
      case "team": return "bg-emerald-500/10 text-emerald-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  // Filter options
  const statusFilterOptions = [
    { label: "Confirmed", value: "confirmed", icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, count: stats.confirmed },
    { label: "Pending", value: "pending", icon: <Clock className="w-4 h-4 text-amber-500" />, count: stats.pending },
    { label: "Cancelled", value: "cancelled", icon: <XOctagon className="w-4 h-4 text-red-500" /> },
    { label: "Waitlisted", value: "waitlisted", icon: <Clock className="w-4 h-4 text-blue-500" /> },
  ];

  const typeFilterOptions = [
    { label: "Individual", value: "individual", icon: <User className="w-4 h-4 text-blue-500" />, count: stats.individual },
    { label: "Duo", value: "duo", icon: <Users2 className="w-4 h-4 text-violet-500" />, count: stats.duo },
    { label: "Team", value: "team", icon: <Users2 className="w-4 h-4 text-emerald-500" />, count: stats.team },
  ];

  // Export to CSV
  const handleExport = () => {
    const headers = ["Registration ID", "Event", "Type", "Status", "User/Team", "Registered At"];
    const rows = registrations.map((reg) => [
      reg.registrationId,
      reg.event?.name || reg.eventSlug,
      reg.participationType,
      reg.status,
      reg.user 
        ? `${reg.user.firstName || ""} ${reg.user.lastName || ""}`.trim() || reg.user.email 
        : reg.team?.name || "",
      formatDate(reg.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `registrations-${new Date().toISOString().split("T")[0]}.csv`;
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
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight">Registrations</h1>
                        <p className="text-muted-foreground text-sm">View event registrations</p>
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

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <StatCard
                    title="Total"
                    value={stats.total}
                    icon={ClipboardList}
                    iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Individual"
                    value={stats.individual}
                    icon={User}
                    iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Duo"
                    value={stats.duo}
                    icon={Users2}
                    iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Team"
                    value={stats.team}
                    icon={Users2}
                    iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Confirmed"
                    value={stats.confirmed}
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
                </div>

                {/* Table */}
                <Card>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <TableSkeleton />
                    ) : isError ? (
                      <DataTableEmpty
                        icon={<XCircle className="w-8 h-8 text-red-500" />}
                        title="Failed to load registrations"
                        description="There was an error fetching the data. Please try again."
                        action={
                          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                          </Button>
                        }
                      />
                    ) : registrations.length === 0 && activeFiltersCount === 0 ? (
                      <DataTableEmpty
                        icon={<ClipboardList className="w-8 h-8 text-muted-foreground" />}
                        title="No registrations yet"
                        description="No event registrations have been made yet."
                      />
                    ) : (
                      <>
                        {/* Toolbar */}
                        <DataTableToolbar activeFiltersCount={activeFiltersCount} onResetFilters={handleResetFilters}>
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
                                  <TableHead className="min-w-[200px]">Event</TableHead>
                                  <TableHead className="min-w-[200px]">Participant</TableHead>
                                  <TableHead className="min-w-[100px]">Type</TableHead>
                                  <TableHead className="min-w-[100px]">Status</TableHead>
                                  <TableHead className="hidden lg:table-cell min-w-[100px]">Registered</TableHead>
                                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {registrations.map((reg) => (
                                  <TableRow key={reg.registrationId} className="group border-border/50">
                                    <TableCell>
                                      <div className="min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                          {reg.event?.name || reg.eventSlug}
                                        </p>
                                        {reg.event?.category && (
                                          <Badge variant="outline" className="text-xs mt-1">
                                            {reg.event.category}
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
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
                                      ) : reg.team ? (
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                                            <Users2 className="h-4 w-4 text-violet-600" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{reg.team.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {reg.team.memberCount} members
                                            </p>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary" className={`${getTypeColor(reg.participationType)} border-0 text-xs`}>
                                        {reg.participationType}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary" className={`${getStatusColor(reg.status)} border-0 text-xs`}>
                                        {reg.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                      <p className="text-sm text-muted-foreground">{formatDate(reg.createdAt)}</p>
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
                              Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} registrations
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

          {/* Registration Detail Modal */}
          <RegistrationDetailModal
            isOpen={!!selectedRegistration}
            onClose={() => setSelectedRegistration(null)}
            registration={selectedRegistration}
          />
        </SidebarProvider>
      </ManagerGuard>
    </AuthGuard>
  );
}
