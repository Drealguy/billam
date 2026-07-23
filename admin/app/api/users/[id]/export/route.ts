import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user.id);
  if (!hasPermission(ctx, "users.manage")) {
    return NextResponse.json({ error: "Missing permission: users.manage" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const [{ data: profile }, { data: invoices }, { data: clients }, { data: subscription }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).single(),
    admin.from("invoices").select("*").eq("user_id", id),
    admin.from("clients").select("*").eq("user_id", id),
    admin.from("subscriptions").select("*").eq("user_id", id).single(),
  ]);

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "user.export",
    targetType: "customer_user",
    targetId: id,
  });

  const payload = {
    exported_at: new Date().toISOString(),
    profile,
    subscription: subscription ?? null,
    invoices: invoices ?? [],
    clients: clients ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="user-${id}.json"`,
    },
  });
}
