import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client that uses the service role key.
 * This bypasses Row Level Security — only use it for trusted server-side
 * operations (e.g. reading public invoices without an auth session).
 * NEVER expose this client or the service role key to the browser.
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
