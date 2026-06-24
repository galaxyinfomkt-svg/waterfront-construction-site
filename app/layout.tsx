import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { TopBar, SiteHeader, SiteFooter, FloatingCTA } from "@/components/chrome";
import JsonLd from "@/components/JsonLd";
import { graph, businessSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL, GEO } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Remodeling & Construction Contractor in Northborough, MA | Waterfront Construction",
    template: "%s | Waterfront Construction Inc",
  },
  description:
    "Licensed, insured home remodeling & construction in Northborough, MA & MetroWest. Kitchens, baths, siding, additions, decks & more. ★ 5.0 rated. Free estimates — call (508) 816-2726.",
  applicationName: "Waterfront Construction Inc",
  keywords: ["remodeling contractor Northborough MA", "home remodeling MetroWest", "kitchen remodeling Worcester County", "siding contractor MA", "deck builder Massachusetts", "home additions"],
  authors: [{ name: "Waterfront Construction Inc" }],
  creator: "Waterfront Construction Inc",
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "en_US", siteName: "Waterfront Construction Inc", url: SITE_URL },
  twitter: { card: "summary_large_image" },
  other: {
    "geo.region": "US-MA",
    "geo.placename": "Northborough, Massachusetts",
    "geo.position": `${GEO.lat};${GEO.lng}`,
    ICBM: `${GEO.lat}, ${GEO.lng}`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <noscript><style>{`.r-up{opacity:1!important;transform:none!important}`}</style></noscript>
        <JsonLd data={graph([businessSchema, websiteSchema])} />
        <TopBar />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingCTA />
      </body>
    </html>
  );
}
