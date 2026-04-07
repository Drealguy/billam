import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { InvoiceBuilder } from "@/components/invoice-builder";
import type { Profile, Client } from "@/types";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: clients }, { data: lastInvoice }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("name"),
      supabase
        .from("invoices")
        .select("invoice_number")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

  // Auto-generate next invoice number
  const lastNum = lastInvoice?.[0]?.invoice_number ?? null;
  let nextNumber = "INV-2026-001";
  if (lastNum) {
    const match = lastNum.match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10) + 1;
      nextNumber = lastNum.replace(/\d+$/, String(n).padStart(3, "0"));
    }
  }

  return (
    <InvoiceBuilder
      profile={profile as Profile}
      clients={(clients ?? []) as Client[]}
      defaultInvoiceNumber={nextNumber}
      userId={user.id}
    />
  );
}
