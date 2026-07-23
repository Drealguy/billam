"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    // Confirm this account is actually an active admin before letting
    // the redirect happen — signing in to Supabase Auth alone (e.g. a
    // regular Bill Am customer) grants no admin access.
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("is_active")
      .eq("id", data.user.id)
      .single();

    if (!adminUser?.is_active) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("This account does not have admin access.");
      return;
    }

    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
            <ShieldAlert size={22} className="text-primary" />
          </div>
          <h1 className="text-lg font-black uppercase tracking-tight">Bill Am Admin</h1>
          <p className="text-xs text-muted-foreground mt-1">Internal use only</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-bold cursor-pointer transition-opacity hover:opacity-90 active:opacity-75 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
