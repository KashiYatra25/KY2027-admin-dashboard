"use client";

import { SidebarProvider } from "@/hooks";
import { AuthGuard } from "@/components/auth";
import { DashboardContent } from "@/components/pages/dashboard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function Page() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-0 md:ml-16 lg:ml-60 min-w-0">
            <Topbar />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <DashboardContent />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
