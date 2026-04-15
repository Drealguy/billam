"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2, Users } from "lucide-react";

export function AdminSendNotification() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ count: number } | null>(null);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Both title and message are required.");
      return;
    }
    setSending(true);
    setError("");
    setSent(null);

    const res = await fetch("/api/admin/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), body: body.trim() }),
    });

    const json = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }

    setSent({ count: json.count });
    setTitle("");
    setBody("");
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Send Notification</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          This will be delivered to every registered user.
        </p>
      </div>

      {sent && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Notification sent!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Delivered to <strong>{sent.count}</strong> user{sent.count !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New feature available"
            className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Message
          </label>
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message to all users…"
            className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users size={13} />
            Sends to all registered users
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending
              ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
              : <><Send size={14} /> Send to All</>}
          </button>
        </div>
      </div>
    </div>
  );
}
