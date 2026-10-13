"use client";

import { useAdminUsers, useCAApplications } from "@/lib/api/hooks";
import { useAdminSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import { 
  Users, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  Crown, 
  ShieldCheck, 
  User, 
  ArrowUpRight, 
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════════
// STAT CARD SKELETON
// ═══════════════════════════════════════════════════════════════════

function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  iconClassName?: string;
  isLoading?: boolean;
  href?: string;
  trend?: { value: number; isPositive: boolean };
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconClassName,
  isLoading, 
  href,
  trend 
}: StatCardProps) {
  if (isLoading) {
    return <StatCardSkeleton />;
  }

  const content = (
    <Card className="group hover:shadow-lg hover:border-foreground/10 transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 pt-1">
                <Badge 
                  variant={trend.isPositive ? "default" : "secondary"} 
                  className={trend.isPositive 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10" 
                    : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                  }
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </Badge>
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconClassName || "bg-foreground/5"}`}>
            <Icon className="h-6 w-6 text-foreground/70" />
          </div>
        </div>
        {href && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">View all</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

// ═══════════════════════════════════════════════════════════════════
// PROGRESS CARD
// ═══════════════════════════════════════════════════════════════════

function ProgressCard({ rate, isLoading }: { rate: number; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg hover:border-foreground/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Acceptance Rate</p>
            <p className="text-3xl font-bold tracking-tight mt-1">{rate}%</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
        <Progress value={rate} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {rate >= 50 ? "Great acceptance rate!" : "Keep reviewing applications"}
        </p>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// QUICK ACTION CARD SKELETON
// ═══════════════════════════════════════════════════════════════════

function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-xl border bg-card p-4 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD CONTENT
// ═══════════════════════════════════════════════════════════════════

export function DashboardContent() {
  const { session: admin } = useAdminSession();
  const { admins, isLoading: isLoadingAdmins } = useAdminUsers();
  const { applications, isLoading: isLoadingCA } = useCAApplications();

  // Admin counts
  const totalAdmins = admins.length;
  const masterAdminCount = admins.filter(a => a.role?.level === "MASTER_ADMIN").length;
  const managerCount = admins.filter(a => a.role?.level === "MANAGER").length;
  const operatorCount = admins.filter(a => a.role?.level === "OPERATOR").length;

  // CA Application counts
  const pendingCA = applications.filter(app => app.status === "PENDING").length;
  const acceptedCA = applications.filter(app => app.status === "ACCEPTED").length;
  const totalCA = applications.length;
  const acceptanceRate = totalCA > 0 ? Math.round((acceptedCA / totalCA) * 100) : 0;

  const isLoading = isLoadingAdmins || isLoadingCA;

  const displayName = admin?.firstName || (admin?.email ? admin.email.split("@")[0] : "");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with Kashiyatra 2027
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Activity className="h-3 w-3" />
            Live
          </Badge>
          <Link href="/campus-ambassadors">
            <Button size="sm" className="gap-1.5">
              View Applications
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Stats - Only show to MASTER_ADMIN */}
      {admin?.role === "MASTER_ADMIN" && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Admin Team</h2>
              <p className="text-sm text-muted-foreground">Team composition overview</p>
            </div>
            <Link href="/admin-users">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                Manage
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Admins"
              value={totalAdmins}
              subtitle="Active accounts"
              icon={Users}
              isLoading={isLoadingAdmins}
              href="/admin-users"
            />
            <StatCard
              title="Master Admins"
              value={masterAdminCount}
              icon={Crown}
              iconClassName="bg-amber-500/10"
              isLoading={isLoadingAdmins}
            />
            <StatCard
              title="Managers"
              value={managerCount}
              icon={ShieldCheck}
              iconClassName="bg-blue-500/10"
              isLoading={isLoadingAdmins}
            />
            <StatCard
              title="Operators"
              value={operatorCount}
              icon={User}
              iconClassName="bg-violet-500/10"
              isLoading={isLoadingAdmins}
            />
          </div>
        </section>
      )}

      {/* CA Applications */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Campus Ambassador Program</h2>
            <p className="text-sm text-muted-foreground">Application status overview</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Applications"
            value={totalCA}
            subtitle="All time"
            icon={GraduationCap}
            isLoading={isLoadingCA}
            href="/campus-ambassadors"
          />
          <StatCard
            title="Pending Review"
            value={pendingCA}
            subtitle={pendingCA > 0 ? "Needs attention" : "All caught up!"}
            icon={Clock}
            iconClassName="bg-amber-500/10"
            isLoading={isLoadingCA}
            href="/campus-ambassadors"
          />
          <StatCard
            title="Accepted"
            value={acceptedCA}
            icon={CheckCircle2}
            iconClassName="bg-emerald-500/10"
            isLoading={isLoadingCA}
          />
          <ProgressCard rate={acceptanceRate} isLoading={isLoadingCA} />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <QuickActionsSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/campus-ambassadors" className="block">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-4 justify-start w-full hover:bg-amber-500/5 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mr-4 group-hover:bg-amber-500/20 transition-colors">
                      <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Review Applications</p>
                      <p className="text-xs text-muted-foreground">{pendingCA} pending review</p>
                    </div>
                  </Button>
                </Link>
                {admin?.role === "MASTER_ADMIN" && (
                  <Link href="/admin-users" className="block">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 px-4 justify-start w-full hover:bg-blue-500/5 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-4 group-hover:bg-blue-500/20 transition-colors">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Manage Team</p>
                        <p className="text-xs text-muted-foreground">{totalAdmins} team members</p>
                      </div>
                    </Button>
                  </Link>
                )}
                <Link href="/settings" className="block">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 px-4 justify-start w-full hover:bg-violet-500/5 hover:border-violet-500/30 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mr-4 group-hover:bg-violet-500/20 transition-colors">
                      <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Account Settings</p>
                      <p className="text-xs text-muted-foreground">Manage your preferences</p>
                    </div>
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
