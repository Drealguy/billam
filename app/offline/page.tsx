"use client";

export const dynamic = "force-dynamic";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <span className="text-3xl">📡</span>
      </div>
      <h1 className="text-2xl font-black mb-2">You're offline</h1>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
        No internet connection. Check your network and try again — your data is safe.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
      <p className="mt-8 text-xl font-black uppercase tracking-tight text-primary">Bill Am</p>
    </div>
  );
}
