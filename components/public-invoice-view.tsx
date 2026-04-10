"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CURRENCY_SYMBOLS } from "@/types";
import type { Invoice, Profile, LineItem } from "@/types";
import { Link2, Check, Download, Copy, Building2, Phone, Landmark } from "lucide-react";

interface Props {
  invoice: Invoice;
  profile: Profile;
}

function fmt(n: number, sym: string) {
  return `${sym}${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string) {
  if (!d) return "Upon receipt";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; border: string }> = {
  unpaid:       { bg: "#fef2f2", text: "#dc2626", label: "Awaiting Payment", border: "#fecaca" },
  part_payment: { bg: "#eff6ff", text: "#2563eb", label: "Part Payment Received", border: "#bfdbfe" },
  paid:         { bg: "#f0fdf4", text: "#16a34a", label: "Fully Paid",        border: "#bbf7d0" },
};

export function PublicInvoiceView({ invoice, profile }: Props) {
  const [copied, setCopied] = useState(false);
  const [acctCopied, setAcctCopied] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("print") === "1") {
      setTimeout(() => window.print(), 900);
    }
  }, [searchParams]);

  const sym = CURRENCY_SYMBOLS[invoice.currency as keyof typeof CURRENCY_SYMBOLS] ?? invoice.currency;
  const items = invoice.line_items as LineItem[];
  const snap = invoice.client_snapshot as { name?: string; email?: string; phone?: string; address?: string };
  const status = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.unpaid;
  const brand = profile?.brand_colour ?? "#2B52FF";
  const accent = profile?.accent_colour ?? "#2B52FF";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href.split("?")[0]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyAcct = async () => {
    await navigator.clipboard.writeText(profile?.account_number ?? "");
    setAcctCopied(true);
    setTimeout(() => setAcctCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f0" }}>

      {/* ── TOP BAR (hidden on print) ── */}
      <div className="no-print sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black uppercase text-sm" style={{ color: brand }}>Bill Am</span>
            <span className="text-black/20 mx-1">·</span>
            <span className="text-sm text-black/50 hidden sm:block">Invoice #{invoice.invoice_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-black/15 hover:bg-black/5 transition-colors bg-white">
              {copied ? <><Check size={12} style={{ color: brand }} /> Copied!</> : <><Link2 size={12} /> Copy link</>}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: brand }}
            >
              <Download size={12} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* ── INVOICE CARD ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-8 py-7 flex justify-between items-start" style={{ background: brand }}>
            <div>
              {profile?.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logo_url} alt="logo" className="h-10 mb-3 object-contain" />
              )}
              <div className="font-bold text-lg leading-tight" style={{ color: accent }}>
                {profile?.business_name || "Business"}
              </div>
              {profile?.business_tagline && (
                <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {profile.business_tagline}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-white font-black text-2xl leading-none">Invoice</div>
              <div className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                {formatDate(invoice.invoice_date)}
              </div>
              <div className="text-sm font-bold mt-1" style={{ color: accent }}>
                #{invoice.invoice_number}
              </div>
            </div>
          </div>

          {/* Billed to + dates */}
          <div className="px-8 py-5 bg-gray-50 border-b border-gray-100 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Billed To</p>
              <p className="font-bold text-gray-900">{snap?.name || "Client"}</p>
              {snap?.email    && <p className="text-xs text-gray-500 mt-0.5">{snap.email}</p>}
              {snap?.phone    && <p className="text-xs text-gray-500">{snap.phone}</p>}
              {snap?.address  && <p className="text-xs text-gray-500">{snap.address}</p>}
            </div>
            <div className="text-right">
              <div className="mb-3">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Invoice Date</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(invoice.invoice_date)}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Due Date</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(invoice.due_date ?? "")}</p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="px-8 py-5">
            <div className="flex text-[9px] font-bold uppercase tracking-wider text-gray-400 border-b-2 pb-2 mb-1" style={{ borderColor: brand }}>
              <div className="flex-1">Description</div>
              <div className="w-12 text-center">Qty</div>
              <div className="w-24 text-right">Rate</div>
              <div className="w-24 text-right">Amount</div>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex items-start py-3 border-b border-gray-50 text-sm">
                <div className="flex-1 font-medium text-gray-800">{item.description}</div>
                <div className="w-12 text-center text-gray-500">{item.quantity}</div>
                <div className="w-24 text-right text-gray-600">{fmt(item.unit_price, sym)}</div>
                <div className="w-24 text-right font-semibold text-gray-900">{fmt(item.total, sym)}</div>
              </div>
            ))}

            {/* Totals */}
            <div className="flex justify-end mt-4">
              <div className="w-56 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-700">{fmt(Number(invoice.subtotal), sym)}</span>
                </div>
                {invoice.vat_enabled && (
                  <div className="flex justify-between text-gray-500">
                    <span>VAT (7.5%)</span>
                    <span className="font-medium text-gray-700">{fmt(Number(invoice.vat_amount), sym)}</span>
                  </div>
                )}
                {invoice.status === "part_payment" && Number(invoice.deposit_paid) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Deposit paid</span>
                    <span className="font-medium">− {fmt(Number(invoice.deposit_paid), sym)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base pt-2 border-t border-gray-200" style={{ color: brand }}>
                  <span>Total Due</span>
                  <span>{fmt(Number(invoice.balance_due), sym)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div
            className="mx-8 mb-6 px-4 py-3 rounded-xl flex items-center justify-between"
            style={{ background: status.bg, border: `1px solid ${status.border}` }}
          >
            <span className="text-sm font-bold" style={{ color: status.text }}>{status.label}</span>
            <span className="text-xl font-black" style={{ color: status.text }}>{fmt(Number(invoice.balance_due), sym)}</span>
          </div>

          {/* Notes / Contract Terms */}
          {invoice.notes && (
            <div className="mx-8 mb-6 px-4 py-4 rounded-xl border border-gray-100 bg-gray-50">
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Contract Terms & Notes</p>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* ── PAYMENT CARD ── */}
        {invoice.status !== "paid" && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Landmark size={16} style={{ color: brand }} />
              <h2 className="font-bold text-gray-900">How to Pay</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-500">
                Transfer <strong className="text-gray-900">{fmt(Number(invoice.balance_due), sym)}</strong> to the account below, then send your payment receipt to{" "}
                {profile?.phone && <strong className="text-gray-900">{profile.phone}</strong>}.
              </p>

              {/* Bank details */}
              <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 bg-gray-50">
                {[
                  { icon: Building2, label: "Bank", value: profile?.bank_name },
                  { icon: Landmark, label: "Account Number", value: profile?.account_number, copyable: true },
                  { icon: null, label: "Account Name", value: profile?.account_name },
                ].filter(r => r.value).map(({ icon: Icon, label, value, copyable }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={14} className="text-gray-400" />}
                      {!Icon && <div className="w-3.5" />}
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-bold text-gray-900">{value}</p>
                      </div>
                    </div>
                    {copyable && (
                      <button
                        onClick={handleCopyAcct}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        {acctCopied ? <><Check size={11} className="text-green-500" /> Copied</> : <><Copy size={11} /> Copy</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Phone */}
              {profile?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={13} />
                  <span>Send receipt to: <strong className="text-gray-900">{profile.phone}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <p className="text-center text-xs text-black/30 pb-4">
          Invoice generated with <span className="font-bold">Bill Am</span> · billam.co
        </p>
      </div>
    </div>
  );
}
