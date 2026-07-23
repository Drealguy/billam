"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { getAdminContext } from "@/lib/rbac";

export async function markAdminEventsRead() {
  const user = await getAuthUser();
  if (!user) return;

  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user.id);
  if (!ctx.isAdmin) return;

  await supabase.from("admin_events").update({ read: true }).eq("read", false);
  revalidatePath("/", "layout");
}
