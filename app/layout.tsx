import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { TopBar, SiteHeader, SiteFooter, FloatingCTA } from "@/components/chrome";
import JsonLd from "@/components/JsonLd";
import { graph, businessSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL, GEO } from "@/lib/seo";
import Analytics from "@/components/Analytics";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Remodeling & Construction Contractor in Northborough, MA | Waterfront Construction",
    template: "%s | Waterfront Construction",
  },
  description:
    "Licensed, insured home remodeling & construction in Northborough, MA & MetroWest. Kitchens, baths, siding, additions, decks & more. Free estimates — call (508) 816-2726.",
  applicationName: "Waterfront Construction Inc",
  authors: [{ name: "Waterfront Construction Inc" }],
  creator: "Waterfront Construction Inc",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  // No root canonical/og:url: metadata merges shallowly, so they would leak into pages
  // without their own (thank-you, 404). Every indexable page sets a self-canonical via pageMeta().
  openGraph: { type: "website", locale: "en_US", siteName: "Waterfront Construction Inc" },
  twitter: { card: "summary_large_image" },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    // Bing Webmaster Tools (Bing powers Copilot and feeds ChatGPT search)
    ...(process.env.NEXT_PUBLIC_BING_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } } : {}),
  },
  other: {
    "geo.region": "US-MA",
    "geo.placename": "Northborough, Massachusetts",
    "geo.position": `${GEO.lat};${GEO.lng}`,
    ICBM: `${GEO.lat}, ${GEO.lng}`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <noscript><style>{`.r-up{opacity:1!important;transform:none!important}`}</style></noscript>
        <JsonLd data={graph([businessSchema, websiteSchema])} />
        <TopBar />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingCTA />
        <Analytics />
        <ChatWidget />
      </body>
    </html>
  );
}
