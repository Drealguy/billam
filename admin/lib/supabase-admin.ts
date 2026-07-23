import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key. Bypasses RLS —
 * only for trusted server-side reads/writes (analytics queries spanning
 * all customers, audit log inserts, etc). Never expose to the browser.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      `Supabase admin client misconfigured — missing ${!url ? "NEXT_PUBLIC_SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY"} env var`
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
