"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, LifeBuoy } from "lucide-react";
import { FAQ, matchFaq } from "@/lib/faq";

interface TicketMessage {
  id: string;
  sender: "customer" | "admin";
  body: string;
  created_at: string;
}

interface Ticket {
  id: string;
  status: "open" | "in_progress" | "resolved";
}

interface FaqBubble {
  role: "user" | "bot";
  text: string;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [faqMessages, setFaqMessages] = useState<FaqBubble[]>([]);
  const [unresolved, setUnresolved] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loaded) return;
    fetch("/api/support/thread")
      .then((r) => r.json())
      .then((data) => {
        if (data.ticket) {
          setTicket(data.ticket);
          setTicketMessages(data.messages ?? []);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open, loaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [faqMessages, ticketMessages, open]);

  const askFaq = (question: string) => {
    const match = matchFaq(question);
    setFaqMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      match
        ? { role: "bot", text: match.answer }
        : { role: "bot", text: "Sorry, I don't have an answer for that. Want to talk to a live agent instead?" },
    ]);
    setUnresolved(!match);
    setInput("");
  };

  const handleEscalate = async () => {
    const lastUserMessage = [...faqMessages].reverse().find((m) => m.role === "user")?.text;
    const messageToSend = lastUserMessage || "I'd like to speak with a live agent, please.";

    setSending(true);
    try {
      const res = await fetch("/api/support/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not reach support");

      setTicket(data.ticket);
      setTicketMessages([data.message]);
      setFaqMessages([]);
      setUnresolved(false);
    } catch {
      // Leave them in FAQ mode with the option to retry.
    } finally {
      setSending(false);
    }
  };

  const handleSendTicketMessage = async () => {
    const body = input.trim();
    if (!body || !ticket) return;

    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id, message: body }),
      });
      const data = await res.json();
      if (res.ok) setTicketMessages((prev) => [...prev, data.message]);
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = () => {
    setTicket(null);
    setTicketMessages([]);
    setFaqMessages([]);
    setUnresolved(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[340px] max-w-[calc(100vw-2.5rem)] h-[480px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-primary-foreground">
              <LifeBuoy size={16} />
              <span className="text-sm font-bold">Bill Am Support</span>
              {ticket && (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-white/20">
                  {STATUS_LABEL[ticket.status]}
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {ticket ? (
              <>
                {ticketMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                        m.sender === "customer" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                ))}
                {ticket.status === "resolved" && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground mb-2">This conversation has been resolved.</p>
                    <button
                      onClick={startNewConversation}
                      className="text-xs font-semibold text-primary hover:opacity-80 cursor-pointer"
                    >
                      Start a new conversation
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-secondary rounded-xl px-3 py-2 text-xs w-fit max-w-[85%]">
                  Hi! I&apos;m the Bill Am assistant. Ask me anything, or pick a question below.
                </div>
                {faqMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {faqMessages.length === 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {FAQ.map((f) => (
                      <button
                        key={f.question}
                        onClick={() => askFaq(f.question)}
                        className="text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors cursor-pointer"
                      >
                        {f.question}
                      </button>
                    ))}
                  </div>
                )}
                {unresolved && (
                  <button
                    onClick={handleEscalate}
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
                  >
                    {sending ? <Loader2 size={13} className="animate-spin" /> : <LifeBuoy size={13} />}
                    Talk to a live agent
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2.5 flex-shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;
                if (ticket) handleSendTicketMessage();
                else askFaq(input.trim());
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={ticket ? "Type a message…" : "Ask a question…"}
                disabled={ticket?.status === "resolved"}
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !input.trim() || ticket?.status === "resolved"}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </form>
            {!ticket && (
              <button
                onClick={handleEscalate}
                disabled={sending}
                className="w-full text-[11px] text-center text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Not satisfied? Talk to a live agent instead
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer ml-auto"
        aria-label="Support chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
