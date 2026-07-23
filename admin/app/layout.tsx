import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

// Same font setup as the customer app (app/layout.tsx there) — Jost
// mapped to --font-sans, so both apps render with identical type.
const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bill Am Admin",
  description: "Internal admin dashboard for Bill Am.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
