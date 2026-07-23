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

  // One nested query instead of two sequential round trips: roles and
  // their permissions come back together via PostgREST's embedding.
  const { data: userRoles } = await supabase
    .from("admin_user_roles")
    .select("admin_roles(name, admin_role_permissions(admin_permissions(key)))")
    .eq("user_id", userId);

  type RoleRow = {
    admin_roles: {
      name: string;
      admin_role_permissions: { admin_permissions: { key: string } | null }[];
    } | null;
  };

  const roles: string[] = [];
  const permissions = new Set<string>();
  for (const row of (userRoles ?? []) as unknown as RoleRow[]) {
    const role = row.admin_roles;
    if (!role) continue;
    roles.push(role.name);
    for (const rp of role.admin_role_permissions ?? []) {
      if (rp.admin_permissions?.key) permissions.add(rp.admin_permissions.key);
    }
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
