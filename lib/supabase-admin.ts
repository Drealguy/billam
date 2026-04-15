import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client that uses the service role key.
 * This bypasses Row Level Security — only use it for trusted server-side
 * operations (e.g. reading public invoices without an auth session).
 * NEVER expose this client or the service role key to the browser.
 */
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
