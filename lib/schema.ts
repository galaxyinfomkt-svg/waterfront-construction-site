import { SITE_URL, GEO } from "./seo";
import { site, services } from "./site";
import type { Service, Faq } from "./site";

export const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export const businessSchema = {
  "@type": ["GeneralContractor", "HomeAndConstructionBusiness", "LocalBusiness"],
  "@id": BUSINESS_ID,
  name: site.name,
  alternateName: "Waterfront Construction",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-solid.png`,
  image: `${SITE_URL}/images/hero.jpg`,
  telephone: "+15088162726",
  email: site.email,
  priceRange: "$$",
  foundingDate: "2017",
  slogan: "From the foundation to the final finish.",
  founder: { "@type": "Person", name: "Ernando Nunes" },
  address: { "@type": "PostalAddress", streetAddress: "44 Bearfoot Road", addressLocality: "Northborough", addressRegion: "MA", postalCode: "01532", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: GEO.lat, longitude: GEO.lng },
  areaServed: { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: GEO.lat, longitude: GEO.lng }, geoRadius: "48000" },
  sameAs: [site.facebook, site.instagram],
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "07:00", closes: "18:00" }],
  knowsAbout: services.map((s) => s.short),
  hasOfferCatalog: {
    "@type": "OfferCatalog", name: "Construction & Remodeling Services",
    itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.short, url: `${SITE_URL}/services/${s.slug}` } })),
  },
};

export const websiteSchema = {
  "@type": "WebSite", "@id": WEBSITE_ID, url: SITE_URL,
  name: site.name, publisher: { "@id": BUSINESS_ID }, inLanguage: "en-US",
};

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function serviceSchema(s: Service, cityName?: string) {
  const path = cityName ? `/services/${s.slug}/${cityName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : `/services/${s.slug}`;
  return {
    "@type": "Service",
    "@id": `${SITE_URL}${path}#service`,
    serviceType: s.name,
    name: cityName ? `${s.short} in ${cityName}, MA` : `${s.short} in Northborough, MA`,
    description: s.blurb,
    url: `${SITE_URL}${path}`,
    provider: { "@id": BUSINESS_ID },
    areaServed: cityName ? { "@type": "City", name: `${cityName}, MA` } : { "@type": "AdministrativeArea", name: "MetroWest & Worcester County, MA" },
  };
}

export function faqSchema(faqs: Faq[]) {
  return { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}

export function articleSchema(p: { title: string; excerpt: string; image: string; date: string; slug: string }) {
  let iso = p.date;
  try { iso = new Date(p.date).toISOString(); } catch { /* keep */ }
  return {
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    image: `${SITE_URL}${p.image}`,
    datePublished: iso,
    dateModified: iso,
    author: { "@type": "Organization", name: site.name, url: SITE_URL },
    publisher: { "@id": BUSINESS_ID },
    mainEntityOfPage: `${SITE_URL}/blog/${p.slug}`,
  };
}
