"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserCog,
  CreditCard,
  Bell,
  ScrollText,
  ShieldAlert,
  LifeBuoy,
  Settings,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/",           label: "Dashboard", icon: LayoutDashboard, permission: null },
      { href: "/analytics",  label: "Analytics", icon: BarChart3,       permission: null },
    ],
  },
  {
    label: "Customers",
    items: [
      { href: "/users",         label: "Users",         icon: Users,      permission: "users.manage" },
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard, permission: "subscriptions.manage" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell,     permission: "notifications.manage" },
      { href: "/support",       label: "Support",        icon: LifeBuoy, permission: "support.manage" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/moderation", label: "Moderation", icon: ShieldAlert, permission: "moderation.manage" },
      { href: "/audit-logs", label: "Audit Logs", icon: ScrollText,  permission: "audit_logs.view" },
      { href: "/team",       label: "Team",       icon: UserCog,     permission: "team.manage" },
      { href: "/settings",   label: "Settings",   icon: Settings,    permission: "settings.manage" },
    ],
  },
] as const;

interface Props {
  fullName: string;
  roles: string[];
  permissions: string[];
  open: boolean;
  onClose: () => void;
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ").filter(Boolean);
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : (parts[0] ?? "A").slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-black text-primary-foreground uppercase">{letters}</span>
    </div>
  );
}

export function Sidebar({ fullName, roles, permissions, open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const permissionSet = new Set(permissions);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || permissionSet.has(item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex-shrink-0 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 h-16 flex items-center justify-between border-b border-border flex-shrink-0">
          <div className="flex items-center">
            <span className="text-sm font-black uppercase tracking-tight text-primary">Bill Am</span>
            <span className="ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/15 text-primary">
              Admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground p-1 cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Initials name={fullName || "Admin"} />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight">{fullName || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5 capitalize">
                {roles.join(", ") || "No role assigned"}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-[10px] text-primary font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
          {visibleGroups.map((group, i) => (
            <div key={group.label} className={i === 0 ? "" : "mt-6"}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer select-none transition-colors active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} className="flex-shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground cursor-pointer select-none transition-colors hover:bg-destructive/10 hover:text-destructive active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            <LogOut size={16} strokeWidth={1.8} className="flex-shrink-0" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

/* Hamburger button for the mobile topbar */
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  );
}
