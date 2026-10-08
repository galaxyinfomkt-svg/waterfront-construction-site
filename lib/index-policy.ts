// Which service×town pages are indexed (owner decision, Oct 2026; study in the AI-visibility audit).
// All 2,010 pages stay built and linked for visitors, but only the ones where the company really works are offered
// to search engines. The rest carry noindex,follow, no JSON-LD (check:schema R00) and are left out of the sitemaps,
// so Google and Bing judge the site by its strong pages instead of 1,500+ templated ones (doorway / scaled-content
// policies). A town comes back into the index on the next deploy as soon as it qualifies:
//   1. within CORE_RADIUS_MI of Northborough (the daily market), or
//   2. documented proof in the town: a case study (lib/projects.ts), a client testimonial (lib/site.ts) or a
//      completed job from the owner's records (JOBS in lib/towns.ts, the "30+ towns"), or
//   3. the exact page path is in SEARCH_CONSOLE_KEEP (pages with Search Console impressions).
// The 201 city hubs (/service-areas/<town>) are always indexed; this policy covers the service×town pages only.
import { allCities, citySlug, testimonials, type City } from "./site";
import { projects } from "./projects";
import { townFacts, projectTown, JOBS } from "./towns";

/** Straight-line miles from Northborough within which every service×town page is indexed. */
export const CORE_RADIUS_MI = 15;

/** Service×town paths that earned Search Console impressions outside the rules above, e.g. "/services/decks/acton".
 *  Fill from a Search Console Performance export (last 3 months, pages under /services/). */
export const SEARCH_CONSOLE_KEEP: string[] = [];

const testimonialTown = (town: string) => {
  const m = town.match(/^(.+), (MA|NH)$/);
  return m ? allCities.find((c) => c.n === m[1] && (c.s ?? "MA") === m[2]) : undefined;
};

/** Towns with documented proof: case studies, testimonials and the owner's job records. */
export const PROOF_TOWNS: ReadonlySet<string> = new Set([
  ...projects.map(projectTown).filter((c): c is City => Boolean(c)).map(citySlug),
  ...testimonials.map((t) => testimonialTown(t.town)).filter((c): c is City => Boolean(c)).map(citySlug),
  ...JOBS.map((j) => j.town),
]);

/** True when every service page of this town is indexed (core radius or documented proof). */
export const townIndexed = (c: City) => townFacts(c).exactMiles <= CORE_RADIUS_MI || PROOF_TOWNS.has(citySlug(c));

/** True when /services/<serviceSlug>/<town> is offered to search engines. */
export const townPageIndexed = (serviceSlug: string, c: City) =>
  townIndexed(c) || SEARCH_CONSOLE_KEEP.includes(`/services/${serviceSlug}/${citySlug(c)}`);
