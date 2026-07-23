import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

// Memoized per-request so every server component/route sees the same
// client instance — required for lib/rbac.ts's getAdminContext cache
// to actually dedupe (React's cache() keys on argument identity).
export const createServerSupabaseClient = cache(async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookie setting handled by middleware
          }
        },
      },
    }
  );
});

/**
 * auth.getUser() makes a real network call to Supabase's Auth server to
 * revalidate the token (unlike getSession(), which just reads the local
 * cookie) — necessary for security, but expensive to repeat. The layout
 * and every page were each calling it independently, doubling that
 * round trip on every navigation. Memoized so it runs once per request.
 */
export const getAuthUser = cache(async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
