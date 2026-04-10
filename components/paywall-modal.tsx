"use client";

import { useState } from "react";
import { X, Zap, Loader2, MessageCircle } from "lucide-react";

const FREE_LIMIT = 5;
const WA_LINK = `https://wa.me/2349167802170?text=${encodeURIComponent("Hi! I'd like to upgrade to BILL AM Pro (₦3,000/year). Please assist me.")}`;

interface Props {
  onClose?: () => void;
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function PaywallModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Initialize transaction on the server
      const res = await fetch("/api/paystack/initialize", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not start payment");

      const { reference, email } = json;

      // 2. Load Paystack inline script
      await loadPaystackScript();
      setLoading(false);

      // 3. Open Paystack popup
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: 300000, // ₦3,000 in kobo
        currency: "NGN",
        ref: reference,
        onClose: () => {},
        callback: async (response: { reference: string }) => {
          setLoading(true);
          // 4. Verify + upgrade on the server
          const vRes = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          });
          if (vRes.ok) {
            window.location.reload();
          } else {
            const vJson = await vRes.json();
            setLoading(false);
            setError(vJson.error ?? "Verification failed. Please contact support.");
          }
        },
      });

      handler.openIframe();
    } catch (e: any) {
      setLoading(false);
      setError(e.message ?? "Something went wrong. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
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

          {/* Price card */}
          <div className="flex items-center justify-between bg-muted rounded-xl px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Bill Am Pro
              </p>
              <p className="text-2xl font-black text-foreground mt-0.5">
                ₦3,000
                <span className="text-sm font-medium text-muted-foreground">/year</span>
              </p>
            </div>
            <span className="text-xs font-bold bg-primary/15 text-primary px-3 py-1 rounded-full">
              Best value
            </span>
          </div>

          {/* Features */}
          <ul className="space-y-2 text-sm text-foreground">
            {[
              "Unlimited invoices",
              "Edit invoices anytime",
              "All templates & branding",
              "Client portal with payment instructions",
              "PDF downloads",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-primary-foreground">✓</span>
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
              : <><Zap size={16} /> Pay ₦3,000 — Upgrade to Pro</>
            }
          </button>

          {/* WhatsApp fallback */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <MessageCircle size={15} /> Pay via WhatsApp instead
          </a>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          )}
        </div>

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
