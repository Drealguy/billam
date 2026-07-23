"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

async function requireTeamManage() {
  const user = await getAuthUser();
  if (!user) throw new Error("Not signed in");
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user.id);
  if (!hasPermission(ctx, "team.manage")) throw new Error("Missing permission: team.manage");
  return ctx;
}

/** Invites a brand-new person via Supabase Auth (creates their account
 * and emails them a link to set a password). If the email already has
 * an account — e.g. an existing Bill Am customer — falls back to
 * looking them up and just granting admin access to that account. */
export async function inviteAdmin(formData: FormData) {
  const ctx = await requireTeamManage();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const fullName = (formData.get("fullName") as string) || "";
  const roleIds = formData.getAll("roleIds") as string[];

  const admin = createAdminSupabaseClient();

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);

  let userId: string;
  if (invited?.user) {
    userId = invited.user.id;
  } else {
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const match = existing?.users.find((u) => u.email?.toLowerCase() === email);
    if (!match) throw new Error(inviteError?.message ?? "Could not find or invite this email");
    userId = match.id;
  }

  await admin.from("admin_users").upsert({ id: userId, email, full_name: fullName, is_active: true });

  await admin.from("admin_user_roles").delete().eq("user_id", userId);
  if (roleIds.length > 0) {
    await admin.from("admin_user_roles").insert(roleIds.map((roleId) => ({ user_id: userId, role_id: roleId })));
  }

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "team.admin.invite",
    targetType: "admin_user",
    targetId: userId,
    metadata: { email, roleIds },
  });

  revalidatePath("/team");
}

export async function updateAdminRoles(formData: FormData) {
  const ctx = await requireTeamManage();
  const userId = formData.get("userId") as string;
  const roleIds = formData.getAll("roleIds") as string[];

  const admin = createAdminSupabaseClient();
  await admin.from("admin_user_roles").delete().eq("user_id", userId);
  if (roleIds.length > 0) {
    await admin.from("admin_user_roles").insert(roleIds.map((roleId) => ({ user_id: userId, role_id: roleId })));
  }

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "team.admin.update_roles",
    targetType: "admin_user",
    targetId: userId,
    metadata: { roleIds },
  });

  revalidatePath("/team");
}

export async function setAdminActive(formData: FormData) {
  const ctx = await requireTeamManage();
  const userId = formData.get("userId") as string;
  const isActive = formData.get("isActive") === "true";

  if (userId === ctx.adminUserId && !isActive) {
    throw new Error("You can't deactivate your own account");
  }

  const admin = createAdminSupabaseClient();
  await admin.from("admin_users").update({ is_active: isActive }).eq("id", userId);

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: isActive ? "team.admin.reactivate" : "team.admin.deactivate",
    targetType: "admin_user",
    targetId: userId,
  });

  revalidatePath("/team");
}
