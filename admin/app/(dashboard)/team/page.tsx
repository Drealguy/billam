import Link from "next/link";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { inviteAdmin, updateAdminRoles, setAdminActive } from "./actions";
import { Settings2, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminUserRow {
  id: string;
  full_name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

interface RoleRow {
  id: string;
  name: string;
  description: string;
}

export default async function TeamPage() {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "team.manage")) return <AccessRestricted />;

  const admin = createAdminSupabaseClient();
  const [{ data: admins }, { data: roles }, { data: userRoles }] = await Promise.all([
    admin.from("admin_users").select("id, full_name, email, is_active, created_at").order("created_at", { ascending: true }),
    admin.from("admin_roles").select("id, name, description").order("name"),
    admin.from("admin_user_roles").select("user_id, role_id"),
  ]);

  const roleList = (roles ?? []) as RoleRow[];
  const rolesByUser = new Map<string, string[]>();
  for (const ur of userRoles ?? []) {
    const arr = rolesByUser.get(ur.user_id) ?? [];
    arr.push(ur.role_id);
    rolesByUser.set(ur.user_id, arr);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black">Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{(admins ?? []).length} admin{(admins ?? []).length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/team/roles"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <Settings2 size={13} /> Roles &amp; Permissions
        </Link>
      </div>

      {/* Invite */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
          <UserPlus size={13} /> Invite Admin
        </p>
        <form action={inviteAdmin} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              name="email"
              type="email"
              required
              placeholder="email@example.com"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              name="fullName"
              placeholder="Full name"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {roleList.map((r) => (
              <label key={r.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" name="roleIds" value={r.id} className="cursor-pointer accent-primary" />
                <span className="capitalize">{r.name.replace(/_/g, " ")}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Send Invite
          </button>
        </form>
      </div>

      {/* Roster */}
      <div className="space-y-3">
        {(admins as AdminUserRow[] ?? []).map((a) => {
          const assignedRoleIds = rolesByUser.get(a.id) ?? [];
          const isSelf = a.id === ctx.adminUserId;
          return (
            <div key={a.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-bold">
                    {a.full_name || "—"} {isSelf && <span className="text-xs text-muted-foreground font-normal">(you)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.email}</p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    a.is_active
                      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {a.is_active ? "Active" : "Deactivated"}
                </span>
              </div>

              <form action={updateAdminRoles} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="userId" value={a.id} />
                {roleList.map((r) => (
                  <label key={r.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      name="roleIds"
                      value={r.id}
                      defaultChecked={assignedRoleIds.includes(r.id)}
                      className="cursor-pointer accent-primary"
                    />
                    <span className="capitalize">{r.name.replace(/_/g, " ")}</span>
                  </label>
                ))}
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                >
                  Save Roles
                </button>
              </form>

              <form action={setAdminActive}>
                <input type="hidden" name="userId" value={a.id} />
                <input type="hidden" name="isActive" value={(!a.is_active).toString()} />
                <button
                  type="submit"
                  disabled={isSelf && a.is_active}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title={isSelf && a.is_active ? "You can't deactivate your own account" : undefined}
                >
                  {a.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
