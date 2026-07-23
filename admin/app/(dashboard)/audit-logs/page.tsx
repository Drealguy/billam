import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "audit_logs.view")) return <AccessRestricted />;

  return (
    <ModulePlaceholder
      icon={ScrollText}
      title="Audit Logs"
      description="A read-only feed of every sensitive admin action, filterable by admin, action, and date."
    />
  );
}
