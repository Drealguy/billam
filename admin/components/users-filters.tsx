"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

const STATUS_OPTIONS = ["All", "active", "suspended", "banned", "deleted"] as const;
const PLAN_OPTIONS = ["All", "free", "pro"] as const;

export function UsersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const pushParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "All") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          pushParams({ q });
        }}
        className="relative flex-1"
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, business, or email…"
          className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </form>

      <select
        defaultValue={searchParams.get("status") ?? "All"}
        onChange={(e) => pushParams({ status: e.target.value })}
        className="bg-card border border-border rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s === "All" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("plan") ?? "All"}
        onChange={(e) => pushParams({ plan: e.target.value })}
        className="bg-card border border-border rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {PLAN_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p === "All" ? "All plans" : p[0].toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
