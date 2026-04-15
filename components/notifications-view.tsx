"use client";

import { Bell } from "lucide-react";
import type { Notification } from "@/types";

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
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function NotificationsView({ notifications }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {notifications.length === 0
            ? "You're all caught up"
            : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bell size={24} className="text-primary" />
          </div>
          <p className="font-bold text-base">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ll let you know when something important happens.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          {notifications.map((n, idx) => (
            <div
              key={n.id}
              className={`flex gap-4 px-5 py-4 ${idx !== 0 ? "border-t border-border" : ""} ${!n.read ? "bg-primary/5" : "bg-card"}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell size={15} className="text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-foreground leading-snug">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0 mt-0.5">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div className="flex-shrink-0 mt-2">
                  <span className="block w-2 h-2 rounded-full bg-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
