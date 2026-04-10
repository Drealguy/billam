import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, full_name, plan")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell
      businessName={profile?.business_name ?? ""}
      fullName={profile?.full_name ?? user.email ?? ""}
      plan={(profile?.plan as "free" | "pro") ?? "free"}
    >
      {children}
    </DashboardShell>
  );
}
