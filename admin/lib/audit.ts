import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/**
 * Records a sensitive admin action. Always uses the service-role
 * client — admin_audit_logs has no insert policy for any other role,
 * so this is the only way a row can be written.
 */
export async function logAdminAction(params: {
  adminUserId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  const supabase = createAdminSupabaseClient();
  await supabase.from("admin_audit_logs").insert({
    admin_user_id: params.adminUserId,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    metadata: params.metadata ?? {},
    ip_address: params.ipAddress ?? null,
  });
}
