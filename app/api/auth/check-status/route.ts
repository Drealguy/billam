import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/**
 * Called by the login page right after a successful sign-in, to
 * confirm the account's status actually allows access — a suspended/
 * banned/deleted account can still complete signInWithPassword. The
 * block happens here and again in the dashboard layout for sessions
 * that were already active when an admin changed the status.
 */
export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ ok: false, reason: "Not signed in" }, { status: 401 });

  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("status, status_reason")
    .eq("id", user.id)
    .single();

  if (profile && profile.status !== "active") {
    return NextResponse.json(
      { ok: false, status: profile.status, reason: profile.status_reason },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
