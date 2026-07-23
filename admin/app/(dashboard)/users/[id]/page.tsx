import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { updateAccountStatus, setUserPlan, verifyUserEmail, resetOnboarding } from "./actions";
import { CURRENCY_SYMBOLS } from "@/types";
import type { Profile, Invoice, LoginEvent, Subscription } from "@/types";
import { ArrowLeft, Download, Mail, ShieldCheck, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  suspended: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  banned: "bg-destructive/15 text-destructive border-destructive/20",
  deleted: "bg-muted text-muted-foreground border-border",
};

function fmtMoney(n: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;
  return `${sym}${Number(n).toLocaleString("en-NG")}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{title}</p>
      {children}
    </div>
  );
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "users.manage")) return <AccessRestricted />;

  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const [{ data: profile }, { data: invoices }, { data: loginEvents }, { data: subscription }, authUser] =
    await Promise.all([
      admin.from("profiles").select("*").eq("id", id).single(),
      admin.from("invoices").select("id, invoice_number, client_snapshot, currency, total, status, invoice_date").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
      admin.from("login_events").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
      admin.from("subscriptions").select("*").eq("user_id", id).single(),
      admin.auth.admin.getUserById(id),
    ]);

  if (!profile) notFound();

  const p = profile as Profile;
  const emailVerified = Boolean(authUser.data.user?.email_confirmed_at);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <Link href="/users" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft size={15} /> Users
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black">{p.business_name || p.full_name || "—"}</h1>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status]}`}>{p.status}</span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                p.plan === "pro" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {p.plan}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{p.email}</p>
        </div>
        <a
          href={`/api/users/${id}/export`}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <Download size={13} /> Export User
        </a>
      </div>

      {/* Profile info */}
      <Section title="Profile">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-muted-foreground">Full name</p><p className="font-semibold mt-0.5">{p.full_name || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-semibold mt-0.5">{p.phone || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Bank</p><p className="font-semibold mt-0.5">{p.bank_name || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Currency</p><p className="font-semibold mt-0.5">{p.default_currency}</p></div>
          <div><p className="text-xs text-muted-foreground">Joined</p><p className="font-semibold mt-0.5">{fmtDate(p.created_at)}</p></div>
          <div><p className="text-xs text-muted-foreground">Email verified</p><p className="font-semibold mt-0.5">{emailVerified ? "Yes" : "No"}</p></div>
        </div>
      </Section>

      {/* Account status */}
      <Section title="Account Status">
        <form action={updateAccountStatus} className="space-y-3">
          <input type="hidden" name="userId" value={id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              name="status"
              defaultValue={p.status}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
              <option value="deleted">Deleted</option>
            </select>
            <input
              name="reason"
              defaultValue={p.status_reason ?? ""}
              placeholder="Reason (shown to the user)"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Update Status
          </button>
        </form>
      </Section>

      {/* Plan + quick actions */}
      <Section title="Plan & Actions">
        <div className="flex flex-wrap gap-2">
          <form action={setUserPlan}>
            <input type="hidden" name="userId" value={id} />
            <input type="hidden" name="plan" value="pro" />
            <button
              type="submit"
              disabled={p.plan === "pro"}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Grant Pro
            </button>
          </form>
          <form action={setUserPlan}>
            <input type="hidden" name="userId" value={id} />
            <input type="hidden" name="plan" value="free" />
            <button
              type="submit"
              disabled={p.plan === "free"}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Remove Pro
            </button>
          </form>
          <form action={verifyUserEmail}>
            <input type="hidden" name="userId" value={id} />
            <button
              type="submit"
              disabled={emailVerified}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Mail size={13} /> Verify Email
            </button>
          </form>
          <form action={resetOnboarding}>
            <input type="hidden" name="userId" value={id} />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            >
              <RotateCcw size={13} /> Reset Onboarding
            </button>
          </form>
        </div>
        {subscription && (
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Subscription: {(subscription as Subscription).status}
            {(subscription as Subscription).billing_cycle ? ` · ${(subscription as Subscription).billing_cycle}` : ""}
          </p>
        )}
      </Section>

      {/* Invoices */}
      <Section title={`Invoices (${(invoices ?? []).length})`}>
        {(invoices ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <div className="space-y-2">
            {(invoices as Invoice[]).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <div className="min-w-0">
                  <p className="font-semibold truncate">#{inv.invoice_number} — {inv.client_snapshot?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(inv.invoice_date)}</p>
                </div>
                <span className="font-bold tabular-nums flex-shrink-0">{fmtMoney(Number(inv.total), inv.currency)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Login history */}
      <Section title="Login History">
        {(loginEvents ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No login events recorded yet — tracking started when this feature shipped, so accounts that haven&apos;t logged in since won&apos;t show history yet.
          </p>
        ) : (
          <div className="space-y-2">
            {(loginEvents as LoginEvent[]).map((ev) => (
              <div key={ev.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <p className="text-muted-foreground">{new Date(ev.created_at).toLocaleString("en-GB")}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[50%]">{ev.ip_address ?? "—"}</p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
