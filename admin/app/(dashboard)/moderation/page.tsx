import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "moderation.manage")) return <AccessRestricted />;

  return (
    <ModulePlaceholder
      icon={ShieldAlert}
      title="Moderation"
      description="Review flagged accounts and invoices for fraud or abuse, and act on them."
    />
  );
}
