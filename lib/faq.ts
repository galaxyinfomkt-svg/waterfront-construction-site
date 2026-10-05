// Pre-hire questions and answers: the /faq hub (all groups) and the home page (a selection).
// Audit 09 AEO-H6/M3, 01 H6, 06 ST-M1. Rules for every answer:
// - Answer first, with the fact in the first sentence. Plain text only: the same string is rendered
//   visibly AND used in FAQPage JSON-LD, so it must match word for word (scripts/check-jsonld.mjs R09).
//   Links and sources go in `links` / `sources`, rendered after the answer.
// - Only facts from lib/site.ts, lib/credentials.ts, computed data, or sourced general rules.
//   Questions whose answer depends on owner input that has not been supplied (warranty terms, deposit
//   policy, payment methods, languages, response time) are left out until the owner confirms them.
// - No "licensed" self-claims until site.hic is set (licensingAnswer() handles both cases).
import { site, services, cities, allCities, citySlug, testimonials } from "./site";
import { licensingAnswer, hasHic, hasCsl } from "./credentials";
import { displayAddress } from "./address";
import { AREA_FACTS } from "./schema";
import { townFacts, VILLAGE_OF, DEVENS } from "./towns";
import { projects } from "./projects";
import { posts } from "./posts";
import { SOURCES, type Source } from "./service-content";

export type Faq = { q: string; a: string };
export type FaqLink = { href: string; label: string; external?: boolean };
export type FaqEntry = Faq & { id: string; links?: FaqLink[]; sources?: Source[] };
export type FaqGroup = { id: string; title: string; items: FaqEntry[] };

// ---------- computed facts (never typed by hand, so they cannot drift from the data) ----------
const VILLAGES = allCities.filter((c) => VILLAGE_OF[citySlug(c)]).length; // 7
const HAS_DEVENS = allCities.some((c) => citySlug(c) === DEVENS);
const FARTHEST = [...allCities].sort((a, b) => townFacts(b).exactMiles - townFacts(a).exactMiles)[0];
const NH = allCities.filter((c) => c.s === "NH");
const NH_COUNTIES = [...new Set(NH.map((c) => townFacts(c).county.replace(/ County$/, "")))];
const NH_EXAMPLES = cities.filter((c) => c.s === "NH").map((c) => c.n);
const SMALL = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const word = (n: number) => SMALL[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (xs: string[]) => (xs.length < 3 ? xs.join(" and ") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const placesSentence = `${AREA_FACTS.municipalities} cities and towns, plus ${VILLAGES} villages${HAS_DEVENS ? " and Devens" : ""}, across ${AREA_FACTS.counties} counties in Massachusetts and southern New Hampshire`;

/** Link to a blog guide only if that post exists (slugs can change in lib/posts.ts). */
const guide = (slug: string): FaqLink[] => {
  const p = posts.find((x) => x.slug === slug);
  return p ? [{ href: `/blog/${p.slug}`, label: p.title }] : [];
};
const hub = (slug: string, label?: string): FaqLink[] => {
  const s = services.find((x) => x.slug === slug);
  return s ? [{ href: `/services/${s.slug}`, label: label ?? s.short }] : [];
};
const NH_SOURCE: Source = { label: "New Hampshire contractor licensing overview (SimplyWise)", url: "https://www.simplywise.com/blog/new-hampshire-contractor-license/" };

// ---------- the answers ----------
const E = {
  whatWeDo: {
    id: "what-we-do",
    q: "What does Waterfront Construction do?",
    a: `${site.name} is an owner-led home remodeling contractor based in Northborough, Massachusetts. We remodel kitchens and bathrooms, build home additions and decks, replace siding, windows and doors, and paint interiors and exteriors for homeowners in Massachusetts and southern New Hampshire.`,
    links: [{ href: "/services", label: "All six services" }],
  },
  owner: {
    id: "owner",
    q: "Who owns Waterfront Construction?",
    a: `${site.owner} owns the company. He founded ${site.name} in Northborough, Massachusetts, in ${site.founded} and has ${site.experience}+ years of hands-on construction experience.`,
    links: [{ href: "/about/ernando-nunes", label: `About ${site.owner}` }, { href: "/about", label: "About the company" }],
  },
  trackRecord: {
    id: "track-record",
    q: "How many projects has Waterfront Construction completed?",
    a: `${site.projectsCompleted}+ projects, in ${site.townsWithProjects}+ towns. ${cap(word(projects.length))} of them are documented on this site as case studies, with our own photos and site videos.`,
    links: [{ href: "/gallery", label: "Project case studies" }],
  },
  reviews: {
    id: "reviews",
    q: "Where can I read reviews of Waterfront Construction?",
    a: `Our reviews page has ${word(testimonials.length)} testimonials that clients shared with permission, quoted as they wrote them. Our public Google reviews are on our Google Business Profile.`,
    links: [{ href: "/reviews", label: "Client testimonials" }, { href: site.gbp, label: "Google Business Profile", external: true }],
  },
  area: {
    id: "area",
    q: "Which towns does Waterfront Construction serve?",
    a: `We are based in Northborough, Massachusetts (Worcester County) and take projects in ${placesSentence}. The farthest, ${FARTHEST.n}, is about ${townFacts(FARTHEST).miles} miles from Northborough in a straight line.`,
    links: [{ href: "/service-areas", label: "Every town we serve, by county" }],
  },
  nh: {
    id: "new-hampshire",
    q: "Do you work in New Hampshire?",
    a: `Yes. We take projects in ${NH.length} southern New Hampshire towns in ${list(NH_COUNTIES)} counties, including ${list(NH_EXAMPLES)}. New Hampshire has no statewide contractor license; building permits come from each town's building department.`,
    links: [{ href: "/service-areas#new-hampshire", label: "New Hampshire towns we serve" }],
    sources: [NH_SOURCE],
  },
  registered: {
    id: "registered-insured",
    q: hasHic ? "Is Waterfront Construction registered and insured?" : "Are you insured, and how do I check a contractor's registration?",
    a: licensingAnswer("MA"),
    sources: [SOURCES.hic],
  },
  permits: {
    id: "permits",
    q: "Do you take care of the building permit?",
    a: hasCsl
      ? "Yes. We apply for the building permit for our work and schedule the inspections; licensed plumbers, gas fitters and electricians take out their own permits for their part of the job. In Massachusetts, a homeowner who pulls the permit for a contractor's work generally loses access to the state Guaranty Fund."
      : "Permits are part of the plan for every job we quote. In Massachusetts the building permit for structural work is applied for by a Construction Supervisor License holder, licensed plumbers, gas fitters and electricians take out their own permits, and the written contract must say who obtains each permit. A homeowner who pulls the permit for a contractor's work generally loses access to the state Guaranty Fund.",
    sources: [SOURCES.contract],
  },
  whichPermits: {
    id: "which-permits",
    q: "Which projects need a building permit?",
    a: "In Massachusetts, additions, decks, re-siding, replacement windows and exterior doors, and remodels that move walls or change the structure generally need a building permit from the town's building department. Moving plumbing, gas or wiring needs separate permits taken out by Massachusetts-licensed trades. Painting does not need a building permit. In New Hampshire, each town's building department decides which work needs a permit.",
    links: guide("do-you-need-a-permit-to-remodel-massachusetts"),
  },
  lead: {
    id: "pre-1978-homes",
    q: "My house was built before 1978. Does that change anything?",
    a: "Yes. Paint in a pre-1978 home is treated as if it contains lead unless a test shows otherwise. In Massachusetts, work that disturbs more than 6 square feet of painted surface per room inside, more than 20 square feet outside, or replaces any window falls under the state's lead-safe renovation rules (454 CMR 22.00). In New Hampshire, the federal EPA Renovation, Repair and Painting rule applies.",
    sources: [SOURCES.lead],
  },
  contract: {
    id: "contract",
    q: "What should a Massachusetts home improvement contract include?",
    a: "Home improvement work over $1,000 on an owner-occupied home in Massachusetts needs a written contract that includes the price, the payment schedule, the start and completion dates and the contractor's registration number. The deposit can be no more than one-third of the total price, or the cost of special-order materials if that is greater.",
    links: guide("how-to-choose-a-contractor-in-massachusetts"),
    sources: [SOURCES.contract, SOURCES.c142a],
  },
  estimates: {
    id: "free-estimates",
    q: "Are estimates free?",
    a: `Yes. Estimates are free and there is no obligation. Call ${site.phone} (${site.hours}) or send the estimate form, and tell us the town and the type of project.`,
    links: [{ href: "/contact#estimate", label: "Request a free estimate" }],
  },
  // verify against jlconline before next update — figures must match lib/service-content.ts (CVV, New England average, 2025)
  costKb: {
    id: "cost-kitchen-bathroom",
    q: "How much does a kitchen or bathroom remodel cost in Massachusetts?",
    a: "We price every project with an itemized estimate for your house. As a regional benchmark, Remodeling magazine's 2025 Cost vs. Value report puts the New England average at $28,936 for a midrange minor kitchen remodel and $27,559 for a midrange bathroom remodel. These are published averages, not our prices.",
    links: [...hub("kitchen-bathroom-remodeling", "Kitchen & bathroom costs, permits and FAQ"), ...guide("kitchen-remodel-cost-massachusetts"), ...guide("bathroom-remodel-cost-massachusetts")],
    sources: [SOURCES.cvv],
  },
  // verify against jlconline before next update (same report as above)
  costExterior: {
    id: "cost-siding-windows-decks",
    q: "What do siding, window and deck projects cost in New England?",
    a: "The same 2025 Cost vs. Value report lists New England averages of $17,590 for vinyl siding and $20,678 for fiber-cement siding on about 1,250 square feet, $21,922 to replace ten vinyl windows, and $25,817 for a 16-by-20-foot composite deck ($20,603 with pressure-treated wood). Size, materials and the condition of your house move the price.",
    links: [...hub("siding", "Siding costs and options"), ...hub("windows-and-doors", "Window and door costs"), ...hub("decks", "Deck costs and materials"), ...guide("siding-replacement-cost-massachusetts")],
    sources: [SOURCES.cvv],
  },
  financing: {
    id: "financing",
    q: "Do you offer financing?",
    a: "No. We don't offer financing.",
  },
  timeline: {
    id: "timeline",
    q: "How long does a remodeling project take?",
    a: services.map((s) => s.timeline).join(" "),
    links: [{ href: "/services", label: "Typical timelines by service" }],
  },
  contact: {
    id: "contact",
    q: "What are your hours, and how do I reach you?",
    a: `We're open ${site.hours}. Call ${site.phone}, email ${site.email}, or send the estimate form on our contact page. ${site.showStreet ? "Our address is" : "We are based in"} ${displayAddress}.`,
    links: [{ href: "/contact", label: "Contact page" }],
  },
} satisfies Record<string, FaqEntry>;

/** Every pre-hire question, grouped, for /faq. FAQPage markup lives ONLY on /faq: home and /contact show a
 *  selection as visible text, without markup, so no Q&A is marked up on two URLs (V4.1). */
export const faqGroups: FaqGroup[] = [
  { id: "company", title: "About Waterfront Construction", items: [E.whatWeDo, E.owner, E.trackRecord, E.reviews] },
  { id: "area", title: "Where we work", items: [E.area, E.nh] },
  { id: "rules", title: "Registration, insurance and permits", items: [E.registered, E.permits, E.whichPermits, E.lead, E.contract] },
  { id: "cost", title: "Estimates, cost and timing", items: [E.estimates, E.costKb, E.costExterior, E.financing, E.timeline] },
  { id: "contact", title: "Contacting us", items: [E.contact] },
];

export const allFaqs: FaqEntry[] = faqGroups.flatMap((g) => g.items);

/** Home page selection — the same entries (verbatim) as /faq; visible only, no FAQPage markup on home. */
export const homeFaqs: FaqEntry[] = [E.whatWeDo, E.area, E.registered, E.costKb, E.estimates, E.nh];

/** Contact page selection. */
export const contactFaqs: FaqEntry[] = [E.estimates, E.registered, E.area, E.financing];
