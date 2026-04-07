import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
      {/* Logo */}
      <Link href="/" className="mb-10">
        <span className="text-xl font-black uppercase tracking-tight text-primary">Bill Am</span>
      </Link>

      <div className="w-full max-w-sm">{children}</div>

      <p className="mt-10 text-xs text-muted-foreground">
        © 2026 Bill Am · Built for creatives
      </p>
    </div>
  );
}
