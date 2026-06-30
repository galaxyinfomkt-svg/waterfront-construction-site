import { SITE_URL, GEO } from "./seo";
import { site, services } from "./site";
import type { Service, Faq } from "./site";
import type { Post } from "./posts";

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
  description:
    "Waterfront Construction Inc is a licensed, insured, owner-led home remodeling and general contractor based in Northborough, MA, serving MetroWest and Worcester County since 2017 — kitchens, bathrooms, additions, siding, windows, decks and full remodels.",
  founder: {
    "@type": "Person",
    name: "Ernando Nunes",
    jobTitle: "Owner & Lead Builder",
    description: `${site.experience}+ years of hands-on residential construction experience.`,
  },
  hasMap: "https://www.google.com/maps/search/?api=1&query=Waterfront+Construction+Inc+Northborough+MA",
  paymentAccepted: "Cash, Check, Credit Card",
  currenciesAccepted: "USD",
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

export function articleSchema(p: Post) {
  let iso = p.date;
  try { iso = new Date(p.date).toISOString(); } catch { /* keep */ }
  const wordCount = [p.lead, ...p.sections.flatMap((s) => [...(s.p || []), ...(s.ul || []), s.quote || ""])]
    .join(" ").trim().split(/\s+/).filter(Boolean).length;
  return {
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    image: `${SITE_URL}${p.image}`,
    datePublished: iso,
    dateModified: iso,
    inLanguage: "en-US",
    wordCount,
    articleSection: p.category,
    keywords: ["home remodeling", "Northborough MA", "MetroWest contractor", p.category],
    // E-E-A-T: named, experienced practitioner as author
    author: {
      "@type": "Person",
      name: "Ernando Nunes",
      jobTitle: "Owner & Lead Builder, Waterfront Construction Inc",
      worksFor: { "@id": BUSINESS_ID },
      knowsAbout: ["home remodeling", "kitchen & bathroom remodeling", "general contracting", "siding", "home additions", "decks"],
    },
    publisher: { "@id": BUSINESS_ID },
    mainEntityOfPage: `${SITE_URL}/blog/${p.slug}`,
  };
}

// AEO: process steps eligible for HowTo rich results & AI step extraction.
export function howToSchema() {
  const steps: [string, string][] = [
    ["Free estimate", "We visit, listen, and give you a clear, honest, itemized quote — no obligation."],
    ["Plan & materials", "We lock the scope, materials, timeline, and permits before any work begins."],
    ["We build", "Clean, on-schedule construction with one accountable point of contact."],
    ["Final walkthrough", "We don't consider the job done until you're 100% happy with the result."],
  ];
  return {
    "@type": "HowTo",
    name: "How a remodeling project works with Waterfront Construction",
    description: "The 4-step process Waterfront Construction follows on every Northborough & MetroWest remodeling project.",
    step: steps.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text })),
  };
}
