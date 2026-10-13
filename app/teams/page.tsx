"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard, ManagerGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useTeams, type Team } from "@/lib/api/hooks";
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
} from "@/components/ui/data-table";
import {
  RefreshCw,
  Users2,
  XCircle,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Crown,
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
// TEAM DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════

interface TeamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

function TeamDetailModal({ isOpen, onClose, team }: TeamDetailModalProps) {
  if (!isOpen || !team) return null;

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
              <Users2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>Team ID: {team.teamId}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Team Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(team.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="font-medium">{team.memberCount} members</p>
            </div>
          </div>

          {/* Creator */}
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">Team Creator</p>
            <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-amber-500/5">
              <Avatar className="h-10 w-10 border border-amber-500/30">
                {team.createdBy.googleAvatarUrl && (
                  <AvatarImage src={team.createdBy.googleAvatarUrl} />
                )}
                <AvatarFallback className="text-sm bg-amber-500/10 text-amber-600 font-medium">
                  {getInitials(team.createdBy.firstName, team.createdBy.lastName, team.createdBy.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {team.createdBy.firstName || team.createdBy.lastName
                      ? `${team.createdBy.firstName || ""} ${team.createdBy.lastName || ""}`.trim()
                      : "Unknown"}
                  </p>
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-sm text-muted-foreground truncate">{team.createdBy.email}</p>
                {team.createdBy.kyId && (
                  <p className="text-xs text-muted-foreground font-mono">{team.createdBy.kyId}</p>
                )}
              </div>
              {team.createdBy.isPaidUser && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0 text-xs">
                  Paid
                </Badge>
              )}
            </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">Team Members ({team.memberCount})</p>
            <div className="space-y-2">
              {team.members.map((member) => (
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {member.firstName || member.lastName
                          ? `${member.firstName || ""} ${member.lastName || ""}`.trim()
                          : "Unknown"}
                      </p>
                      {member.userId === team.createdBy.userId && (
                        <Crown className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    {member.college && (
                      <p className="text-xs text-muted-foreground truncate">{member.college}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs border-0 ${
                        member.status === "accepted" 
                          ? "bg-green-500/10 text-green-600" 
                          : member.status === "pending"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {member.status}
                    </Badge>
                    {member.isPaidUser && (
                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 border-0 text-xs">
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function TeamsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { teams, pagination, isLoading, isError, refetch } = useTeams({
    page,
    limit: 20,
    search: debouncedSearch,
  });

  const activeFiltersCount = searchQuery ? 1 : 0;

  const handleResetFilters = () => {
    setSearchQuery("");
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

  // Export to CSV
  const handleExport = () => {
    const headers = ["Team ID", "Team Name", "Creator", "Creator Email", "Member Count", "Created At"];
    const rows = teams.map((team) => [
      team.teamId,
      team.name,
      `${team.createdBy.firstName || ""} ${team.createdBy.lastName || ""}`.trim(),
      team.createdBy.email || "",
      String(team.memberCount),
      formatDate(team.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `teams-${new Date().toISOString().split("T")[0]}.csv`;
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
                        <Users2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
                        <p className="text-muted-foreground text-sm">Manage registered teams</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={isLoading || teams.length === 0}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <StatCard
                    title="Total Teams"
                    value={pagination.totalCount}
                    icon={Users2}
                    iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Total Members"
                    value={teams.reduce((acc, t) => acc + t.memberCount, 0)}
                    icon={User}
                    iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    isLoading={isLoading}
                  />
                  <StatCard
                    title="Avg Team Size"
                    value={teams.length > 0 ? Math.round(teams.reduce((acc, t) => acc + t.memberCount, 0) / teams.length) : 0}
                    icon={Users2}
                    iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
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
                        title="Failed to load teams"
                        description="There was an error fetching the data. Please try again."
                        action={
                          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                          </Button>
                        }
                      />
                    ) : teams.length === 0 && !debouncedSearch ? (
                      <DataTableEmpty
                        icon={<Users2 className="w-8 h-8 text-muted-foreground" />}
                        title="No teams yet"
                        description="No teams have been created yet."
                      />
                    ) : (
                      <>
                        {/* Toolbar */}
                        <DataTableToolbar activeFiltersCount={activeFiltersCount} onResetFilters={handleResetFilters}>
                          <DataTableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search by team name or ID..."
                          />
                        </DataTableToolbar>

                        {/* Table content */}
                        {teams.length === 0 ? (
                          <DataTableEmpty
                            icon={<Search className="w-8 h-8 text-muted-foreground" />}
                            title="No results found"
                            description="Try adjusting your search to find what you're looking for."
                            action={
                              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                                Clear search
                              </Button>
                            }
                          />
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50">
                                  <TableHead className="min-w-[200px]">Team</TableHead>
                                  <TableHead className="min-w-[200px]">Creator</TableHead>
                                  <TableHead className="min-w-[100px]">Members</TableHead>
                                  <TableHead className="hidden lg:table-cell min-w-[100px]">Created</TableHead>
                                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {teams.map((team) => (
                                  <TableRow key={team.teamId} className="group border-border/50">
                                    <TableCell>
                                      <div className="min-w-0">
                                        <p className="font-medium text-foreground truncate">{team.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{team.teamId}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-border/50">
                                          {team.createdBy.googleAvatarUrl && (
                                            <AvatarImage src={team.createdBy.googleAvatarUrl} />
                                          )}
                                          <AvatarFallback className="text-xs bg-muted font-medium">
                                            {getInitials(team.createdBy.firstName, team.createdBy.lastName, team.createdBy.email)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {team.createdBy.firstName || team.createdBy.lastName
                                              ? `${team.createdBy.firstName || ""} ${team.createdBy.lastName || ""}`.trim()
                                              : "Unknown"}
                                          </p>
                                          <p className="text-xs text-muted-foreground truncate">{team.createdBy.email}</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 border-0">
                                        {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                      <p className="text-sm text-muted-foreground">{formatDate(team.createdAt)}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedTeam(team)}
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
                        {teams.length > 0 && (
                          <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
                            <p className="text-sm text-muted-foreground">
                              Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} teams
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

          {/* Team Detail Modal */}
          <TeamDetailModal
            isOpen={!!selectedTeam}
            onClose={() => setSelectedTeam(null)}
            team={selectedTeam}
          />
        </SidebarProvider>
      </ManagerGuard>
    </AuthGuard>
  );
}
