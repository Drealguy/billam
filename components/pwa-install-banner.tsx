"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

type Platform = "android" | "ios" | null;

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function PWAInstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode()) return;

    // Don't show if already dismissed
    if (localStorage.getItem("pwa-dismissed")) return;

    if (isIOS()) {
      setPlatform("ios");
      setTimeout(() => setVisible(true), 3000);
    }

    // Android — wait for the browser's beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
        localStorage.setItem("pwa-dismissed", "1");
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  if (!visible || !platform) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
        <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Top bar */}
          <div className="bg-primary px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-sm uppercase">BA</span>
              </div>
              <div>
                <p className="text-white font-black text-sm">Bill Am</p>
                <p className="text-white/70 text-xs">billam.co</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5">
            <p className="font-black text-foreground text-base">
              Add Bill Am to your home screen
            </p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Get the full app experience — faster, no browser bar, works offline.
            </p>

            {platform === "ios" && (
              <div className="mt-4 space-y-2.5">
                {[
                  { icon: <Share size={14} className="text-primary flex-shrink-0" />, text: <>Tap the <strong>Share</strong> button at the bottom of Safari</> },
                  { icon: <Download size={14} className="text-primary flex-shrink-0" />, text: <>Scroll down and tap <strong>"Add to Home Screen"</strong></> },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2.5">
                    {step.icon}
                    <p className="text-xs text-foreground leading-relaxed">{step.text}</p>
                  </div>
                ))}
                <button
                  onClick={handleDismiss}
                  className="w-full py-3 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity mt-1"
                >
                  Got it
                </button>
              </div>
            )}

            {platform === "android" && (
              <button
                onClick={handleInstall}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
              >
                <Download size={16} /> Install App
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="mt-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
