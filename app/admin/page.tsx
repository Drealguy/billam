import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Users, FileText, Bell, TrendingUp } from "lucide-react";
import Link from "next/link";

const SUPERADMIN_EMAIL = "fojediji@gmail.com";

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== SUPERADMIN_EMAIL) redirect("/login");

  const admin = createAdminSupabaseClient();

  const [
    { count: totalUsers },
    { data: recentUsers },
    { count: totalInvoices },
    { count: totalNotifications },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("id, full_name, business_name, created_at").order("created_at", { ascending: false }).limit(10),
    admin.from("invoices").select("*", { count: "exact", head: true }),
    admin.from("notifications").select("*", { count: "exact", head: true }),
  ]);

  // Users registered this month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count: newThisMonth } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthStart);

  const stats = [
    { label: "Total Users",       value: totalUsers ?? 0,        icon: Users,      color: "text-primary"       },
    { label: "New This Month",    value: newThisMonth ?? 0,      icon: TrendingUp, color: "text-emerald-400"   },
    { label: "Total Invoices",    value: totalInvoices ?? 0,     icon: FileText,   color: "text-amber-400"     },
    { label: "Notifications Sent",value: totalNotifications ?? 0,icon: Bell,       color: "text-blue-400"      },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Bill Am platform stats</p>
        </div>
        <Link
          href="/admin/send"
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
        >
          <Bell size={14} /> Send Notification
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
              <Icon size={15} className={`${color} opacity-60`} />
            </div>
            <p className={`text-3xl font-black ${color} leading-none`}>{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Recent Registrations
        </p>
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_160px_120px] gap-4 px-5 py-3 bg-card/60 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>User</span>
            <span>Business</span>
            <span>Joined</span>
          </div>
          {(recentUsers ?? []).length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No users yet</div>
          ) : (
            (recentUsers ?? []).map((u, idx) => (
              <div
                key={u.id}
                className={`grid grid-cols-[1fr_160px_120px] gap-4 items-center px-5 py-3.5 ${idx !== 0 ? "border-t border-border" : ""} hover:bg-secondary/30 transition-colors`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-primary uppercase">
                      {(u.full_name || "?")[0]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold truncate">{u.full_name || "—"}</p>
                </div>
                <p className="text-sm text-muted-foreground truncate">{u.business_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(u.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
