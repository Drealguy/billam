"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient, getAuthUser } from "@/lib/supabase-server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getAdminContext, hasPermission } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

async function requireSupportManage() {
  const user = await getAuthUser();
  if (!user) throw new Error("Not signed in");
  const supabase = await createServerSupabaseClient();
  const ctx = await getAdminContext(supabase, user.id);
  if (!hasPermission(ctx, "support.manage")) throw new Error("Missing permission: support.manage");
  return ctx;
}

export async function replyToTicket(formData: FormData) {
  const ctx = await requireSupportManage();
  const ticketId = formData.get("ticketId") as string;
  const body = (formData.get("body") as string)?.trim();
  if (!body) return;

  const admin = createAdminSupabaseClient();
  await admin.from("support_messages").insert({ ticket_id: ticketId, sender: "admin", body });

  // Replying implies someone's on it — bump from open to in_progress.
  await admin
    .from("support_tickets")
    .update({ status: "in_progress" })
    .eq("id", ticketId)
    .eq("status", "open");

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "support.ticket.reply",
    targetType: "support_ticket",
    targetId: ticketId,
  });

  revalidatePath(`/support/${ticketId}`);
  revalidatePath("/support");
}

export async function setTicketStatus(formData: FormData) {
  const ctx = await requireSupportManage();
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as string;

  const admin = createAdminSupabaseClient();
  await admin.from("support_tickets").update({ status }).eq("id", ticketId);

  await logAdminAction({
    adminUserId: ctx.adminUserId!,
    action: "support.ticket.status",
    targetType: "support_ticket",
    targetId: ticketId,
    metadata: { status },
  });

  revalidatePath(`/support/${ticketId}`);
  revalidatePath("/support");
}
