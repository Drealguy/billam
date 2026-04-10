import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { reference } = await req.json();
  if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify with Paystack
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });

  const data = await res.json();

  if (!data.status || data.data.status !== "success") {
    return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
  }

  if (data.data.amount < 300000) {
    return NextResponse.json({ error: "Incorrect amount" }, { status: 400 });
  }

  const amountPaid = data.data.amount / 100; // Convert kobo to naira

  // Check if this reference was already used (prevent double-upgrade)
  const { data: existing } = await supabase
    .from("pro_users")
    .select("id")
    .eq("paystack_reference", reference)
    .single();

  if (existing) {
    // Already processed — just ensure plan is set
    await supabase.from("profiles").update({ plan: "pro" }).eq("id", user.id);
    return NextResponse.json({ success: true });
  }

  // Record in pro_users table
  const { error: proError } = await supabase.from("pro_users").insert({
    user_id: user.id,
    email: user.email,
    paystack_reference: reference,
    amount_paid: amountPaid,
  });

  if (proError) return NextResponse.json({ error: proError.message }, { status: 500 });

  // Upgrade plan on profile
  const { error: planError } = await supabase
    .from("profiles")
    .update({ plan: "pro" })
    .eq("id", user.id);

  if (planError) return NextResponse.json({ error: planError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
