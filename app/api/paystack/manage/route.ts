import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getSubscriptionManageLink } from "@/lib/paystack";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("paystack_subscription_code")
    .eq("user_id", user.id)
    .single();

  if (!sub?.paystack_subscription_code) {
    return NextResponse.json({ error: "No active subscription to manage" }, { status: 400 });
  }

  try {
    const link = await getSubscriptionManageLink(sub.paystack_subscription_code);
    return NextResponse.json({ link });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not fetch manage link" },
      { status: 500 }
    );
  }
}
