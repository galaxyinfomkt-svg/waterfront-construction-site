import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { TopBar, SiteHeader, SiteFooter, FloatingCTA } from "@/components/chrome";
import JsonLd from "@/components/JsonLd";
import { graph, businessSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL, GEO } from "@/lib/seo";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Remodeling & Construction Contractor in Northborough, MA | Waterfront Construction",
    template: "%s | Waterfront Construction",
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
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
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
        <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
          </>
        )}
        {CLARITY_ID && (
          <Script id="clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}</Script>
        )}
      </body>
    </html>
  );
}
