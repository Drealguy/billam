"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { UpgradeModal } from "@/components/upgrade-modal";
import type { PlanTier, BillingCycle } from "@/types";

interface Props {
  plan: PlanTier;
  billingCycle: BillingCycle | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  invoicesThisMonth: number;
  maxInvoicesPerMonth: number | null;
  clientCount: number;
  maxClients: number | null;
}

export function SubscriptionCard({
  plan,
  billingCycle,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  invoicesThisMonth,
  maxInvoicesPerMonth,
  clientCount,
  maxClients,
}: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [managing, setManaging] = useState(false);

  const handleManage = async () => {
    setManaging(true);
    try {
      const res = await fetch("/api/paystack/manage", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Could not open subscription management");
        return;
      }
      window.location.href = json.link;
    } finally {
      setManaging(false);
    }
  };

  const renewalLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Current Plan
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-lg font-black ${plan === "pro" ? "text-primary" : "text-foreground"}`}>
                {plan === "pro" ? "Pro" : "Free"}
              </span>
              {plan === "pro" && billingCycle && (
                <span className="text-xs text-muted-foreground font-medium capitalize">{billingCycle}</span>
              )}
              {cancelAtPeriodEnd && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                  Ending {renewalLabel}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {plan === "pro" ? (
              <button
                onClick={handleManage}
                disabled={managing}
                className="px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {managing && <Loader2 size={12} className="animate-spin" />} Manage Subscription
              </button>
            ) : (
              <button
                onClick={() => setShowUpgrade(true)}
                className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Invoices this month
            </p>
            <p className="text-sm font-bold">
              {invoicesThisMonth}
              {maxInvoicesPerMonth !== null ? ` / ${maxInvoicesPerMonth}` : ""}
              {maxInvoicesPerMonth === null && <span className="text-muted-foreground font-normal"> (unlimited)</span>}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Clients</p>
            <p className="text-sm font-bold">
              {clientCount}
              {maxClients !== null ? ` / ${maxClients}` : ""}
              {maxClients === null && <span className="text-muted-foreground font-normal"> (unlimited)</span>}
            </p>
          </div>
          {plan === "pro" && (
            <div className="col-span-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                {cancelAtPeriodEnd ? "Access ends" : "Renews"}
              </p>
              <p className="text-sm font-bold">{renewalLabel}</p>
            </div>
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal reason="general" onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
