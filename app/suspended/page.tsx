"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ShieldAlert } from "lucide-react";

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  suspended: {
    title: "Your account is suspended",
    body: "Access to Bill Am has been temporarily suspended for this account.",
  },
  banned: {
    title: "Your account has been banned",
    body: "This account no longer has access to Bill Am.",
  },
  deleted: {
    title: "This account has been deleted",
    body: "This account has been deactivated and is no longer accessible.",
  },
};

function SuspendedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "suspended";
  const reason = searchParams.get("reason");
  const copy = STATUS_COPY[status] ?? STATUS_COPY.suspended;

  useEffect(() => {
    // Whatever session is left client-side is no good — clear it so a
    // stale token doesn't quietly keep working somewhere else.
    createClient().auth.signOut();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert size={24} className="text-destructive" />
        </div>
        <h1 className="text-xl font-black mb-2">{copy.title}</h1>
        <p className="text-sm text-muted-foreground mb-4">{copy.body}</p>
        {reason && (
          <p className="text-xs text-muted-foreground bg-card border border-border rounded-xl px-4 py-3 mb-4">
            {reason}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Think this is a mistake? Contact{" "}
          <a href="mailto:support@usebillam.com" className="text-primary font-semibold hover:opacity-80">
            support@usebillam.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function SuspendedPage() {
  return (
    <Suspense>
      <SuspendedContent />
    </Suspense>
  );
}
