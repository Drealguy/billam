import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Send, LogOut } from "lucide-react";

const SUPERADMIN_EMAIL = "fojediji@gmail.com";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== SUPERADMIN_EMAIL) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Admin sidebar */}
      <aside className="w-56 bg-card border-r border-border flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 h-16 border-b border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-[10px] font-black text-primary-foreground">BA</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight text-primary">Bill Am</p>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest">Superadmin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { href: "/admin",      label: "Overview",   icon: LayoutDashboard },
            { href: "/admin/send", label: "Send Notification", icon: Send     },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Back to app */}
        <div className="px-3 py-4 border-t border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut size={16} strokeWidth={1.8} />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center px-6 bg-background sticky top-0 z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Superadmin Panel
          </p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
