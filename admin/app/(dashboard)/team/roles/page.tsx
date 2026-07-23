import Link from "next/link";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { updateRolePermissions, createRole } from "./actions";
import { ArrowLeft, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

interface RoleRow {
  id: string;
  name: string;
  description: string;
}

interface PermissionRow {
  id: string;
  key: string;
  description: string;
}

export default async function RolesPage() {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "team.manage")) return <AccessRestricted />;

  const admin = createAdminSupabaseClient();
  const [{ data: roles }, { data: permissions }, { data: rolePerms }] = await Promise.all([
    admin.from("admin_roles").select("id, name, description").order("name"),
    admin.from("admin_permissions").select("id, key, description").order("key"),
    admin.from("admin_role_permissions").select("role_id, permission_id"),
  ]);

  const roleList = (roles ?? []) as RoleRow[];
  const permissionList = (permissions ?? []) as PermissionRow[];
  const grantSet = new Set((rolePerms ?? []).map((rp) => `${rp.role_id}:${rp.permission_id}`));

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <Link href="/team" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer">
        <ArrowLeft size={15} /> Team
      </Link>

      <div>
        <h1 className="text-2xl font-black">Roles &amp; Permissions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Check the permissions each role grants, then save that role&apos;s row.
        </p>
      </div>

      {/* Create role */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
          <Plus size={13} /> Create Role
        </p>
        <form action={createRole} className="flex flex-col sm:flex-row gap-3">
          <input
            name="name"
            required
            placeholder="Role name, e.g. Auditor"
            className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            name="description"
            placeholder="Description (optional)"
            className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
          >
            Create
          </button>
        </form>
      </div>

      {/* Hidden per-role forms — checkboxes below reference these via the `form` attribute */}
      {roleList.map((r) => (
        <form key={r.id} id={`role-form-${r.id}`} action={updateRolePermissions} className="hidden">
          <input type="hidden" name="roleId" value={r.id} />
        </form>
      ))}

      {/* Matrix */}
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Permission</th>
              {roleList.map((r) => (
                <th key={r.id} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground capitalize whitespace-nowrap">
                  {r.name.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionList.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{p.key}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </td>
                {roleList.map((r) => (
                  <td key={r.id} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      form={`role-form-${r.id}`}
                      name="permissionIds"
                      value={p.id}
                      defaultChecked={grantSet.has(`${r.id}:${p.id}`)}
                      className="cursor-pointer accent-primary"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="px-4 py-3" />
              {roleList.map((r) => (
                <td key={r.id} className="px-4 py-3 text-center">
                  <button
                    type="submit"
                    form={`role-form-${r.id}`}
                    className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
