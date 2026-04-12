"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Already installed — don't show
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Already dismissed — don't show
    if (localStorage.getItem("pwa-dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as any).standalone;
    const android = /android/i.test(navigator.userAgent);

    if (ios) {
      setIsIOS(true);
      setTimeout(() => setShow(true), 2500);
      return;
    }

    if (android) {
      // Listen for Chrome's install prompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 2500);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      dismiss();
    }
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Banner — slides up from bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[101] p-4"
        style={{ animation: "slideUp 0.35s cubic-bezier(0.32,0.72,0,1) both" }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-primary px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-white font-black text-sm">BA</span>
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">Bill Am</p>
                <p className="text-white/60 text-xs">billam.co</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">
            <div>
              <p className="font-black text-foreground text-base">Add to your home screen</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Install Bill Am for a faster, full-screen experience — no browser bar.
              </p>
            </div>

            {/* iOS instructions */}
            {isIOS && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                  <Share size={15} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-foreground">
                    Tap the <strong>Share</strong> icon at the bottom of Safari
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                  <Download size={15} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-foreground">
                    Tap <strong>"Add to Home Screen"</strong>
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  className="w-full py-3 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
                >
                  Got it ✓
                </button>
              </div>
            )}

            {/* Android install button */}
            {!isIOS && (
              <button
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
              >
                <Download size={16} /> Install App — It&apos;s Free
              </button>
            )}

            <button
              onClick={dismiss}
              className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
