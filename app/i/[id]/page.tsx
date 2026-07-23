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

  let invoice: Invoice | null = null;
  let profile: Profile | null = null;

  try {
    // Use admin client so unauthenticated visitors can read the invoice
    // (the anon client is blocked by RLS — only the owner can read their invoices)
    const supabase = createAdminSupabaseClient();

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (invoiceError && invoiceError.code !== "PGRST116") {
      console.error(`[/i/${id}] failed to load invoice:`, invoiceError);
    }

    invoice = invoiceData as Invoice | null;
    if (!invoice) notFound();

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", invoice.user_id)
      .single();

    if (profileError) {
      console.error(`[/i/${id}] failed to load profile:`, profileError);
    }
    profile = profileData as Profile | null;
  } catch (err) {
    // notFound() throws internally — let that propagate, don't swallow it here.
    if ((err as { digest?: string })?.digest === "NEXT_HTTP_ERROR_FALLBACK;404") throw err;

    console.error(`[/i/${id}] unexpected error rendering public invoice:`, err);
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-lg font-bold mb-2">This invoice couldn&apos;t be loaded</p>
          <p className="text-sm text-muted-foreground">
            Please try again in a moment, or ask the sender for a new link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <PublicInvoiceView
        invoice={invoice}
        profile={profile as Profile}
      />
    </Suspense>
  );
}
