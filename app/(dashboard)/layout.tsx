import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import type { Notification, PlanTier } from "@/types";

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
      .select("business_name, full_name, logo_url, plan, status, status_reason")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  // Catches sessions that were already active when an admin changed
  // this account's status — the login-time check only protects fresh
  // sign-ins, not sessions that started before the status changed.
  if (profile && profile.status !== "active") {
    const params = new URLSearchParams();
    params.set("status", profile.status);
    if (profile.status_reason) params.set("reason", profile.status_reason);
    redirect(`/suspended?${params.toString()}`);
  }

  return (
    <DashboardShell
      businessName={profile?.business_name ?? ""}
      fullName={profile?.full_name ?? user.email ?? ""}
      logoUrl={profile?.logo_url ?? ""}
      plan={(profile?.plan as PlanTier) ?? "free"}
      notifications={(notifications ?? []) as Notification[]}
    >
      {children}
    </DashboardShell>
  );
}
