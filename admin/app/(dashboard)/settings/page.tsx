import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { AccessRestricted } from "@/components/access-restricted";
import { setPlatformSetting } from "./actions";
import { Flag } from "lucide-react";

export const dynamic = "force-dynamic";

interface SettingRow {
  key: string;
  value: boolean;
  description: string | null;
}

function labelFor(key: string) {
  return key
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function SettingsPage() {
  const user = await getAuthUser();
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user!.id);

  if (!hasPermission(ctx, "settings.manage")) return <AccessRestricted />;

  const admin = createAdminSupabaseClient();
  const { data: settings } = await admin.from("platform_settings").select("key, value, description").order("key");

  const flags = (settings ?? []) as SettingRow[];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform-level configuration.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
          <Flag size={13} /> Feature Flags
        </p>

        {flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No feature flags yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {flags.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{labelFor(f.key)}</p>
                  {f.description && <p className="text-xs text-muted-foreground mt-1 max-w-md">{f.description}</p>}
                </div>
                <form action={setPlatformSetting} className="flex-shrink-0">
                  <input type="hidden" name="key" value={f.key} />
                  <input type="hidden" name="value" value={(!f.value).toString()} />
                  <button
                    type="submit"
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                      f.value ? "bg-primary" : "bg-muted"
                    }`}
                    aria-label={f.value ? "Enabled — click to disable" : "Disabled — click to enable"}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        f.value ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        More settings (branding, maintenance mode, plan limits, legal pages) will appear here as they&apos;re built —
        this table is designed so new flags are just new rows, not new code.
      </p>
    </div>
  );
}
