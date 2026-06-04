import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { TopBar, SiteHeader, SiteFooter, FloatingCTA } from "@/components/chrome";
import JsonLd from "@/components/JsonLd";
import { site, cities } from "@/lib/site";

const businessLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: site.name,
  image: "/logo-solid.png",
  telephone: "+15088162726",
  email: site.email,
  url: "https://waterfront-site.vercel.app",
  address: { "@type": "PostalAddress", streetAddress: "44 Bearfoot Road", addressLocality: "Northborough", addressRegion: "MA", postalCode: "01532", addressCountry: "US" },
  areaServed: cities.map((c) => ({ "@type": "City", name: `${c}, MA` })),
  priceRange: "$$",
  foundingDate: "2017",
  sameAs: [site.facebook, site.instagram],
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "07:00", closes: "18:00" }],
};

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
        <JsonLd data={businessLd} />
        <TopBar />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingCTA />
      </body>
    </html>
  );
}
