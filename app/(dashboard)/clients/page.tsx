import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ClientsManager } from "@/components/clients-manager";
import { getPlanLimits } from "@/lib/entitlements";
import type { Client, Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: clients }, { data: profile }] = await Promise.all([
    supabase.from("clients").select("*").eq("user_id", user.id).order("name"),
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
  ]);

  const plan = (profile as Pick<Profile, "plan"> | null)?.plan ?? "free";

  return (
    <ClientsManager
      clients={(clients ?? []) as Client[]}
      userId={user.id}
      maxClients={getPlanLimits(plan).maxClients}
    />
  );
}
