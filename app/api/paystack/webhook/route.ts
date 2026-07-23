import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BillingCycle } from "@/types";

const CYCLE_DAYS: Record<BillingCycle, number> = { monthly: 30, yearly: 365 };

function inferCycle(data: Record<string, unknown>): BillingCycle {
  const metadataCycle = (data.metadata as { cycle?: string } | null)?.cycle;
  if (metadataCycle === "monthly" || metadataCycle === "yearly") return metadataCycle;
  const interval = (data.plan as { interval?: string } | null)?.interval;
  return interval === "annually" || interval === "yearly" ? "yearly" : "monthly";
}

async function handleChargeSuccess(supabase: SupabaseClient, data: Record<string, unknown>) {
  const userId = (data.metadata as { user_id?: string } | null)?.user_id;
  if (!userId) {
    console.error("[paystack webhook] charge.success missing metadata.user_id", data.reference);
    return;
  }

  const cycle = inferCycle(data);
  const now = new Date();
  const periodEnd = new Date(now.getTime() + CYCLE_DAYS[cycle] * 24 * 60 * 60 * 1000);
  const customer = data.customer as { customer_code?: string } | null;
  const plan = data.plan as { plan_code?: string } | null;

  await supabase
    .from("subscriptions")
    .update({
      plan: "pro",
      status: "active",
      billing_cycle: cycle,
      paystack_customer_code: customer?.customer_code ?? null,
      paystack_plan_code: plan?.plan_code ?? null,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      last_payment_reference: data.reference ?? null,
      last_payment_amount: typeof data.amount === "number" ? data.amount / 100 : null,
    })
    .eq("user_id", userId);

  await supabase.from("profiles").update({ plan: "pro" }).eq("id", userId);
}

async function handleSubscriptionCreate(supabase: SupabaseClient, data: Record<string, unknown>) {
  const customer = data.customer as { customer_code?: string } | null;
  if (!customer?.customer_code) return;

  const update: Record<string, unknown> = {
    paystack_subscription_code: data.subscription_code,
    paystack_email_token: data.email_token,
  };
  if (typeof data.next_payment_date === "string") {
    update.current_period_end = new Date(data.next_payment_date).toISOString();
  }

  await supabase.from("subscriptions").update(update).eq("paystack_customer_code", customer.customer_code);
}

async function handleSubscriptionDisable(supabase: SupabaseClient, data: Record<string, unknown>) {
  const subscriptionCode = data.subscription_code as string | undefined;
  if (!subscriptionCode) return;

  // Cancelled, but access continues until current_period_end — the
  // cron job (or next login check) downgrades to free once it lapses.
  await supabase
    .from("subscriptions")
    .update({ status: "cancelled", cancel_at_period_end: true })
    .eq("paystack_subscription_code", subscriptionCode);
}

async function handlePaymentFailed(supabase: SupabaseClient, data: Record<string, unknown>) {
  const subscription = data.subscription as { subscription_code?: string } | null;
  const subscriptionCode = subscription?.subscription_code ?? (data.subscription_code as string | undefined);
  if (!subscriptionCode) return;

  await supabase.from("subscriptions").update({ status: "past_due" }).eq("paystack_subscription_code", subscriptionCode);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  // Idempotency — Paystack retries deliveries until it gets a 200.
  const dedupeKey = `${event.event}:${event.data?.id ?? event.data?.reference ?? rawBody.length}`;
  const { error: insertError } = await supabase
    .from("subscription_events")
    .insert({ paystack_event_id: dedupeKey, event_type: event.event, payload: event });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[paystack webhook] failed to record event:", insertError);
  }

  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(supabase, event.data);
        break;
      case "subscription.create":
        await handleSubscriptionCreate(supabase, event.data);
        break;
      case "subscription.disable":
      case "subscription.not_renew":
        await handleSubscriptionDisable(supabase, event.data);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(supabase, event.data);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[paystack webhook] error processing ${event.event}:`, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
