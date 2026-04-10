"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Client } from "@/types";
import { Plus, Users, Pencil, Trash2, X, Check, Loader2, Mail, Phone, MapPin, FileText } from "lucide-react";
import Link from "next/link";

interface Props {
  clients: Client[];
  userId: string;
}

const EMPTY: Omit<Client, "id" | "user_id" | "created_at"> = {
  name: "", email: null, phone: null, address: null,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
      {...props}
    />
  );
}

function ClientForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: typeof EMPTY;
  onSave: (data: typeof EMPTY) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY, v: string) =>
    setForm(p => ({ ...p, [k]: v || null }));

  return (
    <div className="bg-card border border-primary/30 rounded-2xl p-5 space-y-4">
      <Field label="Client name *">
        <Input
          placeholder="Konga Nigeria Ltd"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          autoFocus
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Email">
          <Input
            type="email"
            placeholder="client@company.com"
            value={form.email ?? ""}
            onChange={e => set("email", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <Input
            placeholder="+234 801 234 5678"
            value={form.phone ?? ""}
            onChange={e => set("phone", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Address">
        <Input
          placeholder="12 Broad Street, Lagos Island"
          value={form.address ?? ""}
          onChange={e => set("address", e.target.value)}
        />
      </Field>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          {saving ? "Saving…" : "Save client"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors"
        >
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

export function ClientsManager({ clients: initial, userId }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (data: typeof EMPTY) => {
    if (!data.name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: created, error } = await supabase
      .from("clients")
      .insert({ ...data, user_id: userId })
      .select()
      .single();

    setSaving(false);
    if (error || !created) return alert("Error: " + error?.message);
    setClients(p => [created as Client, ...p].sort((a, b) => a.name.localeCompare(b.name)));
    setShowAdd(false);
    router.refresh();
  };

  const handleUpdate = async (id: string, data: typeof EMPTY) => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("clients")
      .update(data)
      .eq("id", id);

    setSaving(false);
    if (error) return alert("Error: " + error.message);
    setClients(p =>
      p.map(c => c.id === id ? { ...c, ...data } : c)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? Their invoices will not be deleted.")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    setDeletingId(null);
    if (error) { alert("Error deleting client: " + error.message); return; }
    setClients(p => p.filter(c => c.id !== id));
    router.refresh();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""} in your address book
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={15} /> Add Client
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <ClientForm
          initial={EMPTY}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          saving={saving}
        />
      )}

      {/* Search */}
      {clients.length > 4 && (
        <input
          type="search"
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      )}

      {/* Empty */}
      {clients.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl text-center">
          <Users size={40} className="text-muted-foreground/30 mb-4" />
          <p className="font-bold text-base">No clients yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Add your clients once and reuse them across all invoices.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            + Add your first client
          </button>
        </div>
      )}

      {/* Client list */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(client => (
            <div key={client.id}>
              {editingId === client.id ? (
                <ClientForm
                  initial={{ name: client.name, email: client.email, phone: client.phone, address: client.address }}
                  onSave={data => handleUpdate(client.id, data)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/20 transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-black text-primary uppercase">
                      {client.name.slice(0, 2)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-sm">{client.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} /> {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {client.phone}
                        </span>
                      )}
                      {client.address && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {client.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/invoices/new?client=${client.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-secondary transition-colors"
                      title="Create invoice for this client"
                    >
                      <FileText size={12} /> Invoice
                    </Link>
                    <button
                      onClick={() => { setEditingId(client.id); setShowAdd(false); }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      disabled={deletingId === client.id}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      {deletingId === client.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && search && (
        <p className="text-sm text-muted-foreground text-center py-10">
          No clients match &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}
