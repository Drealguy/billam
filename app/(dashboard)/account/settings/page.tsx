import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="pb-8">
      <SettingsForm profile={profile as Profile} userId={user.id} />
    </div>
  );
}
