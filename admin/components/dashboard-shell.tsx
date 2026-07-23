"use client";

import { useState } from "react";
import { Sidebar, SidebarToggle } from "@/components/sidebar";

interface Props {
  fullName: string;
  roles: string[];
  permissions: string[];
  children: React.ReactNode;
}

export function DashboardShell({ fullName, roles, permissions, children }: Props) {
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
        <header className="h-14 border-b border-border flex items-center gap-3 px-4 flex-shrink-0 lg:hidden">
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
          <span className="text-sm font-black uppercase tracking-tight text-primary">Bill Am</span>
          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/15 text-primary">
            Admin
          </span>
        </header>

        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
