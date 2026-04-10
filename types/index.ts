export type Currency = "NGN" | "USD" | "GBP" | "EUR";
export type InvoiceStatus = "unpaid" | "part_payment" | "paid";
export type InvoiceTemplate = "classic" | "clean" | "modern";

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
  default_currency: Currency;
  plan: "free" | "pro";
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface LineItem {
  description: string;
  details?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ClientSnapshot {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_id: string | null;
  client_snapshot: ClientSnapshot;
  line_items: LineItem[];
  currency: Currency;
  subtotal: number;
  vat_enabled: boolean;
  vat_amount: number;
  total: number;
  deposit_paid: number;
  balance_due: number;
  status: InvoiceStatus;
  template: InvoiceTemplate;
  project_title: string | null;
  invoice_date: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

export const VAT_RATE = 0.075; // 7.5%
