import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="w-full space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail size={28} className="text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black">Check your email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We sent a confirmation link to your email address.<br />
          Click it to activate your account and get started.
        </p>
      </div>

      <div className="bg-muted rounded-xl px-5 py-4 text-sm text-muted-foreground text-left space-y-1.5">
        <p className="font-semibold text-foreground text-xs uppercase tracking-widest">Didn&apos;t get it?</p>
        <p>Check your spam or junk folder.</p>
        <p>The link expires after 24 hours.</p>
      </div>

      <p className="text-sm text-muted-foreground">
        Already confirmed?{" "}
        <Link href="/login" className="text-primary font-semibold hover:opacity-80">
          Log in
        </Link>
      </p>
    </div>
  );
}
