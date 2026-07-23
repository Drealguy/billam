import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/** Customer sending another message on a ticket they already have open. */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId, message } = await req.json().catch(() => ({ ticketId: null, message: "" }));
  const body = (message || "").trim();
  if (!ticketId || !body) return NextResponse.json({ error: "ticketId and message are required" }, { status: 400 });

  // RLS already scopes support_tickets/support_messages to auth.uid(),
  // so this insert simply fails if ticketId doesn't belong to this user.
  const { data: newMessage, error } = await supabase
    .from("support_messages")
    .insert({ ticket_id: ticketId, sender: "customer", body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("business_name, full_name, email")
    .eq("id", user.id)
    .single();
  const name = profile?.business_name || profile?.full_name || profile?.email || "A customer";

  await admin.from("admin_events").insert({
    type: "support_reply",
    title: `${name} replied to a support ticket`,
    body: body.slice(0, 140),
    metadata: { ticket_id: ticketId, user_id: user.id },
  });

  return NextResponse.json({ message: newMessage });
}
