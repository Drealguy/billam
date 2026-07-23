"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { markAdminEventsRead } from "@/app/(dashboard)/notification-actions";

export interface AdminEvent {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

export function NotificationBell({ events }: { events: AdminEvent[] }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const unreadCount = events.filter((e) => !e.read).length;

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      startTransition(() => {
        markAdminEventsRead();
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-lg z-50">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notifications</p>
            </div>
            {events.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No notifications yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {events.map((e) => (
                  <div key={e.id} className={`px-4 py-3 ${!e.read ? "bg-primary/5" : ""}`}>
                    <p className="text-sm font-semibold">{e.title}</p>
                    {e.body && <p className="text-xs text-muted-foreground mt-0.5">{e.body}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(e.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
