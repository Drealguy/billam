"use client";

import { Menu } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-4 py-3 border-b border-border bg-background/80 backdrop-blur lg:hidden">
      <button
        onClick={onMenuClick}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <span className="text-base font-bold tracking-tight">
        Bill<span className="text-indigo-400">Am</span>
      </span>
    </header>
  );
}
