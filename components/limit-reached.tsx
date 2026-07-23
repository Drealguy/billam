"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { UpgradeModal } from "@/components/upgrade-modal";

export function LimitReached({
  reason,
  title,
  message,
}: {
  reason: "invoices" | "clients";
  title: string;
  message: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Lock size={28} className="text-primary" />
      </div>
      <h1 className="text-2xl font-black mb-3">{title}</h1>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">{message}</p>
      <button
        onClick={() => setShow(true)}
        className="px-6 py-3 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
      >
        Upgrade to Pro
      </button>
      {show && <UpgradeModal reason={reason} onClose={() => setShow(false)} />}
    </div>
  );
}
