import crypto from "crypto";
import type { BillingCycle } from "@/types";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY env var is not set");
  return key;
}

/** Paystack plan_code for each billing cycle — created once in the
 * Paystack dashboard (Payments → Plans), never hardcoded here. */
export function getPlanCode(cycle: BillingCycle): string {
  const key = cycle === "monthly" ? "PAYSTACK_PLAN_CODE_MONTHLY" : "PAYSTACK_PLAN_CODE_YEARLY";
  const code = process.env[key];
  if (!code) throw new Error(`${key} env var is not set — create the Plan in Paystack first`);
  return code;
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || json.status === false) {
    throw new Error(json.message ?? `Paystack request to ${path} failed`);
  }
  return json.data as T;
}

interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeSubscriptionTransaction(params: {
  email: string;
  cycle: BillingCycle;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<InitializeResult> {
  return paystackFetch<InitializeResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      plan: getPlanCode(params.cycle),
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
}

export interface PaystackTransaction {
  status: string;
  reference: string;
  amount: number;
  customer: { customer_code: string; email: string };
  plan: { plan_code: string } | null;
  authorization: { authorization_code: string };
  paid_at: string | null;
}

export async function verifyTransaction(reference: string): Promise<PaystackTransaction> {
  return paystackFetch<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export interface PaystackSubscription {
  subscription_code: string;
  email_token: string;
  status: string;
  next_payment_date: string;
}

export async function fetchSubscription(subscriptionCode: string): Promise<PaystackSubscription> {
  return paystackFetch<PaystackSubscription>(`/subscription/${encodeURIComponent(subscriptionCode)}`);
}

export async function getSubscriptionManageLink(subscriptionCode: string): Promise<string> {
  const data = await paystackFetch<{ link: string }>(
    `/subscription/${encodeURIComponent(subscriptionCode)}/manage/link`
  );
  return data.link;
}

export async function disableSubscription(subscriptionCode: string, emailToken: string): Promise<void> {
  await paystackFetch("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: subscriptionCode, token: emailToken }),
  });
}

/** Paystack has no separate "webhook secret" — signatures are an
 * HMAC-SHA512 of the raw request body, keyed with the same secret key
 * used for API calls. Must be run against the *raw* body string,
 * before any JSON.parse. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const expected = Buffer.from(
    crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex")
  );
  const actual = Buffer.from(signatureHeader);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}
