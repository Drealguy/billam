"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, RefreshCw, CheckCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  // Auto-redirect as soon as email is confirmed (even in another tab)
  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        router.replace("/dashboard");
      }
    });

    // Also check immediately in case they already verified
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleResend = async () => {
    setResending(true);
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
          <span className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping opacity-30" />
        </div>
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-black">Check your inbox</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to your email.<br />
            Click it and you&apos;ll land on your dashboard automatically.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-muted/60 rounded-2xl p-4 space-y-3">
        {[
          { step: "1", text: "Open the email from Bill Am" },
          { step: "2", text: "Click the confirmation link" },
          { step: "3", text: "You'll be taken straight to your dashboard" },
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
          <span className="font-semibold">Can&apos;t find it?</span> Check your spam or junk folder. The link expires in <span className="font-semibold">24 hours</span>.
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
