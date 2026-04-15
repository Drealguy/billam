"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

const DISMISSED_KEY  = "pwa-dismissed-at";   // timestamp of last dismissal
const INSTALLED_KEY  = "pwa-installed";       // set when app is installed
const COOLDOWN_DAYS  = 7;                     // days before showing again after dismiss

function recentlyDismissed() {
  const ts = localStorage.getItem(DISMISSED_KEY);
  if (!ts) return false;
  return Date.now() - parseInt(ts) < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

export function PWAInstallBanner() {
  const [show, setShow]   = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Already running as installed app — never show
    if (isStandalone) {
      localStorage.setItem(INSTALLED_KEY, "1");
      return;
    }

    // iPadOS 13+ reports as Macintosh, so check touch points too
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    const android = /android/i.test(navigator.userAgent);

    // Detect uninstall: was previously installed but no longer in standalone mode
    const wasInstalled = localStorage.getItem(INSTALLED_KEY);
    if (wasInstalled && !isStandalone) {
      localStorage.removeItem(INSTALLED_KEY);
      localStorage.removeItem(DISMISSED_KEY);
    }

    if (ios) {
      if (recentlyDismissed()) return;
      setIsIOS(true);
      setTimeout(() => setShow(true), 2500);
      return;
    }

    if (android) {
      // Check if the prompt was captured early (before React mounted)
      const early = (window as any).__pwaPrompt;
      if (early) {
        if (!recentlyDismissed()) {
          setDeferredPrompt(early);
          setTimeout(() => setShow(true), 2500);
        }
        return;
      }

      // Fallback: listen for it if we somehow missed the early capture
      const handler = (e: Event) => {
        e.preventDefault();
        if (recentlyDismissed()) return;
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 2500);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  // Allow external triggers (e.g., nav install button) to open this banner
  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("pwa-show-banner", handler);
    return () => window.removeEventListener("pwa-show-banner", handler);
  }, []);

  // Track successful installs via the appinstalled event
  useEffect(() => {
    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      localStorage.removeItem(DISMISSED_KEY);
      setShow(false);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "1");
      localStorage.removeItem(DISMISSED_KEY);
      setShow(false);
    } else {
      dismiss();
    }
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Banner */}
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
                Install Bill Am for a faster, full-screen experience no browser bar.
              </p>
            </div>

            {/* iOS */}
            {isIOS && (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                  <Share size={14} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-foreground leading-relaxed">
                    Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> in Safari
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Download size={16} /> Install App
                </button>
              </div>
            )}

            {/* Android */}
            {!isIOS && (
              <button
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
              >
                <Download size={16} /> Install App
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
