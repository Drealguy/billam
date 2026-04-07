import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  business_name: z.string().min(1, "Business name is required"),
  business_tagline: z.string().optional(),
  phone: z.string().min(7, "Enter a valid phone number"),
  brand_colour: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex colour"),
  accent_colour: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex colour"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(10).max(10),
  account_name: z.string().min(2),
  default_currency: z.enum(["NGN", "USD", "GBP", "EUR"]),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Must be > 0"),
  unit_price: z.number().min(0, "Must be ≥ 0"),
  total: z.number(),
});

export const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  client_id: z.string().optional(),
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email().optional().or(z.literal("")),
  client_phone: z.string().optional(),
  client_address: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, "Add at least one line item"),
  currency: z.enum(["NGN", "USD", "GBP", "EUR"]),
  vat_enabled: z.boolean(),
  status: z.enum(["unpaid", "part_payment", "paid"]),
  deposit_paid: z.number().min(0),
  invoice_date: z.string().min(1, "Invoice date is required"),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  template: z.enum(["classic", "clean", "modern"]),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
