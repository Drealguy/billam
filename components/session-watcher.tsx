"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

/**
 * Listens for Supabase session expiry and redirects to /login.
 * Also handles long inactivity (30 min) by checking the session on user activity.
 */

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export function SessionWatcher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let inactivityTimer: ReturnType<typeof setTimeout>;

    const goToLogin = () => {
      supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(goToLogin, INACTIVITY_LIMIT);
    };

    // Listen for Supabase sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
        router.refresh();
      }
    });

    // Activity events that reset the inactivity timer
    const EVENTS = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    // Start the timer immediately
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      subscription.unsubscribe();
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [router]);

  return null;
}
