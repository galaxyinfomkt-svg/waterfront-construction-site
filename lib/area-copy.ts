// areaCopy(): every string on a city hub (/service-areas/{town}, spec §5), built ONLY from verifiable data, in the
// same style as lib/town-copy.ts: town geodata (lib/towns.ts), the permit authority and state rules (lib/local-rules.ts,
// only rows marked VERIFIED in the fact register, lead ruling O10), the documented case studies (lib/projects.ts) and
// the owner-confirmed testimonials (lib/site.ts). No rotation, no synonyms, no per-town claim without a record.
//
// The hub is the town-level page: it lists the ten service×town pages of the place and carries the town-level content
// that moved off them (the distance and village/Devens/twin questions and the by-distance lists, spec §4.3, D6).
// No per-service blurbs (they would be the same text on every hub), no FAQPage (D7), never Review markup.
//
// Pure and framework-free so it can be measured outside Next.js (G3/G4 similarity, see areaPageText).
import { site, allCities, cityLabel, citySlug, services, testimonials, type City, type Faq } from "./site";
import {
  townFacts, villageParent, villagesOf, twinOf, placeLabel, countyLabel, isNH, isDevens, devensTowns, isDevensTown,
  milesBetween, nearestProjects, jobsIn, permitOffice, cityHubPath, CITY_HUBS_UPDATED, DEVENS, type Job,
} from "./towns";
import { permitAuthority, authorityLabel, contractorRuleRow, SERVICE_SLUGS } from "./local-rules";
import { TESTIMONIAL_SERVICES, servicesCountWord, type ServiceSlug } from "./services";
import { townCopy, townQuestions, caseStudiesNear, reviewTownsNear, proofLineFor, type Card, type LinkItem } from "./town-copy";
import { OG_IMAGE, ogFor, type OgImage } from "./seo";
import { hasHic, hasCsl } from "./credentials";
import type { Project } from "./projects";
import type { Crumb } from "./schema";

const DATE_FMT = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
export const CITY_HUBS_UPDATED_LABEL = DATE_FMT.format(new Date(CITY_HUBS_UPDATED));

const BASE_LABEL = "Northborough, MA";
/** Every served place, nearest to Northborough first (the base itself is first, at 0 miles). */
const BY_DISTANCE = [...allCities].sort((a, b) => townFacts(a).exactMiles - townFacts(b).exactMiles);
const ordinal = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${s}`;
};
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const stateName = (c: City) => (isNH(c) ? "New Hampshire" : "Massachusetts");
const projectHref = (p: Project) => `/projects/${p.slug}`;
const svcOf = (slug: ServiceSlug) => services.find((s) => s.slug === slug)!;

// Client testimonials (verbatim, owner-confirmed real) with the place they came from. Matched by "Town, ST" label, so
// Hudson, MA and Hudson, NH never mix.
const TESTIMONIALS = testimonials.flatMap((t) => {
  const town = allCities.find((c) => cityLabel(c) === t.town);
  const meta = TESTIMONIAL_SERVICES[t.name];
  return town && meta ? [{ ...t, place: town, work: meta.work }] : [];
});

/** Hub of a served place as a link label ("Remodeling in Salem, NH"). */
const hubLink = (c: City): LinkItem => ({ href: cityHubPath(c), label: `Remodeling in ${cityLabel(c)}` });

// First-person permit claim: only with a Construction Supervisor License on file (V3.2, same gate as lib/local-rules.ts).
const OUR_PERMIT = hasCsl ? " On our jobs, we apply for the building permit and schedule the inspections." : "";

/** "Permits and rules in {place}" (spec §5.3-6). Only fact-register rows marked VERIFIED are stated as rules (O10):
 *  MA R3 (siding), R4 (windows), R5 (attached deck, permit only), R8d structure wording, R14
 *  (painting), R9 (lead thresholds and windows). The exterior-door permit (R4a) is PARTLY verified, so it is a pointer to
 *  the authority. NH: R13, R12, R10 only (no Massachusetts law on New Hampshire pages). */
export function areaRules(c: City): string {
  const a = permitAuthority(c).text;
  if (isNH(c)) {
    return `The New Hampshire state building code applies in every town, and each town decides how it issues permits and inspects work, so ask ${a} which parts of your project need a permit. Electricians and plumbers working for hire in New Hampshire hold state licenses through the Office of Professional Licensure and Certification (OPLC). New Hampshire does not run its own renovation lead program, so paid work in a pre-1978 home follows the federal EPA lead-safe (RRP) rule: more than 6 square feet of painted surface in a room, more than 20 square feet outside, or any window replacement.`;
  }
  return `Re-siding, replacement windows, an attached deck, and an addition or remodel that moves walls or changes the structure need a building permit from ${a}; painting needs none under the Massachusetts building code. Ask ${a} whether replacing an exterior door needs one.${OUR_PERMIT} In a pre-1978 home, paid work that disturbs more than 6 square feet of painted surface in a room, or more than 20 square feet in total outside, falls under Massachusetts lead-safe renovation rules (454 CMR 22.00), and so does every window replacement.`;
}

export type AreaFact = { dt: string; dd: string; href?: string; links?: LinkItem[] };
export type AreaCopy = {
  path: string;
  slug: string;
  crumbs: Crumb[];
  title: string; // without the brand; the root template adds " | Waterfront Construction" unless titleIsAbsolute
  titleIsAbsolute: boolean;
  description: string;
  og: OgImage;
  h1: string;
  summary: string; // answer-first lead: services, where the place is, the strongest true proof
  heroNotes: { text: string; links: LinkItem[] }[]; // twin / parent town / villages / Devens
  cta: { estimate: string; phone: string };
  trust: string[];
  quote?: { text: string; cite: string; disclosure: string; reviewsLabel: string }; // a testimonial from THIS place only
  servicesHeading: string;
  services: (LinkItem & { slug: ServiceSlug })[]; // the ten service×town pages, D10 order; meta = proofLineFor()
  glanceHeading: string;
  facts: AreaFact[];
  workHeading: string;
  photoCards: Card[]; // same-town case studies only (a photo taken in this place)
  nearestWork: LinkItem[]; // the other nearest case studies (any service), with distance from this place
  caseStudiesLabel: string;
  caseStudies: LinkItem[]; // caseStudiesNear(c)
  reviewsLabel: string;
  reviews: LinkItem[]; // reviewTownsNear(c)
  rulesHeading: string;
  rules: string;
  faqHeading: string;
  faqs: Faq[]; // townQuestions(c): visible only, no FAQPage (D7)
  nearbyHeading: string;
  nearby: LinkItem[]; // the 8 nearest city hubs
  footnote: string;
  updated: { label: string; date: string; iso: string };
  caseStudyLinks: string[]; // case-study URLs linked from the page (WebPage.relatedLink)
  sameTownPhoto?: { src: string; alt: string; caption: string }; // primaryImageOfPage + ImageObject
};

export function areaCopy(c: City): AreaCopy {
  const f = townFacts(c);
  const slug = citySlug(c);
  const path = cityHubPath(c);
  const T = c.n;
  const CL = cityLabel(c);
  const TL = placeLabel(c);
  const parent = villageParent(c);
  const twin = twinOf(c);
  const devens = isDevens(c);
  const nh = isNH(c);
  const base = f.isBase;
  const county = countyLabel(c);
  const { miles: mi, dir } = f;

  // ----- documented proof, nearest first (any service) -----
  const near = nearestProjects(c, { limit: 99 });
  const same = near.filter((x) => x.sameTown);
  const nearestElsewhere = near.find((x) => !x.sameTown);
  const quoteT = TESTIMONIALS.find((t) => citySlug(t.place) === slug);
  const jobs: Job[] = jobsIn(c); // owner's completed-job records here (phase 2; empty today)

  // ----- answer-first summary (spec §5.3-1) -----
  const offer = `We take home improvement and remodeling projects in ${TL}: ${servicesCountWord} services, from siding and windows to kitchens, bathrooms and additions.`;
  const where = base ? `Northborough is our home base${site.showStreet ? `, at ${site.street}` : ""}, in ${county}.`
    : devens ? `Devens, a regional enterprise zone on the former Fort Devens across parts of Ayer, Harvard and Shirley, is about ${mi} miles ${dir} of our Northborough base; building permits there come from the Devens Enterprise Commission.`
    : parent ? `${T} is a village in the town of ${parent.n}, ${county}, about ${mi} miles ${dir} of our Northborough base.`
    : nh ? `${T} is in ${county}, New Hampshire, about ${mi} miles ${dir} of our base in Northborough, Massachusetts.`
    : `${T} is in ${county}, about ${mi} miles ${dir} of our Northborough base.`;
  const quoted = (p: Project) => `“${p.title}”`;
  let proofSentence = "";
  if (same.length === 1) proofSentence = `Our case study ${quoted(same[0].project)} documents our work here.`;
  else if (same.length > 1) proofSentence = `${same.length === 2 ? "Two" : same.length} of our case studies document our work here: ${same.map((x) => quoted(x.project)).join(" and ")}.`;
  else if (quoteT) proofSentence = `${quoteT.name}, a ${T} client, shared a review of our ${quoteT.work}; it is quoted on this page with permission.`;
  else if (jobs.length) proofSentence = `Our records show ${plural(jobs.length, "completed project", "completed projects")} in ${T}.`;
  else if (nearestElsewhere) proofSentence = `Our closest published case study is ${quoted(nearestElsewhere.project)}, about ${nearestElsewhere.miles} miles ${nearestElsewhere.dir} of ${T}.`;
  const summary = [offer, where, proofSentence].filter(Boolean).join(" ");

  // ----- hero extras: easily confused or related places (each links its own hub) -----
  const heroNotes: AreaCopy["heroNotes"] = [];
  if (twin) heroNotes.push({ text: `Looking for ${cityLabel(twin)}?`, links: [hubLink(twin)] });
  if (parent) heroNotes.push({ text: `${T} is part of ${parent.n}.`, links: [hubLink(parent)] });
  const villages = villagesOf(c);
  if (villages.length) heroNotes.push({ text: `${villages.length > 1 ? "Villages" : "Village"} of ${T} with ${villages.length > 1 ? "their own pages" : "its own page"}:`, links: villages.map(hubLink) });
  if (devens) heroNotes.push({ text: "Devens lies across parts of three towns we also serve:", links: devensTowns(c).map(hubLink) });
  const devensHub = isDevensTown(c) ? allCities.find((x) => citySlug(x) === DEVENS) : undefined;
  if (devensHub) heroNotes.push({ text: `Parts of ${T} lie in Devens, where building permits come from the Devens Enterprise Commission.`, links: [hubLink(devensHub)] });

  // HIC/CSL only when the numbers are set (never a placeholder) and never a Massachusetts credential on an NH page.
  const trust = [!nh && hasHic ? `MA HIC Reg. #${site.hic}` : "", !nh && hasCsl ? `MA Construction Supervisor License ${site.csl} (${site.owner})` : "", "Insured"].filter(Boolean);
  const quote = quoteT
    ? { text: quoteT.text, cite: `${quoteT.name}, ${cityLabel(quoteT.place)} · ${quoteT.date}`, disclosure: "Shared with permission by our client.", reviewsLabel: "Our Google reviews" }
    : undefined;

  // ----- the ten service×town pages (spec §5.3-2): "{name} in {Town, ST}" + the nearest proof line where one exists -----
  const svcLinks = SERVICE_SLUGS.map((x) => ({ slug: x, href: `/services/${x}/${slug}`, label: `${svcOf(x).name} in ${CL}`, meta: proofLineFor(x, c) }));

  // ----- at a glance (spec §5.3-3) -----
  const countyRow = devens ? "Middlesex & Worcester, Massachusetts (former Fort Devens)"
    : parent ? `${county}, Massachusetts (village of ${parent.n})`
    : `${county}, ${stateName(c)}${f.sameCounty > 1 ? ` · ${f.sameCounty} places we serve there` : ""}`;
  const rank = BY_DISTANCE.findIndex((x) => citySlug(x) === slug); // 0 = Northborough
  const within10 = allCities.filter((x) => citySlug(x) !== slug && milesBetween(c, x) <= 10).length;
  const office = permitOffice(c);
  const mapQuery = `${T}, ${parent ? `${parent.n}, ` : ""}${c.s ?? "MA"}`;
  const facts: AreaFact[] = [
    { dt: "County", dd: countyRow },
    { dt: "From our base", dd: base ? "Our home base" : `About ${mi} miles ${dir} (${ordinal(rank)} nearest of the ${allCities.length - 1} other places we serve)` },
    { dt: "Places we serve within 10 miles", dd: within10 ? plural(within10, "place", "places") : "None" },
    { dt: "Building permits", dd: authorityLabel(c), href: office?.url },
    { dt: "Contractor rules", dd: contractorRuleRow(c) },
    ...(jobs.length ? [{ dt: "Our record here", dd: plural(jobs.length, "completed project", "completed projects") }] : []),
    {
      dt: "Map", dd: "",
      links: [
        { href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, label: `Open ${CL} in Google Maps` },
        ...(base ? [] : [{ href: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(BASE_LABEL)}&destination=${encodeURIComponent(mapQuery)}`, label: "Driving directions from Northborough" }]),
      ],
    },
  ];

  // ----- documented work closest to this place (spec §5.3-4): the 3 nearest case studies of any service; a photo
  // card only for a photo taken here (its true caption and alt come from the service×town page of its own service) -----
  const nearest3 = near.slice(0, 3);
  const photoCards: Card[] = nearest3.filter((x) => x.sameTown).flatMap((x) => {
    const card = townCopy(svcOf(x.project.services[0]), c).proof.cards.find((cd) => cd.href === projectHref(x.project));
    return card ? [card] : [{ href: projectHref(x.project), title: x.project.title, caption: `Case study in ${CL}` }];
  });
  const nearestWork: LinkItem[] = nearest3.filter((x) => !x.sameTown).map((x) => ({
    href: projectHref(x.project), label: x.project.title, meta: `About ${x.miles} miles ${x.dir} of ${T}`,
  }));
  const caseStudies = caseStudiesNear(c);
  const reviews = reviewTownsNear(c);
  const firstPhoto = photoCards.find((cd) => cd.img);
  const sameTownPhoto = firstPhoto?.img ? { src: firstPhoto.img, alt: firstPhoto.alt ?? "", caption: firstPhoto.title } : undefined;

  // ----- nearby hubs (spec §5.3-8) -----
  const nearby: LinkItem[] = f.nearest.map((n) => ({ href: cityHubPath(n.city), label: cityLabel(n.city), meta: `${n.miles} mi ${n.dir}` }));

  // ----- metadata (spec §5.2): never equal to a service×town description (those start with "{L.title} in") -----
  const core = `General Contractor in ${TL}`;
  const titleIsAbsolute = core.length + " | Waterfront Construction".length > 60;
  const [n1, n2] = f.nearest;
  const firstSame = same[0];
  const parts = [
    base ? `General contractor in ${CL}, our home base.` : `General contractor for ${CL} (${county}), about ${mi} mi ${dir} of our Northborough base.`,
    firstSame ? `See our ${firstSame.project.category.toLowerCase()} case study from ${T}.`
      : quoteT ? `Read what a ${T} client said.`
      : nearestElsewhere ? `Nearest case study: ${cityLabel(nearestElsewhere.town)}, ${nearestElsewhere.miles} mi.` : "",
    "Free estimates.",
    `Also near ${cityLabel(n1.city)} and ${cityLabel(n2.city)}.`,
  ];
  let description = "";
  for (const part of parts.filter(Boolean)) {
    const next = description ? `${description} ${part}` : part;
    if (next.length <= 158) description = next;
  }
  const og = firstSame ? ogFor(`project-${firstSame.project.slug}`, `${firstSame.project.title} — Waterfront Construction`) : OG_IMAGE;

  const caseStudyLinks = [...new Set([...photoCards, ...nearestWork, ...caseStudies].map((x) => x.href).filter((h) => h.startsWith("/projects/")))];

  return {
    path,
    slug,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Service Areas", path: "/service-areas" },
      { name: CL, path },
    ],
    title: core,
    titleIsAbsolute,
    description,
    og,
    h1: core,
    summary,
    heroNotes,
    cta: { estimate: "Get a free estimate", phone: site.phone },
    trust,
    quote,
    servicesHeading: `Our services in ${TL}`,
    services: svcLinks,
    glanceHeading: `${TL} at a glance`,
    facts,
    workHeading: `Documented work closest to ${T}`,
    photoCards,
    nearestWork,
    caseStudiesLabel: "Case studies by distance:",
    caseStudies,
    reviewsLabel: "Client reviews by distance:",
    reviews,
    rulesHeading: `Permits and rules in ${TL}`,
    rules: areaRules(c),
    faqHeading: "Questions",
    faqs: townQuestions(c),
    nearbyHeading: "Nearby places we serve",
    nearby,
    footnote: "Distances: straight line, GeoNames data (CC BY 4.0).",
    updated: { label: "Updated", date: CITY_HUBS_UPDATED_LABEL, iso: CITY_HUBS_UPDATED },
    caseStudyLinks,
    sameTownPhoto,
  };
}

/** The visible text of a city hub's <main>, in DOM order — must mirror app/service-areas/[town]/page.tsx (the mid-page
 *  FormBand and the CtaRows are template chrome and left out, as scripts/check-town-pages.mjs does). Not rendered: it
 *  lets the G3/G4 similarity of the 201 hubs be measured from source without a build. */
export function areaPageText(k: AreaCopy): string {
  const parts: string[] = [
    ...k.crumbs.map((x) => x.name),
    k.h1, k.summary,
    ...k.heroNotes.flatMap((n) => [n.text, ...n.links.map((l) => l.label)]),
    k.cta.estimate, k.cta.phone, ...k.trust,
    ...(k.quote ? [k.quote.text, k.quote.cite, k.quote.disclosure, k.quote.reviewsLabel] : []),
    k.servicesHeading, ...k.services.flatMap((x) => [x.label, x.meta ?? ""]),
    k.glanceHeading, ...k.facts.flatMap((x) => [x.dt, x.dd, ...(x.links ?? []).map((l) => l.label)]),
    k.workHeading,
    ...k.photoCards.flatMap((x) => [x.title, x.caption]),
    ...k.nearestWork.flatMap((x) => [x.label, x.meta ?? ""]),
    ...(k.caseStudies.length ? [k.caseStudiesLabel, ...k.caseStudies.flatMap((x) => [x.label, x.meta ?? ""])] : []),
    ...(k.reviews.length ? [k.reviewsLabel, ...k.reviews.flatMap((x) => [x.label, x.meta ?? ""])] : []),
    k.rulesHeading, k.rules,
    ...(k.faqs.length ? [k.faqHeading, ...k.faqs.flatMap((x) => [x.q, x.a])] : []),
    k.nearbyHeading, ...k.nearby.flatMap((x) => [x.label, x.meta ?? ""]),
    k.footnote, k.updated.label, k.updated.date,
  ];
  return parts.filter(Boolean).join(" ");
}

