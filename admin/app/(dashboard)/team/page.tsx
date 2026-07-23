import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { UserCog } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "team.manage")) return <AccessRestricted />;

  return (
    <ModulePlaceholder
      icon={UserCog}
      title="Team Management"
      description="Invite admin operators and assign them roles — super admin, admin, support, or moderator."
    />
  );
}
