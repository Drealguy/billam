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

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_snapshot: { name?: string };
  currency: string;
  total: number;
  status: "unpaid" | "part_payment" | "paid";
  invoice_date: string;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface LoginEvent {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanTier;
  billing_cycle: "monthly" | "yearly" | null;
  status: "none" | "active" | "past_due" | "cancelled" | "expired";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}
