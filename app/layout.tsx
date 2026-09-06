import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  title: { default: "Nudge", template: "%s · Nudge" },
  description: "A positive personal money, investing and daily-life companion.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fffaf3" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PWARegister/>{children}</body></html>;
}
