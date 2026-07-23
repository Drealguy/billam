import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "users.manage")) return <AccessRestricted />;

  return (
    <ModulePlaceholder
      icon={Users}
      title="User Management"
      description="Search, view, suspend, and adjust Bill Am customer accounts and plans."
    />
  );
}
