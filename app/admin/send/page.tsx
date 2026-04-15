import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminSendNotification } from "@/components/admin-send-notification";

const SUPERADMIN_EMAIL = "fojediji@gmail.com";

export const dynamic = "force-dynamic";

export default async function AdminSendPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== SUPERADMIN_EMAIL) redirect("/login");

  return <AdminSendNotification />;
}
