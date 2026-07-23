import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/** platform_settings is owned by the admin app's Settings module (its
 * migrations create the table), but the customer app reads it via its
 * own service-role client — same cross-app pattern as admin_events,
 * just in reverse. */
export async function getPlatformSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin.from("platform_settings").select("value").eq("key", key).single();
  return data ? (data.value as T) : fallback;
}
