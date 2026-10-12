"use client";

import { SidebarProvider } from "@/hooks";
import { AuthGuard } from "@/components/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Wrench } from "lucide-react";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-0 md:ml-16 lg:ml-60 min-w-0">
            <Topbar />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your admin preferences</p>
              </div>

              {/* Placeholder */}
              <Card>
                <CardContent className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Wrench className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Coming Soon</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                      Settings and preferences will be available here in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
