"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account/settings", label: "Settings" },
  { href: "/account/billing", label: "Billing" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your business profile and subscription.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-border mb-8">
        {TABS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
