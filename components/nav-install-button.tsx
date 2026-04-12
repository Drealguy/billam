"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function NavInstallButton() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const android = /android/i.test(navigator.userAgent);

    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    if (android) {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  if (!show) return null;

  const handleClick = async () => {
    if (isIOS) {
      // Open the existing banner which has iOS share instructions
      window.dispatchEvent(new CustomEvent("pwa-show-banner"));
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShow(false);
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
