"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function NavInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Hide if already running as installed PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) { setHidden(true); return; }

    // Capture Android native install prompt when available
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      // Android: trigger native install dialog
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      // iOS or any other browser: open the banner with instructions
      window.dispatchEvent(new CustomEvent("pwa-show-banner"));
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
    >
      <Download size={12} />
      Install App
    </button>
  );
}
