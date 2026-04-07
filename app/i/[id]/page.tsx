import { createServerSupabaseClient } from "@/lib/supabase-server";
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
  const supabase = await createServerSupabaseClient();

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
