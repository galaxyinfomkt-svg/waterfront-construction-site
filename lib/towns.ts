// Computed, verifiable facts about each served town — used to make every service×town page
// genuinely specific without inventing anything. All distances are straight-line, town center
// to town center, from Northborough (the company's base), rounded and labelled "about".
import { allCities, citySlug, type City } from "./site";
import { TOWN_GEO } from "./town-geo";
import { projects, type Project } from "./projects";

const BASE = { lat: 42.3182, lng: -71.6464 }; // Northborough town center (ZIP 01532 centroid)

const toRad = (d: number) => (d * Math.PI) / 180;
function miles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function bearing(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"][Math.round(deg / 45) % 8];
}

// Villages that are not municipalities — building permits are issued by the parent town.
export const VILLAGE_OF: Record<string, string> = {
  whitinsville: "Northbridge",
  "cherry-valley": "Leicester",
  rochdale: "Leicester",
  jefferson: "Holden",
  fiskdale: "Sturbridge",
  baldwinville: "Templeton",
  "still-river": "Harvard",
};
// Devens is a regional enterprise zone (Ayer/Harvard/Shirley) with its own permitting authority.
export const DEVENS = "devens";

// Same town name in both states → always disambiguate.
const NAME_COUNT = allCities.reduce<Record<string, number>>((m, c) => ((m[c.n] = (m[c.n] || 0) + 1), m), {});
export const hasTwin = (c: City) => NAME_COUNT[c.n] > 1;

export type TownFacts = {
  slug: string;
  county: string; // e.g. "Worcester County"
  lat: number; lng: number;
  miles: number; // straight-line from Northborough, rounded
  dir: string; // compass direction from Northborough
  isBase: boolean;
  villageOf?: string;
  nearest: { city: City; miles: number }[]; // true nearest served towns
  sameCounty: number; // how many served towns share the county
};

const geoOf = (c: City) => {
  const g = TOWN_GEO[citySlug(c)];
  if (!g) throw new Error(`No geodata for ${citySlug(c)}`);
  return { county: `${g[0]} County`, lat: g[1], lng: g[2] };
};

const cache = new Map<string, TownFacts>();
export function townFacts(c: City): TownFacts {
  const slug = citySlug(c);
  const hit = cache.get(slug);
  if (hit) return hit;
  const g = geoOf(c);
  const m = miles(BASE, g);
  const nearest = allCities
    .filter((x) => x !== c)
    .map((x) => ({ city: x, miles: miles(g, geoOf(x)) }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, 8)
    .map((x) => ({ ...x, miles: Math.max(1, Math.round(x.miles)) }));
  const facts: TownFacts = {
    slug, county: g.county, lat: g.lat, lng: g.lng,
    miles: Math.round(m), dir: bearing(BASE, g), isBase: slug === "northborough",
    villageOf: VILLAGE_OF[slug],
    nearest,
    sameCounty: allCities.filter((x) => geoOf(x).county === g.county && (x.s ?? "MA") === (c.s ?? "MA")).length,
  };
  cache.set(slug, facts);
  return facts;
}

// Real, documented projects with a known town → nearest one to any served town.
const PROJECT_TOWN: Record<string, City> = {};
for (const p of projects) {
  const m = p.location.match(/^(.+), (MA|NH)$/);
  if (!m) continue;
  const city = allCities.find((c) => c.n === m[1] && (c.s ?? "MA") === m[2]);
  if (city) PROJECT_TOWN[p.slug] = city;
}

export function nearestProjects(c: City, opts: { service?: string; limit?: number } = {}): { project: Project; miles: number; sameTown: boolean }[] {
  const g = geoOf(c);
  return projects
    .filter((p) => PROJECT_TOWN[p.slug] && (!opts.service || p.services.includes(opts.service)))
    .map((p) => {
      const pc = PROJECT_TOWN[p.slug];
      return { project: p, miles: Math.round(miles(g, geoOf(pc))), sameTown: citySlug(pc) === citySlug(c) };
    })
    .sort((a, b) => a.miles - b.miles)
    .slice(0, opts.limit ?? 2);
}

export function projectTown(p: Project): City | undefined {
  return PROJECT_TOWN[p.slug];
}
