// Computed service-area facts shared by /service-areas, the home page, /about and /contact.
// Everything comes from the town list (lib/site.ts), GeoNames geodata (lib/towns.ts) and the documented
// projects (lib/projects.ts), so no count or distance is ever typed by hand (audit 06 ST-H3/H4, 09 AEO-H1).
import { allCities, citySlug, testimonials, type City } from "@/lib/site";
import { townFacts, projectTown, VILLAGE_OF, DEVENS } from "@/lib/towns";
import { projects, type Project } from "@/lib/projects";
import { AREA_FACTS } from "@/lib/schema";

export type State = "MA" | "NH";
export type CountyGroup = {
  id: string; // "worcester-county-ma" — the same anchor as the county @id in lib/schema.ts
  county: string; // "Worcester County"
  state: State;
  stateName: string;
  towns: City[]; // alphabetical
  min: number; // nearest, miles from Northborough (straight line)
  max: number; // farthest
  projects: Project[]; // documented case studies in this county
};

export const countyAnchor = (county: string, state: State) => `${county.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
const stateOf = (c: City): State => (c.s === "NH" ? "NH" : "MA");

let cache: CountyGroup[] | null = null;
/** Counties in display order: Massachusetts first, then New Hampshire; larger counties first. */
export function countyGroups(): CountyGroup[] {
  if (cache) return cache;
  const map = new Map<string, CountyGroup>();
  for (const c of allCities) {
    const f = townFacts(c);
    const state = stateOf(c);
    const id = countyAnchor(f.county, state);
    if (!map.has(id)) map.set(id, { id, county: f.county, state, stateName: state === "MA" ? "Massachusetts" : "New Hampshire", towns: [], min: Infinity, max: 0, projects: [] });
    const g = map.get(id)!;
    g.towns.push(c);
    g.min = Math.min(g.min, f.miles);
    g.max = Math.max(g.max, f.miles);
  }
  for (const p of projects) {
    const t = projectTown(p);
    if (!t) continue;
    map.get(countyAnchor(townFacts(t).county, stateOf(t)))?.projects.push(p);
  }
  cache = [...map.values()]
    .map((g) => ({ ...g, towns: [...g.towns].sort((a, b) => a.n.localeCompare(b.n, "en-US")) }))
    .sort((a, b) => (a.state === b.state ? b.towns.length - a.towns.length || a.county.localeCompare(b.county) : a.state === "MA" ? -1 : 1));
  return cache;
}

export const VILLAGE_COUNT = allCities.filter((c) => VILLAGE_OF[citySlug(c)]).length;
export const HAS_DEVENS = allCities.some((c) => citySlug(c) === DEVENS);
export const isDevensCity = (c: City) => citySlug(c) === DEVENS;
export const MUNICIPALITIES = AREA_FACTS.municipalities;
export const COUNTIES = AREA_FACTS.counties;
export const PLACES = allCities.length;

const byDistance = [...allCities].sort((a, b) => townFacts(a).exactMiles - townFacts(b).exactMiles);
export const NEAREST = byDistance.find((c) => !townFacts(c).isBase)!;
export const FARTHEST = byDistance[byDistance.length - 1];

/** e.g. "193 cities and towns, plus 7 villages and Devens, across 11 counties in Massachusetts and southern New Hampshire" */
export const AREA_SENTENCE = `${MUNICIPALITIES} cities and towns, plus ${VILLAGE_COUNT} villages${HAS_DEVENS ? " and Devens" : ""}, across ${COUNTIES} counties in Massachusetts and southern New Hampshire`;

/** Straight-line distance bands from Northborough, for the /service-areas table. */
export function distanceBands(): { label: string; count: number }[] {
  const edges = [10, 20, 30, 40, 50, Infinity];
  let lo = 0;
  return edges.map((hi) => {
    const count = allCities.filter((c) => { const m = townFacts(c).exactMiles; return m >= lo && m < hi; }).length;
    const label = hi === Infinity ? `${lo}+ miles` : `${lo}–${hi} miles`;
    lo = hi;
    return { label, count };
  });
}

export type ProofTown = { city: City; projects: Project[]; clients: string[] };
/** Towns where our work is documented on this site: case-study towns and towns of clients whose testimonials we publish. */
export function documentedTowns(): ProofTown[] {
  const out = new Map<string, ProofTown>();
  const get = (c: City) => {
    const k = citySlug(c);
    if (!out.has(k)) out.set(k, { city: c, projects: [], clients: [] });
    return out.get(k)!;
  };
  for (const p of projects) {
    const t = projectTown(p);
    if (t) get(t).projects.push(p);
  }
  for (const t of testimonials) {
    const m = t.town.match(/^(.+), (MA|NH)$/);
    const c = m ? allCities.find((x) => x.n === m[1] && stateOf(x) === m[2]) : undefined;
    if (c) get(c).clients.push(t.name);
  }
  return [...out.values()].sort((a, b) => townFacts(a.city).exactMiles - townFacts(b.city).exactMiles);
}

/** Case studies whose town is not recorded (shown honestly as "Massachusetts"). */
export const unplacedProjects = () => projects.filter((p) => !projectTown(p));

/** Anchor of a testimonial card on /reviews, e.g. "testimonial-karen-m". */
export const testimonialAnchor = (name: string) => `testimonial-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
