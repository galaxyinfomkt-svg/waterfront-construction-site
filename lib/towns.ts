// Computed, verifiable facts about each served town — used to make every service×town page
// genuinely specific without inventing anything. All distances are straight-line, town center
// to town center (GeoNames populated-place points, see lib/town-geo.ts), rounded and labelled "about".
import { allCities, citySlug, cityLabel, type City } from "./site";
import { TOWN_GEO } from "./town-geo";
import { projects, type Project } from "./projects";
import { POSITIONING_UPDATE, type ServiceSlug } from "./services";

/** Date the service×town template and its data last changed substantively (sitemap lastModified,
 *  WebPage dateModified and the visible "Page updated" line). Bump ONLY on a substantive change. */
export const TOWN_PAGES_UPDATED = POSITIONING_UPDATE;
/** Date the city hubs (/service-areas/{town}) last changed substantively — same rule as TOWN_PAGES_UPDATED. */
export const CITY_HUBS_UPDATED = POSITIONING_UPDATE;
/** The city hub of a served place. Every package builds the path with this; nobody hand-types it. */
export const cityHubPath = (c: City) => `/service-areas/${citySlug(c)}`;

const BASE = { lat: 42.3195, lng: -71.6412 }; // Northborough town center (GeoNames populated place = lib/town-geo.ts)
type LatLng = { lat: number; lng: number };

const toRad = (d: number) => (d * Math.PI) / 180;
function miles(a: LatLng, b: LatLng) {
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function bearing(a: LatLng, b: LatLng) {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"][Math.round(deg / 45) % 8];
}

// Villages that are not municipalities — building permits are issued by the parent town.
// Values are the parent town's NAME (lib/schema.ts reads them); villageParent() returns the City.
// [verify R15: town websites / MA municipal list]
export const VILLAGE_OF: Record<string, string> = {
  whitinsville: "Northbridge",
  "cherry-valley": "Leicester",
  rochdale: "Leicester",
  jefferson: "Holden",
  fiskdale: "Sturbridge",
  baldwinville: "Templeton",
  "still-river": "Harvard",
};
// Devens is a regional enterprise zone (parts of Ayer, Harvard and Shirley) with its own
// permitting authority, the Devens Enterprise Commission. [verify R16: devensec.com]
export const DEVENS = "devens";
/** The towns Devens was carved from (all three are served places). Names, like VILLAGE_OF. */
export const DEVENS_TOWNS = ["Ayer", "Harvard", "Shirley"] as const;

// Easily-confused pairs (always disambiguated): the same name in MA and NH, plus Manchester NH ⇄
// Manchester-by-the-Sea MA.
const TWIN_OF: Record<string, string> = {
  salem: "salem-nh", "salem-nh": "salem",
  hudson: "hudson-nh", "hudson-nh": "hudson",
  bedford: "bedford-nh", "bedford-nh": "bedford",
  "manchester-by-the-sea": "manchester-nh", "manchester-nh": "manchester-by-the-sea",
};

const BY_SLUG: Record<string, City> = Object.fromEntries(allCities.map((c) => [citySlug(c), c]));
/** Same served place? Always compare by slug, never by object identity: callers (e.g. lib/posts.ts) may pass
 *  their own City objects, which must not become their own neighbour or poison the townFacts cache (V4.8). */
export const sameCity = (a: City, b: City) => citySlug(a) === citySlug(b);
export const isNH = (c: City) => c.s === "NH";
export const isDevens = (c: City) => citySlug(c) === DEVENS;
/** Ayer, Harvard and Shirley (the served towns that Devens lies in), in that order; [] for any other place. */
export const devensTowns = (c: City): City[] =>
  isDevens(c) ? DEVENS_TOWNS.map((n) => allCities.find((x) => x.n === n && !x.s)).filter((x): x is City => Boolean(x)) : [];
/** Is this one of the towns Devens was carved from? (Its building permits still come from the town itself.) */
export const isDevensTown = (c: City) => !c.s && (DEVENS_TOWNS as readonly string[]).includes(c.n);
/** Parent town of a village (Whitinsville → Northbridge), else undefined. */
export function villageParent(c: City): City | undefined {
  const name = VILLAGE_OF[citySlug(c)];
  return name ? allCities.find((x) => x.n === name && (x.s ?? "MA") === (c.s ?? "MA")) : undefined;
}
/** Villages whose parent is this town (Leicester → Cherry Valley, Rochdale). */
export function villagesOf(c: City): City[] {
  return allCities.filter((x) => {
    const p = villageParent(x);
    return Boolean(p && sameCity(p, c));
  });
}
/** The same-name (or easily confused) place in the other state, if any. */
export function twinOf(c: City): City | undefined {
  const t = TWIN_OF[citySlug(c)];
  return t ? BY_SLUG[t] : undefined;
}
/** "Whitinsville (Northbridge), MA" for villages, otherwise "Salem, NH". Used in H1, titles, FAQ questions. */
export function placeLabel(c: City): string {
  const p = villageParent(c);
  return p ? `${c.n} (${p.n}), ${c.s ?? "MA"}` : cityLabel(c);
}

export type Neighbor = { city: City; miles: number; dir: string };
export type TownFacts = {
  slug: string;
  county: string; // e.g. "Worcester County"
  lat: number; lng: number;
  miles: number; // straight-line from Northborough, rounded (≥1 except the base itself)
  exactMiles: number; // unrounded, for sorting and distance bands
  dir: string; // compass direction from Northborough
  isBase: boolean;
  villageOf?: string;
  nearest: Neighbor[]; // the 8 true nearest served places, with miles and direction FROM this town
  sameCounty: number; // how many served places share the county (same state)
};

const geoOf = (c: City) => {
  const g = TOWN_GEO[citySlug(c)];
  if (!g) throw new Error(`No geodata for ${citySlug(c)}`);
  return { county: `${g[0]} County`, lat: g[1], lng: g[2] };
};

/** Straight-line miles between two served places (unrounded). */
export const milesBetween = (a: City, b: City) => miles(geoOf(a), geoOf(b));
/** Compass direction (8-point) from a to b. */
export const dirBetween = (a: City, b: City) => bearing(geoOf(a), geoOf(b));

const cache = new Map<string, TownFacts>();
export function townFacts(c: City): TownFacts {
  const slug = citySlug(c);
  const hit = cache.get(slug);
  if (hit) return hit;
  const g = geoOf(c);
  const isBase = slug === "northborough";
  const m = isBase ? 0 : miles(BASE, g);
  const nearest = allCities
    .filter((x) => citySlug(x) !== slug) // by slug: a non-canonical City object must not list itself (V4.8)
    .map((x) => ({ city: x, exact: miles(g, geoOf(x)) }))
    .sort((a, b) => a.exact - b.exact)
    .slice(0, 8)
    .map((x) => ({ city: x.city, miles: Math.max(1, Math.round(x.exact)), dir: bearing(g, geoOf(x.city)) }));
  const facts: TownFacts = {
    slug, county: g.county, lat: g.lat, lng: g.lng,
    miles: isBase ? 0 : Math.max(1, Math.round(m)), exactMiles: m, dir: bearing(BASE, g), isBase,
    villageOf: VILLAGE_OF[slug],
    nearest,
    sameCounty: allCities.filter((x) => geoOf(x).county === g.county && (x.s ?? "MA") === (c.s ?? "MA")).length,
  };
  cache.set(slug, facts);
  return facts;
}

/** County as shown in copy: Devens spans parts of Middlesex (Ayer, Shirley) and Worcester (Harvard). */
export function countyLabel(c: City): string {
  return isDevens(c) ? "Middlesex & Worcester Counties" : townFacts(c).county;
}

/** Served places (towns and villages) within `radius` miles of Northborough, straight line. */
export const placesWithin = (radius: number) => allCities.filter((c) => townFacts(c).exactMiles <= radius).length;

// Real, documented projects with a known town (town-level only; projects whose location is just
// "Massachusetts" — e.g. the bathroom-remodels album — have no town and are never tied to one).
const PROJECT_TOWN: Record<string, City> = {};
for (const p of projects) {
  const m = p.location.match(/^(.+), (MA|NH)$/);
  if (!m) continue;
  const city = allCities.find((c) => c.n === m[1] && (c.s ?? "MA") === m[2]);
  if (city) PROJECT_TOWN[p.slug] = city;
}

export type ProjectNear = { project: Project; town: City; miles: number; dir: string; sameTown: boolean };
export function nearestProjects(c: City, opts: { service?: ServiceSlug; limit?: number } = {}): ProjectNear[] {
  return projects
    .filter((p) => PROJECT_TOWN[p.slug] && (!opts.service || p.services.includes(opts.service)))
    .map((p) => {
      const pc = PROJECT_TOWN[p.slug];
      const same = citySlug(pc) === citySlug(c);
      return { project: p, town: pc, miles: same ? 0 : Math.max(1, Math.round(milesBetween(c, pc))), dir: same ? "" : dirBetween(c, pc), sameTown: same };
    })
    .sort((a, b) => a.miles - b.miles)
    .slice(0, opts.limit ?? 2);
}

export function projectTown(p: Project): City | undefined {
  return PROJECT_TOWN[p.slug];
}

// ---------- phase-2 records (render only when filled; never guessed) ----------

/** Completed jobs from the owner's invoices/contracts — the records behind "30+ towns with completed
 *  projects" (audit 03 §3.2-c, 09 AEO-H4). Town level only, never street addresses or client names.
 *  Every row must be producible on request (M.G.L. c.142A §17; FTC Act §5). Empty until the owner
 *  supplies the list; every sentence built from it renders only for towns that have a row.
 *  Example row: { town: "grafton", service: "decks", year: 2024 } */
export type Job = { town: string /* citySlug */; service: ServiceSlug; year: number; caseStudy?: string /* project slug */ };
export const JOBS: Job[] = [];
export const jobsIn = (c: City, service?: ServiceSlug) => JOBS.filter((j) => j.town === citySlug(c) && (!service || j.service === service));

/** Official building-department pages, each opened and checked by a person (never guessed or copied
 *  from a directory), with the month it was checked. Villages use their parent town's entry; Devens
 *  uses "devens" (Devens Enterprise Commission). Example: { worcester: { url: "https://…", verified: "2026-11" } } */
export const PERMIT_OFFICE: Record<string, { url: string; verified: string }> = {};
export function permitOffice(c: City): { url: string; verified: string } | undefined {
  const p = villageParent(c);
  return PERMIT_OFFICE[citySlug(p ?? c)];
}
