"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

async function requireUsersManage() {
  const user = await getAuthUser();
  if (!user) throw new Error("Not signed in");
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user.id);
  if (!hasPermission(ctx, "users.manage")) throw new Error("Missing permission: users.manage");
  return ctx;
}

/** Covers Suspend/Unsuspend, Ban/Unban, Delete/Restore — all are just
 * transitions of the same status field, enforced in the customer app
 * at login and in its dashboard layout. */
export async function updateAccountStatus(formData: FormData) {
  const ctx = await requireUsersManage();
  const userId = formData.get("userId") as string;
  const status = formData.get("status") as string;
  const reason = (formData.get("reason") as string) || null;

  const admin = createAdminSupabaseClient();
  await admin.from("profiles").update({ status, status_reason: reason }).eq("id", userId);

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "user.status.update",
    targetType: "customer_user",
    targetId: userId,
    metadata: { status, reason },
  });

  revalidatePath(`/users/${userId}`);
  revalidatePath("/users");
}

/** Manual override — does not touch any real Paystack subscription
 * that might exist for this user, so a webhook firing later can still
 * correct things. Intended for comping access or clawing back comped
 * access, not for cancelling a real paid subscription (use the
 * Subscriptions module for that). */
export async function setUserPlan(formData: FormData) {
  const ctx = await requireUsersManage();
  const userId = formData.get("userId") as string;
  const plan = formData.get("plan") as "free" | "pro";

  const admin = createAdminSupabaseClient();
  await admin.from("profiles").update({ plan }).eq("id", userId);
  await admin
    .from("subscriptions")
    .update({ plan, status: plan === "pro" ? "active" : "none" })
    .eq("user_id", userId);

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: plan === "pro" ? "user.plan.grant_pro" : "user.plan.remove_pro",
    targetType: "customer_user",
    targetId: userId,
  });

  revalidatePath(`/users/${userId}`);
  revalidatePath("/users");
}

export async function verifyUserEmail(formData: FormData) {
  const ctx = await requireUsersManage();
  const userId = formData.get("userId") as string;

  const admin = createAdminSupabaseClient();
  await admin.auth.admin.updateUserById(userId, { email_confirm: true });

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "user.email.verify",
    targetType: "customer_user",
    targetId: userId,
  });

  revalidatePath(`/users/${userId}`);
}

/** Clears the branding fields the dashboard's onboarding checklist
 * actually checks (logo, brand/accent colour) so those steps show as
 * incomplete again. Never touches business_name/phone/bank details —
 * those are real business data, not onboarding state. */
export async function resetOnboarding(formData: FormData) {
  const ctx = await requireUsersManage();
  const userId = formData.get("userId") as string;

  const admin = createAdminSupabaseClient();
  await admin
    .from("profiles")
    .update({ logo_url: null, brand_colour: "#111827", accent_colour: "#2B52FF" })
    .eq("id", userId);

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "user.onboarding.reset",
    targetType: "customer_user",
    targetId: userId,
  });

  revalidatePath(`/users/${userId}`);
}
