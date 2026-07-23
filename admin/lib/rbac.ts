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
type AdminUserRow = {
  id: string;
  full_name: string;
  is_active: boolean;
  admin_user_roles: {
    admin_roles: {
      name: string;
      admin_role_permissions: { admin_permissions: { key: string } | null }[];
    } | null;
  }[];
};

export const getAdminContext = cache(async function getAdminContext(
  supabase: SupabaseClient,
  userId: string
): Promise<AdminContext> {
  // One nested query instead of two sequential round trips —
  // admin_users, its roles, and each role's permissions all come back
  // together via PostgREST's embedding.
  const { data } = await supabase
    .from("admin_users")
    .select("id, full_name, is_active, admin_user_roles(admin_roles(name, admin_role_permissions(admin_permissions(key))))")
    .eq("id", userId)
    .single();

  const adminUser = data as unknown as AdminUserRow | null;

  if (!adminUser || !adminUser.is_active) {
    return EMPTY_ADMIN_CONTEXT;
  }

  const roles: string[] = [];
  const permissions = new Set<string>();
  for (const row of adminUser.admin_user_roles ?? []) {
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
