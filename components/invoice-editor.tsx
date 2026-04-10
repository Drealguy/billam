"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import type { Profile, Client, LineItem, Invoice } from "@/types";
import { CURRENCY_SYMBOLS, VAT_RATE } from "@/types";
import { InvoicePreview } from "@/components/invoice-preview";
import { createClient } from "@/lib/supabase";

interface Props {
  invoice: Invoice;
  profile: Profile;
  clients: Client[];
  userId: string;
}

type Section = "client" | "info" | "items" | "payment";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
      {...props}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      {...props}
    >
      {children}
    </select>
  );
}

function Collapsible({ title, icon, open, onToggle, children }: {
  title: string; icon: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary/30 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span>{icon}</span> {title}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="px-4 pb-4 pt-2 space-y-3 bg-card">{children}</div>}
    </div>
  );
}

export function InvoiceEditor({ invoice, profile, clients, userId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState<Record<Section, boolean>>({
    client: true, info: true, items: true, payment: true,
  });
  const toggle = (s: Section) => setOpen(p => ({ ...p, [s]: !p[s] }));

  // Hydrate from existing invoice
  const snap = invoice.client_snapshot as { name?: string; email?: string; phone?: string; address?: string };
  const existingItems = (invoice.line_items as LineItem[]).map(i => ({
    description: i.description,
    details: i.details ?? "",
    quantity: i.quantity,
    unit_price: i.unit_price,
  }));

  const [clientId,      setClientId]      = useState(invoice.client_id ?? "");
  const [clientName,    setClientName]    = useState(snap?.name ?? "");
  const [clientEmail,   setClientEmail]   = useState(snap?.email ?? "");
  const [clientPhone,   setClientPhone]   = useState(snap?.phone ?? "");
  const [clientAddress, setClientAddress] = useState(snap?.address ?? "");

  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number);
  const [invoiceDate,   setInvoiceDate]   = useState(invoice.invoice_date);
  const [dueDate,       setDueDate]       = useState(invoice.due_date ?? "");
  const [projectTitle,  setProjectTitle]  = useState(invoice.project_title ?? "");
  const [currency,      setCurrency]      = useState(invoice.currency);
  const [notes,         setNotes]         = useState(invoice.notes ?? "");

  const [items, setItems] = useState(
    existingItems.length > 0
      ? existingItems
      : [{ description: "", details: "", quantity: 1, unit_price: 0 }]
  );

  const [vatEnabled,   setVatEnabled]   = useState(invoice.vat_enabled);
  const [status,       setStatus]       = useState<"unpaid" | "part_payment" | "paid">(invoice.status);
  const [depositPaid,  setDepositPaid]  = useState(Number(invoice.deposit_paid));

  // Calculations
  const subtotal   = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const vatAmount  = vatEnabled ? subtotal * VAT_RATE : 0;
  const total      = subtotal + vatAmount;
  const balanceDue = status === "part_payment" ? total - depositPaid : status === "paid" ? 0 : total;
  const sym        = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;

  const addItem    = () => setItems(p => [...p, { description: "", details: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = useCallback((i: number, field: string, value: string | number) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item)), []);

  const handleClientSelect = (id: string) => {
    setClientId(id);
    if (!id) return;
    const c = clients.find(c => c.id === id);
    if (c) {
      setClientName(c.name);
      setClientEmail(c.email ?? "");
      setClientPhone(c.phone ?? "");
      setClientAddress(c.address ?? "");
    }
  };

  const handleSave = async () => {
    if (!clientName.trim()) return alert("Enter a client name");
    if (items.every(i => !i.description.trim())) return alert("Add at least one line item");

    setSaving(true);
    const supabase = createClient();

    const lineItems: LineItem[] = items
      .filter(i => i.description.trim())
      .map(i => ({
        description: i.description,
        details: i.details || undefined,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.quantity * i.unit_price,
      }));

    const { error } = await supabase
      .from("invoices")
      .update({
        invoice_number: invoiceNumber,
        client_id: clientId || null,
        client_snapshot: { name: clientName, email: clientEmail, phone: clientPhone, address: clientAddress },
        line_items: lineItems,
        currency,
        subtotal,
        vat_enabled: vatEnabled,
        vat_amount: vatAmount,
        total,
        deposit_paid: status === "part_payment" ? depositPaid : 0,
        balance_due: balanceDue,
        status,
        invoice_date: invoiceDate,
        project_title: projectTitle || null,
        due_date: dueDate || null,
        notes: notes || null,
      })
      .eq("id", invoice.id);

    setSaving(false);
    if (error) { alert("Error: " + error.message); return; }
    router.push(`/invoices/${invoice.id}`);
    router.refresh();
  };

  const previewData = {
    profile, invoiceNumber, invoiceDate, dueDate, projectTitle,
    clientName, clientEmail, clientPhone, clientAddress,
    items: items.map(i => ({ description: i.description, details: i.details, quantity: i.quantity, unit_price: i.unit_price, total: i.quantity * i.unit_price })),
    currency, sym, subtotal, vatEnabled, vatAmount, total, status, depositPaid, balanceDue, notes,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/invoices/${invoice.id}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              ← Back
            </Link>
            <div className="hidden sm:block border-l border-border pl-3">
              <p className="text-sm font-semibold">Edit Invoice</p>
              <p className="text-xs text-muted-foreground">#{invoice.invoice_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden md:block text-xs text-muted-foreground">Updates as you type</span>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              ✓ {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Form */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 overflow-y-auto px-4 py-5 space-y-3 border-r border-border scrollbar-none">

          {/* Client */}
          <Collapsible title="Client Details" icon="🧑" open={open.client} onToggle={() => toggle("client")}>
            {clients.length > 0 && (
              <Field label="Saved client (optional)">
                <Select value={clientId} onChange={e => handleClientSelect(e.target.value)}>
                  <option value="">— Select saved client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
            )}
            <Field label="Client Name">
              <Input placeholder="e.g. Konga" value={clientName} onChange={e => setClientName(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Email">
                <Input placeholder="client@email.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
              </Field>
              <Field label="Phone">
                <Input placeholder="+234..." value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
              </Field>
            </div>
            <Field label="Address">
              <Input placeholder="123 Street, Lagos" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />
            </Field>
          </Collapsible>

          {/* Invoice Info */}
          <Collapsible title="Invoice Info" icon="📄" open={open.info} onToggle={() => toggle("info")}>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Invoice Number">
                <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
              </Field>
              <Field label="Invoice Date">
                <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Due Date">
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </Field>
              <Field label="Project Title">
                <Input placeholder="e.g. Website Redesign" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} />
              </Field>
            </div>
            <Field label="Currency">
              <Select value={currency} onChange={e => setCurrency(e.target.value as "NGN"|"USD"|"GBP"|"EUR")}>
                <option value="NGN">NGN ₦</option>
                <option value="USD">USD $</option>
                <option value="GBP">GBP £</option>
                <option value="EUR">EUR €</option>
              </Select>
            </Field>
          </Collapsible>

          {/* Line Items */}
          <Collapsible title="Line Items" icon="📋" open={open.items} onToggle={() => toggle("items")}>
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Item {i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-semibold">
                        = {sym}{(item.quantity * item.unit_price).toLocaleString()}
                      </span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <Field label="Description">
                    <Input placeholder="e.g. Logo Design" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} />
                  </Field>
                  <Field label="Details (optional)">
                    <Input placeholder="Short description..." value={item.details} onChange={e => updateItem(i, "details", e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Quantity">
                      <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, "quantity", Number(e.target.value))} />
                    </Field>
                    <Field label={`Rate (${sym})`}>
                      <Input type="number" min={0} value={item.unit_price} onChange={e => updateItem(i, "unit_price", Number(e.target.value))} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <Plus size={13} /> Add Item
            </button>
          </Collapsible>

          {/* Payment */}
          <Collapsible title="Payment & Notes" icon="💳" open={open.payment} onToggle={() => toggle("payment")}>
            <Field label="Payment Status">
              <Select value={status} onChange={e => setStatus(e.target.value as typeof status)}>
                <option value="unpaid">Unpaid</option>
                <option value="part_payment">Part Payment</option>
                <option value="paid">Paid</option>
              </Select>
            </Field>
            {status === "part_payment" && (
              <Field label={`Deposit Paid (${sym})`}>
                <Input type="number" min={0} value={depositPaid} onChange={e => setDepositPaid(Number(e.target.value))} />
              </Field>
            )}
            <div className="flex items-center gap-2 py-1">
              <input id="vat-edit" type="checkbox" checked={vatEnabled} onChange={e => setVatEnabled(e.target.checked)} className="accent-primary" />
              <label htmlFor="vat-edit" className="text-xs text-foreground cursor-pointer">Add VAT (7.5%)</label>
            </div>
            <Field label="Notes / Contract Terms">
              <textarea
                rows={3}
                placeholder="Payment terms, contract notes…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </Field>
          </Collapsible>
        </div>

        {/* Live preview */}
        <div className="hidden md:flex flex-1 flex-col overflow-y-auto bg-muted/20 px-8 py-6 scrollbar-none">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Live Preview</p>
          <div className="flex-1 flex items-start justify-center">
            <InvoicePreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
