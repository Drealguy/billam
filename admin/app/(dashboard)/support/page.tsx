import Link from "next/link";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  in_progress: "bg-primary/15 text-primary border-primary/20",
  resolved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "support.manage")) return <AccessRestricted />;

  const { status } = await searchParams;
  const admin = createAdminSupabaseClient();

  let query = admin.from("support_tickets").select("*").order("updated_at", { ascending: false });
  if (status && status !== "All") query = query.eq("status", status);
  const { data: tickets } = await query;

  const ticketList = (tickets ?? []) as Ticket[];
  const userIds = Array.from(new Set(ticketList.map((t) => t.user_id)));
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, business_name, full_name, email").in("id", userIds)
    : { data: [] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Support</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{ticketList.length} ticket{ticketList.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl w-fit">
        {["All", "open", "in_progress", "resolved"].map((s) => (
          <Link
            key={s}
            href={s === "All" ? "/support" : `/support?status=${s}`}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              (status ?? "All") === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "All" ? "All" : STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        {ticketList.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No support tickets.</div>
        ) : (
          ticketList.map((t, idx) => {
            const p = profileById.get(t.user_id);
            const name = p?.business_name || p?.full_name || p?.email || "—";
            return (
              <Link
                key={t.id}
                href={`/support/${t.id}`}
                className={`flex items-center justify-between gap-4 px-5 py-4 hover:bg-secondary/40 transition-colors cursor-pointer ${
                  idx !== 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{name}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
