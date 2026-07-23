import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "subscriptions.manage")) return <AccessRestricted />;

  return (
    <ModulePlaceholder
      icon={CreditCard}
      title="Subscription Management"
      description="View live subscription status, billing cycles, and Paystack event history, with manual overrides when needed."
    />
  );
}
