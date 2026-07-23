// Mirrors the subset of the customer app's types/index.ts this admin
// app actually reads/writes. The two apps don't share a codebase, so
// this is kept in sync manually.

export type PlanTier = "free" | "pro";
export type AccountStatus = "active" | "suspended" | "banned" | "deleted";

export interface Profile {
  id: string;
  full_name: string;
  business_name: string;
  business_tagline: string;
  phone: string;
  logo_url: string | null;
  brand_colour: string;
  accent_colour: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  default_currency: string;
  plan: PlanTier;
  status: AccountStatus;
  status_reason: string | null;
  email: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanTier;
  billing_cycle: "monthly" | "yearly" | null;
  status: "none" | "active" | "past_due" | "cancelled" | "expired";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}
