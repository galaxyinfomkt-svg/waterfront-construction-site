// State × service rules for the service×town pages (audit 03 §3.5-B/D, fact register §4).
// These are the ONLY shared paragraphs on a town page. Every statement is phrased as a general rule
// (never as a claim that we hold a credential or follow a practice the owner has not confirmed), and
// Massachusetts-only law never appears on a New Hampshire page.
//
// Fact register — every templated legal/jurisdiction statement used on the 1,188 pages. A person must
// check each one against the primary source before release, then replace "verify" with
// "verified YYYY-MM-DD by <name>: <url>" (audit 03 §4; Google asks for human fact-checking of templated text):
//   R1  MA Home Improvement Contractor registration, M.G.L. c.142A ................. verify (mass.gov, 201 CMR 18.00)
//   R3  re-siding needs a building permit in most MA towns ......................... verify (780 CMR R105.2 + town pages)
//   R4  replacement windows/exterior doors generally need a building permit in MA .. verify (same)
//   R5  attached deck: building permit; footing, framing and final inspections ..... verify (780 CMR 51 / IRC R105)
//   R6  deck within 100 ft of a wetland → Conservation Commission may review ........ verify (310 CMR 10.02)
//   R7  adding a bedroom on septic → Board of Health review under Title 5 .......... verify (310 CMR 15.000)
//   R8  MA plumbing/gas/electrical permits are taken out by licensed trades ........ verify (248 CMR; 527 CMR 12.00)
//   R9  MA lead-safe renovation rules (454 CMR 22.00) apply above 6 sq ft of paint per
//       room inside / 20 sq ft outside; every window replacement is covered ....... verify (mass.gov lead-safe renovation)
//   R10 NH: federal EPA RRP rule (40 CFR 745 Subpart E), same thresholds ........... verify (epa.gov RRP)
//   R11 NH has no statewide home-improvement contractor license or registration .... verify (NH OPLC; NH AG)
//   R12 NH electricians and plumbers hold state licenses (OPLC) ..................... verify (oplc.nh.gov)
//   R13 NH building permits are local, under the state building code (RSA 155-A) ... verify
//   R14 painting needs no building permit ......................................... verify (780 CMR R105.2)
//   R15 villages → permits from the parent town (lib/towns.ts VILLAGE_OF) .......... verify (town websites)
//   R16 Devens: regional enterprise zone on the former Fort Devens; permits and land use
//       by the Devens Enterprise Commission, not Ayer/Harvard/Shirley ............. verify (devensec.com)
import type { City } from "./site";
import { villageParent, isDevens, isNH } from "./towns";

export type ServiceSlug = "siding" | "windows-and-doors" | "kitchen-bathroom-remodeling" | "decks" | "home-additions-remodeling" | "painting";
export const SERVICE_SLUGS: ServiceSlug[] = ["siding", "windows-and-doors", "kitchen-bathroom-remodeling", "decks", "home-additions-remodeling", "painting"];
export const isServiceSlug = (s: string): s is ServiceSlug => (SERVICE_SLUGS as string[]).includes(s);

/** Service-local vocabulary: query-form title, H1 noun phrase, prose noun, link label, 4 scope items. */
export const SERVICE_LOCAL: Record<ServiceSlug, {
  title: string; // <title>: "Deck Builder in Salem, NH"
  h1: string; // H1: "Deck Design & Construction in Salem, NH"
  noun: string; // prose: "deck building"
  link: string; // anchor in "Other services in {Town}"
  meta: string; // short noun for meta descriptions: "Nearest deck case study"
  project: string; // "our closest documented {project} project"
  scope: string[]; // "What's included" (true for every town; details live on the hub)
}> = {
  siding: {
    title: "Siding Contractor", h1: "Siding Installation & Replacement", noun: "siding", link: "Siding", meta: "siding", project: "siding",
    scope: ["Vinyl & fiber-cement siding", "Trim, soffit & fascia", "House wrap & moisture protection", "Clean-up & haul-away"],
  },
  "windows-and-doors": {
    title: "Window & Door Replacement", h1: "Window & Door Replacement", noun: "window and door replacement", link: "Windows & doors", meta: "window and door", project: "window and door",
    scope: ["Replacement windows", "Entry & patio doors", "Interior trim & casing", "Sealed, weather-tight installs"],
  },
  "kitchen-bathroom-remodeling": {
    title: "Kitchen & Bath Remodeling", h1: "Kitchen & Bathroom Remodeling", noun: "kitchen and bathroom remodeling", link: "Kitchen & bath remodeling", meta: "kitchen & bath", project: "kitchen or bathroom",
    scope: ["Cabinets & islands", "Tile & walk-in showers", "Countertops & backsplash", "Vanities, fixtures & lighting"],
  },
  decks: {
    title: "Deck Builder", h1: "Deck Design & Construction", noun: "deck building", link: "Decks", meta: "deck", project: "deck",
    scope: ["Composite & wood decks", "Railings, stairs & lighting", "Pergolas & outdoor living", "Custom design to fit your yard"],
  },
  "home-additions-remodeling": {
    title: "Home Additions & Remodeling", h1: "Home Additions & Remodeling", noun: "home additions and remodeling", link: "Additions & remodeling", meta: "addition", project: "addition or remodeling",
    scope: ["Room & second-story additions", "In-law suites & sunrooms", "Whole-home renovations", "Basement finishing"],
  },
  painting: {
    title: "House Painting", h1: "Interior & Exterior Painting", noun: "interior and exterior painting", link: "Painting", meta: "painting", project: "painting",
    scope: ["Interior & exterior painting", "Surface prep", "Cabinet & trim painting", "Color consultation"],
  },
};

export type Authority = { kind: "town" | "village" | "devens" | "nh"; text: string };
/** Who issues building permits for this place (R13, R15, R16). */
export function permitAuthority(c: City): Authority {
  if (isDevens(c)) return { kind: "devens", text: "the Devens Enterprise Commission" };
  const p = villageParent(c);
  if (p) return { kind: "village", text: `the Town of ${p.n}` };
  if (isNH(c)) return { kind: "nh", text: `${c.n}'s building office` };
  return { kind: "town", text: `${c.n}'s building department` };
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const authorityLabel = (c: City) => cap(permitAuthority(c).text);

/** "Permits and rules" paragraph (§3.5-D). Shared within state × service except the permit authority. */
export function rulesParagraph(svc: ServiceSlug, c: City): string {
  const a = permitAuthority(c).text;
  if (isNH(c)) {
    if (svc === "painting") {
      return "Painting needs no building permit in New Hampshire. In a pre-1978 home, disturbing more than 6 square feet of paint in a room, or 20 outside, falls under the federal EPA lead-safe (RRP) rule.";
    }
    const base = `New Hampshire has no statewide contractor license; ${a} decides which ${SERVICE_LOCAL[svc].noun} work needs a permit and inspection under the state building code.`;
    const extra: Record<Exclude<ServiceSlug, "painting">, string> = {
      siding: " Removing painted siding or trim on a pre-1978 home falls under the federal EPA lead-safe (RRP) rule.",
      "windows-and-doors": " In a pre-1978 home, every window replacement falls under the federal EPA lead-safe (RRP) rule.",
      "kitchen-bathroom-remodeling": " Electricians and plumbers hold New Hampshire state licenses (OPLC).",
      decks: " Where a permit is required, the town inspects the footings and framing.",
      "home-additions-remodeling": " Setbacks come from the town's zoning ordinance.",
    };
    return base + extra[svc];
  }
  switch (svc) {
    case "siding":
      return `Re-siding needs a building permit in most Massachusetts towns; here it comes from ${a}. Removing painted siding or trim on a pre-1978 home falls under Massachusetts lead-safe rules (454 CMR 22.00).`;
    case "windows-and-doors":
      return `Replacement windows and exterior doors generally need a building permit, here from ${a}. In a pre-1978 home, every window replacement falls under Massachusetts lead-safe rules (454 CMR 22.00).`;
    case "kitchen-bathroom-remodeling":
      return `A remodel that moves walls, plumbing or wiring needs a building permit from ${a}; plumbing, gas and electrical permits are taken out by Massachusetts-licensed trades.`;
    case "decks":
      return `An attached deck needs a building permit from ${a}, with footing, framing and final inspections. Within 100 feet of a wetland, the Conservation Commission may also review it.`;
    case "home-additions-remodeling":
      return `An addition needs a building permit from ${a} and must meet zoning setbacks; adding a bedroom to a home on septic also brings Board of Health review under Title 5.`;
    case "painting":
      return "Painting needs no building permit. In a pre-1978 home, disturbing more than 6 square feet of paint in a room, or 20 outside, falls under Massachusetts lead-safe rules (454 CMR 22.00).";
  }
}

/** "Contractor rules" row of the at-a-glance table (R1, R11). Our own HIC/CSL numbers render once, in the
 *  hero trust line (credentialLine pattern), only when they are set. */
export function contractorRuleRow(c: City): string {
  if (isNH(c)) return "No statewide contractor license in New Hampshire";
  return "MA Home Improvement Contractor registration (M.G.L. c.142A)";
}

