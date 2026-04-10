"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  X,
  Menu,
  Zap,
} from "lucide-react";
import { PaywallModal } from "@/components/paywall-modal";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  businessName: string;
  fullName: string;
  plan: "free" | "pro";
  logoUrl: string;
  open: boolean;
  onClose: () => void;
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-black text-primary-foreground uppercase">
        {letters}
      </span>
    </div>
  );
}

export function Sidebar({ businessName, fullName, plan, logoUrl, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Paywall modal — must be outside <aside> so CSS transforms don't confine fixed positioning */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out",
          "lg:static lg:translate-x-0 lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
          <Link href="/dashboard" onClick={onClose}>
            <span className="text-base font-black uppercase tracking-tight text-primary">
              Bill Am
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* User profile section */}
        <div className="px-4 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-border"
              />
            ) : (
              <Initials name={businessName || fullName || "B A"} />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight">
                {businessName || fullName}
              </p>
              {businessName && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {fullName}
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-[10px] text-primary font-semibold">Active</span>
                {plan === "free" && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full leading-none">
                    Free Trial
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={active ? "text-primary" : ""}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade CTA for free users */}
        {plan === "free" && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-xs font-bold text-foreground">Upgrade to Pro</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">₦10,000/year — unlimited invoices</p>
            <button
              onClick={() => setShowPaywall(true)}
              className="mt-2 flex items-center gap-1.5 w-full justify-center py-1.5 text-[11px] font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              <Zap size={11} /> Upgrade now
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="px-3 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={17} strokeWidth={1.8} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

/* Hamburger button for mobile topbar */
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  );
}
