import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent content-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Referrer leakage control
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable sensitive browser features we don't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self https://js.paystack.co)",
  },
  // Content Security Policy
  // - 'unsafe-inline' and 'unsafe-eval' required by Next.js App Router
  // - Paystack checkout is served from a pop-up, not an iframe we embed
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://api.resend.com",
      "frame-src https://checkout.paystack.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
