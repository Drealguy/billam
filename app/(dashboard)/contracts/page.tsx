import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <ScrollText size={28} className="text-primary" />
      </div>

      <h1 className="text-2xl font-black mb-3">Contracts</h1>

      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-2">
        Send professional contracts to clients, collect e-signatures, and keep
        everything in one place — right alongside your invoices.
      </p>

      <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider mt-4">
        Coming soon
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full text-left">
        {[
          {
            title: "Custom templates",
            desc: "Start from a Nigerian-law-ready template or write your own.",
          },
          {
            title: "E-signatures",
            desc: "Clients sign directly in their browser — no printing needed.",
          },
          {
            title: "Linked to invoices",
            desc: "Attach a contract to any invoice so payment terms are crystal clear.",
          },
        ].map(({ title, desc }) => (
          <div
            key={title}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <p className="font-bold text-sm mb-1">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
