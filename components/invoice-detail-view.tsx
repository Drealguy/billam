"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InvoicePreview } from "@/components/invoice-preview";
import { CURRENCY_SYMBOLS } from "@/types";
import type { Invoice, Profile, LineItem } from "@/types";
import { ArrowLeft, Link2, Download, Pencil, Trash2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Props {
  invoice: Invoice;
  profile: Profile;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  unpaid: "bg-red-500/15 text-red-400 border-red-500/20",
  part_payment: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};
const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  part_payment: "Part Paid",
};

export function InvoiceDetailView({ invoice, profile }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sym =
    CURRENCY_SYMBOLS[invoice.currency as keyof typeof CURRENCY_SYMBOLS] ??
    invoice.currency;

  const items = (invoice.line_items as LineItem[]).map((i) => ({
    description: i.description,
    details: "",
    quantity: i.quantity,
    unit_price: i.unit_price,
    total: i.total,
  }));

  const previewData = {
    profile,
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date ?? "",
    projectTitle: invoice.project_title ?? "",
    clientName: (invoice.client_snapshot as { name?: string })?.name ?? "",
    clientEmail: (invoice.client_snapshot as { email?: string })?.email ?? "",
    clientPhone: (invoice.client_snapshot as { phone?: string })?.phone ?? "",
    clientAddress: (invoice.client_snapshot as { address?: string })?.address ?? "",
    items,
    currency: invoice.currency,
    sym,
    subtotal: Number(invoice.subtotal),
    vatEnabled: invoice.vat_enabled,
    vatAmount: Number(invoice.vat_amount),
    total: Number(invoice.total),
    status: invoice.status,
    depositPaid: Number(invoice.deposit_paid),
    balanceDue: Number(invoice.balance_due),
    notes: invoice.notes ?? "",
  };

  const publicLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/i/${invoice.id}`
      : `/i/${invoice.id}`;

  const handleCopyLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/i/${invoice.id}`
        : "";
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    window.open(`/i/${invoice.id}?print=1`, "_blank");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("invoices").delete().eq("id", invoice.id).eq("user_id", invoice.user_id);
    router.push("/invoices");
    router.refresh();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} /> Invoices
          </Link>
          <span className="text-border">/</span>
          <span className="text-sm font-semibold">#{invoice.invoice_number}</span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[invoice.status]}`}
          >
            {STATUS_LABELS[invoice.status]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            {copied ? (
              <><Check size={13} className="text-primary" /> Copied!</>
            ) : (
              <><Link2 size={13} /> Copy client link</>
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            <Download size={13} /> Download PDF
          </button>
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            <Pencil size={13} /> Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={13} /> {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {/* Shareable link callout */}
      <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
        <Link2 size={15} className="text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-primary">Client invoice link</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{publicLink}</p>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex-shrink-0 text-xs font-bold text-primary hover:opacity-70 transition-opacity"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Invoice preview */}
      <div className="flex justify-center overflow-x-auto pb-4">
        <InvoicePreview data={previewData} />
      </div>
    </div>
  );
}
