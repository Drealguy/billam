"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  Bell,
  ScrollText,
  ShieldAlert,
  LifeBuoy,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const NAV = [
  { href: "/",              label: "Dashboard",     icon: LayoutDashboard, permission: null },
  { href: "/users",         label: "Users",         icon: Users,           permission: "users.manage" },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard,      permission: "subscriptions.manage" },
  { href: "/notifications", label: "Notifications", icon: Bell,            permission: "notifications.manage" },
  { href: "/moderation",    label: "Moderation",    icon: ShieldAlert,     permission: "moderation.manage" },
  { href: "/support",       label: "Support",       icon: LifeBuoy,        permission: "support.manage" },
  { href: "/audit-logs",    label: "Audit Logs",    icon: ScrollText,      permission: "audit_logs.view" },
  { href: "/team",          label: "Team",          icon: UserCog,         permission: "team.manage" },
  { href: "/settings",      label: "Settings",      icon: Settings,        permission: "settings.manage" },
] as const;

interface Props {
  fullName: string;
  roles: string[];
  permissions: string[];
}

export function Sidebar({ fullName, roles, permissions }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const permissionSet = new Set(permissions);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const visibleNav = NAV.filter((item) => !item.permission || permissionSet.has(item.permission));

  return (
    <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="px-5 h-16 flex items-center border-b border-border flex-shrink-0">
        <span className="text-sm font-black uppercase tracking-tight text-primary">Bill Am</span>
        <span className="ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/15 text-primary">
          Admin
        </span>
      </div>

      <div className="px-4 py-4 border-b border-border flex-shrink-0">
        <p className="text-sm font-bold truncate">{fullName || "Admin"}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5 capitalize">
          {roles.join(", ") || "No role assigned"}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-none">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut size={16} strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </aside>
  );
}
