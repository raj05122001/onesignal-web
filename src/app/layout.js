import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import OneSignalProvider from "@/components/OneSignalProvider"; // ADD THIS
import SubscriptionModal from "@/components/SubscriptionModal"; // ADD THIS

const inter = Inter({
  subsets: ["latin"],
  display: "swap", 
  variable: "--font-inter",
});

export const metadata = {
  title: "NotifyPanel",
  description: "Internal OneSignal notification manager",
  manifest: "/manifest.json", // ADD THIS
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-zinc-50 font-sans antialiased dark:bg-zinc-950">
        <OneSignalProvider> {/* ADD THIS */}
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
            <SubscriptionModal /> {/* ADD THIS */}
          </Providers>
        </OneSignalProvider> {/* ADD THIS */}
      </body>
    </html>
  );
}