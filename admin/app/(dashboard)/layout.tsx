import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/rbac";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user.id);

  // proxy.ts only confirms a Supabase session exists — this is where
  // "is this session actually an active admin" is enforced.
  if (!ctx.isAdmin) redirect("/login");

  const { data: events } = await supabase
    .from("admin_events")
    .select("id, title, body, read, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <DashboardShell
      fullName={ctx.fullName}
      roles={ctx.roles}
      permissions={Array.from(ctx.permissions)}
      events={events ?? []}
    >
      {children}
    </DashboardShell>
  );
}
