// State × service rules for the service×town pages (audit 03 §3.5-B/D, fact register §4; SERVICES-CITIES spec §4.2).
// These are the ONLY shared paragraphs on a town page. Every statement is phrased as a general rule
// (never as a claim that we hold a credential or follow a practice the owner has not confirmed), and
// Massachusetts-only law never appears on a New Hampshire page. The one first-person permit sentence
// ("we apply for the building permit") renders only once a Construction Supervisor License is on file
// (hasCsl, lib/credentials.ts) — the same gate as lib/faq.ts and lib/service-content.ts (V3.2).
// Binding (spec §4.2): within a state, no two services share a rules sentence (apart from the authority phrase).
//
// Fact register — every templated legal/jurisdiction statement used on the 2,010 pages (10 services × 201 places).
// Lead ruling O10: only rows that design/FACTS-VERIFIED.md (2026-10-06) marks VERIFIED are stated as rules; PARTLY or
// unverified rows are written as a general pointer to the permit authority, with no number and no legal claim.
// The 2026-10-06 pass checked primary-source excerpts (direct fetches were blocked), so a person must still open each
// URL and confirm the passage before release, then replace "verify" with "verified YYYY-MM-DD by <name>: <url>"
// (audit 03 §4; Google asks for human fact-checking of templated text):
//   R1  MA Home Improvement Contractor registration, M.G.L. c.142A ................ VERIFIED-excerpt, verify (201 CMR 18.00; mass.gov HIC resources)
//   R3  re-siding needs a building permit in MA, CSL-supervised ................... VERIFIED-excerpt, verify (mass.gov HIC table "Siding")
//   R4  replacement windows need a building permit in MA, CSL-supervised .......... VERIFIED-excerpt, verify (mass.gov HIC table "Window installation")
//   R4a exterior door permit ........................... PARTLY ("maybe" in the HIC table) → pointer only: ask the authority
//   R5  attached deck needs a building permit ...................................... VERIFIED-excerpt, verify (780 CMR 51 R105.2; HIC table "Decks")
//       (the footing/framing/final inspection list is PARTLY → not stated)
//   R6  within 100 ft of a wetland, the Conservation Commission may need to review .. VERIFIED-excerpt, verify (310 CMR 10.02; mass.gov wetlands)
//   R7  adding a bedroom on septic → Board of Health review under Title 5 .......... VERIFIED-excerpt, verify (310 CMR 15.000; Title 5 ADU guidance)
//   R7b smoke/CO triggers on remodels .................. PARTLY (MA amends IRC R314/R315) → pointer only: ask the authority
//   R8  MA plumbing/gas/electrical permits are taken out by licensed trades ........ VERIFIED-excerpt, verify (248 CMR 3.00; mass.gov electricians fact sheet)
//   R8b general remodel permit sentence ................ PARTLY → not used; kitchen/bath/whole-home use R8d's verified wording
//   R8c bath exhaust vents directly outdoors; every bathroom receptacle needs GFCI .. VERIFIED-excerpt, verify (IRC M1501.1; NEC 210.8(A)(1) via 527 CMR 12.00)
//   R8d cabinets/counters need no building permit; walls or structure do; moved sink or
//       gas line → licensed plumber/gas fitter permit; new circuits → licensed electrician VERIFIED-excerpt, verify (780 CMR 51 R105.2; 248 CMR 3.00)
//   R9  MA lead-safe rules (454 CMR 22.00): > 6 sq ft per room inside, > 20 sq ft in total
//       outside, every window replacement, partial demolition of painted surfaces; LSRC
//       license from DLS + certified renovator on site ............................ VERIFIED-excerpt, verify (mass.gov 454 CMR 22 PDF; lead-safe renovation for contractors)
//   R9a doors: covered only above 6 sq ft in the room / 20 sq ft outside (not automatic) VERIFIED-excerpt, verify (EPA door FAQ; 454 CMR 22)
//   R10 NH follows the federal EPA RRP rule (no state program), same thresholds .... VERIFIED-excerpt, verify (NH DHHS; 40 CFR 745.83/745.85)
//   R11 NH has no statewide contractor license or registration ..................... VERIFIED-excerpt as of 2026-10-06, verify; RE-CHECK after 2026-11-30 (SB 523 study commission)
//   R12 NH electricians and plumbers working for hire hold state licenses (OPLC) .... VERIFIED-excerpt, verify (oplc.nh.gov; RSA 319-C:15 homeowner exception)
//   R13 NH state building code applies in every town; each town administers it;
//       third-party approved agencies allowed from 2025-07-15 (SB 188) ............. VERIFIED-excerpt, verify (RSA 155-A:2; NH fire marshal; NHMA guide)
//   R14 painting needs no building permit under the MA building code ............... VERIFIED-excerpt, verify (780 CMR 51 R105.2)
//   R14a interior painting: > 6 sq ft per room (454 CMR 22.00) ..................... VERIFIED-excerpt, verify (as R9)
//   R14b exterior painting: > 20 sq ft in total (454 CMR 22.00) .................... VERIFIED-excerpt, verify (as R9; EPA "per side" FAQ)
//   R15 villages → permits from the parent town (lib/towns.ts VILLAGE_OF) .......... PARTLY (principle holds; each mapping unchecked), verify (town websites)
//   R16 Devens: the Devens Enterprise Commission issues building permits and acts as
//       the conservation commission and board of health ........................... VERIFIED-excerpt, verify (mass.gov DEC overview; Ch. 498 Acts 1993)
//   R17 local historic district: exterior changes visible from a public way need the
//       commission's approval first; some districts review paint color, many exclude it VERIFIED-excerpt, verify (M.G.L. c.40C §5-8; MHC guide)
//   ADU one accessory dwelling unit by right since 2025-02-02, ≤ 900 sq ft or half ... VERIFIED-excerpt, verify (mass.gov ADU)
//   EGR a new basement bedroom needs an emergency escape opening ................... VERIFIED-excerpt (IRC R310.1/R310.6; MA amendment unread), verify
//   RRP-P prohibited practices: no open-flame burning; no power sanding without HEPA . VERIFIED-excerpt, verify (40 CFR 745.85(a)(3))
import type { City } from "./site";
import { villageParent, isDevens, isNH } from "./towns";
import { hasCsl } from "./credentials";
import type { ServiceSlug } from "./services";

// The slug type and list live in lib/services.ts (spec §2.1); re-exported here to keep this module's API.
export { SERVICE_SLUGS, isServiceSlug, type ServiceSlug } from "./services";

/** Service-local vocabulary (spec §1): query-form title, H1 noun phrase, prose noun, link label, 4 scope items. */
export const SERVICE_LOCAL: Record<ServiceSlug, {
  title: string; // <title>: "Deck Builder in Salem, NH"
  h1: string; // H1: "Deck Design & Construction in Salem, NH"
  noun: string; // prose: "deck building"
  link: string; // anchor in "Other services in {Town}" and the nearby list ("Decks in Salem, NH")
  meta: string; // short noun for meta descriptions: "Nearest deck case study"
  project: string; // "our closest documented {project} project"
  scope: string[]; // "What's included": a SUBSET of the hub's features (lib/services.ts), true for every town (V3.9)
}> = {
  siding: {
    title: "Siding Contractor", h1: "Siding Installation & Replacement", noun: "siding", link: "Siding", meta: "siding", project: "siding",
    scope: ["Vinyl & fiber-cement siding", "Trim, soffit & fascia", "House wrap & flashing", "Cleanup & haul-away"],
  },
  "window-replacement": {
    title: "Window Replacement", h1: "Window Replacement", noun: "window replacement", link: "Window replacement", meta: "window", project: "window replacement",
    scope: ["Replacement windows", "Insert or full-frame installation", "Flashing, insulation & sealing", "Interior trim & casing"],
  },
  "door-installation": {
    title: "Door Installation", h1: "Entry & Patio Door Installation", noun: "entry and patio door installation", link: "Doors", meta: "door", project: "door installation",
    scope: ["Entry doors", "Patio doors (sliding or hinged)", "Sill pan & flashing", "Weatherstripping & trim"],
  },
  decks: {
    title: "Deck Builder", h1: "Deck Design & Construction", noun: "deck building", link: "Decks", meta: "deck", project: "deck",
    scope: ["Composite & pressure-treated wood decks", "Railings, stairs & landings", "Pool decks", "Custom design to fit your yard"],
  },
  "exterior-painting": {
    title: "Exterior House Painting", h1: "Exterior House Painting", noun: "exterior painting", link: "Exterior painting", meta: "exterior painting", project: "exterior painting",
    scope: ["Siding & trim painting", "Washing, scraping & sanding", "Caulking & priming bare wood", "Color selection help"],
  },
  "kitchen-remodeling": {
    title: "Kitchen Remodeling", h1: "Kitchen Remodeling", noun: "kitchen remodeling", link: "Kitchen remodeling", meta: "kitchen", project: "kitchen",
    scope: ["Cabinets & islands", "Countertops & backsplash", "Lighting", "Plumbing & electrical trades coordinated"],
  },
  "bathroom-remodeling": {
    title: "Bathroom Remodeling", h1: "Bathroom Remodeling", noun: "bathroom remodeling", link: "Bathroom remodeling", meta: "bathroom", project: "bathroom",
    scope: ["Tile & walk-in showers", "Waterproofing behind tile", "Vanities & fixtures", "Frameless glass enclosures"],
  },
  "home-additions": {
    title: "Home Addition Contractor", h1: "Home Additions", noun: "home additions", link: "Additions", meta: "addition", project: "addition",
    scope: ["Room & second-story additions", "In-law suites (ADUs)", "Sunrooms & porches", "Designer & engineer coordination"],
  },
  "home-remodeling": {
    title: "Whole-Home Remodeling", h1: "Whole-Home & Interior Remodeling", noun: "whole-home remodeling", link: "Whole-home remodeling", meta: "remodeling", project: "whole-home remodeling",
    scope: ["First-floor & whole-home remodels", "Layout & wall changes", "Basement finishing", "Licensed trades coordinated"],
  },
  "interior-painting": {
    title: "Interior Painting", h1: "Interior Painting", noun: "interior painting", link: "Interior painting", meta: "interior painting", project: "interior painting",
    scope: ["Walls & ceilings", "Trim, doors & cabinets", "Patching, sanding & priming", "Color selection help"],
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

/** Painting needs no building permit under the MA building code (R14); not stated for NH (no verified row). */
export const isPaintingService = (svc: ServiceSlug) => svc === "exterior-painting" || svc === "interior-painting";

/** "Building permits" row of the at-a-glance table (spec §4.3): service-aware. */
export function permitRow(svc: ServiceSlug, c: City): string {
  return isPaintingService(svc) && !isNH(c) ? "No building permit for painting" : authorityLabel(c);
}

// First-person permit claim: only with a CSL on file (V3.2); until then the paragraph states the general rule only.
const OUR_PERMIT = hasCsl ? " On our jobs, we apply for the building permit and schedule the inspections." : "";

/** Who reviews work near a wetland here (R6, R15, R16). */
function conservation(c: City): string {
  if (isDevens(c)) return "the Devens Enterprise Commission, which also acts as the conservation commission there,";
  const p = villageParent(c);
  return `${p ? `the Town of ${p.n}` : c.n}'s Conservation Commission`;
}

/** "Permits and rules" paragraph (§3.5-D, spec §4.2): one distinct paragraph per state × service; only the
 *  permit authority (and, for decks, the conservation body) varies by place. */
export function rulesParagraph(svc: ServiceSlug, c: City): string {
  const a = permitAuthority(c).text;
  const A = cap(a);
  if (isNH(c)) {
    // R10-R13 only. No Massachusetts law, and no NH permit claim beyond "the town decides" (R13).
    const nh: Record<ServiceSlug, string> = {
      siding: `${A} decides whether re-siding needs a permit under the New Hampshire state building code. On a pre-1978 house, re-siding that disturbs more than 20 square feet of painted siding or trim in total falls under the federal EPA lead-safe (RRP) rule.`,
      "window-replacement": `Ask ${a} which permit replacement windows need. In a pre-1978 home, every window replacement falls under the federal EPA lead-safe (RRP) rule, whatever the area disturbed.`,
      "door-installation": `Whether a replacement exterior door needs a permit is for ${a} to say. Unlike a window, a door replacement in a pre-1978 home falls under the federal EPA lead-safe (RRP) rule only when it disturbs more than 6 square feet of painted surface in the room or more than 20 square feet outside.`,
      decks: `${A} decides which permit and inspections a deck needs. New Hampshire has no statewide license or registration for home-improvement contractors, so ask any deck builder for proof of insurance and a written contract.`,
      "exterior-painting": `In a pre-1978 home, exterior paint prep that disturbs more than 20 square feet of painted surface in total falls under the federal EPA lead-safe (RRP) rule, which prohibits open-flame burning of the paint and power sanding without a shroud and HEPA vacuum.`,
      "kitchen-remodeling": `Electricians and plumbers you hire for a kitchen's new circuits or a moved sink must hold New Hampshire licenses from the Office of Professional Licensure and Certification. ${A} decides which kitchen work needs a building permit.`,
      "bathroom-remodeling": `${A} decides which bathroom work needs a permit and inspection. A plumber you hire to move a toilet, shower or vanity drain must hold a New Hampshire plumbing license.`,
      "home-additions": `Ask ${a} how an addition is permitted and inspected: the state building code applies in every New Hampshire town, and each town decides how it issues permits and inspects work.`,
      "home-remodeling": `In a pre-1978 home, taking out painted walls falls under the federal EPA lead-safe (RRP) rule, because demolition of painted surfaces is never minor repair. ${A} decides whether layout and wall changes need a permit.`,
      "interior-painting": `New Hampshire follows the federal EPA lead-safe (RRP) rule: in a pre-1978 home, paid interior work that disturbs more than 6 square feet of painted surface in a room is covered, including scraping and sanding before painting.`,
    };
    return nh[svc];
  }
  const ma: Record<ServiceSlug, string> = {
    siding: `Re-siding needs a building permit from ${a}.${OUR_PERMIT} On a pre-1978 house, re-siding that disturbs more than 20 square feet of painted siding or trim in total falls under Massachusetts lead-safe rules (454 CMR 22.00).`,
    "window-replacement": `Replacement windows need a building permit from ${a}.${OUR_PERMIT} In a pre-1978 home, every window replacement falls under Massachusetts lead-safe rules (454 CMR 22.00), whatever the area disturbed.`,
    // R4a is PARTLY verified, so the permit is a pointer; R9a (lead) is verified.
    "door-installation": `Ask ${a} whether replacing your exterior door needs a building permit. Unlike a window, a door replacement in a pre-1978 home falls under Massachusetts lead-safe rules (454 CMR 22.00) only when it disturbs more than 6 square feet of painted surface in the room or more than 20 square feet outside.`,
    decks: `An attached deck needs a building permit from ${a}.${OUR_PERMIT} Within 100 feet of a wetland, ${conservation(c)} may need to review the work before it starts.`,
    "exterior-painting": `Painting needs no building permit from ${a}. In a pre-1978 home, paid exterior work that disturbs more than 20 square feet of painted surface in total falls under Massachusetts lead-safe rules (454 CMR 22.00). In a local historic district, exterior changes seen from a public way need the commission's approval first; some districts review paint color, many do not.`,
    "kitchen-remodeling": `Cabinets, countertops and finishes need no building permit, but a kitchen remodel that moves walls or changes the structure needs one from ${a}. Moving the sink or a gas line needs a permit from a Massachusetts-licensed plumber or gas fitter, and new circuits need one from a licensed electrician.${OUR_PERMIT}`,
    "bathroom-remodeling": `Retiling needs no building permit, but moving a toilet, shower or vanity drain needs a plumbing permit from a Massachusetts-licensed plumber, and moving walls needs a building permit from ${a}.${OUR_PERMIT} The exhaust fan must vent directly outdoors, and every bathroom receptacle needs GFCI protection.`,
    "home-additions": `An addition needs a building permit from ${a} and must meet local zoning rules such as setbacks.${OUR_PERMIT} On septic, an added bedroom also needs Board of Health review under Title 5. Since February 2, 2025, one accessory dwelling unit, up to 900 square feet or half the main house if smaller, is allowed by right in single-family zones.`,
    // R8b and R7b are PARTLY verified: the structural permit uses R8d's verified wording; smoke/CO is left to the hub.
    "home-remodeling": `Layout and wall changes need a building permit from ${a}, and new or moved plumbing, gas lines and wiring need permits from Massachusetts-licensed trades.${OUR_PERMIT} A new basement bedroom needs an emergency escape opening, and in a pre-1978 home, partial demolition of painted walls is lead-safe renovation work under 454 CMR 22.00.`,
    "interior-painting": `Painting inside needs no building permit from ${a}. In a pre-1978 home, paid interior work that disturbs more than 6 square feet of painted surface in a room falls under Massachusetts lead-safe rules (454 CMR 22.00).`,
  };
  return ma[svc];
}

/** "Contractor rules" row of the at-a-glance table (R1, R11). Our own HIC/CSL numbers render once, in the
 *  hero trust line (credentialLine pattern), only when they are set. */
export function contractorRuleRow(c: City): string {
  if (isNH(c)) return "No statewide contractor license in New Hampshire";
  return "MA Home Improvement Contractor registration (M.G.L. c.142A)";
}
