// app/layout.jsx
//
// 🌐  Root layout (Next.js App Router)
// ───────────────────────────────────────────────────────────
// • Global Tailwind + dark-mode support (next-themes)
// • React-Query client provider
// • <Toaster/> from “sonner” for app-wide toast notifications
// • Loads Google Font (Inter) via next/font
// -----------------------------------------------------------

import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental"; // ↳ streaming hydration
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/* ══════════════════════════════════════════════════════════
   Metadata (override per-page where needed)
══════════════════════════════════════════════════════════ */
export const metadata = {
  title: "NotifyPanel",
  description: "Internal OneSignal notification manager",
};

/* ══════════════════════════════════════════════════════════
   Root layout component (Server Component)
══════════════════════════════════════════════════════════ */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-zinc-50 font-sans antialiased dark:bg-zinc-950">
        <Providers>
          {/* Each page / nested layout renders inside */}
          <Suspense fallback={null}>{children}</Suspense>

          {/* Global toast portal */}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
