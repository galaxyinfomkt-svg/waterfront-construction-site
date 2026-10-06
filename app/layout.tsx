import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { TopBar, SiteHeader, SiteFooter, FloatingCTA } from "@/components/chrome";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import Analytics from "@/components/Analytics";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Newsreader: one static 400 roman (no opsz axis, no italic) for h1–h3, stat numerals and quotes (design spec §1.2).
const newsreader = Newsreader({ subsets: ["latin"], weight: "400", style: "normal", variable: "--font-newsreader", display: "swap" });

// Root defaults only. Every indexable page sets its own title, description, self-canonical and
// og:url through pageMeta() — none are set here, because metadata merges shallowly and a root
// canonical/og:url would leak into noindex pages (thank-you, 404) (audit 01 M3).
// No site-wide JSON-LD either: each indexable page emits ONE @graph via pageGraph(); noindex pages emit none (08 S-06).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description:
    "Owner-led home remodeling contractor in Northborough, MA, founded in 2017: kitchens and bathrooms, additions, decks, siding, windows and doors, and painting. Free estimates: (508) 816-2726.",
  applicationName: SITE_NAME,
  // Indexing is the default, so no site-wide "index, follow" (it leaked next to Next's own noindex on the
  // 404 page). Only the Googlebot preview limits are set here; noindex pages override robots entirely.
  robots: { googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "en_US", siteName: SITE_NAME },
  twitter: { card: "summary_large_image" },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    // Bing Webmaster Tools (Bing powers Copilot and feeds ChatGPT search)
    ...(process.env.NEXT_PUBLIC_BING_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } } : {}),
  },
  // Region tags only: no geo.position/ICBM, because the only coordinates on file are the Northborough
  // town center, not the business location (01 H5). Add them from site.geo once the GBP pin is supplied.
  other: { "geo.region": "US-MA", "geo.placename": "Northborough, Massachusetts" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" data-scroll-behavior="smooth" className={`${inter.variable} ${newsreader.variable}`}>
      <body>
        {/* Skip link: first Tab stop on every page (10 UX-M2). */}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:px-6 focus:whitespace-nowrap btn btn-white border border-line">Skip to content</a>
        <TopBar />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">{children}</main>
        <SiteFooter />
        <FloatingCTA />
        <Analytics />
        <ChatWidget />
      </body>
    </html>
  );
}
