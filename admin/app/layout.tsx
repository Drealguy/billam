import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bill Am Admin",
  description: "Internal admin dashboard for Bill Am.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
