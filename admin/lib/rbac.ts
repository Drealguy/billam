import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminContext {
  isAdmin: boolean;
  adminUserId: string | null;
  fullName: string;
  roles: string[];
  permissions: Set<string>;
}

export const EMPTY_ADMIN_CONTEXT: AdminContext = {
  isAdmin: false,
  adminUserId: null,
  fullName: "",
  roles: [],
  permissions: new Set(),
};

/**
 * Resolves who's signed in to: are they an active admin, which roles do
 * they hold, and which permissions do those roles grant. Every
 * protected page/route calls this once and checks hasPermission() —
 * nothing checks role names directly, so adding a role or permission
 * later never requires touching call sites.
 */
export const getAdminContext = cache(async function getAdminContext(
  supabase: SupabaseClient,
  userId: string
): Promise<AdminContext> {
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, full_name, is_active")
    .eq("id", userId)
    .single();

  if (!adminUser || !adminUser.is_active) {
    return EMPTY_ADMIN_CONTEXT;
  }

  const { data: userRoles } = await supabase
    .from("admin_user_roles")
    .select("role_id, admin_roles(name)")
    .eq("user_id", userId);

  const roleIds = (userRoles ?? []).map((r) => r.role_id);
  const roles = (userRoles ?? [])
    .map((r) => (r.admin_roles as unknown as { name: string } | null)?.name)
    .filter((name): name is string => Boolean(name));

  let permissions = new Set<string>();
  if (roleIds.length > 0) {
    const { data: rolePermissions } = await supabase
      .from("admin_role_permissions")
      .select("admin_permissions(key)")
      .in("role_id", roleIds);

    permissions = new Set(
      (rolePermissions ?? [])
        .map((rp) => (rp.admin_permissions as unknown as { key: string } | null)?.key)
        .filter((key): key is string => Boolean(key))
    );
  }

  return {
    isAdmin: true,
    adminUserId: adminUser.id,
    fullName: adminUser.full_name,
    roles,
    permissions,
  };
});

export function hasPermission(ctx: AdminContext, key: string): boolean {
  return ctx.isAdmin && ctx.permissions.has(key);
}
