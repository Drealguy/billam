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
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set up your business profile — this appears on every invoice you send.
        </p>
      </div>
      <SettingsForm profile={profile as Profile} userId={user.id} />
    </div>
  );
}
