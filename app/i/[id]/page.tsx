import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicInvoiceView } from "@/components/public-invoice-view";
import type { Invoice, Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Use admin client so unauthenticated visitors can read the invoice
  // (the anon client is blocked by RLS — only the owner can read their invoices)
  const supabase = createAdminSupabaseClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", invoice.user_id)
    .single();

  return (
    <Suspense>
      <PublicInvoiceView
        invoice={invoice as Invoice}
        profile={profile as Profile}
      />
    </Suspense>
  );
}
