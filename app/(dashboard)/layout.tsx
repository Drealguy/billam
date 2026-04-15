import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import type { Notification } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: notifications }] = await Promise.all([
    supabase
      .from("profiles")
      .select("business_name, full_name, logo_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <DashboardShell
      businessName={profile?.business_name ?? ""}
      fullName={profile?.full_name ?? user.email ?? ""}
      logoUrl={profile?.logo_url ?? ""}
      notifications={(notifications ?? []) as Notification[]}
    >
      {children}
    </DashboardShell>
  );
}
