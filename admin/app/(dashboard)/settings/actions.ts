"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

export async function setPlatformSetting(formData: FormData) {
  const user = await getAuthUser();
  if (!user) throw new Error("Not signed in");
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user.id);
  if (!hasPermission(ctx, "settings.manage")) throw new Error("Missing permission: settings.manage");

  const key = formData.get("key") as string;
  const value = formData.get("value") === "true";

  const admin = createAdminSupabaseClient();
  await admin.from("platform_settings").update({ value }).eq("key", key);

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "settings.update",
    targetType: "platform_setting",
    targetId: key,
    metadata: { value },
  });

  revalidatePath("/settings");
}
