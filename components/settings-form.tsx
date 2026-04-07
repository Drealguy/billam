"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/types";
import { Upload, Check, Loader2 } from "lucide-react";

interface Props { profile: Profile; userId: string; }

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-3">
        <h2 className="font-bold text-base">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
      {...props}
    />
  );
}

export function SettingsForm({ profile, userId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [businessName, setBusinessName] = useState(profile?.business_name ?? "");
  const [tagline, setTagline] = useState(profile?.business_tagline ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [currency, setCurrency] = useState(profile?.default_currency ?? "NGN");
  const [brandColour, setBrandColour] = useState(profile?.brand_colour ?? "#0e2310");
  const [accentColour, setAccentColour] = useState(profile?.accent_colour ?? "#c8e52d");
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url ?? "");
  const [bankName, setBankName] = useState(profile?.bank_name ?? "");
  const [accountNumber, setAccountNumber] = useState(profile?.account_number ?? "");
  const [accountName, setAccountName] = useState(profile?.account_name ?? "");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Logo must be under 2MB"); return; }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/logo.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
    setLogoUrl(publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: err } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        business_name: businessName,
        business_tagline: tagline,
        phone,
        default_currency: currency,
        brand_colour: brandColour,
        accent_colour: accentColour,
        logo_url: logoUrl || null,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
      });

    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  };

  return (
    <div className="space-y-10">

      {/* Business Info */}
      <Section title="Business Info" desc="This appears in your invoice header.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Temi Adebayo" />
          </Field>
          <Field label="Business name">
            <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Temi Adebayo Studio" />
          </Field>
        </div>
        <Field label="Tagline" hint="Short line that appears under your business name on invoices.">
          <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Creative direction & branding" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone number">
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" />
          </Field>
          <Field label="Default currency">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as "NGN" | "USD" | "GBP" | "EUR")}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            >
              <option value="NGN">NGN ₦ — Nigerian Naira</option>
              <option value="USD">USD $ — US Dollar</option>
              <option value="GBP">GBP £ — British Pound</option>
              <option value="EUR">EUR € — Euro</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Branding */}
      <Section title="Branding" desc="Your logo and colours show on every invoice.">
        {/* Logo upload */}
        <Field label="Business logo" hint="PNG or JPG, max 2MB. Displayed in your invoice header.">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="logo" className="h-14 w-auto rounded-lg border border-border object-contain bg-white p-1" />
            ) : (
              <div className="h-14 w-14 rounded-lg border border-dashed border-border flex items-center justify-center bg-card">
                <Upload size={18} className="text-muted-foreground" />
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : <><Upload size={13} /> {logoUrl ? "Change logo" : "Upload logo"}</>}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="mt-1.5 text-xs text-destructive hover:opacity-70 block"
                >
                  Remove
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
        </Field>

        {/* Colour pickers */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Brand colour" hint="Used in invoice header background.">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColour}
                onChange={e => setBrandColour(e.target.value)}
                className="h-10 w-14 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
              />
              <Input
                value={brandColour}
                onChange={e => setBrandColour(e.target.value)}
                placeholder="#0e2310"
                className="font-mono text-xs"
              />
            </div>
          </Field>
          <Field label="Accent colour" hint="Used for highlights and business name.">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColour}
                onChange={e => setAccentColour(e.target.value)}
                className="h-10 w-14 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
              />
              <Input
                value={accentColour}
                onChange={e => setAccentColour(e.target.value)}
                placeholder="#c8e52d"
                className="font-mono text-xs"
              />
            </div>
          </Field>
        </div>

        {/* Live colour preview */}
        <div className="rounded-xl overflow-hidden border border-border h-16 flex items-center">
          <div className="flex-1 h-full flex items-center px-5" style={{ background: brandColour }}>
            <span className="font-bold text-sm" style={{ color: accentColour }}>
              {businessName || "Your Business"}
            </span>
          </div>
          <div className="flex-1 h-full flex items-center px-5 bg-white">
            <span className="text-sm font-bold" style={{ color: brandColour }}>Invoice</span>
          </div>
        </div>
      </Section>

      {/* Bank Details */}
      <Section title="Bank Details" desc="Shown on every invoice so clients know where to pay you.">
        <Field label="Bank name">
          <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Zenith Bank" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Account number">
            <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="0123456789" maxLength={10} />
          </Field>
          <Field label="Account name">
            <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Temitope Adebayo" />
          </Field>
        </div>
      </Section>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {saved
          ? <><Check size={16} /> Saved!</>
          : saving
          ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
          : "Save changes"}
      </button>
    </div>
  );
}
