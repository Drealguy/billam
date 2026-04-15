"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import type { Notification } from "@/types";
import { createClient } from "@/lib/supabase";

interface Props {
  notifications: Notification[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function NotificationBell({ notifications: initial }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(initial);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.read).length;

  // Mark all as read when panel opens
  useEffect(() => {
    if (!open) return;
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

    const supabase = createClient();
    supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds)
      .then(() => {});
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Overlay backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      )}

      {/* Slide-over panel */}
      {open && (
        <div
          className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-background border-l border-border shadow-2xl flex flex-col"
          style={{ animation: "slideInRight 0.22s cubic-bezier(0.32,0.72,0,1) both" }}
        >
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <Bell size={16} className="text-primary" />
              <span className="font-black text-sm">Notifications</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                  {unread} new
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Bell size={22} className="text-primary" />
                </div>
                <p className="font-bold text-sm">You&apos;re all caught up</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  No notifications yet. We&apos;ll let you know when something important happens.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3.5 px-5 py-4 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!n.read ? "bg-primary/15" : "bg-secondary"}`}>
                        <Bell size={13} className={!n.read ? "text-primary" : "text-muted-foreground"} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className="text-sm font-bold leading-snug">{n.title}</p>
                        {!n.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
