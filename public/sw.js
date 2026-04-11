const CACHE_NAME = "billam-v1";

const STATIC_ASSETS = [
  "/",
  "/offline",
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache, then offline page
self.addEventListener("fetch", (event) => {
  // Skip non-GET and non-http requests
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http")) return;

  // Skip Supabase and Paystack API calls — always need fresh data
  const url = new URL(event.request.url);
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("paystack.co") ||
    url.hostname.includes("resend.com") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache successful page navigations
        if (res.ok && event.request.mode === "navigate") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fall back to offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/offline");
          }
        });
      })
  );
});
