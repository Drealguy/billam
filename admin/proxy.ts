import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// This Next.js version uses proxy.ts (not middleware.ts) as its
// request-interception convention — see AGENTS.md in the main app repo.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession() decodes the cookie locally — no network round-trip to
  // Supabase's Auth server, unlike getUser(). Safe here specifically
  // because this is only a coarse "is there a session at all" redirect;
  // the authoritative, revalidating check (is this session actually an
  // active admin, which permissions) happens in
  // app/(dashboard)/layout.tsx via getUser() + lib/rbac.ts on every
  // request regardless, so a stale/tampered cookie sneaking past this
  // check still gets caught immediately downstream. Trading that
  // redundant network call for real per-navigation latency.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
