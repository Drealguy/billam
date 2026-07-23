import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/rbac";
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const ctx = await getAdminContext(supabase, user.id);

  // proxy.ts only confirms a Supabase session exists — this is where
  // "is this session actually an active admin" is enforced.
  if (!ctx.isAdmin) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        fullName={ctx.fullName}
        roles={ctx.roles}
        permissions={Array.from(ctx.permissions)}
      />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
