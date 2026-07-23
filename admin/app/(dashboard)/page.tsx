import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { Users, TrendingUp, FileText, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

// Kept in sync manually with the customer app's pricing
// (billam/lib/paystack.ts) — the two apps don't share a codebase.
const MONTHLY_PRICE_NGN = 2500;
const YEARLY_PRICE_NGN = 25000;

function fmtNaira(n: number) {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

export default async function AdminDashboardHome() {
  const admin = createAdminSupabaseClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const [
    { count: totalCustomers },
    { count: signupsThisWeek },
    { count: proCount },
    { data: allSubs },
    { count: invoicesThisMonth },
    { data: recentSignups },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "pro"),
    admin.from("subscriptions").select("status, billing_cycle"),
    admin.from("invoices").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
    admin
      .from("profiles")
      .select("id, full_name, business_name, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const statusCounts: Record<string, number> = { active: 0, past_due: 0, cancelled: 0, expired: 0, none: 0 };
  let mrr = 0;
  for (const s of allSubs ?? []) {
    statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;
    if (s.status === "active") {
      mrr += s.billing_cycle === "yearly" ? YEARLY_PRICE_NGN / 12 : MONTHLY_PRICE_NGN;
    }
  }

  const cards = [
    { label: "Total Customers", value: (totalCustomers ?? 0).toLocaleString(), icon: Users, sub: `${signupsThisWeek ?? 0} new this week` },
    { label: "Pro Subscribers", value: (proCount ?? 0).toLocaleString(), icon: TrendingUp, sub: `${statusCounts.active} active subscriptions` },
    { label: "Estimated MRR", value: fmtNaira(mrr), icon: TrendingUp, sub: "based on active subscriptions" },
    { label: "Invoices This Month", value: (invoicesThisMonth ?? 0).toLocaleString(), icon: FileText, sub: "across all customers" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Bill Am platform overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
              <Icon size={15} className="text-primary opacity-70" />
            </div>
            <p className="text-2xl font-black leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription status breakdown */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Subscription Status
          </p>
          <div className="space-y-3">
            {[
              { key: "active", label: "Active", color: "bg-emerald-500" },
              { key: "past_due", label: "Past Due", color: "bg-amber-500" },
              { key: "cancelled", label: "Cancelled", color: "bg-orange-500" },
              { key: "expired", label: "Expired", color: "bg-destructive" },
              { key: "none", label: "None (Free)", color: "bg-muted-foreground" },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  {label}
                </span>
                <span className="font-bold">{statusCounts[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent signups */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Recent Signups
          </p>
          {(recentSignups ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No signups yet.</p>
          ) : (
            <div className="space-y-3">
              {(recentSignups ?? []).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <UserPlus size={13} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{p.business_name || p.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                      p.plan === "pro" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.plan}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
