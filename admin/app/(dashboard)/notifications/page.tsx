import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "notifications.manage")) return <AccessRestricted />;

  return (
    <ModulePlaceholder
      icon={Bell}
      title="Notification Center"
      description="Send and manage the in-app broadcast notifications Bill Am customers see."
    />
  );
}
