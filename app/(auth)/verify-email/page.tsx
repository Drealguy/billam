"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, RefreshCw, CheckCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    // Get the email from sessionStorage if we stored it, otherwise prompt
    const email = sessionStorage.getItem("pendingEmail");
    if (email) {
      const supabase = createClient();
      await supabase.auth.resend({ type: "signup", email });
    }
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div className="w-full space-y-6">

      {/* Animated envelope */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail size={36} className="text-primary" strokeWidth={1.6} />
          </div>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping opacity-30" />
        </div>
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-black">Check your inbox</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to your email.<br />
            Click it to activate your Bill Am account.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-muted/60 rounded-2xl p-4 space-y-3">
        {[
          { step: "1", text: "Open the email from Bill Am" },
          { step: "2", text: "Click the confirmation link" },
          { step: "3", text: "You'll land on your dashboard" },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center flex-shrink-0">
              {step}
            </span>
            <p className="text-sm text-foreground">{text}</p>
          </div>
        ))}
      </div>

      {/* Spam notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-base leading-none mt-0.5">📬</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Can't find it?</span> Check your spam or junk folder — sometimes it lands there. The link expires in <span className="font-semibold">24 hours</span>.
        </p>
      </div>

      {/* Resend */}
      <div className="text-center space-y-3">
        {resent ? (
          <div className="flex items-center justify-center gap-1.5 text-sm text-emerald-600 font-semibold">
            <CheckCircle size={15} /> Email resent successfully
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center justify-center gap-1.5 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
            {resending ? "Resending…" : "Resend confirmation email"}
          </button>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          <span>or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          Already confirmed? Log in <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
