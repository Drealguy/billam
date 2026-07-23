import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/**
 * Called by the login page right after a successful sign-in. Two jobs:
 * confirm the account's status actually allows access (a suspended/
 * banned/deleted account can still complete signInWithPassword — the
 * block happens here and again in the dashboard layout for existing
 * sessions), and record the login event for the admin dashboard's
 * login-history feature.
 */
export async function POST(req: NextRequest) {
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

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;
  const userAgent = req.headers.get("user-agent");

  await admin.from("login_events").insert({
    user_id: user.id,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  return NextResponse.json({ ok: true });
}
