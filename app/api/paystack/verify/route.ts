import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyTransaction } from "@/lib/paystack";

/**
 * Read-only status check used purely for immediate post-checkout UI
 * feedback. The webhook is the sole writer of subscription state —
 * this route never touches the database, so it can't drift out of
 * sync with it or double-apply an upgrade.
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reference } = await req.json().catch(() => ({ reference: null }));
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  try {
    const txn = await verifyTransaction(reference);
    return NextResponse.json({ status: txn.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not verify payment" },
      { status: 500 }
    );
  }
}
