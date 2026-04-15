import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

const SUPERADMIN_EMAIL = "fojediji@gmail.com";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== SUPERADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body } = await req.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();

  // Fetch all user IDs from profiles
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id");

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  // Insert one notification per user
  const rows = profiles.map((p: { id: string }) => ({
    user_id: p.id,
    title: title.trim(),
    body: body.trim(),
    read: false,
  }));

  const { error: insertError } = await admin.from("notifications").insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ count: rows.length });
}
