import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { replyToTicket, setTicketStatus } from "./actions";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "support.manage")) return <AccessRestricted />;

  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const [{ data: ticket }, { data: messages }] = await Promise.all([
    admin.from("support_tickets").select("*").eq("id", id).single(),
    admin.from("support_messages").select("*").eq("ticket_id", id).order("created_at", { ascending: true }),
  ]);

  if (!ticket) notFound();

  const { data: profile } = await admin
    .from("profiles")
    .select("business_name, full_name, email")
    .eq("id", ticket.user_id)
    .single();
  const name = profile?.business_name || profile?.full_name || profile?.email || "—";

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <Link href="/support" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer">
        <ArrowLeft size={15} /> Support
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{name} &middot; {profile?.email}</p>
        </div>
        <form action={setTicketStatus} className="flex items-center gap-2">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <select
            name="status"
            defaultValue={ticket.status}
            className="bg-input border border-border rounded-md px-3 py-2 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            type="submit"
            className="px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
          >
            Update
          </button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3 max-h-[50vh] overflow-y-auto">
        {(messages ?? []).map((m) => (
          <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                m.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              <p>{m.body}</p>
              <p className={`text-[10px] mt-1 ${m.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {new Date(m.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form action={replyToTicket} className="flex items-center gap-2">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <input
          name="body"
          required
          placeholder="Type a reply…"
          className="flex-1 bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2.5 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Reply
        </button>
      </form>
    </div>
  );
}
