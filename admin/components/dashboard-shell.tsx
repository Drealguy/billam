"use client";

import { useState } from "react";
import { Sidebar, SidebarToggle } from "@/components/sidebar";
import { NotificationBell, type AdminEvent } from "@/components/notification-bell";

interface Props {
  fullName: string;
  roles: string[];
  permissions: string[];
  events: AdminEvent[];
  children: React.ReactNode;
}

export function DashboardShell({ fullName, roles, permissions, events, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        fullName={fullName}
        roles={roles}
        permissions={permissions}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between gap-3 px-4 flex-shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <SidebarToggle onClick={() => setSidebarOpen(true)} />
            <span className="text-sm font-black uppercase tracking-tight text-primary">Bill Am</span>
            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/15 text-primary">
              Admin
            </span>
          </div>
          <div className="flex-1 lg:flex-none" />
          <NotificationBell events={events} />
        </header>

        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
