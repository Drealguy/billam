import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/**
 * Safety net for the webhook: if a subscription.disable/invoice.payment_failed
 * webhook was missed and a cancelled/past-due subscription's period has
 * actually lapsed, downgrade it here. Runs daily via Vercel Cron.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const nowIso = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from("subscriptions")
    .select("user_id")
    .in("status", ["cancelled", "past_due"])
    .lt("current_period_end", nowIso);

  if (error) {
    console.error("[cron check-subscriptions] query failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = (expired ?? []).map((row) => row.user_id as string);

  if (userIds.length > 0) {
    await supabase
      .from("subscriptions")
      .update({ status: "expired", plan: "free" })
      .in("user_id", userIds);

    await supabase.from("profiles").update({ plan: "free" }).in("id", userIds);
  }

  return NextResponse.json({ downgraded: userIds.length });
}
