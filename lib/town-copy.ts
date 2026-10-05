// townCopy(): every string on a service×town page (/services/{service}/{town}), built ONLY from
// verifiable data — town geodata (lib/towns.ts), state × service rules (lib/local-rules.ts),
// documented case studies (lib/projects.ts) and the owner-confirmed testimonials (lib/site.ts).
// No rotation, no synonyms, no per-town claims without a record (audit 03 §3.1). Variation comes
// only from data: county, distance and direction, permit authority, village/Devens/twin/NH status,
// the nearest real case studies and the 8 true nearest served places.
//
// Pure and framework-free so it can be measured outside Next.js (see the similarity check).
import { site, allCities, cityLabel, citySlug, serviceArea, testimonials, type City, type Faq } from "./site";
import { projects, projectImages, type Project } from "./projects";
import {
  townFacts, nearestProjects, villageParent, villagesOf, twinOf, placeLabel, countyLabel, isNH, isDevens,
  milesBetween, dirBetween, placesWithin, jobsIn, permitOffice, TOWN_PAGES_UPDATED, type ProjectNear, type Job,
} from "./towns";
import {
  SERVICE_LOCAL, SERVICE_SLUGS, permitAuthority, authorityLabel, rulesParagraph, contractorRuleRow, isServiceSlug, type ServiceSlug,
} from "./local-rules";
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
      "windows-and-doors": { label: "home addition and exterior remodel with new windows", photo: `${IMG}home-addition-exterior-lynnfield-ma-18.webp`, alt: "Three new arched black windows and white siding on a home addition in Lynnfield, MA", pos: "50% 60%" },
    },
  },
  "home-addition-framing-lynnfield-ma": {
    label: "home addition filmed while it was framed and sheathed", short: "addition framing video",
    photo: `${IMG}home-addition-lynnfield-ma-03.webp`, alt: "Home addition framing and sheathing in winter in Lynnfield, MA",
  },
};
// Project OG crops not used on town pages: public/og/project-home-addition-needham-ma.jpg shows the
// client's house number beside the door (owner decision: no street addresses) — re-crop before re-enabling.
const OG_HOLD = new Set<string>(); // all project OG crops are safe to publish

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
// ---------- testimonials (owner-confirmed real; verbatim; never marked up as Review) ----------
// Which services each one is about, read from its own words. Owner to confirm the mapping (audit 03 §5).
const TESTIMONIAL_META: Record<string, { services: ServiceSlug[]; work: string }> = {
  "Karen M.": { services: ["kitchen-bathroom-remodeling"], work: "kitchen and bathroom remodel" },
  "Dave R.": { services: ["siding", "windows-and-doors"], work: "new siding and windows" },
  "Priya S.": { services: ["decks", "home-additions-remodeling"], work: "deck and small addition" },
  "Tom & Lisa B.": { services: ["home-additions-remodeling"], work: "first-floor remodel" },
  "Rafael C.": { services: ["kitchen-bathroom-remodeling"], work: "bathroom remodel" },
  "Susan D.": { services: ["kitchen-bathroom-remodeling"], work: "kitchen remodel" },
};
type LocalTestimonial = { name: string; town: City; date: string; text: string; services: ServiceSlug[]; work: string };
const TESTIMONIALS: LocalTestimonial[] = testimonials.flatMap((t) => {
  const m = t.town.match(/^(.+), (MA|NH)$/);
  const meta = TESTIMONIAL_META[t.name];
  if (!m || !meta) return [];
  const town = allCities.find((c) => c.n === m[1] && (c.s ?? "MA") === m[2]);
  return town ? [{ name: t.name, town, date: t.date, text: t.text, services: meta.services, work: meta.work }] : [];
});

/** Testimonials for this town and service (shown only on their own town's pages). */
export function localTestimonials(c: City, svc: ServiceSlug) {
  return TESTIMONIALS.filter((t) => t.town === c && t.services.includes(svc));
}

// ---------- helpers ----------
const W15 = placesWithin(15);
const DATE_FMT = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
export const TOWN_PAGES_UPDATED_LABEL = DATE_FMT.format(new Date(TOWN_PAGES_UPDATED));
// Cost guides on the blog, by service (painting has none yet).
const COST_GUIDES: Record<string, string[]> = {
  "kitchen-bathroom-remodeling": ["kitchen-remodel-cost-massachusetts", "bathroom-remodel-cost-massachusetts"],
  siding: ["siding-replacement-cost-massachusetts"],
  "windows-and-doors": ["window-replacement-cost-massachusetts"],
  decks: ["deck-cost-massachusetts"],
  "home-additions-remodeling": ["home-addition-cost-massachusetts"],
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
  heroImage?: { src: string; alt: string; pos?: string; caption: string; href: string };
  cta: { estimate: string; phone: string };
  trust: string[];
  glanceHeading: string;
  facts: { dt: string; dd: string; href?: string }[]; // href = a person-verified official page (phase 2)
  proof: {
    heading: string;
    cards: Card[];
    also: LinkItem[];
    caseStudiesLabel: string;
    caseStudies: LinkItem[];
    reviewsLabel: string;
    reviewTowns: LinkItem[];
  };
  estimate: { heading: string };
  rulesHeading: string;
  rules: string;
  scopeLabel: string;
  scope: string[];
  hubLink: LinkItem;
  guideLinks: LinkItem[]; // Massachusetts cost guides for this service (MA pages only — the guides cite MA law)
  faqHeading: string;
  faqs: Faq[];
  nearbyHeading: string;
  nearby: LinkItem[];
  otherHeading: string;
  otherServices: LinkItem[];
  footnote: string;
  updated: { label: string; date: string; iso: string }; // visible "Updated …" (= WebPage dateModified)
  relatedLinks: string[]; // case-study URLs linked from the page (WebPage.relatedLink)
  tier: "proof" | "base" | "near" | "mid" | "far";
};

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
  const nounShort = L.noun.replace(/^interior and exterior /, "");

  // ----- documented proof, nearest first -----
  const located = nearestProjects(c, { limit: 99 }); // every case study with a known town
  const forSvc = located.filter((x) => x.project.services.includes(svc));
  const sameP = forSvc.filter((x) => x.sameTown); // case studies for this service in this town
  const np = forSvc.find((x) => !x.sameTown); // nearest one for this service elsewhere
  const sameOther = located.filter((x) => x.sameTown && !x.project.services.includes(svc));
  const anyP = located.find((x) => !x.sameTown);
  const sameR = localTestimonials(c, svc);
  const jobs = jobsIn(c, svc); // owner's completed-job records for this service here (phase 2; empty today)
  const townJobs = jobsIn(c);
  const otherR = TESTIMONIALS.filter((t) => t.town === c && !t.services.includes(svc));
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
  let proofSentence = "";
  if (jobsSentence && !sameP.length) proofSentence = jobsSentence;
  else if (sameP.length === 1) proofSentence = `We have documented work here: our ${pv(sameP[0]).label} in ${T} is published as a case study.`;
  else if (sameP.length > 1) proofSentence = `We have documented work here: ${sameP.length === 2 ? "two" : sameP.length} case studies in ${T}, ${an(pv(sameP[0]).label)} and ${an(pv(sameP[1]).label)}.`;
  else if (sameR.length) proofSentence = "";
  else if (np) proofSentence = `Our closest documented ${L.project} project is in ${cityLabel(np.town)}, ${away(np)}.`;
  else if (sameOther.length) proofSentence = `We have not published ${an(nounShort)} case study yet, but our ${projectView(sameOther[0].project, sameOther[0].town).label} here in ${T} is documented.`;
  else if (anyP) proofSentence = `We have not published ${an(nounShort)} case study yet; the closest project we have documented is ${an(projectView(anyP.project, anyP.town).label)} in ${cityLabel(anyP.town)}, ${away(anyP)}.`;
  const summary = [offer, where, proofSentence].filter(Boolean).join(" ");
  // Testimonials are quoted verbatim right under the summary (own town + own service only); the
  // Service description carries a plain, non-quoted line instead (never Review markup).
  const quote = sameR.length
    ? { text: sameR[0].text, cite: `${sameR[0].name}, ${cityLabel(sameR[0].town)} · ${sameR[0].date}`, disclosure: "Shared with permission by our client.", reviewsLabel: "Our Google reviews" }
    : undefined;
  const schemaSummary = [offer, where, proofSentence, sameR.length ? `${sameR[0].name}, ${an(`${T} client`)}, shared a review of our ${sameR[0].work}.` : ""].filter(Boolean).join(" ");

  // ----- hero extras -----
  const heroNote = twin
    ? { text: `Looking for ${cityLabel(twin)}?`, href: `/services/${svc}/${citySlug(twin)}`, label: `${L.link} in ${cityLabel(twin)}` }
    : parent ? { text: `${T} is part of ${parent.n}.`, href: `/services/${svc}/${citySlug(parent)}`, label: `${L.link} in ${cityLabel(parent)}` }
    : undefined;
  const heroImage = sameP.length
    ? { src: pv(sameP[0]).photo, alt: pv(sameP[0]).alt, pos: pv(sameP[0]).pos, caption: `From our case study: ${sameP[0].project.title}`, href: `/projects/${sameP[0].project.slug}` }
    : undefined;
  // HIC/CSL only when the numbers are set (never a placeholder; no MA registration chip on NH pages).
  const trust = [!nh && hasHic ? `MA HIC Reg. #${site.hic}` : "", hasCsl ? `MA Construction Supervisor License ${site.csl} (${site.owner})` : "", "Insured"].filter(Boolean);

  // ----- at a glance (§3.5-B) -----
  const countyRow = devens ? "Middlesex & Worcester, Massachusetts (former Fort Devens)"
    : parent ? `${county}, Massachusetts (village of ${parent.n})`
    : `${county}, ${stateName(c)}${f.sameCounty > 1 ? ` · ${f.sameCounty} places we serve there` : ""}`;
  const office = permitOffice(c);
  const facts: TownCopy["facts"] = [
    { dt: "County", dd: countyRow },
    { dt: "From our base", dd: base ? "Home base" : `About ${mi} miles ${dir}` },
    { dt: "Building permits", dd: authorityLabel(c), href: office?.url },
    { dt: "Contractor rules", dd: contractorRuleRow(c) },
    ...(jobs.length ? [{ dt: "Our record here", dd: `${jobs.length} completed ${L.project} project${jobs.length > 1 ? "s" : ""}, ${yearsLabel(jobs)}` }] : []),
  ];

  // ----- proof module (§3.5-C): true captions, real town and distance -----
  const cardFor = (x: ProjectNear, caption: string): Card => {
    const v = pv(x);
    return { href: `/projects/${x.project.slug}`, title: x.project.title, img: v.photo, alt: v.alt, pos: v.pos, caption };
  };
  // On same-town pages the hero already shows the first case study's photo → that card is text-only.
  const cards: Card[] = sameP.length ? sameP.slice(0, 2).map((x, i) => (i === 0 ? { ...cardFor(x, `Case study in ${CL}`), img: undefined, alt: undefined, pos: undefined } : cardFor(x, `Case study in ${CL}`)))
    : np ? [cardFor(np, `${np.miles} mi ${np.dir} of ${T}`)]
    : sameOther.length ? [cardFor(sameOther[0], `Case study in ${CL}; ${an(projectView(sameOther[0].project, sameOther[0].town).short)}, not ${nounShort}`)]
    : anyP ? [cardFor(anyP, `${cap(away(anyP))} of ${T}; ${an(projectView(anyP.project, anyP.town).short)}, not ${nounShort}`)]
    : [];
  const also: LinkItem[] = [
    ...sameOther.filter((x) => !cards.some((cd) => cd.href === `/projects/${x.project.slug}`))
      .map((x) => ({ href: `/projects/${x.project.slug}`, label: `Also in ${T}: our ${projectView(x.project, x.town).short} case study` })),
    ...otherR.map((t) => ({ href: `/services/${t.services[0]}/${slug}`, label: `Also in ${T}: a client review of our ${t.work}` })),
    // The bathroom album is real work with no published town — linked as such, never tied to this place.
    ...(svc === "kitchen-bathroom-remodeling" && projects.some((p) => p.slug === "bathroom-remodels")
      ? [{ href: "/projects/bathroom-remodels", label: "Our bathroom remodel photos (towns not listed)" }] : []),
  ];
  // Each case-study town once, nearest first, linked to its (first) case study.
  const seenTowns = new Set<string>();
  const caseStudies: LinkItem[] = located.filter((x) => (seenTowns.has(citySlug(x.town)) ? false : (seenTowns.add(citySlug(x.town)), true))).map((x) => ({
    href: `/projects/${x.project.slug}`,
    label: cityLabel(x.town),
    meta: x.sameTown ? "here" : `${x.miles} mi ${x.dir}`,
  }));
  // Towns of the consented client reviews, nearest first (not quoted here — each is quoted only on
  // its own town's pages; this line links to /reviews).
  const reviewTowns: LinkItem[] = [...new Map(TESTIMONIALS.filter((t) => t.town !== c).map((t) => [citySlug(t.town), t.town])).values()]
    .map((t) => ({ t, d: milesBetween(c, t) }))
    .sort((a, b) => a.d - b.d)
    .map(({ t, d }) => ({ href: "/reviews", label: cityLabel(t), meta: `${Math.max(1, Math.round(d))} mi ${dirBetween(c, t)}` }));
  const proofHeading = sameP.length ? `Our ${L.noun} work in ${TL}` : np ? `Nearest documented ${L.project} project` : "Nearest documented project";

  // ----- questions (§3.5-F): only ones whose answer is specific to this page -----
  const [n1, n2] = f.nearest;
  const near2 = `${cityLabel(n1.city)} (${n1.miles} mi ${n1.dir}) and ${cityLabel(n2.city)} (${n2.miles} mi ${n2.dir})`;
  const faqs: Faq[] = [];
  if (base) faqs.push({ q: "Where exactly are you based?", a: `In Northborough, Massachusetts${site.showStreet ? `, at ${site.street}, Northborough, MA ${site.postalCode}` : ""}. Our service area covers ${serviceArea.short}; the closest places are ${near2}.` });
  else faqs.push({ q: `How far is ${TL} from your base?`, a: `About ${mi} miles ${dir} of Northborough, in a straight line. Nearest places we also serve: ${near2}.` });
  if (townJobs.length) {
    const bySvc = SERVICE_SLUGS.map((x) => [x, townJobs.filter((j) => j.service === x)] as const).filter(([, js]) => js.length);
    faqs.push({ q: `Have you worked in ${CL} before?`, a: `Yes. Our records show ${townJobs.length} completed project${townJobs.length > 1 ? "s" : ""} in ${T}: ${bySvc.map(([x, js]) => `${SERVICE_LOCAL[x].link.toLowerCase()} (${yearsLabel(js)})`).join("; ")}.` });
  }
  if (sameP.length) faqs.push({ q: `Have you done ${L.project} work in ${CL}?`, a: sameP.length > 1 ? `Yes. ${sameP.length === 2 ? "Two" : sameP.length} of our case studies are from ${T}: ${sameP.map((x) => `“${x.project.title}”`).join(" and ")}.` : `Yes. Our case study “${sameP[0].project.title}” documents ${an(pv(sameP[0]).label)} in ${T}.` });
  else if (sameR.length) faqs.push({ q: `Have you done ${L.project} work in ${CL}?`, a: `Yes. ${sameR[0].name}, ${an(`${T} client`)}, shared a review of our ${sameR[0].work}; it is quoted on this page with permission.` });
  if (parent) faqs.push({ q: `Is ${T} part of ${parent.n}?`, a: `Yes. ${T} is a village in the town of ${parent.n}, not a separate municipality, so building permits, zoning and inspections go through the Town of ${parent.n}.` });
  const villages = villagesOf(c);
  if (villages.length) {
    const names = villages.map((v) => v.n).join(" and ");
    faqs.push({ q: `Do you also work in ${names}?`, a: `Yes. ${names} ${villages.length > 1 ? "are villages" : "is a village"} of ${T}, so permits for work there also come from the Town of ${T}.` });
  }
  if (devens) faqs.push({ q: "Who issues building permits in Devens?", a: "The Devens Enterprise Commission, which regulates land use and building in the Devens regional enterprise zone, rather than the towns of Ayer, Harvard or Shirley." });
  if (twin) faqs.push({ q: `Do you also serve ${cityLabel(twin)}?`, a: `Yes. ${cityLabel(twin)} is a different place in ${stateName(twin)}, about ${Math.round(milesBetween(c, twin))} miles ${dirBetween(c, twin)} of ${CL}, with its own page.` });
  // NH: answer with New Hampshire rules only (no Massachusetts-only law on NH pages).
  if (nh) faqs.push({ q: `Is there a state contractor license to check for a project in ${CL}?`, a: `No. New Hampshire has no statewide license or registration for home-improvement contractors, so for work in ${T} ask any contractor for proof of insurance and a written contract, and check with ${permitAuthority(c).text} about permits.` });

  // ----- links (§3.5-G/H, §3.10) -----
  const nearby: LinkItem[] = f.nearest.map((n) => ({ href: `/services/${svc}/${citySlug(n.city)}`, label: cityLabel(n.city), meta: `${n.miles} mi ${n.dir}` }));
  const otherServices: LinkItem[] = SERVICE_SLUGS.filter((x) => x !== svc).map((x) => ({ href: `/services/${x}/${slug}`, label: SERVICE_LOCAL[x].link }));

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
  const ogProject = [...sameP, ...forSvc.filter((x) => !x.sameTown)].find((x) => !OG_HOLD.has(x.project.slug));
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
    proof: { heading: proofHeading, cards, also, caseStudiesLabel: "Case studies by distance:", caseStudies, reviewsLabel: "Client reviews by distance:", reviewTowns },
    estimate: { heading: "Request a free estimate" },
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
    footnote: "Distances: straight line, GeoNames data (CC BY 4.0).",
    updated: { label: "Updated", date: TOWN_PAGES_UPDATED_LABEL, iso: TOWN_PAGES_UPDATED },
    relatedLinks: [...new Set([...cards.map((x) => x.href), ...also.filter((x) => x.href.startsWith("/projects/")).map((x) => x.href)])],
    tier,
  };
}

/** Images actually shown on a town page (hero + proof cards) — for the sitemap's image entries (audit 03 M3). */
export function townPageImages(s: { slug: string; name: string }, c: City): string[] {
  const k = townCopy(s, c);
  return [...new Set([k.heroImage?.src, ...k.proof.cards.map((x) => x.img)].filter((x): x is string => Boolean(x)))];
}

/** The visible text of a town page's <main>, in DOM order — must mirror app/services/[slug]/[city]/page.tsx.
 *  Used by the similarity check (scratchpad impl-city/measure.mjs); not rendered. */
export function townPageText(k: TownCopy): string {
  const parts: string[] = [
    ...k.crumbs.map((x) => x.name),
    k.h1, k.summary,
    ...(k.quote ? [k.quote.text, k.quote.cite, k.quote.disclosure, k.quote.reviewsLabel] : []),
    ...(k.heroNote ? [k.heroNote.text, k.heroNote.label] : []),
    k.cta.estimate, k.cta.phone, ...k.trust,
    ...(k.heroImage ? [k.heroImage.caption] : []),
    k.glanceHeading, ...k.facts.flatMap((x) => [x.dt, x.dd]),
    k.proof.heading,
    ...k.proof.cards.flatMap((x) => [x.title, x.caption]),
    ...k.proof.also.map((x) => x.label),
    k.proof.caseStudiesLabel, ...k.proof.caseStudies.flatMap((x) => [x.label, x.meta ?? ""]),
    k.proof.reviewsLabel, ...k.proof.reviewTowns.flatMap((x) => [x.label, x.meta ?? ""]),
    k.estimate.heading,
    k.rulesHeading, k.rules,
    k.scopeLabel, ...k.scope, k.hubLink.label,
    ...(k.faqs.length ? [k.faqHeading, ...k.faqs.flatMap((x) => [x.q, x.a])] : []),
    k.nearbyHeading, ...k.nearby.flatMap((x) => [x.label, x.meta ?? ""]),
    k.otherHeading, ...k.otherServices.map((x) => x.label),
    k.footnote, k.updated.label, k.updated.date,
  ];
  return parts.filter(Boolean).join(" ");
}
