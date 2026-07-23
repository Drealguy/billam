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

export async function updateRolePermissions(formData: FormData) {
  const ctx = await requireTeamManage();
  const roleId = formData.get("roleId") as string;
  const permissionIds = formData.getAll("permissionIds") as string[];

  const admin = createAdminSupabaseClient();
  await admin.from("admin_role_permissions").delete().eq("role_id", roleId);
  if (permissionIds.length > 0) {
    await admin.from("admin_role_permissions").insert(permissionIds.map((permissionId) => ({ role_id: roleId, permission_id: permissionId })));
  }

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "team.role.update_permissions",
    targetType: "admin_role",
    targetId: roleId,
    metadata: { permissionIds },
  });

  revalidatePath("/team/roles");
}

export async function createRole(formData: FormData) {
  const ctx = await requireTeamManage();
  const rawName = (formData.get("name") as string).trim();
  const name = rawName.toLowerCase().replace(/\s+/g, "_");
  const description = (formData.get("description") as string) || "";

  if (!name) throw new Error("Role name is required");

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("admin_roles").insert({ name, description });
  if (error) throw new Error(error.message);

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "team.role.create",
    targetType: "admin_role",
    metadata: { name, description },
  });

  revalidatePath("/team/roles");
}
