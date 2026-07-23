import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["open", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!ticket) return NextResponse.json({ ticket: null, messages: [] });

  const { data: messages } = await supabase
    .from("support_messages")
    .select("*")
    .eq("ticket_id", ticket.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ ticket, messages: messages ?? [] });
}
