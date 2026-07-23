"use client";

import { useState } from "react";
import { X, Loader2, Zap, Check } from "lucide-react";
import type { BillingCycle } from "@/types";

const REASON_COPY: Record<string, { title: string; subtitle: string }> = {
  invoices: {
    title: "You've hit your free invoice limit",
    subtitle: "Upgrade to Pro for unlimited invoices every month.",
  },
  clients: {
    title: "You've hit your free client limit",
    subtitle: "Upgrade to Pro to add unlimited clients.",
  },
  template: {
    title: "This template is a Pro feature",
    subtitle: "Upgrade to unlock every template and full branding.",
  },
  branding: {
    title: "Remove Bill Am branding",
    subtitle: "Pro invoices carry only your brand — nothing of ours.",
  },
  pdf: {
    title: "PDF export is a Pro feature",
    subtitle: "Upgrade to download polished PDF invoices.",
  },
  general: {
    title: "Upgrade to Bill Am Pro",
    subtitle: "Unlock everything Bill Am has to offer.",
  },
};

interface Props {
  reason?: keyof typeof REASON_COPY;
  onClose: () => void;
}

const FEATURES = [
  "Unlimited invoices",
  "Unlimited clients",
  "All templates & full branding",
  "PDF export",
  "Payment status tracking",
];

export function UpgradeModal({ reason = "general", onClose }: Props) {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const copy = REASON_COPY[reason] ?? REASON_COPY.general;

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not start payment");
      window.location.href = json.authorization_url;
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10 text-primary-foreground"
        >
          <X size={14} />
        </button>

        <div className="bg-primary px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-4">
            <Zap size={26} className="text-primary-foreground fill-primary-foreground" />
          </div>
          <h2 className="text-xl font-black text-primary-foreground">{copy.title}</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">{copy.subtitle}</p>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`relative py-2.5 rounded-lg text-sm font-bold transition-colors ${
                cycle === "monthly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
              <br />
              <span className="text-xs font-medium">₦2,500/mo</span>
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={`relative py-2.5 rounded-lg text-sm font-bold transition-colors ${
                cycle === "yearly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              Yearly
              <br />
              <span className="text-xs font-medium">₦25,000/yr</span>
              <span className="absolute -top-2 -right-1 text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                Save ₦5,000
              </span>
            </button>
          </div>

          <ul className="space-y-2 text-sm text-foreground">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-primary-foreground" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Redirecting…
              </>
            ) : (
              "Continue to payment"
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
