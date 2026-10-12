"use client";

import { useState } from "react";
import { SidebarProvider } from "@/hooks";
import { AuthGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  useVenues,
  useFestDays,
  useScheduleEntries,
  useCreateVenue,
  type Venue,
  type FestDay,
  type ScheduleEntry,
} from "@/lib/api/hooks";
import { AddVenueModal, EditVenueModal, DeleteVenueModal, AddScheduleEntryModal, DeleteScheduleEntryModal, AddFestDayModal, EditFestDayModal, DeleteFestDayModal } from "@/components/modals";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/loader/Skeleton";
import {
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  CalendarDays,
  ListTodo,
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

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32 flex-1" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TONE BADGE CONFIG
// ═══════════════════════════════════════════════════════════════════

const toneConfig: Record<string, { label: string; className: string }> = {
  blue: { label: "Blue", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  red: { label: "Red", className: "bg-red-500/10 text-red-600 dark:text-red-400" },
  green: { label: "Green", className: "bg-green-500/10 text-green-600 dark:text-green-400" },
  white: { label: "White", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
  text: { label: "Text", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

const categoryConfig: Record<string, { label: string; className: string }> = {
  NATRAJ: { label: "Natraj", className: "bg-pink-500/10 text-pink-600" },
  CROSSWINDZ: { label: "Crosswindz", className: "bg-purple-500/10 text-purple-600" },
  BANDISH: { label: "Bandish", className: "bg-yellow-500/10 text-yellow-600" },
  ABHINAY: { label: "Abhinay", className: "bg-orange-500/10 text-orange-600" },
  MIRAGE: { label: "Mirage", className: "bg-cyan-500/10 text-cyan-600" },
  TOOLIKA: { label: "Toolika", className: "bg-lime-500/10 text-lime-600" },
  ENQUIZTA: { label: "Enquizta", className: "bg-rose-500/10 text-rose-600" },
  SAMWAAD: { label: "Samwaad", className: "bg-amber-500/10 text-amber-600" },
  ZAIKA: { label: "Zaika", className: "bg-red-500/10 text-red-600" },
};

// ═══════════════════════════════════════════════════════════════════
// VENUES TAB
// ═══════════════════════════════════════════════════════════════════

function VenuesTab() {
  const { venues, count, isLoading, refetch } = useVenues();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsEditModalOpen(true);
  };

  const handleDelete = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Venues ({count})</h3>
          <p className="text-sm text-muted-foreground">Manage campus map venues</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton />
        ) : venues.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No venues found</p>
            <Button size="sm" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Venue
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Tone</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => (
                <TableRow key={venue._id}>
                  <TableCell className="font-mono text-sm">{venue.slug}</TableCell>
                  <TableCell className="font-medium">{venue.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                    {venue.label.replace(/\n/g, " ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={toneConfig[venue.tone]?.className}>
                      {toneConfig[venue.tone]?.label || venue.tone}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {venue.x.toFixed(1)}, {venue.y.toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={venue.active ? "default" : "secondary"}>
                      {venue.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(venue)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(venue)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AddVenueModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <EditVenueModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} venue={selectedVenue} />
      <DeleteVenueModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} venue={selectedVenue} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FEST DAYS TAB
// ═══════════════════════════════════════════════════════════════════

function FestDaysTab() {
  const { festDays, count, isLoading, refetch } = useFestDays();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFestDay, setSelectedFestDay] = useState<FestDay | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleEdit = (festDay: FestDay) => {
    setSelectedFestDay(festDay);
    setIsEditModalOpen(true);
  };

  const handleDelete = (festDay: FestDay) => {
    setSelectedFestDay(festDay);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Fest Days ({count})</h3>
          <p className="text-sm text-muted-foreground">Manage festival day configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Day
          </Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : festDays.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No fest days configured</p>
            <Button size="sm" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Day
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Display Date</TableHead>
                <TableHead>Full Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {festDays.map((day) => (
                <TableRow key={day._id}>
                  <TableCell>
                    <Badge variant="outline" className="font-bold">
                      Day {day.dayNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{day.displayDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{day.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={day.active ? "default" : "secondary"}>
                      {day.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(day)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(day)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AddFestDayModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <EditFestDayModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} festDay={selectedFestDay} />
      <DeleteFestDayModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} festDay={selectedFestDay} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHEDULE ENTRIES TAB
// ═══════════════════════════════════════════════════════════════════

function ScheduleEntriesTab() {
  const { entries, count, isLoading, refetch } = useScheduleEntries();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDelete = (entry: ScheduleEntry) => {
    setSelectedEntry(entry);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Schedule Entries ({count})</h3>
          <p className="text-sm text-muted-foreground">Manage event schedule assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No schedule entries found</p>
            <Button size="sm" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Entry
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell className="font-mono text-sm">{entry.eventSlug}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={categoryConfig[entry.categorySlug]?.className}>
                      {categoryConfig[entry.categorySlug]?.label || entry.categorySlug}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{entry.venueSlug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Day {entry.day}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.startTime && entry.endTime
                      ? `${entry.startTime} - ${entry.endTime}`
                      : entry.startTime || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.active ? "default" : "secondary"}>
                      {entry.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(entry)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AddScheduleEntryModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <DeleteScheduleEntryModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} entry={selectedEntry} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function SchedulePage() {
  const { venues, isLoading: venuesLoading } = useVenues();
  const { festDays, isLoading: festDaysLoading } = useFestDays();
  const { entries, isLoading: entriesLoading } = useScheduleEntries();

  const isLoading = venuesLoading || festDaysLoading || entriesLoading;

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-0 md:ml-16 lg:ml-60 min-w-0">
            <Topbar />
            <main className="flex-1 p-6 space-y-6 overflow-auto">
              {/* Page Header */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage venues, fest days, and event schedule entries
                </p>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Venues"
                  value={venues.length}
                  icon={Building2}
                  iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  isLoading={venuesLoading}
                />
                <StatCard
                  title="Fest Days"
                  value={festDays.length}
                  icon={CalendarDays}
                  iconClassName="bg-green-500/10 text-green-600 dark:text-green-400"
                  isLoading={festDaysLoading}
                />
                <StatCard
                  title="Schedule Entries"
                  value={entries.length}
                  icon={ListTodo}
                  iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  isLoading={entriesLoading}
                />
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="venues" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                  <TabsTrigger value="venues" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Venues
                  </TabsTrigger>
                  <TabsTrigger value="fest-days" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Fest Days
                  </TabsTrigger>
                  <TabsTrigger value="entries" className="gap-2">
                    <ListTodo className="h-4 w-4" />
                    Entries
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="venues">
                  <VenuesTab />
                </TabsContent>

                <TabsContent value="fest-days">
                  <FestDaysTab />
                </TabsContent>

                <TabsContent value="entries">
                  <ScheduleEntriesTab />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
