"use client";

import { MessageCircle, Zap, X } from "lucide-react";

const FREE_LIMIT = 5;
const PRO_PRICE = "₦3,000/year";
const WA_NUMBER = "2349167802170";
const WA_MESSAGE = encodeURIComponent(
  "Hi! I'd like to upgrade to BILL AM Pro (₦3,000/year). Please assist me."
);
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

interface Props {
  onClose?: () => void; // optional — if not provided, modal is non-dismissible
}

export function PaywallModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header strip */}
        <div className="bg-primary px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-4">
            <Zap size={26} className="text-primary-foreground fill-primary-foreground" />
          </div>
          <h2 className="text-xl font-black text-primary-foreground">
            You&apos;ve used all {FREE_LIMIT} free invoices
          </h2>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Upgrade to Pro to keep creating unlimited invoices
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">

          {/* Price */}
          <div className="flex items-center justify-between bg-muted rounded-xl px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Bill Am Pro
              </p>
              <p className="text-2xl font-black text-foreground mt-0.5">{PRO_PRICE}</p>
            </div>
            <span className="text-xs font-bold bg-primary/15 text-primary px-3 py-1 rounded-full">
              Best value
            </span>
          </div>

          {/* Features */}
          <ul className="space-y-2 text-sm text-foreground">
            {[
              "Unlimited invoices",
              "All templates & branding",
              "Client portal with payment instructions",
              "PDF downloads",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-primary-foreground">✓</span>
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={18} />
            Chat us on WhatsApp to upgrade
          </a>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          )}
        </div>

        {/* Close button (only if dismissible) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-primary-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export const FREE_INVOICE_LIMIT = FREE_LIMIT;
