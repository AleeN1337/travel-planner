import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WorldMapBackground } from "@/components/layout/world-map-background";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Planer Podróży",
    template: "%s | Planer Podróży",
  },
  description:
    "Spersonalizowany plan podróży z mapą, budżetem, checklistą i planem B.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${dmSans.variable} ${geistMono.variable} dark h-full scroll-pt-24 antialiased`}
    >
      <body className="travel-bg flex min-h-full flex-col">
        <div className="travel-bg-layers" aria-hidden>
          <div className="travel-bg-layer travel-bg-aurora" />
          <WorldMapBackground />
          <div className="travel-bg-layer travel-bg-grid" />
          <div className="travel-bg-layer travel-bg-grain" />
        </div>
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <SiteHeader />
          <AppProviders>
            <main className="flex-1">{children}</main>
          </AppProviders>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
