import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { LifeBuoy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "support.manage")) return <AccessRestricted />;

  return (
    <ModulePlaceholder
      icon={LifeBuoy}
      title="Support"
      description="View and respond to customer support requests in one queue."
    />
  );
}
