import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { InvoicesList } from "@/components/invoices-list";
import type { Invoice, Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: invoices }, { data: profile }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("default_currency").eq("id", user.id).single(),
  ]);

  const p = profile as Profile | null;

  return (
    <InvoicesList
      invoices={(invoices ?? []) as Invoice[]}
      defaultCurrency={p?.default_currency ?? "NGN"}
    />
  );
}
