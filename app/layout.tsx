import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { TopBar, SiteHeader, SiteFooter, FloatingCTA } from "@/components/chrome";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "Waterfront Construction Inc | Remodeling & Home Builder in Northborough, MA",
  description:
    "Licensed, insured home remodeling and construction in Northborough, MA & MetroWest. Kitchens, baths, siding, additions, decks & more. Free estimates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <TopBar />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingCTA />
      </body>
    </html>
  );
}
