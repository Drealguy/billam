import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { LifeBuoy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
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
