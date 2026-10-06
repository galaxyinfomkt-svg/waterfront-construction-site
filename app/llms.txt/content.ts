// Shared builders for /llms.txt and /llms-full.txt (audit 09 AEO-M1, 07 T13, 01 M5).
//
// Both files are generated from the same data modules as the pages (lib/site.ts, lib/services.ts,
// lib/towns.ts, lib/projects.ts, lib/posts.ts, lib/faq.ts), so they can never contradict the site.
// Rules: every statement here must also be visible on the website; credentials appear only once their
// numbers are set in lib/site.ts (never a placeholder, never the word "licensed" before that); no ratings;
// counts are computed. llms.txt is a convenience for AI tools, not a ranking factor — do not market it as one.
import { SITE_URL } from "@/lib/seo";
import { site, services, allCities, citySlug, cityLabel, testimonials, serviceArea, type City } from "@/lib/site";
import { servicesCountWord } from "@/lib/services";
import { hasHic, hasCsl } from "@/lib/credentials";
import { AREA_FACTS } from "@/lib/schema";
import { townFacts, VILLAGE_OF, DEVENS, TOWN_PAGES_UPDATED, CITY_HUBS_UPDATED, cityHubPath } from "@/lib/towns";
import { projects } from "@/lib/projects";
import { posts } from "@/lib/posts";

/** Last time a fact typed in this file (or a business fact in lib/site.ts) changed. The "Last updated"
 *  line shows the newest of this date and the content dates of the services, guides, case studies and
 *  town pages. Bump it by hand ONLY when one of those facts changes. */
const LLMS_FACTS_UPDATED = "2026-10-05T10:28:17-04:00";

// ---------- formatting ----------
/** Absolute URL for a site path ("/" → the home page). */
export const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path === "/" ? "/" : path}`);
/** Markdown link with an absolute URL. */
export const link = (label: string, path: string) => `[${label.replace(/[[\]]/g, "")}](${abs(path)})`;
/** Rewrites the site's inline markdown links ([label](/path) or [label](#anchor)) to absolute URLs. */
export const absLinks = (text: string, pagePath: string) =>
  text.replace(/\]\((\/[^)\s]*|#[^)\s]*)\)/g, (_, target: string) => `](${target.startsWith("#") ? abs(pagePath) + target : abs(target)})`);
/** "A, B and C". */
export const list = (xs: string[]) => (xs.length < 3 ? xs.join(" and ") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

const isoDay = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" });
/** ISO 8601 calendar date (America/New_York) of an ISO timestamp, e.g. "2026-10-05". */
export const day = (iso: string) => isoDay.format(new Date(iso));

/** Newest content date behind these files, as an ISO calendar date. */
export function lastUpdated(): string {
  const dates = [LLMS_FACTS_UPDATED, TOWN_PAGES_UPDATED, CITY_HUBS_UPDATED, ...services.map((s) => s.updated), ...posts.map((p) => p.modified), ...projects.map((p) => p.updated)];
  return day(dates.reduce((a, b) => (Date.parse(b) > Date.parse(a) ? b : a)));
}

export function textResponse(body: string) {
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}

// ---------- entity ----------
/** The entity paragraph: the same sentences as the home page lead (app/page.tsx). */
export const ENTITY = `${site.name} is an owner-led home remodeling contractor based in Northborough, Massachusetts. ${site.owner} founded the company in ${site.founded} and has ${site.experience}+ years of hands-on construction experience. We remodel kitchens and bathrooms, build home additions and decks, replace siding, windows and doors, and paint interiors and exteriors for homeowners across ${serviceArea.short}.`;

/** The brand name is also a generic industry term; say which entity this is. */
export const NAME_NOTE = `About the name: "waterfront construction" is also a general term for marine work such as docks, piers and seawalls. This file is about ${site.name}, the home remodeling contractor in Northborough, Massachusetts, whose website is ${SITE_URL}.`;

const VILLAGES = allCities.filter((c) => VILLAGE_OF[citySlug(c)]).length;
const HAS_DEVENS = allCities.some((c) => citySlug(c) === DEVENS);
/** Same sentence as /service-areas and /faq: "{n} cities and towns, plus {v} villages and Devens, across {k} counties…" (all computed). */
export const AREA_SENTENCE = `We take projects in ${AREA_FACTS.municipalities} cities and towns, plus ${VILLAGES} villages${HAS_DEVENS ? " and Devens" : ""}, across ${AREA_FACTS.counties} counties in Massachusetts and southern New Hampshire.`;

export function keyFacts(): string[] {
  const address = site.showStreet ? site.address : `${site.locality}, ${site.region} ${site.postalCode}`;
  return [
    `- Business name: ${site.name}`,
    "- What it is: an owner-led home remodeling contractor (kitchens and bathrooms, home additions, decks, siding, windows and doors, interior and exterior painting)",
    `- Owner: ${link(site.owner, "/about/ernando-nunes")}, who founded the company in ${site.founded} and has ${site.experience}+ years of hands-on construction experience`,
    `- Based in: ${serviceArea.base}`,
    `- Address: ${address}`,
    `- Phone: ${site.phone}`,
    `- Email: ${site.email}`,
    `- Hours: ${site.hours}`,
    `- Track record: ${site.projectsCompleted}+ projects completed, in ${site.townsWithProjects}+ towns`,
    // Credentials render only once the numbers are set in lib/site.ts (M.G.L. c.142A §17; owner decision 3).
    ...(hasHic ? [`- Massachusetts Home Improvement Contractor registration: #${site.hic}`] : []),
    ...(hasCsl ? [`- Massachusetts Construction Supervisor License: ${site.csl}, held by ${site.owner}`] : []),
    "- Insurance: insured; a certificate of insurance is provided on request",
    `- Estimates: free, with no obligation (${link("request an estimate", "/contact#estimate")})`,
    "- Financing: not offered",
  ];
}

// ---------- service area, by county ----------
type CountyGroup = { id: string; county: string; state: "MA" | "NH"; towns: City[]; min: number; max: number };
const stateOf = (c: City) => (c.s === "NH" ? "NH" : "MA") as "MA" | "NH";
/** Counties as on /service-areas: Massachusetts first, larger counties first. `id` = the county anchor there. */
export function countyGroups(): CountyGroup[] {
  const map = new Map<string, CountyGroup>();
  for (const c of allCities) {
    const f = townFacts(c);
    const state = stateOf(c);
    const id = `${f.county.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
    if (!map.has(id)) map.set(id, { id, county: f.county, state, towns: [], min: Infinity, max: 0 });
    const g = map.get(id)!;
    g.towns.push(c);
    g.min = Math.min(g.min, f.miles);
    g.max = Math.max(g.max, f.miles);
  }
  return [...map.values()]
    .map((g) => ({ ...g, towns: [...g.towns].sort((a, b) => a.n.localeCompare(b.n, "en-US")) }))
    .sort((a, b) => (a.state === b.state ? b.towns.length - a.towns.length || a.county.localeCompare(b.county) : a.state === "MA" ? -1 : 1));
}
const townName = (c: City) => (VILLAGE_OF[citySlug(c)] ? `${c.n} (village of ${VILLAGE_OF[citySlug(c)]})` : c.n);

/** The example city hub named in the URL pattern line (a real, built page). */
const EXAMPLE_HUB: City = allCities.find((c) => citySlug(c) === "shrewsbury") ?? allCities[0];

export function serviceAreaLines(): string[] {
  return [
    `${AREA_SENTENCE} Distances are straight-line miles from Northborough, town center to town center.`,
    "",
    ...countyGroups().map((g) => {
      const range = g.min === g.max ? `${g.min} miles` : `${g.min}–${g.max} miles`;
      const places = `${g.towns.length} ${g.towns.length === 1 ? "place" : "places"}`;
      return `- ${link(`${g.county}, ${g.state}`, `/service-areas#${g.id}`)}: ${places}, ${range} from Northborough: ${g.towns.map(townName).join(", ")}`;
    }),
    `- ${link("Every town we serve, by county, with distances", "/service-areas")}`,
    // Relative patterns in code formatting, never a bare absolute URL: crawlers auto-link and fetch it (404; V2.4).
    `- Each town also has a page listing all ${servicesCountWord} services: \`/service-areas/<town>\` (for example ${link(cityLabel(EXAMPLE_HUB), cityHubPath(EXAMPLE_HUB))}).`,
    `- Each service has a page per town at \`/services/<service>/<town>\` (for example ${link("decks in Salem, NH", "/services/decks/salem-nh")}). New Hampshire town addresses end in "-nh".`,
  ];
}

// ---------- reviews ----------
/** "6 testimonials that clients shared with permission, from Shrewsbury, …, MA" (towns as written on /reviews). */
export function testimonialsLine(): string {
  const towns = [...new Set(testimonials.map((t) => t.town))];
  const states = [...new Set(towns.map((t) => t.split(", ").pop()))];
  const places = states.length === 1 ? `${list(towns.map((t) => t.replace(/, (MA|NH)$/, "")))}, ${states[0]}` : list(towns);
  return `${testimonials.length} testimonials that clients shared with permission, quoted as written, from ${places}`;
}
