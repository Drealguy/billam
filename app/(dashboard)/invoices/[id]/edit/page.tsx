import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import { InvoiceEditor } from "@/components/invoice-editor";
import type { Invoice, Profile, Client } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: invoice }, { data: profile }, { data: clients }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("clients").select("*").eq("user_id", user.id).order("name"),
  ]);

  if (!invoice) notFound();

  return (
    <InvoiceEditor
      invoice={invoice as Invoice}
      profile={profile as Profile}
      clients={(clients ?? []) as Client[]}
      userId={user.id}
    />
  );
}
