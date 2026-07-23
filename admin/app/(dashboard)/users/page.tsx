import Link from "next/link";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { UsersFilters } from "@/components/users-filters";
import type { Profile } from "@/types";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  suspended: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  banned: "bg-destructive/15 text-destructive border-destructive/20",
  deleted: "bg-muted text-muted-foreground border-border",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; plan?: string; page?: string }>;
}) {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "users.manage")) return <AccessRestricted />;

  const { q, status, plan, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = createAdminSupabaseClient();
  let query = admin
    .from("profiles")
    .select("id, full_name, business_name, email, plan, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    const term = q.replace(/[%_]/g, "");
    query = query.or(`full_name.ilike.%${term}%,business_name.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (status && status !== "All") query = query.eq("status", status);
  if (plan && plan !== "All") query = query.eq("plan", plan);

  const { data: users, count } = await query.range(from, to);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status && status !== "All") params.set("status", status);
    if (plan && plan !== "All") params.set("plan", plan);
    params.set("page", String(targetPage));
    return `/users?${params.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {(count ?? 0).toLocaleString()} customer{(count ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      <UsersFilters />

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_120px_100px_120px_40px] gap-4 px-5 py-3 bg-card/60 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Customer</span>
          <span>Plan</span>
          <span>Status</span>
          <span>Joined</span>
          <span />
        </div>

        {(users ?? []).length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No users match these filters.</div>
        ) : (
          (users as Profile[]).map((u, idx) => (
            <Link
              key={u.id}
              href={`/users/${u.id}`}
              className={`grid grid-cols-1 md:grid-cols-[1fr_120px_100px_120px_40px] gap-2 md:gap-4 md:items-center px-5 py-4 hover:bg-secondary/40 transition-colors cursor-pointer ${
                idx !== 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{u.business_name || u.full_name || "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit ${
                  u.plan === "pro" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {u.plan}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border w-fit ${STATUS_STYLES[u.status]}`}>
                {u.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <ArrowRight size={14} className="text-muted-foreground hidden md:block" />
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page === 1}
            className={`p-2 rounded-lg border border-border cursor-pointer hover:bg-secondary transition-colors ${
              page === 1 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <ChevronLeft size={15} />
          </Link>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page === totalPages}
            className={`p-2 rounded-lg border border-border cursor-pointer hover:bg-secondary transition-colors ${
              page === totalPages ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <ChevronRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
