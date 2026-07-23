import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * auth.users isn't exposed over PostgREST, so anything needing
 * last_sign_in_at (Active Users, Active Sessions) has to go through
 * the Admin Auth API instead of .from(). Paginates through every user
 * rather than trusting a single page, so counts stay correct as the
 * user base grows past 1000.
 */
export async function listAllAuthUsers(admin: SupabaseClient) {
  const perPage = 1000;
  let page = 1;
  const all: { id: string; last_sign_in_at: string | null }[] = [];

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;
    all.push(...data.users.map((u) => ({ id: u.id, last_sign_in_at: u.last_sign_in_at ?? null })));
    if (data.users.length < perPage) break;
    page += 1;
  }

  return all;
}

export function countActiveSince(users: { last_sign_in_at: string | null }[], since: Date): number {
  const sinceIso = since.toISOString();
  return users.filter((u) => u.last_sign_in_at && u.last_sign_in_at >= sinceIso).length;
}
