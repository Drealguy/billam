import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvoiceTemplate, PlanTier } from "@/types";

/**
 * Single source of truth for what each plan tier can do. Adding a new
 * tier (Business, Agency, ...) is one new entry here — nothing else in
 * the app should hardcode a plan name or a limit number.
 */
export interface PlanLimits {
  label: string;
  maxInvoicesPerMonth: number | null; // null = unlimited
  maxClients: number | null;
  templates: InvoiceTemplate[];
  canRemoveBranding: boolean;
  canExportPdf: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    label: "Free",
    maxInvoicesPerMonth: 5,
    maxClients: 5,
    templates: ["classic"],
    canRemoveBranding: false,
    canExportPdf: false,
  },
  pro: {
    label: "Pro",
    maxInvoicesPerMonth: null,
    maxClients: null,
    templates: ["classic", "clean", "modern", "studio"],
    canRemoveBranding: true,
    canExportPdf: true,
  },
};

export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function canUseTemplate(plan: PlanTier, template: InvoiceTemplate): boolean {
  return getPlanLimits(plan).templates.includes(template);
}

export function isAtInvoiceLimit(plan: PlanTier, invoicesThisMonth: number): boolean {
  const max = getPlanLimits(plan).maxInvoicesPerMonth;
  return max !== null && invoicesThisMonth >= max;
}

export function isAtClientLimit(plan: PlanTier, clientCount: number): boolean {
  const max = getPlanLimits(plan).maxClients;
  return max !== null && clientCount >= max;
}

/** Start of the current calendar month, in UTC — the free-plan invoice
 * count resets automatically because this window rolls forward with no
 * stored counter to reset or drift out of sync. */
export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getMonthlyInvoiceCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfCurrentMonth().toISOString());
  return count ?? 0;
}

export async function getClientCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

export interface PlanContext {
  plan: PlanTier;
  limits: PlanLimits;
  invoicesThisMonth: number;
  clientCount: number;
  atInvoiceLimit: boolean;
  atClientLimit: boolean;
}

/** One call, used from every server component/route that needs to know
 * what the current user is allowed to do right now. */
export async function getPlanContext(
  supabase: SupabaseClient,
  userId: string,
  plan: PlanTier
): Promise<PlanContext> {
  const [invoicesThisMonth, clientCount] = await Promise.all([
    getMonthlyInvoiceCount(supabase, userId),
    getClientCount(supabase, userId),
  ]);

  return {
    plan,
    limits: getPlanLimits(plan),
    invoicesThisMonth,
    clientCount,
    atInvoiceLimit: isAtInvoiceLimit(plan, invoicesThisMonth),
    atClientLimit: isAtClientLimit(plan, clientCount),
  };
}
