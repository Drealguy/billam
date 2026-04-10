"use client";

import { useState } from "react";
import { Sidebar, SidebarToggle } from "@/components/sidebar";
import { SessionWatcher } from "@/components/session-watcher";
import Link from "next/link";
import { Plus } from "lucide-react";

interface DashboardShellProps {
  businessName: string;
  fullName: string;
  plan: "free" | "pro";
  children: React.ReactNode;
}

export function DashboardShell({
  businessName,
  fullName,
  plan,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SessionWatcher />
      <Sidebar
        businessName={businessName}
        fullName={fullName}
        plan={plan}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0 bg-background">
          <div className="flex items-center gap-3">
            <SidebarToggle onClick={() => setSidebarOpen(true)} />
            {/* Mobile logo */}
            <span className="lg:hidden text-base font-black uppercase tracking-tight text-primary">
              Bill Am
            </span>
          </div>

          {/* Top-right actions */}
          <Link
            href="/invoices/new"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New Invoice
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
