import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ClientsManager } from "@/components/clients-manager";
import type { Client } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return (
    <ClientsManager
      clients={(clients ?? []) as Client[]}
      userId={user.id}
    />
  );
}
