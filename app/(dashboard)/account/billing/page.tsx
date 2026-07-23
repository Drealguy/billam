import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { SubscriptionCard } from "@/components/subscription-card";
import { getPlanLimits, getClientCount, getMonthlyInvoiceCount } from "@/lib/entitlements";
import type { Profile, Subscription } from "@/types";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: subscription }, invoicesThisMonth, clientCount] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    getMonthlyInvoiceCount(supabase, user.id),
    getClientCount(supabase, user.id),
  ]);

  const p = profile as Profile | null;
  const sub = subscription as Subscription | null;
  const plan = p?.plan ?? "free";
  const limits = getPlanLimits(plan);

  return (
    <div className="pb-8">
      <SubscriptionCard
        plan={plan}
        billingCycle={sub?.billing_cycle ?? null}
        currentPeriodEnd={sub?.current_period_end ?? null}
        cancelAtPeriodEnd={sub?.cancel_at_period_end ?? false}
        invoicesThisMonth={invoicesThisMonth}
        maxInvoicesPerMonth={limits.maxInvoicesPerMonth}
        clientCount={clientCount}
        maxClients={limits.maxClients}
      />
    </div>
  );
}
