import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "settings.manage")) return <AccessRestricted />;

  return (
    <ModulePlaceholder
      icon={Settings}
      title="Settings"
      description="Admin-app-level configuration, plus role and permission management."
    />
  );
}
