"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface Props {
  email: string;
  onDone: () => void;
}

export function PaymentSuccessModal({ email, onDone }: Props) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); onDone(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden text-center">

        {/* Top stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-blue-400 to-primary" />

        <div className="px-8 py-10 space-y-5">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={44} className="text-emerald-500" strokeWidth={1.8} />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Welcome to Pro! 🎉</h2>
            <p className="text-sm text-muted-foreground">
              Payment confirmed. Your account has been upgraded to <span className="font-bold text-primary">Bill Am Pro</span> — unlimited invoices, full access, forever.
            </p>
          </div>

          {/* Email notice */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground">
              A welcome email has been sent to <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          {/* Countdown */}
          <p className="text-xs text-muted-foreground">
            Redirecting in <span className="font-bold text-foreground">{countdown}s</span>…
          </p>

          {/* Manual button */}
          <button
            onClick={onDone}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
