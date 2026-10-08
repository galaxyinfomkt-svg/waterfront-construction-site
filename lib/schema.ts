// lib/schema.ts — TARGET (audit 08-schema.md). One JSON-LD @graph per indexable page, built by pageGraph().
// Rules: every value must be TRUE and VISIBLE on the page that carries it (Google structured-data policies;
// 2026-10-01 gen-AI guidance: structured data is fact-checked like copy). Owner-supplied facts render only
// when set — never a placeholder. Never add Review / AggregateRating / HowTo / SiteNavigationElement.
import { SITE_URL, SITE_NAME } from "./seo";
import { site, services, allCities, citySlug, type Service, type City, type Faq } from "./site";
import { townFacts, VILLAGE_OF, DEVENS, projectTown } from "./towns";
import { projects, projectImages, type Project, type ProjectVideo } from "./projects";
import type { ServiceSlug } from "./services";
import { VIDEO_FACTS, PROJECT_PUBLISHED } from "./media-facts";
import MEDIA from "./media-manifest.json";

type Node = Record<string, unknown>;
type Ref = { "@id": string };
const ref = (id: string): Ref => ({ "@id": id });

// ---------- stable identifiers (never change once shipped) ----------
export const HOME_URL = `${SITE_URL}/`;
export const BUSINESS_ID = `${SITE_URL}/#business`; // unchanged from HEAD
export const WEBSITE_ID = `${SITE_URL}/#website`; // unchanged from HEAD
export const LOGO_ID = `${SITE_URL}/#logo`;
export const OWNER_PAGE = "/about/ernando-nunes"; // ProfilePage (04-B-03). If it is not built, set "/about".
export const OWNER_ID = `${SITE_URL}${OWNER_PAGE}#person`; // the ONLY Person @id for Ernando (supersedes 01-H5)
export const serviceId = (slug: string) => `${SITE_URL}/services/${slug}#service`;
export const pageUrl = (path: string) => (path === "/" ? HOME_URL : `${SITE_URL}${path}`);
const abs = (src: string) => (/^https?:\/\//.test(src) ? src : `${SITE_URL}${src}`);
const compact = <T>(xs: (T | null | undefined | false | "")[]) => xs.filter(Boolean) as T[];

// ---------- places ----------
const STATE = {
  MA: { "@type": "State", "@id": `${SITE_URL}/#state-ma`, name: "Massachusetts", identifier: "US-MA" },
  NH: { "@type": "State", "@id": `${SITE_URL}/#state-nh`, name: "New Hampshire", identifier: "US-NH" },
} as const;
const st = (c: City) => (c.s ?? "MA") as "MA" | "NH";
const countyName = (c: City) => townFacts(c).county; // "Worcester County" (GeoNames)
const countyId = (county: string, s: "MA" | "NH") => `${SITE_URL}/service-areas#${county.toLowerCase().replace(/\s+/g, "-")}-${s.toLowerCase()}`;
const countyNode = (c: City) => ({ "@type": "AdministrativeArea", "@id": countyId(countyName(c), st(c)), name: countyName(c), containedInPlace: ref(STATE[st(c)]["@id"]) });
const isVillage = (c: City) => Boolean(VILLAGE_OF[citySlug(c)]) || citySlug(c) === DEVENS;

/** The town as a disambiguated Place: City → County → State; villages → parent town; Devens → MA. */
export function placeNode(c: City): Node {
  const slug = citySlug(c);
  if (slug === DEVENS) return { "@type": "Place", name: "Devens", containedInPlace: ref(STATE.MA["@id"]) };
  const parentName = VILLAGE_OF[slug];
  if (parentName) {
    const parent = allCities.find((x) => x.n === parentName && st(x) === st(c))!;
    return { "@type": "Place", name: c.n, containedInPlace: { "@type": "City", name: parent.n, containedInPlace: countyNode(parent) } };
  }
  return { "@type": "City", name: c.n, containedInPlace: countyNode(c) };
}

const MUNICIPALITIES = allCities.filter((x) => !isVillage(x));
export const AREA_FACTS = { municipalities: MUNICIPALITIES.length, counties: new Set(MUNICIPALITIES.map((c) => `${countyName(c)}|${st(c)}`)).size };

/** Business areaServed: counties with ≥2 served municipalities; single-town counties as that City.
 *  Must match the visible service-area sentence (serviceArea in lib/site.ts). */
export const AREA_SERVED: Node[] = (() => {
  const groups = new Map<string, City[]>();
  for (const c of allCities.filter((x) => !isVillage(x))) {
    const k = `${countyName(c)}|${st(c)}`;
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  return [...groups.values()]
    .sort((a, b) => b.length - a.length)
    .flatMap((towns) => (towns.length >= 2 ? [countyNode(towns[0])] : towns.map(placeNode)));
})();

// ---------- media ----------
const DIMS = MEDIA as Record<string, { w: number; h: number }>;
/** ImageObject. `own` = a photo the company took/owns (owner-confirmed) → creator/credit; never for stock. */
export function imageNode(src: string, o: { caption?: string; own?: boolean; place?: Node } = {}): Node {
  const d = DIMS[src];
  return {
    "@type": "ImageObject", "@id": abs(src), url: abs(src), contentUrl: abs(src),
    ...(d ? { width: d.w, height: d.h } : {}),
    ...(o.caption ? { caption: o.caption } : {}),
    ...(o.own ? { creator: ref(BUSINESS_ID), creditText: site.name, copyrightHolder: ref(BUSINESS_ID) } : {}),
    ...(o.place ? { contentLocation: o.place } : {}),
  };
}
const logoNode = { "@type": "ImageObject", "@id": LOGO_ID, url: abs("/logo-solid.png"), contentUrl: abs("/logo-solid.png"), width: 480, height: 480, caption: `${site.name} logo` };
const isoDuration = (sec: number) => `PT${sec >= 60 ? `${Math.floor(sec / 60)}M` : ""}${Math.round(sec % 60)}S`;

// ---------- credentials (render only when the number is set) ----------
const hic = site.hic ? {
  "@type": "EducationalOccupationalCredential", "@id": `${SITE_URL}/#ma-hic`,
  name: "Massachusetts Home Improvement Contractor Registration", credentialCategory: "registration",
  identifier: site.hic, validIn: ref(STATE.MA["@id"]),
  recognizedBy: { "@type": "GovernmentOrganization", name: "Massachusetts Office of Consumer Affairs and Business Regulation" }, // verify against the card
  ...(site.hicExpires ? { expires: site.hicExpires } : {}),
} : null;
const csl = site.csl ? {
  "@type": "EducationalOccupationalCredential", "@id": `${SITE_URL}/#ma-csl`,
  name: "Massachusetts Construction Supervisor License", credentialCategory: "license",
  identifier: site.csl, validIn: ref(STATE.MA["@id"]),
  recognizedBy: { "@type": "GovernmentOrganization", name: "Massachusetts Board of Building Regulations and Standards" }, // verify against the card
  ...(site.cslExpires ? { expires: site.cslExpires } : {}),
} : null;

// ---------- entities ----------
const ADDRESS = {
  "@type": "PostalAddress", ...(site.showStreet ? { streetAddress: site.street } : {}),
  addressLocality: site.locality, addressRegion: site.region, postalCode: site.postalCode, addressCountry: "US",
};
const BIZ_IMAGES = ["/images/projects/kitchen-remodel-mansfield-ma-01.webp", "/images/projects/home-addition-exterior-lynnfield-ma-12.webp"];

/** Compact business node — on every indexable page, so provider/publisher refs resolve in-page. */
export function businessStub(): Node {
  return {
    "@type": "GeneralContractor", "@id": BUSINESS_ID, name: site.name, url: HOME_URL,
    logo: ref(LOGO_ID), telephone: "+1-508-816-2726", address: ADDRESS,
    ...(hic && site.hicHolder === "company" ? { hasCredential: hic } : {}),
  };
}

/** Full business node — home, /about, /contact, /service-areas only. */
export function businessFull(o: { contactPoint?: boolean; images?: boolean } = {}): Node {
  return {
    ...businessStub(),
    ...(site.legalName ? { legalName: site.legalName } : {}),
    alternateName: site.shortName,
    description: `Owner-led general contractor based in Northborough, Massachusetts, founded in ${site.founded} by Ernando Nunes. Kitchens and bathrooms, home additions, decks, siding, windows and doors, and painting for homeowners in ${AREA_FACTS.municipalities} cities and towns across ${AREA_FACTS.counties} counties of Massachusetts and southern New Hampshire.`,
    ...(o.images ? { image: BIZ_IMAGES.map((src) => ref(abs(src))) } : {}),
    email: site.email,
    foundingDate: String(site.founded),
    founder: ref(OWNER_ID),
    slogan: "From the foundation to the final finish.",
    ...(site.geo ? { geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng } } : {}),
    ...(site.mapsUrl ? { hasMap: site.mapsUrl } : {}),
    sameAs: compact([site.mapsUrl || site.gbp, site.facebook, site.instagram, ...site.profiles]),
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "07:00", closes: "18:00" }], // = GBP hours
    areaServed: AREA_SERVED,
    knowsAbout: services.map((s) => s.short),
    knowsLanguage: site.languages,
    ...(site.paymentAccepted ? { paymentAccepted: site.paymentAccepted } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog", name: "Home improvement and remodeling services",
      itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", "@id": serviceId(s.slug), name: s.short, url: `${SITE_URL}/services/${s.slug}` } })),
    },
    ...(o.contactPoint ? { contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: "+1-508-816-2726", email: site.email, areaServed: ["US-MA", "US-NH"], availableLanguage: site.languages, hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "07:00", closes: "18:00" } } } : {}),
  };
}

export function ownerNode(): Node {
  return {
    "@type": "Person", "@id": OWNER_ID, name: "Ernando Nunes", url: pageUrl(OWNER_PAGE),
    jobTitle: "Owner & Lead Builder", worksFor: ref(BUSINESS_ID),
    description: `Founder and owner of ${site.name} (founded ${site.founded}), with ${site.experience}+ years of hands-on residential construction experience.`,
    knowsAbout: services.map((s) => s.short),
    ...(site.ownerPhoto ? { image: imageNode(site.ownerPhoto, { caption: "Ernando Nunes, owner of Waterfront Construction Inc" }) } : {}),
    ...(site.ownerProfiles.length ? { sameAs: site.ownerProfiles } : {}),
    ...(compact([csl, hic && site.hicHolder === "owner" ? hic : null]).length ? { hasCredential: compact([csl, hic && site.hicHolder === "owner" ? hic : null]) } : {}),
  };
}

export function websiteNode(): Node {
  return { "@type": "WebSite", "@id": WEBSITE_ID, url: HOME_URL, name: SITE_NAME, alternateName: site.name, publisher: ref(BUSINESS_ID), inLanguage: "en-US" };
}

// ---------- page-level nodes ----------
export type Crumb = { name: string; path: string };
/** Same items feed the visible <Breadcrumbs> component — they can never diverge. */
export function breadcrumbNode(items: Crumb[]): Node {
  const last = pageUrl(items[items.length - 1].path);
  return {
    "@type": "BreadcrumbList", "@id": `${last}#breadcrumb`,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: pageUrl(it.path) })),
  };
}

type PageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ProfilePage";
export function webPageNode(o: {
  path: string; name: string; description: string; type?: PageType;
  about?: Ref | Ref[]; mainEntity?: Ref | Node; primaryImage?: string; crumbs?: boolean;
  datePublished?: string; dateModified?: string; relatedLink?: string[];
  spatialCoverage?: Node; // the place a page is about (city hubs); CreativeWork property, emitted only when set
}): Node {
  const u = pageUrl(o.path);
  return {
    "@type": o.type ?? "WebPage", "@id": `${u}#webpage`, url: u, name: o.name, description: o.description,
    isPartOf: ref(WEBSITE_ID), inLanguage: "en-US",
    about: o.about ?? ref(BUSINESS_ID),
    ...(o.mainEntity ? { mainEntity: o.mainEntity } : {}),
    ...(o.primaryImage ? { primaryImageOfPage: ref(abs(o.primaryImage)) } : {}),
    ...(o.crumbs === false ? {} : { breadcrumb: ref(`${u}#breadcrumb`) }),
    ...(o.datePublished ? { datePublished: o.datePublished } : {}),
    ...(o.dateModified ? { dateModified: o.dateModified } : {}),
    ...(o.relatedLink?.length ? { relatedLink: o.relatedLink } : {}),
    ...(o.spatialCoverage ? { spatialCoverage: o.spatialCoverage } : {}),
  };
}

/** FAQPage only for Q&As that are visible on THIS page and not repeated site-wide. */
export function faqNode(path: string, faqs: Faq[]): Node | null {
  if (!faqs.length) return null;
  const u = pageUrl(path);
  return {
    "@type": "FAQPage", "@id": `${u}#faq`, url: u, isPartOf: ref(`${u}#webpage`),
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

const SERVICE_TYPE: Record<ServiceSlug, string> = {
  siding: "Siding installation and replacement",
  "window-replacement": "Window replacement",
  "door-installation": "Exterior door installation and replacement",
  decks: "Deck design and construction",
  "exterior-painting": "Exterior house painting",
  "kitchen-remodeling": "Kitchen remodeling",
  "bathroom-remodeling": "Bathroom remodeling",
  "home-additions": "Home additions",
  "home-remodeling": "Whole-home and interior remodeling",
  "interior-painting": "Interior painting",
};
const caseStudyRef = (p: Project) => ({ "@type": "Article", "@id": `${SITE_URL}/projects/${p.slug}#article`, url: `${SITE_URL}/projects/${p.slug}`, headline: p.title });

/** Hub service (/services/[slug]). description = the visible lead paragraph of the hub. */
export function hubServiceNode(s: Service, o: { description: string; image?: string }): Node {
  const proof = projects.filter((p) => p.services.includes(s.slug));
  return {
    "@type": "Service", "@id": serviceId(s.slug), url: `${SITE_URL}/services/${s.slug}`,
    name: s.short, serviceType: SERVICE_TYPE[s.slug], description: o.description,
    provider: ref(BUSINESS_ID), areaServed: AREA_SERVED,
    ...(o.image ? { image: ref(abs(o.image)) } : {}),
    ...(proof.length ? { subjectOf: proof.map(caseStudyRef) } : {}),
  };
}

/** Town service (/services/[slug]/[town]). name = visible H1; description = the page's unique, visible summary. */
export function townServiceNode(s: Service, c: City, o: { h1: string; summary: string }): Node {
  const u = `${SITE_URL}/services/${s.slug}/${citySlug(c)}`;
  const sameTown = projects.filter((p) => p.services.includes(s.slug) && projectTown(p) && citySlug(projectTown(p)!) === citySlug(c));
  return {
    "@type": "Service", "@id": `${u}#service`, url: u,
    name: o.h1, serviceType: SERVICE_TYPE[s.slug], description: o.summary,
    provider: ref(BUSINESS_ID), areaServed: placeNode(c),
    isRelatedTo: { "@type": "Service", "@id": serviceId(s.slug), name: s.short, url: `${SITE_URL}/services/${s.slug}` },
    ...(sameTown.length ? { subjectOf: sameTown.map(caseStudyRef) } : {}),
  };
}

/** Case study (/projects/[slug]): Article + its own photos (ImageObject) and unique clips (VideoObject). */
export function projectNodes(p: Project, o: { videoText?: (v: ProjectVideo, i: number, n: number) => { name: string; description: string } } = {}): Node[] {
  const u = `${SITE_URL}/projects/${p.slug}`;
  const town = projectTown(p);
  const place = town ? placeNode(town) : ref(STATE.MA["@id"]); // exterior project: town unknown → state only (ask owner)
  const imgs = [...new Set(projectImages(p))].map((src) => imageNode(src, { own: true, place }));
  const vids = p.videos.filter((v) => !VIDEO_FACTS[v.src]?.duplicateOf);
  const videoNodes = vids.map((v, i) => {
    const f = VIDEO_FACTS[v.src];
    const t = o.videoText?.(v, i, vids.length) ?? { name: `${p.shortTitle}: clip ${i + 1} of ${vids.length}`, description: `Silent site clip ${i + 1} of ${vids.length} from the ${p.title} project by ${site.name}.` };
    return {
      "@type": "VideoObject", "@id": `${abs(v.src)}#video`, name: t.name, description: t.description,
      thumbnailUrl: abs(v.poster), contentUrl: abs(v.src), encodingFormat: "video/mp4",
      uploadDate: f.published, duration: isoDuration(f.seconds), width: f.w, height: f.h,
      contentLocation: place, creator: ref(BUSINESS_ID),
    };
  });
  const published = PROJECT_PUBLISHED[p.slug];
  return [
    {
      "@type": "Article", "@id": `${u}#article`, url: u, mainEntityOfPage: ref(`${u}#webpage`),
      headline: p.title, description: p.blurb, articleSection: "Project case studies",
      about: p.services.map((s) => ({ "@type": "Service", "@id": serviceId(s), name: services.find((x) => x.slug === s)!.short, url: `${SITE_URL}/services/${s}` })),
      contentLocation: place, author: ref(BUSINESS_ID), publisher: ref(BUSINESS_ID),
      datePublished: published, dateModified: published, // bump dateModified only on substantive edits
      image: imgs.map((i) => ref(i["@id"] as string)),
      ...(videoNodes.length ? { video: videoNodes.map((v) => ref(v["@id"] as string)) } : {}),
      inLanguage: "en-US",
    },
    ...imgs,
    ...videoNodes,
  ];
}

// ---------- assembly ----------
/** One @graph per page. `full` = complete business entity (+ owner) — home, /about, /contact, /service-areas. */
export function pageGraph(nodes: (Node | null | false | undefined)[], o: { business?: "full" | "stub"; contactPoint?: boolean; owner?: boolean } = {}) {
  const full = o.business === "full";
  // The business photos are only described on the page that actually shows them (the home page):
  // structured data must describe visible content (verification V4.6).
  const isHome = nodes.some((n) => n && (n as Node)["@id"] === `${HOME_URL}#webpage`);
  const bizImages = full && isHome;
  return {
    "@context": "https://schema.org",
    "@graph": compact<Node>([
      websiteNode(),
      STATE.MA, STATE.NH,
      full ? businessFull({ contactPoint: o.contactPoint, images: bizImages }) : businessStub(),
      logoNode,
      bizImages ? compact(BIZ_IMAGES.map((src) => imageNode(src, { own: true }))) : null,
      full || o.owner ? ownerNode() : null,
      ...nodes,
    ].flat() as (Node | null)[]),
  };
}
