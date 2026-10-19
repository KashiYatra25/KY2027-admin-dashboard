"use client";

import { useState } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard, ManagerGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useRevenue } from "@/lib/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  RefreshCw,
  Wallet,
  Receipt,
  TrendingUp,
  XCircle,
  IndianRupee,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const RANGE_OPTIONS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const;

// Palette for the pass-wise bars (cycled).
const PASS_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#06b6d4"];

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Short date label for the x-axis, e.g. "20 Oct". */
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ═══════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconClassName: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, iconClassName, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-sm text-muted-foreground">{title}</p>
              </>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClassName}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CHART TOOLTIP
// ═══════════════════════════════════════════════════════════════════

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { count?: number };
}

function ChartTooltip({
  active,
  label,
  payload,
  labelFormatter,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  labelFormatter?: (label: string | number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const count = payload[0]?.payload?.count;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-muted-foreground">
        {labelFormatter && label !== undefined ? labelFormatter(label) : label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {formatINR(Number(entry.value) || 0)}
        </p>
      ))}
      {typeof count === "number" && (
        <p className="mt-0.5 text-xs text-muted-foreground">{count} pass{count === 1 ? "" : "es"}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════

function PaymentsPageInner() {
  const [days, setDays] = useState<number>(30);
  const { totals, revenueByDate, revenueByPass, isLoading, isError, refetch } = useRevenue({
    days,
  });

  const hasTrendData = revenueByDate.some((d) => d.revenue > 0);
  const hasPassData = revenueByPass.length > 0;

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
            <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Payments &amp; Revenue</h1>
            <p className="text-sm text-muted-foreground">
              Pass sales revenue, daily trend, and tier breakdown
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                onClick={() => setDays(opt.days)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  days === opt.days
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <XCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm text-muted-foreground">
              Failed to load revenue analytics. Please try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              title="Total Revenue"
              value={formatINR(totals.totalRevenue)}
              icon={IndianRupee}
              iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              isLoading={isLoading}
            />
            <StatCard
              title="Total Passes Sold"
              value={totals.totalPurchases.toLocaleString("en-IN")}
              icon={Receipt}
              iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              isLoading={isLoading}
            />
            <StatCard
              title="Average Order Value"
              value={formatINR(totals.averageOrderValue)}
              icon={TrendingUp}
              iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              isLoading={isLoading}
            />
          </div>

          {/* Date-wise revenue trend */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily pass revenue over the last {days} days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : !hasTrendData ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  No revenue recorded in this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueByDate} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={shortDate}
                      tick={{ fontSize: 11 }}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                      width={70}
                    />
                    <Tooltip content={<ChartTooltip labelFormatter={(l) => shortDate(String(l))} />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#revGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Pass-wise breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Pass</CardTitle>
              <CardDescription>Revenue split across pass tiers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : !hasPassData ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  No pass sales yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByPass} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="passType" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                      width={70}
                    />
                    <Tooltip
                      cursor={{ fill: "currentColor", opacity: 0.06 }}
                      content={<ChartTooltip />}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {revenueByPass.map((_, i) => (
                        <Cell key={i} fill={PASS_COLORS[i % PASS_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

export default function PaymentsPage() {
  return (
    <AuthGuard>
      <ManagerGuard>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="ml-0 flex min-w-0 flex-1 flex-col md:ml-16 lg:ml-60">
              <Topbar />
              <PaymentsPageInner />
            </div>
          </div>
        </SidebarProvider>
      </ManagerGuard>
    </AuthGuard>
  );
}
