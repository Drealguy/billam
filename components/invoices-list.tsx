"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CURRENCY_SYMBOLS, type Invoice } from "@/types";
import { FileText, Plus, ArrowRight, Trash2, Copy, Link2, Pencil, Zap } from "lucide-react";
import { FREE_INVOICE_LIMIT } from "@/components/paywall-modal";
import { createClient } from "@/lib/supabase";

const FILTERS = ["All", "Unpaid", "Part Paid", "Paid"] as const;
type Filter = typeof FILTERS[number];

const STATUS_MAP: Record<string, Filter> = {
  unpaid: "Unpaid",
  part_payment: "Part Paid",
  paid: "Paid",
};

const STATUS_STYLES: Record<string, string> = {
  paid:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  unpaid:       "bg-red-500/15 text-red-400 border-red-500/20",
  part_payment: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

function fmt(amount: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;
  return `${sym}${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  invoices: Invoice[];
  defaultCurrency: string;
  plan: "free" | "pro";
}

export function InvoicesList({ invoices, defaultCurrency, plan }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = filter === "All"
    ? invoices
    : invoices.filter(i => STATUS_MAP[i.status] === filter);

  const totalBilled = filtered.reduce((s, i) => s + Number(i.total), 0);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("invoices").delete().eq("id", id);
    router.refresh();
    setDeletingId(null);
  };

  const handleCopyLink = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/i/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDuplicate = async (invoice: Invoice) => {
    const supabase = createClient();
    // Generate a new invoice number
    const newNum = invoice.invoice_number + "-copy";
    await supabase.from("invoices").insert({
      user_id: invoice.user_id,
      invoice_number: newNum,
      client_id: invoice.client_id,
      client_snapshot: invoice.client_snapshot,
      line_items: invoice.line_items,
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      vat_enabled: invoice.vat_enabled,
      vat_amount: invoice.vat_amount,
      total: invoice.total,
      deposit_paid: 0,
      balance_due: invoice.total,
      status: "unpaid",
      template: invoice.template,
      project_title: invoice.project_title,
      invoice_date: new Date().toISOString().split("T")[0],
      due_date: invoice.due_date,
      notes: invoice.notes,
    });
    router.refresh();
  };

  const usedCount = invoices.length;
  const atLimit = plan === "free" && usedCount >= FREE_INVOICE_LIMIT;
  const WA_LINK = `https://wa.me/2349167802170?text=${encodeURIComponent("Hi! I'd like to upgrade to BILL AM Pro (₦3,000/year). Please assist me.")}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-6">

      {/* Free plan usage banner */}
      {plan === "free" && (
        <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border ${atLimit ? "bg-red-50 border-red-200" : "bg-primary/5 border-primary/20"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <Zap size={16} className={atLimit ? "text-red-500 flex-shrink-0" : "text-primary flex-shrink-0"} />
            <div className="min-w-0">
              <p className={`text-sm font-bold ${atLimit ? "text-red-700" : "text-foreground"}`}>
                {atLimit
                  ? "You've reached your free invoice limit"
                  : `${usedCount} of ${FREE_INVOICE_LIMIT} free invoices used`}
              </p>
              {!atLimit && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 max-w-[120px] h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(usedCount / FREE_INVOICE_LIMIT) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{FREE_INVOICE_LIMIT - usedCount} left</span>
                </div>
              )}
            </div>
          </div>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            <Zap size={12} /> Upgrade — ₦3,000/yr
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> New Invoice
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl w-fit">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
            <span className="ml-1.5 opacity-60">
              {f === "All"
                ? invoices.length
                : invoices.filter(i => STATUS_MAP[i.status] === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{filtered.length}</span> invoice{filtered.length !== 1 ? "s" : ""} ·{" "}
          Total: <span className="text-primary font-semibold">{fmt(totalBilled, defaultCurrency)}</span>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl text-center">
          <div className="text-5xl mb-4">🧾</div>
          <p className="font-bold text-base">
            {filter === "All" ? "No invoices yet" : `No ${filter.toLowerCase()} invoices`}
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {filter === "All" ? "Create your first invoice to get started." : "Change the filter to see other invoices."}
          </p>
          {filter === "All" && (
            <Link
              href="/invoices/new"
              className="px-5 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              + Create Invoice
            </Link>
          )}
        </div>
      ) : (
        /* Invoice table */
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_140px_120px_100px_44px] gap-4 px-5 py-3 bg-card/60 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Client</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span />
          </div>

          {filtered.map((inv, idx) => {
            const clientName = (inv.client_snapshot as { name?: string })?.name ?? "—";
            const isDeleting = deletingId === inv.id;
            const isCopied = copiedId === inv.id;

            return (
              <div
                key={inv.id}
                className={`group flex flex-col md:grid md:grid-cols-[1fr_140px_120px_100px_44px] md:items-center gap-2 md:gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors ${idx !== 0 ? "border-t border-border" : ""}`}
              >
                {/* Client + invoice number */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{clientName}</p>
                    <p className="text-xs text-muted-foreground">#{inv.invoice_number}</p>
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground md:text-sm md:text-foreground">
                  {formatDate(inv.invoice_date)}
                </p>

                {/* Amount */}
                <p className="text-sm font-bold tabular-nums">{fmt(Number(inv.total), inv.currency)}</p>

                {/* Status */}
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold w-fit ${STATUS_STYLES[inv.status]}`}>
                  {STATUS_MAP[inv.status]}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    title="View"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Mobile action row */}
                <div className="flex items-center gap-2 md:hidden pt-1 border-t border-border/50 mt-1">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowRight size={12} /> View
                  </Link>
                  <span className="text-border">·</span>
                  <Link
                    href={`/invoices/${inv.id}/edit`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                  <span className="text-border">·</span>
                  <button
                    onClick={() => handleCopyLink(inv.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Link2 size={12} /> {isCopied ? "Copied!" : "Copy link"}
                  </button>
                  <span className="text-border">·</span>
                  <button
                    onClick={() => handleDelete(inv.id)}
                    disabled={isDeleting}
                    className="flex items-center gap-1 text-xs text-destructive hover:opacity-70"
                  >
                    <Trash2 size={12} /> {isDeleting ? "…" : "Delete"}
                  </button>
                </div>

                {/* Desktop hover row (shown in the detail view instead) */}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick action row below list */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-center gap-6 pt-2">
          <Link href="/invoices/new" className="text-xs text-primary font-semibold hover:opacity-80 flex items-center gap-1">
            <Plus size={12} /> New invoice
          </Link>
        </div>
      )}
    </div>
  );
}
