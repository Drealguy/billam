import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { initializeSubscriptionTransaction } from "@/lib/paystack";
import type { BillingCycle } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const cycle = body?.cycle as BillingCycle;

  if (cycle !== "monthly" && cycle !== "yearly") {
    return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;

  try {
    const result = await initializeSubscriptionTransaction({
      email: user.email,
      cycle,
      callbackUrl: `${origin}/dashboard`,
      metadata: { user_id: user.id, cycle },
    });

    return NextResponse.json({ authorization_url: result.authorization_url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start payment" },
      { status: 500 }
    );
  }
}
