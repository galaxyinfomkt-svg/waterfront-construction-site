// townCopy(): every string on a service×town page (/services/{service}/{town}), built ONLY from
// verifiable data — town geodata (lib/towns.ts), state × service rules (lib/local-rules.ts),
// documented case studies (lib/projects.ts) and the owner-confirmed testimonials (lib/site.ts, mapped to services
// by TESTIMONIAL_SERVICES in lib/services.ts).
// No rotation, no synonyms, no per-town claims without a record (audit 03 §3.1). Variation comes
// only from data: county, distance and direction, permit authority, village/Devens/twin/NH status,
// the nearest real case studies and the 8 true nearest served places.
//
// Town-level content (the "where are you based / how far / is it part of …" questions and the by-distance lists)
// lives on the city hub (/service-areas/{town}, lib/area-copy.ts) since the 10-service split (spec §4.3, D6); this
// module exports it for that page (spec §4.4) and keeps only service×town-specific text on the service pages.
//
// Pure and framework-free so it can be measured outside Next.js (see the similarity check).
import { site, allCities, cityLabel, citySlug, serviceArea, testimonials, type City, type Faq } from "./site";
import { projects, projectImages, type Project } from "./projects";
import {
  townFacts, nearestProjects, villageParent, villagesOf, twinOf, placeLabel, countyLabel, isNH, isDevens, isDevensTown, sameCity,
  milesBetween, dirBetween, placesWithin, jobsIn, permitOffice, projectTown, cityHubPath, TOWN_PAGES_UPDATED, DEVENS,
  type ProjectNear, type Job,
} from "./towns";
import {
  SERVICE_LOCAL, SERVICE_SLUGS, permitAuthority, permitRow, isPaintingService, rulesParagraph, contractorRuleRow, isServiceSlug, type ServiceSlug,
} from "./local-rules";
import { TESTIMONIAL_SERVICES, servicesCountWord } from "./services";
import { OG_IMAGE, ogFor, type OgImage } from "./seo";
import { getPost } from "./posts";
import { hasHic, hasCsl } from "./credentials";
import type { Crumb } from "./schema";

// ---------- documented projects: how a town page may describe and show them ----------
// `label` is what the case study itself documents (true for its town only); photos are chosen so the
// picture shows what the caption says (e.g. Lynnfield 18 = the finished siding and windows) and no
// house number is legible. The photo must exist in the project's own image list, else the cover is used.
// `pos` = CSS object-position for the 4:3 crop of a portrait photo (keeps the subject in frame).
type PhotoCopy = { label: string; photo: string; alt: string; pos?: string };
type ProjectCopy = PhotoCopy & { short: string; bySvc?: Partial<Record<ServiceSlug, PhotoCopy>> };
const IMG = "/images/projects/";
const PROJECT_COPY: Record<string, ProjectCopy> = {
  "kitchen-remodel-mansfield-ma": {
    label: "kitchen remodel with white cabinetry and a large island", short: "kitchen remodel",
    photo: `${IMG}kitchen-remodel-mansfield-ma-01.webp`, alt: "Finished white kitchen with a large island and pendant lights in Mansfield, MA",
  },
  "pool-deck-salem-nh": {
    label: "deck built around an above-ground pool", short: "pool deck",
    photo: `${IMG}deck-salem-nh-02.webp`, alt: "Deck with white railings built around an above-ground pool in Salem, NH",
  },
  "home-addition-needham-ma": {
    label: "front porch addition (framing stage)", short: "porch addition",
    photo: `${IMG}home-addition-needham-ma-05.webp`, alt: "Front porch and addition framing on a colonial home in Needham, MA", pos: "50% 60%",
  },
  "home-addition-exterior-lynnfield-ma": {
    label: "home addition and exterior remodel", short: "addition and exterior remodel",
    photo: `${IMG}home-addition-exterior-lynnfield-ma-12.webp`, alt: "Home addition under construction in Lynnfield, MA, with the new wing sheathed", pos: "50% 65%",
    bySvc: {
      siding: { label: "home addition and exterior remodel with new siding", photo: `${IMG}home-addition-exterior-lynnfield-ma-18.webp`, alt: "New white siding and three arched black windows on a home addition in Lynnfield, MA", pos: "50% 60%" },
      // HA13 / HA14: the same true captions as lib/services.ts P.ha13 / P.ha14 (no "wood" door), with the place.
      "window-replacement": { label: "home addition and exterior remodel with new windows", photo: `${IMG}home-addition-exterior-lynnfield-ma-13.webp`, alt: "Three new arched windows with factory labels still on, set into green sheathing with taped seams, on a home addition in Lynnfield, MA" },
      "door-installation": { label: "home addition and exterior remodel with a new entry door", photo: `${IMG}home-addition-exterior-lynnfield-ma-14.webp`, alt: "New entry door in protective plastic, with flashing membrane at the sill and a wood form for its step, on a home addition in Lynnfield, MA" },
    },
  },
  "home-addition-framing-lynnfield-ma": {
    label: "home addition filmed while it was framed and sheathed", short: "addition framing video",
    photo: `${IMG}home-addition-lynnfield-ma-03.webp`, alt: "Home addition framing and sheathing in winter in Lynnfield, MA",
  },
};

function projectView(p: Project, town: City, svc?: ServiceSlug) {
  const base = PROJECT_COPY[p.slug];
  const v = (svc && base?.bySvc?.[svc]) || base;
  const imgs = projectImages(p);
  const photo = v && imgs.includes(v.photo) ? v.photo : p.cover;
  const own = Boolean(v && photo === v.photo);
  return {
    label: v?.label ?? p.category.toLowerCase(),
    short: base?.short ?? p.category.toLowerCase(),
    photo,
    alt: own && v ? v.alt : `${p.title} (photo from the case study in ${cityLabel(town)})`,
    pos: own ? v?.pos : undefined,
  };
}
// Case studies of a service that are published without a town (the bathroom album): real work, never tied to a place.
const UNLOCATED_LABEL: Record<string, string> = { "bathroom-remodels": "bathroom remodel photos" };
// ---------- testimonials (owner-confirmed real; verbatim; never marked up as Review) ----------
// Which services each one is about: TESTIMONIAL_SERVICES (lib/services.ts), the ONE mapping (lead ruling O6).
type LocalTestimonial = { name: string; town: City; date: string; text: string; services: ServiceSlug[]; work: string };
const TESTIMONIALS: LocalTestimonial[] = testimonials.flatMap((t) => {
  const m = t.town.match(/^(.+), (MA|NH)$/);
  const meta = TESTIMONIAL_SERVICES[t.name];
  if (!m || !meta) return [];
  const town = allCities.find((c) => c.n === m[1] && (c.s ?? "MA") === m[2]);
  return town ? [{ name: t.name, town, date: t.date, text: t.text, services: meta.services, work: meta.work }] : [];
});

/** Testimonials for this town and service (shown only on their own town's pages). Towns are compared by
 *  slug, never by object identity (V4.8). */
export function localTestimonials(c: City, svc: ServiceSlug) {
  return TESTIMONIALS.filter((t) => sameCity(t.town, c) && t.services.includes(svc));
}

// ---------- helpers ----------
const W15 = placesWithin(15);
const DATE_FMT = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
export const TOWN_PAGES_UPDATED_LABEL = DATE_FMT.format(new Date(TOWN_PAGES_UPDATED));
// Cost guides on the blog, by service (spec §4.2). Doors, whole-home remodeling and both paintings have none.
const COST_GUIDES: Partial<Record<ServiceSlug, string[]>> = {
  siding: ["siding-replacement-cost-massachusetts"],
  "window-replacement": ["window-replacement-cost-massachusetts"],
  decks: ["deck-cost-massachusetts"],
  "kitchen-remodeling": ["kitchen-remodel-cost-massachusetts"],
  "bathroom-remodeling": ["bathroom-remodel-cost-massachusetts"],
  "home-additions": ["home-addition-cost-massachusetts"],
};

const stateName = (c: City) => (isNH(c) ? "New Hampshire" : "Massachusetts");
/** "a deck" / "an addition". */
const an = (phrase: string) => `${/^[aeiou]/i.test(phrase) ? "an" : "a"} ${phrase}`;
/** "2024" or "2021–2025" for a set of job years. */
function yearsLabel(jobs: Job[]): string {
  const ys = [...new Set(jobs.map((j) => j.year))].sort((a, b) => a - b);
  return ys.length > 1 ? `${ys[0]}–${ys[ys.length - 1]}` : String(ys[0]);
}

export type Card = { href: string; title: string; img?: string; alt?: string; pos?: string; caption: string };
export type LinkItem = { href: string; label: string; meta?: string };
export type TownCopy = {
  path: string;
  crumbs: Crumb[];
  title: string; // without the brand; the root template adds " | Waterfront Construction" unless titleIsAbsolute
  titleIsAbsolute: boolean;
  description: string;
  og: OgImage;
  h1: string;
  summary: string;
  schemaSummary: string; // the visible summary plus a non-quoted proof line (Service.description)
  quote?: { text: string; cite: string; disclosure: string; reviewsLabel: string }; // own town + own service only
  heroNote?: { text: string; href: string; label: string };
  // The page's lead photo: a case study from THIS town. Since V5.3 the hero holds the estimate form, so the photo
  // is shown on the first proof card (caption = that card's visible title); kept here for the WebPage
  // primaryImageOfPage / ImageObject and app/sitemap/entries.ts (name kept for that consumer).
  heroImage?: { src: string; alt: string; pos?: string; caption: string; href: string };
  cta: { estimate: string; phone: string };
  trust: string[];
  glanceHeading: string;
  facts: { dt: string; dd: string; href?: string }[]; // href = a person-verified official page (phase 2)
  // byDistance: located proof for this service and its related services (case studies and the client reviews about
  // them), nearest first — service×town data (spec §7.2 lever 5), unlike the all-service lists that moved to the city hub.
  proof: { heading: string; cards: Card[]; also: LinkItem[]; byDistanceLabel: string; byDistance: LinkItem[] };
  rulesHeading: string;
  rules: string;
  scopeLabel: string;
  scope: string[];
  hubLink: LinkItem;
  guideLinks: LinkItem[]; // Massachusetts cost guides for this service (MA pages only — the guides cite MA law)
  faqHeading: string;
  faqs: Faq[]; // service×town only ("Have you done {project} work in {Town}?"); town-level Q&As are on the city hub
  nearbyHeading: string;
  nearby: LinkItem[];
  otherHeading: string;
  otherServices: LinkItem[];
  cityHub: LinkItem; // the ONE up-link to the city hub, under the other-services list (spec §4.3)
  footnote: string;
  updated: { label: string; date: string; iso: string }; // visible "Updated …" (= WebPage dateModified)
  relatedLinks: string[]; // case-study URLs and the city hub linked from the page (WebPage.relatedLink)
  tier: "proof" | "base" | "near" | "mid" | "far";
};

/** Case studies with a known town that document this service, nearest first (with mi/dir from `c`). */
const located = (c: City) => nearestProjects(c, { limit: 99 });
const projectHref = (p: Project) => `/projects/${p.slug}`;

/** One muted proof line per service for a place (the city hub's service list, spec §4.4):
 *  "Case study here" | "Nearest {meta} case study: {town}, {n} mi {dir}" | undefined (no located case study). */
export function proofLineFor(svc: ServiceSlug, c: City): string | undefined {
  const x = located(c).find((p) => p.project.services.includes(svc));
  if (!x) return undefined;
  return x.sameTown ? "Case study here" : `Nearest ${SERVICE_LOCAL[svc].meta} case study: ${cityLabel(x.town)}, ${x.miles} mi ${x.dir}`;
}

/** Each case-study town once, nearest first, linked to its (first) case study (ex "Case studies by distance:"). */
export function caseStudiesNear(c: City): LinkItem[] {
  const seen = new Set<string>();
  return located(c)
    .filter((x) => (seen.has(citySlug(x.town)) ? false : (seen.add(citySlug(x.town)), true)))
    .map((x) => ({ href: projectHref(x.project), label: cityLabel(x.town), meta: x.sameTown ? "here" : `${x.miles} mi ${x.dir}` }));
}

/** Towns of the consented client reviews other than `c`, nearest first, linking /reviews (ex "Client reviews by
 *  distance:"; each review is quoted only on its own town's pages). */
export function reviewTownsNear(c: City): LinkItem[] {
  return [...new Map(TESTIMONIALS.filter((t) => !sameCity(t.town, c)).map((t) => [citySlug(t.town), t.town])).values()]
    .map((t) => ({ t, d: milesBetween(c, t) }))
    .sort((a, b) => a.d - b.d)
    .map(({ t, d }) => ({ href: "/reviews", label: cityLabel(t), meta: `${Math.max(1, Math.round(d))} mi ${dirBetween(c, t)}` }));
}

/** Town-level questions (the same for every service in a place), shown on the city hub as visible text only (no
 *  FAQPage, D7). Wording unchanged from the former service×town pages, plus the Devens question for the three towns
 *  Devens lies in (Ayer, Harvard, Shirley; R16). */
export function townQuestions(c: City): Faq[] {
  const f = townFacts(c);
  const T = c.n;
  const CL = cityLabel(c);
  const TL = placeLabel(c);
  const parent = villageParent(c);
  const twin = twinOf(c);
  const { miles: mi, dir } = f;
  const townJobs = jobsIn(c);
  const [n1, n2] = f.nearest;
  const near2 = `${cityLabel(n1.city)} (${n1.miles} mi ${n1.dir}) and ${cityLabel(n2.city)} (${n2.miles} mi ${n2.dir})`;
  const faqs: Faq[] = [];
  if (f.isBase) faqs.push({ q: "Where exactly are you based?", a: `In Northborough, Massachusetts${site.showStreet ? `, at ${site.street}, Northborough, MA ${site.postalCode}` : ""}. Our service area covers ${serviceArea.short}; the closest places are ${near2}.` });
  else faqs.push({ q: `How far is ${TL} from your base?`, a: `About ${mi} miles ${dir} of Northborough, in a straight line. Nearest places we also serve: ${near2}.` });
  if (townJobs.length) {
    const bySvc = SERVICE_SLUGS.map((x) => [x, townJobs.filter((j) => j.service === x)] as const).filter(([, js]) => js.length);
    faqs.push({ q: `Have you worked in ${CL} before?`, a: `Yes. Our records show ${townJobs.length} completed project${townJobs.length > 1 ? "s" : ""} in ${T}: ${bySvc.map(([x, js]) => `${SERVICE_LOCAL[x].link.toLowerCase()} (${yearsLabel(js)})`).join("; ")}.` });
  }
  if (parent) faqs.push({ q: `Is ${T} part of ${parent.n}?`, a: `Yes. ${T} is a village in the town of ${parent.n}, not a separate municipality, so building permits, zoning and inspections go through the Town of ${parent.n}.` });
  const villages = villagesOf(c);
  if (villages.length) {
    const names = villages.map((v) => v.n).join(" and ");
    faqs.push({ q: `Do you also work in ${names}?`, a: `Yes. ${names} ${villages.length > 1 ? "are villages" : "is a village"} of ${T}, so permits for work there also come from the Town of ${T}.` });
  }
  if (isDevens(c)) faqs.push({ q: "Who issues building permits in Devens?", a: "The Devens Enterprise Commission, which regulates land use and building in the Devens regional enterprise zone, rather than the towns of Ayer, Harvard or Shirley." });
  if (isDevensTown(c)) faqs.push({ q: "Do you also work in Devens?", a: `Yes. Devens, the regional enterprise zone on the former Fort Devens, covers parts of Ayer, Harvard and Shirley; building permits there come from the Devens Enterprise Commission rather than the Town of ${T}.` });
  if (twin) faqs.push({ q: `Do you also serve ${cityLabel(twin)}?`, a: `Yes. ${cityLabel(twin)} is a different place in ${stateName(twin)}, about ${Math.round(milesBetween(c, twin))} miles ${dirBetween(c, twin)} of ${CL}, with its own page.` });
  // NH: answer with New Hampshire rules only (no Massachusetts-only law on NH pages; R11).
  if (isNH(c)) faqs.push({ q: `Is there a state contractor license to check for a project in ${CL}?`, a: `No. New Hampshire has no statewide license or registration for home-improvement contractors, so for work in ${T} ask any contractor for proof of insurance and a written contract, and check with ${permitAuthority(c).text} about permits.` });
  return faqs;
}

/** Everything a service×town page renders, for service `s` in place `c`. */
export function townCopy(s: { slug: string; name: string }, c: City): TownCopy {
  if (!isServiceSlug(s.slug)) throw new Error(`Unknown service ${s.slug}`);
  const svc = s.slug;
  const L = SERVICE_LOCAL[svc];
  const f = townFacts(c);
  const slug = citySlug(c);
  const path = `/services/${svc}/${slug}`;
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
  const far = f.exactMiles > 45;
  const nounShort = L.noun;

  // ----- documented proof, nearest first -----
  const all = located(c); // every case study with a known town
  const forSvc = all.filter((x) => x.project.services.includes(svc));
  const sameP = forSvc.filter((x) => x.sameTown); // case studies for this service in this town
  const np = forSvc.find((x) => !x.sameTown); // nearest one for this service elsewhere
  const sameOther = all.filter((x) => x.sameTown && !x.project.services.includes(svc));
  const anyP = all.find((x) => !x.sameTown);
  // Published work for this service with no town (the bathroom album): mentioned as such, never tied to this place.
  const unlocated = projects.filter((p) => p.services.includes(svc) && !projectTown(p));
  const unlocatedLabel = unlocated.length ? UNLOCATED_LABEL[unlocated[0].slug] ?? `${unlocated[0].category.toLowerCase()} photos` : "";
  const sameR = localTestimonials(c, svc);
  const jobs = jobsIn(c, svc); // owner's completed-job records for this service here (phase 2; empty today)
  const otherR = TESTIMONIALS.filter((t) => sameCity(t.town, c) && !t.services.includes(svc));
  const tier: TownCopy["tier"] = sameP.length || sameR.length || jobs.length ? "proof" : base ? "base" : f.exactMiles <= 15 ? "near" : f.exactMiles <= 35 ? "mid" : "far";
  const pv = (x: ProjectNear) => projectView(x.project, x.town, svc);
  const away = (x: { miles: number; dir: string }) => `about ${x.miles} miles ${x.dir}`;
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  // ----- answer-first summary (§3.5-A): service + place, where it is, the strongest true proof -----
  const offer = base
    ? `Waterfront Construction Inc, an owner-led home remodeling contractor, is based in Northborough${site.showStreet ? `, at ${site.street}` : ""} (${county}), and offers ${L.noun} here in its home town.`
    : `Waterfront Construction Inc, an owner-led home remodeling contractor, offers ${L.noun} in ${TL}.`;
  const where = base ? ""
    : devens ? `Devens, a regional enterprise zone on the former Fort Devens, is about ${mi} miles ${dir} of our Northborough base; building permits there come from the Devens Enterprise Commission.`
    : parent ? `${T} is a village in the town of ${parent.n}, ${county}, about ${mi} miles ${dir} of our Northborough base.`
    : nh ? `${T} is in ${county}, New Hampshire, about ${mi} miles ${dir} of our base in Northborough, Massachusetts${far ? ", near the outer edge of the area we serve" : ""}.`
    : `${T} is in ${county}, about ${mi} miles ${dir} of our Northborough base${f.exactMiles <= 15 ? `, one of ${W15} places we serve within 15 miles` : far ? ", near the outer edge of the area we serve" : ""}.`;
  const jobsSentence = jobs.length ? `Our records show ${jobs.length} completed ${L.project} project${jobs.length > 1 ? "s" : ""} in ${T} (${yearsLabel(jobs)}).` : "";
  const otherLabel = (x: ProjectNear) => projectView(x.project, x.town).label;
  let proofSentence = "";
  if (jobsSentence && !sameP.length) proofSentence = jobsSentence;
  else if (sameP.length === 1) proofSentence = `We have documented work here: our ${pv(sameP[0]).label} in ${T} is published as a case study.`;
  else if (sameP.length > 1) proofSentence = `We have documented work here: ${sameP.length === 2 ? "two" : sameP.length} case studies in ${T}, ${an(pv(sameP[0]).label)} and ${an(pv(sameP[1]).label)}.`;
  else if (sameR.length) proofSentence = "";
  else if (np) proofSentence = `Our closest documented ${L.project} project is in ${cityLabel(np.town)}, ${away(np)}.`;
  else if (unlocated.length && sameOther.length) proofSentence = `Our ${unlocatedLabel} are published without their towns, but our ${otherLabel(sameOther[0])} here in ${T} is documented.`;
  else if (unlocated.length && anyP) proofSentence = `Our ${unlocatedLabel} are published without their towns; the closest project we have documented with a town is ${an(otherLabel(anyP))} in ${cityLabel(anyP.town)}, ${away(anyP)}.`;
  else if (sameOther.length) proofSentence = `We have not published ${an(nounShort)} case study yet, but our ${otherLabel(sameOther[0])} here in ${T} is documented.`;
  else if (anyP) proofSentence = `We have not published ${an(nounShort)} case study yet; the closest project we have documented is ${an(otherLabel(anyP))} in ${cityLabel(anyP.town)}, ${away(anyP)}.`;
  const summary = [offer, where, proofSentence].filter(Boolean).join(" ");
  // Testimonials are quoted verbatim right under the summary (own town + own service only); the
  // Service description carries a plain, non-quoted line instead (never Review markup).
  const quote = sameR.length
    ? { text: sameR[0].text, cite: `${sameR[0].name}, ${cityLabel(sameR[0].town)} · ${sameR[0].date}`, disclosure: "Shared with permission by our client.", reviewsLabel: "Our Google reviews" }
    : undefined;
  const schemaSummary = [offer, where, proofSentence, sameR.length ? `${sameR[0].name}, ${an(`${T} client`)}, shared a review of our ${sameR[0].work}.` : ""].filter(Boolean).join(" ");

  // ----- hero extras -----
  const devensHere = isDevensTown(c) ? allCities.find((x) => citySlug(x) === DEVENS) : undefined;
  const heroNote = twin
    ? { text: `Looking for ${cityLabel(twin)}?`, href: `/services/${svc}/${citySlug(twin)}`, label: `${L.link} in ${cityLabel(twin)}` }
    : parent ? { text: `${T} is part of ${parent.n}.`, href: `/services/${svc}/${citySlug(parent)}`, label: `${L.link} in ${cityLabel(parent)}` }
    : devensHere ? { text: `Parts of ${T} lie in Devens, where building permits come from the Devens Enterprise Commission.`, href: `/services/${svc}/${DEVENS}`, label: `${L.link} in ${cityLabel(devensHere)}` }
    : undefined;
  const heroImage = sameP.length
    ? { src: pv(sameP[0]).photo, alt: pv(sameP[0]).alt, pos: pv(sameP[0]).pos, caption: sameP[0].project.title, href: projectHref(sameP[0].project) }
    : undefined;
  // HIC/CSL only when the numbers are set (never a placeholder; no MA registration chip on NH pages).
  const trust = [!nh && hasHic ? `MA HIC Reg. #${site.hic}` : "", hasCsl ? `MA Construction Supervisor License ${site.csl} (${site.owner})` : "", "Insured"].filter(Boolean);

  // ----- at a glance (§3.5-B; the permit row is service-aware, spec §4.3) -----
  const countyRow = devens ? "Middlesex & Worcester, Massachusetts (former Fort Devens)"
    : parent ? `${county}, Massachusetts (village of ${parent.n})`
    : `${county}, ${stateName(c)}${f.sameCounty > 1 ? ` · ${f.sameCounty} places we serve there` : ""}`;
  const office = permitOffice(c);
  const noPermit = isPaintingService(svc) && !nh;
  const facts: TownCopy["facts"] = [
    { dt: "County", dd: countyRow },
    { dt: "From our base", dd: base ? "Home base" : `About ${mi} miles ${dir}` },
    { dt: "Building permits", dd: permitRow(svc, c), href: noPermit ? undefined : office?.url },
    { dt: "Contractor rules", dd: contractorRuleRow(c) },
    ...(jobs.length ? [{ dt: "Our record here", dd: `${jobs.length} completed ${L.project} project${jobs.length > 1 ? "s" : ""}, ${yearsLabel(jobs)}` }] : []),
  ];

  // ----- proof module (§3.5-C): true captions, real town and distance -----
  const cardFor = (x: ProjectNear, caption: string): Card => {
    const v = pv(x);
    return { href: projectHref(x.project), title: x.project.title, img: v.photo, alt: v.alt, pos: v.pos, caption };
  };
  // Same-town pages: the first card carries the lead photo (heroImage), since the hero now holds the form (V5.3).
  const cards: Card[] = sameP.length ? sameP.slice(0, 2).map((x) => cardFor(x, `Case study in ${CL}`))
    : np ? [cardFor(np, `${np.miles} mi ${np.dir} of ${T}`)]
    : sameOther.length ? [cardFor(sameOther[0], `Case study in ${CL}; ${an(projectView(sameOther[0].project, sameOther[0].town).short)}, not ${nounShort}`)]
    : anyP ? [cardFor(anyP, `${cap(away(anyP))} of ${T}; ${an(projectView(anyP.project, anyP.town).short)}, not ${nounShort}`)]
    : [];
  const also: LinkItem[] = [
    ...sameOther.filter((x) => !cards.some((cd) => cd.href === projectHref(x.project)))
      .map((x) => ({ href: projectHref(x.project), label: `Also in ${T}: our ${projectView(x.project, x.town).short} case study` })),
    // A review of another service from this town: its quote lives on that service's page and on the city hub.
    ...otherR.slice(0, 1).map((t) => ({ href: cityHubPath(c), label: `Also in ${T}: a client review of our ${t.work}` })),
    // The bathroom album is real work with no published town — linked as such, never tied to this place.
    ...(svc === "bathroom-remodeling" ? unlocated.map((p) => ({ href: projectHref(p), label: `Our ${UNLOCATED_LABEL[p.slug] ?? p.shortTitle} (towns not listed)` })) : []),
  ];
  // All our documented work elsewhere, nearest first: every located case study and every client review, each labelled
  // with what it documents (spec §7.2 lever 5). Lead's ruling (option A): all services, not just this one's group —
  // with only four documented places for the outside services, a group-only list left those pages too alike (G1).
  const svcSet = new Set<ServiceSlug>(SERVICE_SLUGS);
  const relCases = all.filter((x) => !x.sameTown && x.project.services.some((y) => svcSet.has(y)));
  const relReviews = TESTIMONIALS.filter((t) => !sameCity(t.town, c) && t.services.some((y) => svcSet.has(y)));
  const byDistance: LinkItem[] = [
    ...relCases.map((x) => ({ d: milesBetween(c, x.town), href: projectHref(x.project), label: `${cityLabel(x.town)}: ${projectView(x.project, x.town).short}`, meta: `${x.miles} mi ${x.dir}` })),
    ...relReviews.map((t) => ({ d: milesBetween(c, t.town), href: "/reviews", label: `${cityLabel(t.town)}: client review of our ${t.work}`, meta: `${Math.max(1, Math.round(milesBetween(c, t.town)))} mi ${dirBetween(c, t.town)}` })),
  ].sort((x, y) => x.d - y.d).map(({ href, label, meta }) => ({ href, label, meta }));
  // Never imply proof of this service where there is none (e.g. no painting job is documented yet, O4).
  const ownProof = relCases.some((x) => x.project.services.includes(svc)) || relReviews.some((t) => t.services.includes(svc));
  const byDistanceLabel = ownProof ? `Our documented ${L.project} and other work, by distance:` : "Our documented work on other services, by distance:";
  const proofHeading = sameP.length ? `Our ${L.noun} work in ${TL}` : np ? `Nearest documented ${L.project} project` : "Nearest documented project";

  // ----- the one service×town question (§4.3): kept only with same-town proof or a review; town-level Q&As are
  // on the city hub (townQuestions). Visible text only, never FAQPage (V4.1). -----
  const faqs: Faq[] = [];
  if (sameP.length) faqs.push({ q: `Have you done ${L.project} work in ${CL}?`, a: sameP.length > 1 ? `Yes. ${sameP.length === 2 ? "Two" : sameP.length} of our case studies are from ${T}: ${sameP.map((x) => `“${x.project.title}”`).join(" and ")}.` : `Yes. Our case study “${sameP[0].project.title}” documents ${an(pv(sameP[0]).label)} in ${T}.` });
  else if (sameR.length) faqs.push({ q: `Have you done ${L.project} work in ${CL}?`, a: `Yes. ${sameR[0].name}, ${an(`${T} client`)}, shared a review of our ${sameR[0].work}; it is quoted on this page with permission.` });

  // ----- links (§3.5-G/H, §3.10; spec §4.2 :315-316, §4.3 up-link) -----
  const nearby: LinkItem[] = f.nearest.map((n) => ({ href: `/services/${svc}/${citySlug(n.city)}`, label: `${L.link} in ${cityLabel(n.city)}`, meta: `${n.miles} mi ${n.dir}` }));
  const otherServices: LinkItem[] = SERVICE_SLUGS.filter((x) => x !== svc).map((x) => ({ href: `/services/${x}/${slug}`, label: SERVICE_LOCAL[x].link }));
  const cityHub: LinkItem = { href: cityHubPath(c), label: `All ${servicesCountWord} services in ${TL}` };

  // ----- metadata (§3.7): unique, true, page-specific; no brand in the title string -----
  const core = `${L.title} in ${TL}`;
  const titleIsAbsolute = core.length + " | Waterfront Construction".length > 60; // drop the brand rather than truncate the place
  const lead: string[] = base
    ? [`${L.title} in Northborough, MA, our home base${site.showStreet ? ` (${site.street})` : ""}.`, sameR.length ? "Read a review from a Northborough client." : ""]
    : sameP.length ? [`${L.title} in ${CL}: see our ${pv(sameP[0]).short} case study from ${T}.`, `${county}, about ${mi} mi ${dir} of our Northborough base.`]
    : sameR.length ? [`${L.title} in ${CL}, about ${mi} mi ${dir} of our Northborough base.`, `Read what ${an(`${T} client`)} said about our ${sameR[0].work}.`]
    : jobs.length ? [`${L.title} in ${CL}: ${jobs.length} completed ${L.meta} project${jobs.length > 1 ? "s" : ""} here (${yearsLabel(jobs)}).`, `${county}, about ${mi} mi ${dir} of our Northborough base.`]
    : parent ? [`${L.title} in ${T} (village of ${parent.n}), MA, about ${mi} mi ${dir} of Northborough.`, `Permits go through the Town of ${parent.n}.`]
    : devens ? [`${L.title} in Devens, MA, about ${mi} mi ${dir} of Northborough.`, "Permits go through the Devens Enterprise Commission."]
    : nh ? [`${L.title} in ${CL} (${county}), about ${mi} mi ${dir} of our Northborough, MA base.`, "NH permits are local."]
    : [`${L.title} in ${CL} (${county}), about ${mi} mi ${dir} of our Northborough base.`];
  const [n1, n2] = f.nearest;
  const extras = [
    !sameP.length && np ? `Nearest ${L.meta} case study: ${cityLabel(np.town)}, ${np.miles} mi.` : "",
    !sameP.length && !np && sameOther.length ? `See our ${projectView(sameOther[0].project, sameOther[0].town).short} case study from ${T}.` : "",
    !sameP.length && !np && !sameOther.length && anyP ? `Nearest case study: ${cityLabel(anyP.town)}, ${anyP.miles} mi.` : "",
    "Free estimates.",
    `Also near ${cityLabel(n1.city)} and ${cityLabel(n2.city)}.`,
  ];
  let description = "";
  for (const part of [...lead, ...extras].filter(Boolean)) {
    const next = description ? `${description} ${part}` : part;
    if (next.length <= 158) description = next;
  }

  // og:image = the nearest service-matched case study's real 1200×630 crop (never stock); else the brand card.
  const ogProject = [...sameP, ...forSvc.filter((x) => !x.sameTown)][0];
  const og = ogProject ? ogFor(`project-${ogProject.project.slug}`, `${ogProject.project.title} — Waterfront Construction`) : OG_IMAGE;

  return {
    path,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: s.name, path: `/services/${svc}` },
      { name: CL, path },
    ],
    title: core,
    titleIsAbsolute,
    description,
    og,
    h1: `${L.h1} in ${TL}`,
    summary,
    schemaSummary,
    quote,
    heroNote,
    heroImage,
    cta: { estimate: "Get a free estimate", phone: site.phone },
    trust,
    glanceHeading: `${TL} at a glance`,
    facts,
    proof: { heading: proofHeading, cards, also, byDistanceLabel, byDistance },
    rulesHeading: `Permits and rules in ${TL}`,
    rules: rulesParagraph(svc, c),
    scopeLabel: "What's included",
    scope: L.scope,
    hubLink: { href: `/services/${svc}`, label: `Costs and timelines: our ${nounShort} guide` },
    guideLinks: nh ? [] : (COST_GUIDES[svc] ?? []).map((g) => getPost(g)).filter((p): p is NonNullable<typeof p> => Boolean(p)).map((p) => ({ href: `/blog/${p.slug}`, label: p.title })),
    faqHeading: "Questions",
    faqs,
    nearbyHeading: "Nearby places we serve",
    nearby,
    otherHeading: `Other services in ${TL}`,
    otherServices,
    cityHub,
    footnote: "Distances: straight line, GeoNames data (CC BY 4.0).",
    updated: { label: "Updated", date: TOWN_PAGES_UPDATED_LABEL, iso: TOWN_PAGES_UPDATED },
    relatedLinks: [...new Set([...cards.map((x) => x.href), ...also.filter((x) => x.href.startsWith("/projects/")).map((x) => x.href), cityHub.href])],
    tier,
  };
}

/** The visible text of a town page's <main>, in DOM order — must mirror app/services/[slug]/[city]/page.tsx
 *  (the mid-page FormBand and the CtaRows are template chrome and left out, as scripts/check-town-pages.mjs does).
 *  Not rendered: it lets the 5-gram similarity of all 2,010 pages be measured from source without a build
 *  (same tokenizer and town-name swap as scripts/check-town-pages.mjs, which checks the built HTML). */
export function townPageText(k: TownCopy): string {
  const parts: string[] = [
    ...k.crumbs.map((x) => x.name),
    k.h1, k.summary,
    ...(k.heroNote ? [k.heroNote.text, k.heroNote.label] : []),
    k.cta.estimate, k.cta.phone, ...k.trust,
    ...(k.quote ? [k.quote.text, k.quote.cite, k.quote.disclosure, k.quote.reviewsLabel] : []),
    k.glanceHeading, ...k.facts.flatMap((x) => [x.dt, x.dd]),
    k.proof.heading,
    ...k.proof.cards.flatMap((x) => [x.title, x.caption]),
    ...k.proof.also.map((x) => x.label),
    ...(k.proof.byDistance.length ? [k.proof.byDistanceLabel, ...k.proof.byDistance.flatMap((x) => [x.label, x.meta ?? ""])] : []),
    k.rulesHeading, k.rules,
    k.scopeLabel, ...k.scope, k.hubLink.label, ...k.guideLinks.map((x) => x.label),
    ...(k.faqs.length ? [k.faqHeading, ...k.faqs.flatMap((x) => [x.q, x.a])] : []),
    k.nearbyHeading, ...k.nearby.flatMap((x) => [x.label, x.meta ?? ""]),
    k.otherHeading, ...k.otherServices.map((x) => x.label), k.cityHub.label,
    k.footnote, k.updated.label, k.updated.date,
  ];
  return parts.filter(Boolean).join(" ");
}
