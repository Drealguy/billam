import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { CURRENCY_SYMBOLS, type Invoice, type Profile } from "@/types";
import Link from "next/link";
import { FileText, ArrowRight, CheckCircle2, Circle, TrendingUp, Wallet, Clock, Send } from "lucide-react";

export const dynamic = "force-dynamic";

function fmt(amount: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;
  return `${sym}${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  unpaid: "bg-red-500/15 text-red-400 border-red-500/20",
  part_payment: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};
const STATUS_LABELS: Record<string, string> = {
  paid: "Paid", unpaid: "Unpaid", part_payment: "Part Paid",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: allInvoices }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const p = profile as Profile | null;
  const invoices = (allInvoices ?? []) as Invoice[];
  const firstName = p?.full_name?.split(" ")[0] ?? "there";
  const currency = p?.default_currency ?? "NGN";

  // Month filter
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = invoices.filter(i => i.created_at >= monthStart);
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  // Stats
  const billed = thisMonth.reduce((s, i) => s + Number(i.total), 0);
  const collected = thisMonth.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const outstanding = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + Number(i.balance_due), 0);
  const sentCount = thisMonth.length;

  // Onboarding checklist
  const checks = {
    profile: !!(p?.business_name && p?.phone),
    logo: !!p?.logo_url,
    colours: !!(p?.brand_colour && p?.brand_colour !== "#111827"),
    bank: !!(p?.bank_name && p?.account_number && p?.account_name),
    invoice: invoices.length > 0,
  };
  const totalChecks = Object.values(checks).length;
  const doneChecks = Object.values(checks).filter(Boolean).length;
  const onboardingComplete = doneChecks === totalChecks;

  const STEPS = [
    { key: "profile", label: "Complete your business profile", href: "/settings", desc: "Add your business name, tagline & phone" },
    { key: "logo",    label: "Upload your logo",              href: "/settings", desc: "Make every invoice look like your brand" },
    { key: "colours", label: "Set your brand colours",        href: "/settings", desc: "Pick your header colour and accent" },
    { key: "bank",    label: "Add bank details",              href: "/settings", desc: "So clients know where to send money" },
    { key: "invoice", label: "Create your first invoice",     href: "/invoices/new", desc: "You're all set — start billing" },
  ] as const;

  const recent = invoices.slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-8">

      {/* Greeting */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black">
            Welcome back, <span className="text-primary">{firstName}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s your overview for <span className="text-foreground font-medium">{monthLabel}</span>
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
        >
          <Send size={14} /> New Invoice
        </Link>
      </div>

      {/* Onboarding checklist */}
      {!onboardingComplete && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-primary/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Set up your account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doneChecks} of {totalChecks} steps completed
              </p>
            </div>
            {/* Progress bar */}
            <div className="hidden sm:block w-32 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(doneChecks / totalChecks) * 100}%` }}
              />
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {STEPS.map(({ key, label, href, desc }) => {
              const done = checks[key];
              return (
                <Link
                  key={key}
                  href={done ? "#" : href}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${done ? "opacity-50 cursor-default" : "hover:bg-primary/10"}`}
                >
                  {done
                    ? <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                    : <Circle size={18} className="text-muted-foreground flex-shrink-0" />
                  }
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : ""}`}>{label}</p>
                    {!done && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
                  </div>
                  {!done && <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Invoices Sent", value: sentCount, icon: FileText, color: "text-foreground", suffix: "this month" },
          { label: "Billed",        value: fmt(billed, currency),     icon: TrendingUp, color: "text-primary",       suffix: "this month" },
          { label: "Collected",     value: fmt(collected, currency),  icon: Wallet,     color: "text-emerald-400",   suffix: "this month" },
          { label: "Outstanding",   value: fmt(outstanding, currency),icon: Clock,      color: "text-amber-400",     suffix: "all invoices" },
        ].map(({ label, value, icon: Icon, color, suffix }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
              <Icon size={15} className={`${color} opacity-60`} />
            </div>
            <p className={`text-xl md:text-2xl font-black ${color} leading-none`}>{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{suffix}</p>
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Invoices</p>
          <Link href="/invoices" className="text-xs text-primary font-semibold hover:opacity-80 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl">
            <div className="text-5xl mb-4">🧾</div>
            <p className="font-bold text-base">No invoices yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first invoice and start getting paid.</p>
            <Link
              href="/invoices/new"
              className="px-5 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              + Create Invoice
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border overflow-hidden">
            {recent.map((inv, idx) => {
              const clientName = (inv.client_snapshot as { name?: string })?.name ?? "—";
              return (
                <Link key={inv.id} href={`/invoices/${inv.id}`}>
                  <div className={`flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors cursor-pointer ${idx !== 0 ? "border-t border-border" : ""}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{clientName}</p>
                        <p className="text-xs text-muted-foreground">#{inv.invoice_number} · {new Date(inv.invoice_date).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`hidden sm:inline-flex text-xs px-2.5 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[inv.status]}`}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                      <span className="text-sm font-bold tabular-nums">
                        {fmt(Number(inv.total), inv.currency)}
                      </span>
                      <ArrowRight size={13} className="text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
