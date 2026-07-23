import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/**
 * "Talk to a live agent" from the chat widget. Reuses an existing
 * open/in_progress ticket if the customer already has one, rather
 * than spawning duplicates every time they click it.
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json().catch(() => ({ message: "" }));
  const body = (message || "").trim();
  if (!body) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const { data: existingTicket } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["open", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let ticket = existingTicket;
  if (!ticket) {
    const { data: newTicket, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject: body.slice(0, 80) })
      .select()
      .single();

    if (error || !newTicket) {
      return NextResponse.json({ error: error?.message ?? "Could not create ticket" }, { status: 500 });
    }
    ticket = newTicket;
  }

  const { data: newMessage, error: messageError } = await supabase
    .from("support_messages")
    .insert({ ticket_id: ticket.id, sender: "customer", body })
    .select()
    .single();

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("business_name, full_name, email")
    .eq("id", user.id)
    .single();
  const name = profile?.business_name || profile?.full_name || profile?.email || "A customer";

  await admin.from("admin_events").insert({
    type: existingTicket ? "support_reply" : "support_new_ticket",
    title: existingTicket ? `${name} replied to a support ticket` : `New support request from ${name}`,
    body: body.slice(0, 140),
    metadata: { ticket_id: ticket.id, user_id: user.id },
  });

  return NextResponse.json({ ticket, message: newMessage });
}
