import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { InvoiceBuilder } from "@/components/invoice-builder";
import type { Profile, Client } from "@/types";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { client: preselectedClientId } = await searchParams;

  const [{ data: profile }, { data: clients }, { data: lastInvoice }, { count: invoiceCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("clients").select("*").eq("user_id", user.id).order("name"),
      supabase
        .from("invoices")
        .select("invoice_number")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  // Auto-generate next invoice number
  const lastNum = lastInvoice?.[0]?.invoice_number ?? null;
  let nextNumber = "INV-2026-001";
  if (lastNum) {
    const match = lastNum.replace(/-copy$/, "").match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10) + 1;
      nextNumber = lastNum.replace(/-copy$/, "").replace(/\d+$/, String(n).padStart(3, "0"));
    }
  }

  const p = profile as Profile | null;

  return (
    <InvoiceBuilder
      profile={p as Profile}
      clients={(clients ?? []) as Client[]}
      defaultInvoiceNumber={nextNumber}
      userId={user.id}
      preselectedClientId={preselectedClientId}
      invoiceCount={invoiceCount ?? 0}
      plan={p?.plan ?? "free"}
    />
  );
}
