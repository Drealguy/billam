import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#f5f5f0" }}>

      {/* Logo */}
      <Link href="/" className="mb-12">
        <span className="text-xl font-black uppercase tracking-tight text-primary">Bill Am</span>
      </Link>

      {/* Big number */}
      <div
        className="text-[120px] sm:text-[180px] font-black leading-none select-none"
        style={{ color: "rgba(43,82,255,0.08)", letterSpacing: "-0.04em" }}
      >
        404
      </div>

      {/* Card */}
      <div className="relative -mt-8 sm:-mt-12 bg-white rounded-2xl shadow-sm px-8 py-8 max-w-sm w-full text-center">
        <h1 className="text-xl font-black text-gray-900 leading-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          The link might be wrong, or this invoice has been removed.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/"
            className="flex items-center justify-center py-3 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
          >
            Go to Bill Am
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Sign in to your account
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-black/30">
        Bill Am · Invoicing for Nigerian Creatives
      </p>
    </div>
  );
}
