// Pillar content for the 10 service hubs (/services/{slug}) and the /services index.
// Audit 02 (§1–§4, §6), 08 §5.2–5.3, 09 AEO-H3/H5, 10 UX-H4, 01 L6; SERVICES-CITIES spec §3.
//
// Truth rules (IMPLEMENTATION.md §2) — read before editing:
// - General rules and code facts are stated as rules, never as company credentials. Never claim the
//   company holds a lead-safe license, EPA certification, warranty, brand certification or price range
//   until the owner supplies it (see OWNER INPUT notes).
// - Costs: only the cited Remodeling "Cost vs. Value" 2025 New England figures, labelled as regional
//   averages, and ONLY on siding, window-replacement, decks, kitchen-remodeling and bathroom-remodeling.
//   Door, additions, whole-home and both painting hubs carry no dollar figure at all (check-claims NO_CVV).
// - Legal/regulatory sentences follow design/FACTS-VERIFIED.md (lead ruling O10): only rows marked VERIFIED there are
//   stated as rules (R4, R8, R8c, R8d, R9, R9a, R14, R14a, R14b, R17, CONTRACT_ROW, basement egress). Rows that are
//   PARTLY or NOT VERIFIED (R4a exterior-door permit, R7b smoke/CO triggers, the "many towns" kitchen/bath permit
//   claim) are phrased as a general pointer to the town's building department, without numbers or legal claims.
//   Outside, the lead threshold is 20 square feet IN TOTAL (not per side), and the cleanup check is a visual one.
// - External links: only URLs that appear in the audit/study notes (they come from real searches).
// - Hub titles/H1s are region-level so they never duplicate the Northborough town pages (owner decision).
// - No "licensed" self-claims anywhere until site.hic is set.
// - No FAQ question or answer may appear on two hubs (R16): twins are reworded to their own scope, never copied.
import { services, PHOTO_CAPTIONS, TESTIMONIAL_SERVICES, type Service, type Photo, type Faq, type ServiceSlug } from "./services";
import { posts } from "./posts";
import { projects, type Project } from "./projects";
import { allCities, citySlug, testimonials, type City } from "./site";
import { hasCsl } from "./credentials";

export type Source = { label: string; url: string };
export type Table = { caption: string; head: string[]; rows: string[][]; note?: string };
export type Section = { id: string; nav: string; h2: string; intro?: string[]; table?: Table; bullets?: string[]; outro?: string[] };
export type HubFaq = Faq & { more?: { href: string; label: string } };
/** A row of the Remodeling 2025 Cost vs. Value report, New England division. `short` names the benchmark in the
 *  "At a glance" box, which lists each benchmark by name (never a synthesized min–max range, V3.5). */
export type Benchmark = { project: string; short: string; scope: string; jobCost: number; recouped: number };

export type ServiceContent = {
  slug: ServiceSlug;
  metaTitle: string; // without the brand (the root layout template appends " | Waterfront Construction")
  metaDescription: string;
  h1: string;
  summary: string; // answer-first, ≤ 60 words, visible under the H1 and used as Service.description in JSON-LD
  cardSummary: string; // one line for the /services index card
  noun: string; // "siding project", used in CTAs ("Planning a {noun}?"): must take the article "a"
  hero?: Photo; // real photo shown in the hero; undefined → text-only gradient hero (painting, whole-home)
  og?: { slug: string; alt: string }; // public/og/{slug}.jpg (1200×630: a real-photo crop, or the typographic card); undefined → default brand card
  intro: string[];
  sections: Section[]; // hub-specific modules (materials tables, code basics, …)
  cost: { h2: string; answer: string; benchmark?: Benchmark[]; drivers: string[]; guides: string[] };
  permitShort: string; // one-line permit answer for the "At a glance" box (Massachusetts)
  permits: { intro: string; table: Table; nh: string };
  // "Homes built before 1978" section. `full` = the ONE canonical copy of LEAD_SAFE_RULES (exterior-painting hub,
  // #lead-safe); other hubs show only their service-specific intro and link to it (V3.10: no repeated rule block).
  leadSafe?: { intro: string; full?: boolean };
  process: { steps: { step: string; detail: string }[] };
  faqs: HubFaq[]; // 6–10 service-specific, answer-first; unique across hubs (R16)
  related: ServiceSlug[]; // 3 service slugs (spec §3)
  guides: string[]; // blog slugs; slugs that do not exist (yet) in lib/posts.ts are skipped at render time
  sources: Source[];
  reviewedOn?: string; // OWNER INPUT: ISO date the owner actually reviewed this page → shows "Reviewed by Ernando Nunes" + schema reviewedBy
};

// ---------- sources (URLs taken from the audit/study notes only) ----------
export const SOURCES = {
  cvv: { label: "Remodeling 2025 Cost vs. Value Report, New England (JLC / Zonda)", url: "https://www.jlconline.com/cost-vs-value/2025/new-england/" },
  cvvData: { label: "Cost vs. Value report data (free download)", url: "https://www.costvsvalue.com" },
  lead: { label: "Mass.gov: Lead-safe renovation for contractors", url: "https://www.mass.gov/info-details/lead-safe-renovation-for-contractors" },
  contract: { label: "Mass.gov: Home improvement contract requirements", url: "https://www.mass.gov/info-details/home-improvement-contract-requirements-details-and-sample-language" },
  c142a: { label: "M.G.L. c.142A §2: home improvement contracts", url: "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXX/Chapter142A/Section2" },
  hic: { label: "Mass.gov: Home Improvement Contractor program resources", url: "https://www.mass.gov/info-details/hic-contractor-resources" },
  cmr18: { label: "201 CMR 18.00: Home Improvement Contractor registration", url: "https://www.mass.gov/regulations/201-CMR-1800-registration-and-enforcement-of-home-improvement-contractor-program" },
} satisfies Record<string, Source>;

// Required Cost vs. Value credit line. // verify against jlconline before next update (exact wording + figures)
export const CVV_CREDIT = "© 2025 Zonda Media, a Delaware corporation. Complete data from the Remodeling 2025 Cost vs. Value Report can be downloaded free at www.costvsvalue.com.";
export const CVV_LABEL = "New England average, 2025";

// Remodeling 2025 Cost vs. Value, New England division (study/03-aeo-geo.md §10A). The 8 approved figures — the only ones.
// verify against jlconline before next update — figures AND scope wording.
const CVV = {
  vinylSiding: { project: "Vinyl siding replacement", short: "Vinyl siding, about 1,250 sq ft", scope: "Replace about 1,250 sq ft of siding with vinyl siding, including trim", jobCost: 17590, recouped: 92.7 },
  fiberCementSiding: { project: "Fiber-cement siding replacement", short: "Fiber-cement siding, about 1,250 sq ft", scope: "Replace about 1,250 sq ft of siding with fiber-cement siding, including trim", jobCost: 20678, recouped: 144.9 },
  vinylWindows: { project: "Vinyl window replacement", short: "Ten vinyl replacement windows", scope: "Replace ten 3 × 5 ft double-hung windows with vinyl windows", jobCost: 21922, recouped: 71.2 },
  woodWindows: { project: "Wood window replacement", short: "Ten wood replacement windows", scope: "Replace ten 3 × 5 ft double-hung windows with wood windows", jobCost: 27226, recouped: 69.7 },
  minorKitchen: { project: "Minor kitchen remodel, midrange", short: "Minor kitchen remodel (midrange)", scope: "A 200 sq ft kitchen: new cabinet fronts and hardware, laminate counters, sink and faucet, oven and cooktop, flooring and paint", jobCost: 28936, recouped: 134.3 },
  bath: { project: "Bathroom remodel, midrange", short: "Bathroom remodel (midrange)", scope: "Update a 5 × 7 ft bathroom: new tub with ceramic tile surround, fixtures, solid-surface vanity top and tile floor", jobCost: 27559, recouped: 90.5 },
  compositeDeck: { project: "Deck addition, composite", short: "16 × 20 ft composite deck", scope: "Add a 16 × 20 ft deck on a pressure-treated frame, with composite decking, railing and stairs", jobCost: 25817, recouped: 95.8 },
  woodDeck: { project: "Deck addition, wood", short: "16 × 20 ft pressure-treated wood deck", scope: "Add a 16 × 20 ft deck with pressure-treated decking, railing and stairs", jobCost: 20603, recouped: 79.1 },
} satisfies Record<string, Benchmark>;

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
/** "At a glance" cost line: each benchmark named, never a min–max range across different projects (V3.5). */
export const benchmarkGlance = (list: Benchmark[]) =>
  `${list.map((b) => `${b.short}: ${usd(b.jobCost)}`).join(" · ")} (${CVV_LABEL}, Remodeling Cost vs. Value). Larger or custom scopes cost more; see the cost table below.`;

// ---------- shared rule text (stated as rules; never as a company credential) ----------
const NH_NOTE = "New Hampshire has no statewide contractor license. Building permits come from each town's building department, and the federal EPA Renovation, Repair and Painting (RRP) rule governs lead-safe work on homes built before 1978.";
const NH_TRADES = "New Hampshire has no statewide contractor license. Building permits come from each town's building department, and plumbers and electricians need New Hampshire state licenses for their part of the work.";
const CSL_PERMIT = hasCsl
  ? "The contractor's Construction Supervisor License holder applies to the town's building department; we do this for our jobs."
  : "The contractor's Construction Supervisor License holder applies to the town's building department; the written contract must say who obtains each permit.";
/** First-person permit claims ("we apply for the permit", "we schedule the inspections") render only once site.csl is
 *  set (V1.4/V3.2). Until then every such string states the general Massachusetts rule instead. */
const weOr = (we: string, rule: string) => (hasCsl ? we : rule);
/** One-line permit answer for the /services "How we work" list (gated like every other permit claim). */
export const PERMITS_HOW = weOr(
  "We apply for the building permit and schedule inspections; plumbing, gas and electrical permits are pulled by those trades.",
  "In Massachusetts the contractor's Construction Supervisor License holder applies for the building permit, and the written contract must say who obtains each permit; plumbing, gas and electrical permits are pulled by those trades.",
);
const LEAD_ROW = (when: string) => ["Lead-safe renovation rules", when, "A contractor holding a Massachusetts Lead-Safe Renovation Contractor license, with a certified renovator directing the work."];
const CONTRACT_WHO = "The contractor, who must be registered with the state Home Improvement Contractor program.";
const CONTRACT_ROW = ["Written contract", "Home improvement work over $1,000 on an owner-occupied home in Massachusetts needs a written contract, and the deposit is limited.", CONTRACT_WHO];
// The same rule without a dollar figure, for the hubs that must carry none (door, additions, whole-home and painting hubs;
// check-claims NO_CVV bans any "$1,000"-style figure in their <main>). The threshold is on the linked mass.gov page.
const CONTRACT_ROW_PLAIN = ["Written contract", "Home improvement work on an owner-occupied home in Massachusetts needs a written contract above a set dollar amount, and the deposit is limited.", CONTRACT_WHO];
// R7b is PARTLY verified (Massachusetts names specific triggers, such as adding a bedroom): a pointer, not a rule.
const SMOKE_CO_ROW = ["Smoke and CO alarms", "Some remodels require bringing the home's smoke and carbon monoxide alarms up to current rules; your building department says whether yours does.", "Checked by the building inspector."];
const PERMIT_GUIDE = "/blog/do-you-need-a-permit-to-remodel-massachusetts";
const PERMIT_GUIDE_LABEL = "Massachusetts remodeling permits guide";

/** Rules for pre-1978 homes. Rendered in full ONLY on the canonical section LEAD_SAFE_HREF (exterior-painting hub);
 *  other pages give one service-specific sentence and link there (V3.10). Stated as rules only, never as a company credential. */
export const LEAD_SAFE_HREF = "/services/exterior-painting#lead-safe";
export const LEAD_SAFE_RULES = [
  "The rules cover paid renovation in homes built before 1978 that disturbs more than 6 square feet of painted surface per room inside, or more than 20 square feet in total outside, and any window replacement.",
  "In Massachusetts, the company doing that work must hold a Lead-Safe Renovation Contractor license from the Department of Labor Standards, with a certified renovator directing the work. This is separate from Home Improvement Contractor registration and the Construction Supervisor License.",
  "Before work starts, the homeowner receives the lead hazard information pamphlet.",
  "Work areas are contained with plastic sheeting, and open-flame burning or power sanding and planing without HEPA dust collection are not allowed.",
  "Cleanup uses HEPA vacuums and wet wiping, followed by a cleaning check before the area is reopened.",
  "Unless a test shows otherwise, painted surfaces in a pre-1978 home are treated as if they contain lead.",
];
export const LEAD_SAFE_OUTRO = "Ask any contractor for their lead-safe license number before work starts on a pre-1978 home. In New Hampshire, the federal EPA RRP rule applies instead.";

// ---------- per-service content (D10 order: outside the house, then inside) ----------
const CONTENT: ServiceContent[] = [
  // ===================== SIDING =====================
  {
    slug: "siding",
    metaTitle: "Siding Contractor in Central & Eastern MA",
    metaDescription: "Vinyl, fiber-cement and engineered-wood siding replacement, plus trim, soffit and fascia, for homes in Central & Eastern Massachusetts. Free estimates.",
    h1: "Siding Replacement & Installation in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, replaces and installs vinyl, fiber-cement and engineered-wood siding with trim, soffit and fascia. Most single-family re-siding jobs take about 1–2 weeks of work once materials arrive. We remove the old siding so the sheathing can be inspected and a proper weather barrier installed.",
    cardSummary: "Vinyl, fiber-cement and engineered-wood siding, with trim, soffit, fascia, house wrap and flashing.",
    noun: "siding project",
    og: { slug: "service-siding", alt: "White vertical siding and three arched windows on a home addition in Lynnfield, MA" },
    intro: [
      "Siding is the layer that keeps rain and snowmelt out of your walls. In New England it takes wind-driven rain, freeze-thaw cycles and strong summer sun, so how it is installed matters as much as which product you pick: the weather barrier behind it, the flashing at every window, door and roof edge, and fasteners placed the way the manufacturer specifies.",
      "We handle the whole job: removing the old siding and trim, replacing damaged sheathing, installing house wrap and flashing, then the new siding, trim, soffit and fascia, followed by cleanup and haul-away. The Lynnfield photos on this page show those stages on a real house: taped sheathing, house wrap, then new white siding going on.",
    ],
    sections: [
      {
        id: "materials", nav: "Materials", h2: "Siding materials compared",
        intro: ["These are the siding materials most often compared for New England homes. Relative costs below compare the materials only; labor, trim and repairs often matter more to the final price."],
        table: {
          caption: "Common siding materials for New England homes (relative comparison)",
          head: ["Material", "Up-front cost", "Upkeep", "What to know in New England"],
          rows: [
            ["Vinyl", "$ (lowest)", "Wash occasionally; no painting", "Must be nailed loosely enough to expand and contract with temperature. Can crack if struck in deep cold, and can warp from a grill or reflected sun too close to it."],
            ["Insulated vinyl", "$$", "Same as vinyl", "Foam backing makes panels stiffer and adds some insulation value."],
            ["Fiber cement", "$$–$$$", "Repaint over time; factory-finished boards last longer between coats", "Heavy, so installation takes more labor. Needs the manufacturer's clearances from roofs, decks and the ground. Resists fire better than vinyl or wood, and dents less than vinyl."],
            ["Engineered wood", "$$", "Prefinished; repaint over time", "Lighter than fiber cement. Cut edges must be sealed and clearances kept so the boards do not absorb water."],
            ["Cedar shingles or clapboards", "$$$", "Stain or paint on a regular cycle", "The traditional New England look, and often preferred in historic districts."],
          ],
          note: "We confirm the exact product line, profile and color with you before ordering.",
        },
      },
      {
        id: "behind-the-siding", nav: "Weather barrier", h2: "What goes behind the siding",
        intro: ["The parts you never see decide whether the walls stay dry:"],
        bullets: [
          "A water-resistive barrier, such as house wrap or a sheathing system with taped seams. The building code requires one behind siding, and it is the wall's second line of defense when wind drives rain past the cladding.",
          "Flashing at windows, doors and other openings, lapped so water drains outward.",
          "Kick-out flashing where a roof edge meets a wall. Without it, water running off the roof edge can get behind the siding, a common cause of rotted sheathing and trim.",
          "A sheathing check after tear-off: soft or rotted boards are replaced before anything new goes on.",
          "Clearances: siding stops short of roofs, decks and the ground by the distance the manufacturer requires, so it does not wick up water.",
        ],
        outro: ["On the Lynnfield addition you can see the weather-barrier stage: green sheathing panels with taped seams on the new walls and house wrap on the original house, before the siding went on."],
      },
    ],
    cost: {
      h2: "What does siding replacement cost in Massachusetts?",
      answer: "For a regional benchmark, Remodeling magazine's 2025 Cost vs. Value report puts the New England average at $17,590 to replace about 1,250 square feet of vinyl siding and $20,678 for fiber-cement siding. Your price depends mostly on wall area, number of stories, trim detail and repairs found under the old siding.",
      benchmark: [CVV.vinylSiding, CVV.fiberCementSiding],
      drivers: [
        "Wall area and number of stories (taller walls need staging)",
        "How much trim, soffit and fascia is replaced, and its level of detail",
        "Rotted sheathing or trim found after the old siding comes off",
        "Removal and disposal of the old siding, more so when there are several layers",
        "Lead-safe rules (containment and cleanup) when painted surfaces on a pre-1978 home are disturbed",
        "The material, profile and color you choose",
      ],
      guides: ["siding-replacement-cost-massachusetts"],
    },
    permitShort: "Usually required: most Massachusetts towns issue a building permit for re-siding, often a short-form permit.",
    permits: {
      intro: "Re-siding is regulated more than many homeowners expect. In Massachusetts:",
      table: {
        caption: "Siding permits and rules in Massachusetts",
        head: ["Permit or rule", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "Most Massachusetts towns require one to re-side a house, often a short-form permit for siding, roofing and windows.", CSL_PERMIT],
          ["Historic district review", "If the house is in a local historic district, exterior changes usually need the commission's approval before work starts.", "The property owner applies; we can provide product details and photos for the application."],
          LEAD_ROW("Homes built before 1978, when the work disturbs more than 20 sq ft of exterior painted surface in total."),
          CONTRACT_ROW,
        ],
      },
      nh: NH_NOTE,
    },
    leadSafe: { intro: "Paint applied before 1978 may contain lead, and removing old siding, trim and painted clapboards can release lead dust and chips. On a pre-1978 home, re-siding that disturbs more than 20 square feet of exterior painted surface in total falls under the lead-safe renovation rules; in Massachusetts that work must be done by a firm holding a Lead-Safe Renovation Contractor license." },
    process: {
      steps: [
        { step: "Estimate visit", detail: "We look at the walls, trim and roof edges, measure, and talk through materials and colors. You get an itemized written estimate." },
        { step: "Contract and order", detail: "A written contract, then siding, trim and accessories are ordered once you approve colors and profiles." },
        { step: "Permit", detail: weOr("We apply for the building permit; review time varies by town.", "The contractor's Construction Supervisor License holder applies for the building permit, and the written contract says who obtains it; review time varies by town.") },
        { step: "Tear-off and repairs", detail: "The old siding and trim come off, and any damaged sheathing is replaced." },
        { step: "Weather barrier and flashing", detail: "House wrap, window and door flashing, and kick-out flashing at roof-to-wall joints." },
        { step: "Siding and trim", detail: "New siding, corner boards, window and door trim, soffit and fascia." },
        { step: "Cleanup and walkthrough", detail: "Debris is hauled away and we walk the house with you, plus the town's final inspection where required." },
      ],
    },
    faqs: [
      { q: "How much does siding replacement cost in Massachusetts?", a: "Remodeling magazine's 2025 Cost vs. Value report puts the New England average at $17,590 for about 1,250 square feet of vinyl siding and $20,678 for fiber-cement siding. Wall area, stories, trim and repairs under the old siding move the price; we give an itemized estimate after a free site visit.", more: { href: "#cost", label: "Cost benchmarks and drivers" } },
      { q: "Is vinyl or fiber-cement siding better for a New England house?", a: "Both hold up well when installed correctly. Vinyl costs less and needs no paint, but it can crack on impact in deep cold. Fiber cement costs more, is heavier and resists fire and impact better, but it needs repainting over time. In the 2025 Cost vs. Value data for New England, fiber cement recouped more of its cost at resale (144.9% vs. 92.7%).", more: { href: "/blog/vinyl-vs-fiber-cement-siding", label: "Vinyl vs. fiber-cement siding guide" } },
      { q: "Should the old siding be removed or covered over?", a: "In most cases we recommend removing it. Tear-off exposes the sheathing so rotted boards can be replaced, and it allows a continuous weather barrier and new flashing; siding installed over old siding hides those problems." },
      { q: "Do I need a permit to replace siding in Massachusetts?", a: "Usually, yes. Most Massachusetts towns require a building permit for re-siding, often a short-form permit, taken out by a Construction Supervisor License holder; the written contract must say who obtains it. Homes in a local historic district may also need the commission's approval first.", more: { href: PERMIT_GUIDE, label: PERMIT_GUIDE_LABEL } },
      { q: "Is house wrap required behind new siding?", a: "Yes. The building code requires a water-resistive barrier behind siding, such as house wrap or a sheathing system with taped seams. It drains water that gets past the siding and protects the sheathing from rot." },
      { q: "My house was built before 1978. What changes for re-siding?", a: "Lead-safe rules apply when the work disturbs more than 20 square feet of exterior painted surface in total. In Massachusetts that means a contractor with a Lead-Safe Renovation Contractor license, containment, no open-flame burning or uncontrolled power sanding, and HEPA cleanup with a cleaning check.", more: { href: "#lead-safe", label: "Lead-safe rules for pre-1978 homes" } },
      { q: "Should I repair my siding or replace it?", a: "Repair makes sense when damage is limited to a few boards and the wall behind them is dry. Widespread cracking, warping, loose panels or soft spots in the wall behind the siding usually point to replacement.", more: { href: "/blog/signs-its-time-to-replace-your-siding", label: "Signs it is time to replace your siding" } },
      { q: "Can new siding match an addition or the rest of the house?", a: "Yes. Matching starts with the existing profile, exposure and color; if an exact match is no longer made, re-siding a whole wall or the whole house keeps it consistent. On the Lynnfield project shown here, the addition and the main house's second floor were sided at the same time (vertical siding on the addition, lap siding on the house)." },
      { q: "Will new siding lower my energy bills?", a: "Siding by itself adds little insulation. Savings come from sealing air leaks and fixing the weather barrier during re-siding, or from choosing insulated siding or adding rigid foam under it. We can tell you whether that is worth it for your house." },
      { q: "What time of year can siding be installed in Massachusetts?", a: "Most siding can go on year-round. Caulks, sealants and paints list minimum temperatures on their labels, and vinyl is more brittle in deep cold, so very cold days can limit some steps. Material lead times often matter as much as the weather." },
    ],
    related: ["window-replacement", "door-installation", "exterior-painting"],
    guides: ["siding-replacement-cost-massachusetts", "vinyl-vs-fiber-cement-siding", "signs-its-time-to-replace-your-siding", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts"],
    sources: [SOURCES.cvv, SOURCES.lead, SOURCES.contract],
  },

  // ===================== WINDOW REPLACEMENT =====================
  {
    slug: "window-replacement",
    metaTitle: "Window Replacement in Central & Eastern MA",
    metaDescription: "Replacement windows, insert or full-frame, flashed, insulated and sealed, with interior trim. See the arched windows on our Lynnfield, MA addition.",
    h1: "Window Replacement in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, replaces windows, insert or full-frame, with flashing, sealing and interior trim. Most window replacements take 1–3 days of installation, depending on the number of openings. Replacement units must not shrink bedroom escape openings, and they must meet the energy code for our climate.",
    cardSummary: "Replacement windows, insert or full-frame, flashed, insulated and sealed, with interior trim and casing.",
    noun: "window replacement project",
    og: { slug: "service-window-replacement", alt: "Three new arched windows with factory labels still on, set into green sheathing with taped seams on a home addition in Lynnfield, MA" },
    intro: [
      "Old or failed windows show up as drafts, fogged glass between the panes, sashes that stick or will not stay open, and rot at the sill. Replacing them is partly a product choice and partly an installation job: each unit has to be flashed, insulated and sealed into the wall so water and air stay out.",
      "We replace windows and finish the interior trim and casing. The photos on this page come from the Lynnfield addition, where new arched windows went into the new walls before the siding.",
    ],
    sections: [
      {
        id: "replacement-types", nav: "Insert or full-frame", h2: "Insert or full-frame replacement?",
        intro: ["There are two ways to replace a window, and the condition of the existing frame usually decides which one fits."],
        table: {
          caption: "Insert (pocket) vs. full-frame window replacement",
          head: ["", "Insert (pocket) replacement", "Full-frame replacement"],
          rows: [
            ["What is replaced", "The sashes, with a new frame set inside the existing frame", "The whole window, down to the rough opening"],
            ["Interior and exterior trim", "Usually stays in place", "Removed, then reinstalled or replaced"],
            ["Glass area", "Slightly smaller, because the new frame sits inside the old one", "The same as before, or larger"],
            ["Flashing", "Relies on the existing frame and new sealant", "New flashing can be tied into the wall's weather barrier"],
            ["Best when", "The existing frame is square, solid and dry", "There is rot or leaking around the frame, you want a new size, or the house is being re-sided"],
          ],
        },
      },
      {
        id: "frames", nav: "Frame materials", h2: "Window frame materials",
        table: {
          caption: "Window frame materials (relative comparison)",
          head: ["Frame", "Up-front cost", "Upkeep", "Notes"],
          rows: [
            ["Vinyl", "$", "Wash only; colors are factory-set", "A common replacement choice; good insulation for the cost."],
            ["Fiberglass", "$$", "Low; can be painted", "Expands and contracts much like glass, so it stays stable through temperature swings."],
            ["Wood", "$$$", "Paint or stain on a regular cycle", "Traditional look; often favored for older and historic homes."],
            ["Clad wood", "$$–$$$", "Low outside; the wood interior can be painted or stained", "Aluminum or vinyl cladding protects the exterior, with wood inside."],
            ["Composite", "$$", "Low", "Made from wood fiber and resin; resists rot."],
          ],
        },
      },
      {
        id: "performance", nav: "Labels and code", h2: "Reading the label, and the code rules that come with new windows",
        bullets: [
          "U-factor measures heat loss through the whole window; lower is better in a heating climate like ours. Replacement windows must meet the energy code's U-factor requirement for our climate zone.",
          "Solar heat gain coefficient (SHGC) measures how much of the sun's heat comes through. Choose it by the direction each window faces.",
          "Low-E coatings and gas fills between the panes improve the U-factor; the NFRC label on each unit lists its rated numbers.",
          // IRC R310.2.5 (2021 IRC, base of 780 CMR 51) replacement-window exemption — verify there is no 780 CMR 51 amendment before next update.
          "A replacement window in a bedroom's emergency escape opening must not shrink that opening: it has to be the largest standard size that fits the existing frame or rough opening, in the same operating style or one with an equal or larger clear opening. That can rule out some insert units.",
          "Glass near doors, in or next to tubs and showers, and along stairs must be safety glazing (tempered or laminated).",
          "Upper-story windows with low sills may need fall protection, such as window opening control devices.",
        ],
      },
    ],
    cost: {
      h2: "What does window replacement cost in Massachusetts?",
      answer: "As a regional benchmark, Remodeling magazine's 2025 Cost vs. Value report puts the New England average at $21,922 to replace ten 3-by-5-foot double-hung windows with vinyl windows and $27,226 with wood windows. Your price depends on the number and size of windows, insert or full-frame installation, frame material and trim work.",
      benchmark: [CVV.vinylWindows, CVV.woodWindows],
      drivers: [
        "Number and size of windows",
        "Insert versus full-frame installation",
        "Frame material, glass package and color",
        "Custom shapes such as arched or round tops",
        "Rot repair and new exterior trim",
        "Lead-safe practices on pre-1978 homes, where any window replacement is covered",
        "Interior trim and painting",
      ],
      guides: ["window-replacement-cost-massachusetts"],
    },
    permitShort: "Usually required: most Massachusetts towns require a building permit for replacement windows.",
    permits: {
      intro: "Replacement windows come with permit and code steps. In Massachusetts:",
      table: {
        caption: "Window permits and rules in Massachusetts",
        head: ["Permit or rule", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "Most Massachusetts towns require one for replacement windows, often a short-form permit.", CSL_PERMIT],
          ["Energy code", "Replacement windows must meet the energy code's U-factor requirement for the climate zone.", "Checked against the NFRC label on each unit."],
          ["Historic district review", "Local historic district commissions often review window changes visible from the street.", "The property owner applies; we can provide product specifications."],
          LEAD_ROW("Any window replacement in a home built before 1978."),
          CONTRACT_ROW,
        ],
      },
      nh: NH_NOTE,
    },
    leadSafe: { intro: "Old painted window sashes and frames are a well-known source of lead dust, because opening and closing them grinds the paint. That is why every window replacement in a pre-1978 home falls under the lead-safe renovation rules, whatever the area disturbed; in Massachusetts the work must be done by a firm holding a Lead-Safe Renovation Contractor license." },
    process: {
      steps: [
        { step: "Estimate visit", detail: "We check each window, the frames and sills, measure, and talk through styles and options. You get an itemized written estimate." },
        { step: "Order", detail: "Windows are usually made to order for your openings, so the install date follows the manufacturer's delivery date." },
        { step: "Permit", detail: weOr("We apply for the building permit where the town requires one.", "Where the town requires a building permit, the contractor's Construction Supervisor License holder applies for it; the written contract says who obtains it.") },
        { step: "Removal", detail: "Old sashes or whole units come out, depending on insert or full-frame installation." },
        { step: "Installation", detail: "New units are set level and square, flashed, insulated around the frame and sealed." },
        { step: "Trim, cleanup and walkthrough", detail: "Interior casing and exterior trim are finished, debris is removed, and we check each window with you." },
      ],
    },
    faqs: [
      { q: "How much does window replacement cost in Massachusetts?", a: "Remodeling magazine's 2025 Cost vs. Value report puts the New England average at $21,922 to replace ten 3-by-5-foot double-hung windows with vinyl windows and $27,226 with wood windows. Count, size, frame material and installation type set your price; we itemize it after a free visit.", more: { href: "#cost", label: "Cost benchmarks and drivers" } },
      { q: "Should I choose insert or full-frame replacement windows?", a: "Choose insert replacement when the existing frames are square, solid and dry; it keeps your trim and costs less. Choose full-frame when there is rot or leaking around the frame, when you want a different size, or when the house is being re-sided, because new flashing can then tie into the weather barrier." },
      { q: "Are triple-pane windows worth it in Central Massachusetts?", a: "Sometimes. Triple-pane glass lowers heat loss and outside noise, but it costs more and the units are heavier. For many homes here, a well-installed double-pane window with low-E glass is a sound choice; compare U-factors on the NFRC labels before deciding." },
      { q: "Do I need a permit to replace windows in Massachusetts?", a: "Usually, yes. Most Massachusetts towns require a building permit for replacement windows, often a short-form permit taken out by a Construction Supervisor License holder. Homes in a local historic district may also need the commission's approval for visible changes.", more: { href: PERMIT_GUIDE, label: PERMIT_GUIDE_LABEL } },
      { q: "Can just a foggy glass unit be replaced?", a: "Often, yes: a fogged insulated glass unit or sash can be replaced without replacing the whole window, if the frame is sound and parts are still available. If several windows are failing or the frames are rotting, full replacement is usually the better value." },
      { q: "My house was built before 1978. What changes for window replacement?", a: "Federal and Massachusetts lead-safe rules cover any window replacement in a pre-1978 home. The work must be done by a contractor with a Massachusetts Lead-Safe Renovation Contractor license, with containment, HEPA cleanup and a cleaning check before the area is reopened.", more: { href: "#lead-safe", label: "Lead-safe rules for pre-1978 homes" } },
      { q: "How long does window replacement take?", a: "Most window replacements take 1–3 days of installation, depending on the number of openings. Windows are usually made to order, so the install date depends on the manufacturer's delivery time." },
      { q: "Will my interior trim be kept?", a: "With insert replacement, the interior trim usually stays in place. With full-frame replacement it comes off and is reinstalled or replaced, and we can match the existing casing or upgrade it." },
      { q: "Do new windows really save energy?", a: "Replacing single-pane or failed double-pane windows reduces heat loss and drafts. How much you save depends on what you are replacing, how well the new units are installed and sealed, and the rest of the house, so we do not quote a savings figure.", more: { href: "/blog/signs-you-need-new-windows", label: "Signs it is time to replace your windows" } },
    ],
    related: ["door-installation", "siding", "exterior-painting"],
    guides: ["window-replacement-cost-massachusetts", "signs-you-need-new-windows", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts"],
    sources: [SOURCES.cvv, SOURCES.lead, SOURCES.contract],
  },

  // ===================== DOOR INSTALLATION =====================
  // Scope is what lib/services.ts lists (entry and patio doors); storm and interior doors are not offered (owner item O2).
  // No timeline numbers and no cost figure: neither is documented for doors.
  {
    slug: "door-installation",
    metaTitle: "Door Installation in Central & Eastern MA",
    metaDescription: "Entry and patio doors installed with sill flashing, weatherstripping and trim, by an owner-led Northborough, MA contractor. See a new entry door in Lynnfield.",
    h1: "Entry & Patio Door Installation in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, installs and replaces entry doors and sliding or hinged patio doors. Each door gets a sill pan or flashing under the threshold, weatherstripping that seals on all sides, and trim. Our Lynnfield case study shows the sill flashing under a new entry door before its step was built.",
    cardSummary: "Entry doors and sliding or hinged patio doors, with a sill pan, flashing, weatherstripping and trim.",
    noun: "door project",
    og: { slug: "service-door-installation", alt: "New entry door in protective plastic, with flashing membrane at the sill and a wood form for its step, on a home addition in Lynnfield, MA" },
    intro: [
      "An exterior door has to keep water out at the threshold and seal against air on every side, while opening and closing every day. Drafts, daylight showing around the edges, a door that sticks or will not latch, and soft wood at the sill are the usual signs that a door or its frame needs attention.",
      "We install entry doors and sliding or hinged patio doors, with the sill pan or flashing, weatherstripping and trim each one needs. The photos on this page come from the Lynnfield addition, where a new side entry door went into the addition: flashing membrane at the sill, then a wood form for its step, then siding around it.",
    ],
    sections: [
      {
        id: "doors", nav: "Entry and patio doors", h2: "Entry and patio doors: the main choices",
        bullets: [
          "Entry doors: fiberglass resists dents and can look like wood; steel is strong and economical; wood looks traditional but needs refinishing.",
          "Patio doors: sliding doors save floor space; hinged (French) doors open the full width.",
          "Storm doors add a layer of protection in front of an older entry door.",
        ],
      },
      {
        id: "threshold", nav: "Sill and flashing", h2: "What keeps water out at the threshold",
        bullets: [
          "Every exterior door needs a sill pan or flashing under the threshold so water that gets in drains back out, plus weatherstripping that seals on all sides.",
          "Flashing at the sides and head of the opening is lapped into the wall's weather barrier, so water drains outward.",
          "Soft or rotted wood at the sill and the bottom of the frame is repaired before the new door is set.",
        ],
        outro: ["The Lynnfield photos show the flashing membrane under a new entry door before its step was built."],
      },
    ],
    cost: {
      h2: "What does door installation cost in Massachusetts?",
      answer: "We do not publish a door price range, and we do not use a published benchmark for doors: the price depends on the door itself, a new or an existing opening, the condition of the frame and sill, and the trim and finish work. We give you an itemized estimate after looking at each opening.",
      drivers: [
        "Number of doors",
        "Entry or patio door, and its size",
        "Door material, glass and hardware",
        "A new opening or an existing one, and the condition of the frame and sill",
        "Rot repair at the sill and the bottom of the frame",
        "Exterior trim, interior casing and painting",
        "Lead-safe rules (containment and cleanup) when a door job on a pre-1978 home is covered by them",
      ],
      guides: [],
    },
    permitShort: "Replacing an exterior door may need a building permit; ask your town's building department whether yours does.",
    permits: {
      intro: "Door work has fewer permit steps than an addition, but a few rules apply. In Massachusetts:",
      table: {
        caption: "Door permits and rules in Massachusetts",
        head: ["Permit or rule", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "Replacing an exterior door may need one; your town's building department says whether your project does.", CSL_PERMIT],
          ["Safety glazing", "Glass in or next to a door must be safety glazing (tempered or laminated).", "Confirmed from the door's product specifications."],
          ["Historic district review", "Local historic district commissions often review door changes visible from the street.", "The property owner applies; we can provide product specifications."],
          LEAD_ROW("Homes built before 1978, when the door work disturbs more than 6 sq ft of painted surface in the room or more than 20 sq ft in total outside."),
          CONTRACT_ROW_PLAIN,
        ],
      },
      nh: NH_NOTE,
    },
    leadSafe: { intro: "Paint applied before 1978 may contain lead, and cutting out an old painted door frame and trim disturbs it. Unlike a window replacement, which is always covered, a door replacement in a pre-1978 home falls under the lead-safe renovation rules (454 CMR 22.00) only when it disturbs more than 6 square feet of painted surface in the room or more than 20 square feet in total outside." },
    process: {
      steps: [
        { step: "Estimate visit", detail: "We check each door, its frame and sill, measure, and talk through styles and options. You get an itemized written estimate." },
        { step: "Order", detail: "Doors are usually ordered to fit your openings, so the install date follows the delivery date." },
        { step: "Permit", detail: weOr("We apply for the building permit where the town requires one.", "Where the town requires a building permit, the contractor's Construction Supervisor License holder applies for it; the written contract says who obtains it.") },
        { step: "Removal and repairs", detail: "The old door and, where needed, its frame come out, and soft wood at the sill is repaired." },
        { step: "Sill pan and setting", detail: "The sill pan or flashing goes in first, then the door is set level, plumb and square, fastened and sealed." },
        { step: "Weatherstripping, trim and walkthrough", detail: "Weatherstripping is adjusted to seal on all sides, the casing and exterior trim are finished, and we check each door with you." },
      ],
    },
    faqs: [
      { q: "How much does a new entry or patio door cost?", a: "We do not publish a door price range. The door itself, a new or an existing opening, the condition of the frame and sill, and the trim work set the price; we give you an itemized estimate after a free visit.", more: { href: "#cost", label: "What drives the cost of a door" } },
      { q: "What's the difference between sliding and hinged patio doors?", a: "A sliding patio door saves floor space, because its panel slides past the fixed one instead of swinging into the room. A hinged (French) door swings open and gives you the full width of the opening. Both need the same sill pan, flashing and weatherstripping." },
      { q: "How is a door sill flashed?", a: "A sill pan or flashing membrane goes under the threshold before the door is set, so water that gets past the door drains back out instead of soaking the framing below. Weatherstripping then seals the door on all sides. Our Lynnfield photos show the flashing membrane under a new entry door before its step was built.", more: { href: "/projects/home-addition-exterior-lynnfield-ma", label: "Lynnfield addition and exterior case study" } },
      { q: "Fiberglass, steel or wood: which entry door should I choose?", a: "Fiberglass resists dents and can look like wood, steel is strong and economical, and wood looks traditional but needs refinishing. The right one depends on the look you want, how much sun and weather the door takes, and the upkeep you are willing to do." },
      { q: "Can a door be replaced at the same time as the windows?", a: "Yes. When doors are replaced along with the windows, one crew handles the flashing, trim and finishes on one schedule.", more: { href: "/services/window-replacement", label: "Window replacement" } },
      { q: "Do I need a permit to replace an exterior door in Massachusetts?", a: "It may need one. Ask your town's building department whether your door replacement needs a building permit; where one is needed, a Construction Supervisor License holder takes it out. If the house is in a local historic district, changes visible from the street may also need the commission's approval.", more: { href: `${PERMIT_GUIDE}#windows`, label: "Permits for windows and doors" } },
      { q: "My house was built before 1978. Do lead-safe rules apply to a door?", a: "Above a set amount of disturbed paint, yes. Unlike a window replacement, a door replacement in a pre-1978 home falls under the lead-safe rules only when it disturbs more than 6 square feet of painted surface in the room or more than 20 square feet in total outside, for example by cutting out a painted frame and trim.", more: { href: LEAD_SAFE_HREF, label: "Lead-safe rules for pre-1978 homes" } },
      { q: "How long does door installation take?", a: "Door installation time depends on the number of doors and the condition of each opening; we give you a schedule with the estimate. Doors are usually ordered to fit your openings, so the install date also depends on delivery." },
      { q: "Can a new door go where there was none?", a: "Yes. On our Lynnfield project, a new side entry door went into the new addition, with flashing at the sill before its step was built. Cutting a new opening into an existing wall changes the framing, so ask your town's building department about the permit." },
    ],
    related: ["window-replacement", "siding", "exterior-painting"],
    guides: ["signs-you-need-new-windows", "do-you-need-a-permit-to-remodel-massachusetts"],
    sources: [SOURCES.lead, SOURCES.contract],
  },

  // ===================== DECKS =====================
  {
    slug: "decks",
    metaTitle: "Deck Builder in Central & Eastern MA and Southern NH",
    metaDescription: weOr(
      "Composite and pressure-treated wood decks, railings, stairs and pool decks, built to code with permits and inspections handled. Owner-led, Northborough, MA.",
      "Composite and pressure-treated wood decks, railings, stairs and pool decks, built to code on footings below the frost line. Owner-led, Northborough, MA.",
    ),
    h1: "Deck Design & Construction in Central & Eastern MA and Southern NH",
    summary: weOr(
      "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, designs and builds composite and pressure-treated wood decks, railings, stairs and pool decks, with the building permit and inspections handled. Most decks take about 1–2 weeks to build. Our case studies include a pool deck in Salem, New Hampshire.",
      "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, designs and builds composite and pressure-treated wood decks, railings, stairs and pool decks, on footings below the frost line and framed to code. Most decks take about 1–2 weeks to build. Our case studies include a pool deck in Salem, New Hampshire.",
    ),
    cardSummary: weOr(
      "Composite and pressure-treated wood decks, railings, stairs and pool decks, with permits and inspections.",
      "Composite and pressure-treated wood decks, railings, stairs and pool decks, framed to code with the town's inspections.",
    ),
    noun: "deck project",
    og: { slug: "service-decks", alt: "Pool deck with gray decking and white railings around an above-ground pool in Salem, NH" },
    intro: [
      "A deck is a structure that people stand on, often several feet above the ground, so the parts you cannot see matter most: footings below the frost line, a properly flashed and bolted ledger, rated connectors, and guards that meet code. The decking and railings are the parts you live with every day.",
      "We build decks in composite and pressure-treated wood, with railings and stairs. The Salem, NH project on this page shows the full sequence, from the pressure-treated frame around an above-ground pool to the finished gray decking and white railings.",
    ],
    sections: [
      {
        id: "materials", nav: "Materials", h2: "Decking materials compared",
        table: {
          caption: "Decking materials (relative comparison)",
          head: ["Material", "Up-front cost", "Upkeep", "What to know"],
          rows: [
            ["Pressure-treated pine", "$", "Clean and re-seal or stain every few years", "The lowest cost; can check, split and warp as it dries."],
            ["Cedar", "$$", "Seal or stain to keep its color; it weathers to gray otherwise", "Naturally resists decay; softer, so it dents more easily."],
            ["Capped composite", "$$–$$$", "Wash; no staining or sealing", "Wood-grain look with a protective cap; can get hot in full sun."],
            ["PVC", "$$$", "Wash", "Very moisture-resistant; also warms up in the sun."],
          ],
          note: "Most composite and PVC decks still sit on a pressure-treated wood frame, as the Salem, NH deck does.",
        },
      },
      {
        id: "structure", nav: "Structure and code", h2: "Structure and code basics",
        bullets: [
          "Footings must reach below the frost line. In Massachusetts that is commonly 48 inches; the local building official sets the required depth.",
          "A deck attached to the house hangs on a ledger board that must be flashed and fastened with through-bolts or approved structural screws, never nails alone.",
          "Joist hangers, post bases and fasteners must be corrosion-resistant and rated for contact with treated lumber.",
          "Guards are required where the deck surface is more than 30 inches above grade, and the code sets their minimum height and the maximum gap between balusters.",
          "Stairs must meet maximum riser and minimum tread rules, with a handrail where there are four or more risers.",
          "Composite and PVC decking need joists spaced to the manufacturer's span rating, often closer than for wood.",
        ],
      },
      {
        id: "repair-or-replace", nav: "Repair or replace", h2: "Repair or replace an old deck?",
        intro: ["Warning signs that a deck needs more than new boards:"],
        bullets: [
          "Soft or rotted wood at the ledger, the posts or the joist ends",
          "Guard posts that move when you push on them",
          "Rusted or missing joist hangers and connectors",
          "No flashing above the ledger, or water stains on the house wall below it",
          "Footings that have heaved or settled",
        ],
        outro: ["If the frame is sound, replacing only the decking and railings can be an option. If the ledger or footings are suspect, the frame should be rebuilt."],
      },
    ],
    cost: {
      h2: "What does a new deck cost in Massachusetts?",
      answer: "As a regional benchmark, Remodeling magazine's 2025 Cost vs. Value report puts the New England average for a 16-by-20-foot deck at $25,817 with composite decking and $20,603 with pressure-treated wood. Height above grade, stairs, railings and the number of footings change the price; we price each deck after a free visit.",
      benchmark: [CVV.compositeDeck, CVV.woodDeck],
      drivers: [
        "Height above grade: taller decks need longer posts, bracing and guards",
        "Number of footings and the soil conditions",
        "Stairs and landings",
        "Railing system: wood, composite, aluminum or cable",
        "Decking material and pattern; borders and angles add labor",
        "Removing an old deck",
        "Pool, hot tub or roof loads, which can need heavier framing",
      ],
      guides: ["deck-cost-massachusetts"],
    },
    permitShort: "Usually required, with footing, framing and final inspections by the town.",
    permits: {
      intro: "Deck permits are local, and the inspections follow the build. In Massachusetts:",
      table: {
        caption: "Deck permits, inspections and reviews in Massachusetts",
        head: ["Permit or review", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "Most decks need one, and attached decks almost always do.", CSL_PERMIT],
          ["Inspections", "Typically a footing (hole) inspection before concrete, a framing inspection, and a final.", weOr("We schedule them with the building inspector.", "The permit holder schedules them with the building inspector.")],
          ["Zoning setbacks", "The deck has to stay a set distance from the property lines.", "Checked during design and shown on the permit plan."],
          ["Conservation Commission", "Work near wetlands or rivers may need review before the building permit is issued.", "The town's Conservation Commission; we tell you early if your lot may be affected."],
          ["Pool barrier rules", "Decks around pools must keep the pool barrier and gate requirements in place.", "Reviewed with the building inspector."],
          CONTRACT_ROW,
        ],
      },
      nh: "New Hampshire has no statewide contractor license, and deck permits and inspections come from each town's building department. Our Salem, NH pool deck is an example of our New Hampshire work.",
    },
    process: {
      steps: [
        { step: "Estimate and design", detail: "We look at the yard, the house wall where a ledger would attach, the grade and access, and sketch size, stairs and railings. You get an itemized estimate." },
        { step: "Permit plan", detail: "A framing plan with the footing locations goes to the building department." },
        { step: "Footings", detail: "Holes are dug below the frost depth and inspected, then the concrete is poured." },
        { step: "Framing", detail: "Ledger flashing and bolts, beams, joists and hardware, followed by the framing inspection." },
        { step: "Decking, stairs and railings", detail: "Decking boards, stairs, guards and handrails are installed." },
        { step: "Final inspection and walkthrough", detail: "The final inspection, cleanup and a walkthrough with you." },
      ],
    },
    faqs: [
      { q: "How much does a deck cost in Massachusetts?", a: "Remodeling magazine's 2025 Cost vs. Value report puts the New England average for a 16-by-20-foot deck at $25,817 with composite decking and $20,603 with pressure-treated wood. Height, stairs, railings and footings move the price; we itemize it after a free site visit.", more: { href: "#cost", label: "Cost benchmarks and drivers" } },
      { q: "Composite or wood decking?", a: "Composite costs more up front but needs no staining or sealing, only washing. Pressure-treated wood costs less but needs regular cleaning and sealing to slow checking and splitting. In the 2025 New England Cost vs. Value data, composite decks recouped 95.8% of their cost at resale versus 79.1% for wood." },
      { q: "Do I need a permit for a deck in Massachusetts?", a: `Usually, yes. Most Massachusetts towns require a building permit for a deck, and attached decks almost always need one. The town typically inspects the footing holes, the framing and the finished deck. ${weOr("We handle the application and schedule the inspections.", "The contractor's Construction Supervisor License holder applies for the permit and schedules the inspections, and the written contract must say who obtains it.")}`, more: { href: PERMIT_GUIDE, label: PERMIT_GUIDE_LABEL } },
      { q: "How deep do deck footings go in Massachusetts?", a: "Below the frost line, which is commonly 48 inches in Massachusetts. The local building official sets the required depth, and the footing holes are inspected before the concrete is poured." },
      { q: "Can a deck be built in winter?", a: "Framing and decking can go on in cold weather, but footings need unfrozen ground for digging and pouring concrete. Winter projects plan the footings around the frost; we tell you what is realistic for your yard and schedule." },
      { q: "Can just the decking and railings be replaced?", a: "Sometimes. If the frame, ledger, footings and connectors are sound, new decking and railings can go on the existing frame. If the ledger is not flashed and bolted, or the posts and joists are rotting, the frame should be rebuilt first." },
      { q: "Do you build pool decks?", a: "Yes. Our Salem, NH project wrapped an above-ground pool with a deck on a pressure-treated frame, with gray decking and white railings. Pool decks must also keep the pool barrier and gate requirements in place.", more: { href: "/projects/pool-deck-salem-nh", label: "Salem, NH pool deck case study" } },
      { q: "Do you build decks in New Hampshire?", a: "Yes. We work in southern New Hampshire as well as Massachusetts; the Salem, NH pool deck is one example. New Hampshire has no statewide contractor license, and permits come from each town's building department." },
      { q: "How long does it take to build a deck?", a: "Most decks take about 1–2 weeks to build, depending on size and features. Permit review, inspections and weather can move the start date." },
      { q: "What railing options meet code?", a: "Wood, composite, aluminum and cable railing systems can all meet code when installed as designed. Guards are required where the deck is more than 30 inches above grade, with a minimum height and a limit on the gap between balusters, and the posts must be anchored to resist the load the code specifies." },
    ],
    related: ["home-additions", "siding", "exterior-painting"],
    guides: ["deck-cost-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts"],
    sources: [SOURCES.cvv, SOURCES.contract],
  },

  // ===================== EXTERIOR PAINTING =====================
  // Holds the ONE canonical lead-safe section (LEAD_SAFE_HREF). No photo (owner item O4): text-only hero, typographic OG card.
  {
    slug: "exterior-painting",
    metaTitle: "Exterior House Painting in Central & Eastern MA",
    metaDescription: "Exterior house painting with the prep that makes it last: washing, scraping, wood repair, caulking and priming. Lead-safe rules for pre-1978 homes explained.",
    h1: "Exterior House Painting in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, paints house siding and trim, with the prep that makes exterior paint last: washing, scraping, sanding, rotted-trim repair, caulking and priming bare wood. Painting rarely needs a building permit, but homes built before 1978 fall under lead-safe renovation rules.",
    cardSummary: "Siding and trim painted after washing, scraping, sanding, rotted-trim repair, caulking and priming.",
    noun: "house painting project",
    og: { slug: "service-exterior-painting", alt: "Exterior House Painting, Waterfront Construction, Northborough, MA" },
    intro: [
      "Most paint failures start before the first coat: dirt and chalk left on the surface, loose paint painted over, bare wood left unprimed, or paint applied when it was too cold or damp to cure. Prep is most of the job, especially on New England exteriors that face freeze-thaw cycles, wind-driven rain and strong sun.",
      "We paint siding and trim on house exteriors. We have not published a painting case study on this site yet.",
    ],
    sections: [
      {
        id: "prep", nav: "Prep", h2: "The prep that makes exterior paint last",
        table: {
          caption: "Exterior painting prep steps and why they matter",
          head: ["Step", "Why it matters"],
          rows: [
            ["Wash", "Removes dirt, chalk and mildew so the new paint can bond."],
            ["Scrape and sand", "Loose and flaking paint must come off, and glossy surfaces are dulled so the new coat adheres."],
            ["Repair", "Rotted trim is replaced, and holes and cracks are patched before painting."],
            ["Caulk", "Gaps at trim joints are sealed so water cannot get behind the paint."],
            ["Prime", "Bare wood, patches and stains get primer; a stain-blocking primer stops bleed-through."],
            ["Finish coats", "The number of coats depends on the color change and the surface; label coverage and recoat times are followed."],
          ],
        },
      },
      {
        id: "products", nav: "Paint and timing", h2: "Choosing exterior paint, and when to paint",
        intro: ["General guidance for New England exteriors:"],
        bullets: [
          "Exterior: 100% acrylic latex paints flex with temperature changes and resist peeling on wood siding and trim.",
          "Temperature and moisture: every paint label sets a minimum air and surface temperature, and paint should dry before dew or rain. In Central Massachusetts that usually limits exterior painting to late spring through early fall.",
          "How long it lasts: a good exterior paint job typically lasts 7–10 years or more, depending on sun exposure, the siding material, the quality of the prep and moisture. South- and west-facing walls usually need attention first.",
        ],
      },
    ],
    cost: {
      h2: "What does exterior house painting cost in Massachusetts?",
      answer: "Exterior painting prices depend on the size and number of stories of the house, the condition of the siding and trim, height and access, the amount of trim and the number of colors, and prep is often the largest part of the labor. We do not publish a painting price range; we give an itemized estimate after looking at the surfaces.",
      drivers: [
        "The size and number of stories of the house",
        "Surface condition: how much scraping, sanding and wood repair is needed",
        "Height and access, including ladders or staging",
        "Amount and detail of trim, windows and doors",
        "Number of colors and sheens",
        "Lead-safe rules (containment and cleanup) on pre-1978 homes",
      ],
      guides: [],
    },
    permitShort: "Not normally required; lead-safe rules apply to homes built before 1978.",
    permits: {
      intro: "Exterior painting has fewer permit steps than other work, but two rules matter. In Massachusetts:",
      table: {
        caption: "Exterior painting rules in Massachusetts",
        head: ["Permit or rule", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "Painting alone normally does not need one.", "No application in most cases."],
          ["Historic district review", "Some local historic district commissions review exterior paint colors; many exempt paint color.", "Check with your town's historic district commission before choosing colors."],
          LEAD_ROW("Homes built before 1978, when prep disturbs more than 20 sq ft of exterior painted surface in total."),
        ],
      },
      nh: NH_NOTE,
    },
    leadSafe: { intro: "Scraping and sanding old paint is exactly the kind of work lead-safe rules were written for. The same rules cover siding, window and other renovation work on homes built before 1978:", full: true },
    process: {
      steps: [
        { step: "Estimate visit", detail: "We look at every surface, note repairs and the age of the paint, and talk through colors and sheens. You get an itemized estimate." },
        { step: "Color selection", detail: "We help you narrow down colors; testing samples on the wall in your own light is the most reliable way to choose." },
        { step: "Protection", detail: "Landscaping, walkways and fixtures are covered before any prep or paint." },
        { step: "Prep", detail: "Washing, scraping, sanding, repairs, caulking and priming." },
        { step: "Painting", detail: "Finish coats applied within the label's temperature and recoat limits." },
        { step: "Cleanup and walkthrough", detail: "Touch-ups, cleanup and a walkthrough with you." },
      ],
    },
    faqs: [
      { q: "How much does exterior house painting cost in Massachusetts?", a: "It depends on the size of the house, the condition of the siding and trim, height and access, trim detail and the number of colors, and prep is often the largest part of the labor. We do not publish a painting price range; we give an itemized estimate after looking at the surfaces.", more: { href: "#cost", label: "What drives exterior painting cost" } },
      { q: "When is the best time to paint a house exterior in Central Massachusetts?", a: "Late spring through early fall, on dry days. Every exterior paint lists minimum air and surface temperatures on its label, and the paint should dry before dew or rain; cold nights and morning dew shorten the season at both ends." },
      { q: "How long will exterior paint last?", a: "A good exterior job typically lasts 7–10 years or more, depending on sun exposure, the siding material, the quality of the prep and moisture. South- and west-facing walls and horizontal trim usually wear first." },
      { q: "Does my house have lead paint?", a: "If it was built before 1978, assume painted surfaces may contain lead until a test shows otherwise. Lead-safe rules then apply to prep that disturbs more than 6 square feet per room inside or 20 square feet in total outside: containment, no open-flame burning or uncontrolled power sanding, HEPA cleanup and a cleaning check.", more: { href: "#lead-safe", label: "Lead-safe rules for pre-1978 homes" } },
      { q: "Do you repair rotted trim before painting?", a: "Yes. Rotted trim is replaced and holes and cracks are patched before priming and painting, because paint cannot hold on soft or rotted wood." },
      { q: "Can you help me choose colors?", a: "Yes. We help you narrow down choices for your house and its light. Test samples on the wall at different times of day before committing, especially for exteriors." },
      { q: "Do I need a permit to paint the outside of my house?", a: "Usually not: painting alone does not normally need a building permit. If your house is in a local historic district, check whether the commission reviews exterior colors, and remember that lead-safe rules apply to homes built before 1978.", more: { href: `${PERMIT_GUIDE}#exempt`, label: "Work that usually needs no permit" } },
    ],
    related: ["interior-painting", "siding", "window-replacement"],
    guides: ["how-to-choose-a-contractor-in-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts"],
    sources: [SOURCES.lead],
  },

  // ===================== KITCHEN REMODELING =====================
  {
    slug: "kitchen-remodeling",
    metaTitle: "Kitchen Remodeling in Central & Eastern MA",
    metaDescription: "Kitchen remodels managed start to finish: cabinets, islands, counters, backsplash and lighting, with licensed trades coordinated. See our Mansfield kitchen.",
    h1: "Kitchen Remodeling in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, remodels kitchens from demolition to final finish: cabinets, islands, countertops, backsplash and lighting. Plumbing, gas and electrical work goes to trades who hold the required licenses. Kitchens typically take about 3–6 weeks once materials are in.",
    cardSummary: "Cabinets, islands, countertops, backsplash and lighting, with plumbing and electrical trades coordinated.",
    noun: "kitchen remodel",
    og: { slug: "service-kitchen-remodeling", alt: "Remodeled kitchen with white shaker-style cabinets and glass pendant lights in Mansfield, MA" },
    intro: [
      "A kitchen packs many trades into one room you use every day: demolition, framing, plumbing, electrical, ventilation, cabinets, counters and finish carpentry. Good results come from planning the order of work and getting the hidden details right before the cabinets go in.",
      "We manage the whole remodel and schedule each trade. Plumbing, gas and electrical work is done by trades who hold the required licenses and pull their own permits. The Mansfield kitchen on this page shows a finished result.",
    ],
    sections: [
      {
        id: "choices", nav: "Kitchen choices", h2: "Kitchen remodeling: the choices that shape cost and look",
        table: {
          caption: "Kitchen remodeling choices",
          head: ["Choice", "Options", "What to know"],
          rows: [
            ["Cabinets", "Stock, semi-custom or custom; or refacing the existing boxes", "Semi-custom lines offer more sizes and finishes than stock; custom fits odd spaces. Refacing keeps the boxes and replaces doors and drawer fronts."],
            ["Countertops", "Laminate, quartz, granite and other natural stone, solid surface", "Quartz needs no sealing; natural stone varies slab to slab and may need periodic sealing; laminate costs the least."],
            ["Layout", "Same footprint, or moving the sink, range or walls", "Keeping plumbing, gas and walls where they are is the biggest cost saver; moving them adds trade work and permits."],
            ["Ventilation", "Range hood ducted outdoors, or recirculating", "Ducted hoods remove moisture and cooking fumes; very large hoods (over 400 cfm) can trigger a make-up air requirement."],
            ["Lighting", "Recessed, under-cabinet and pendant lights", "Layered lighting makes counters usable; new circuits need an electrical permit."],
          ],
        },
      },
    ],
    cost: {
      h2: "What does a kitchen remodel cost in Massachusetts?",
      answer: "As a regional benchmark, Remodeling magazine's 2025 Cost vs. Value report puts the New England average at $28,936 for a midrange minor kitchen remodel. Larger kitchens, new layouts, new cabinets and stone counters cost more; we price each kitchen after a free visit.",
      benchmark: [CVV.minorKitchen],
      drivers: [
        "Size of the kitchen and how much of it changes",
        "Moving plumbing, gas lines, walls or windows",
        "Cabinet tier: stock, semi-custom or custom",
        "Countertop material and edge details",
        "Hidden conditions in older homes, such as old wiring or uneven floors",
        "Appliance and fixture level",
      ],
      guides: ["kitchen-remodel-cost-massachusetts"],
    },
    permitShort: "None for new cabinets, counters and finishes alone; a building permit when walls or structure change, plus plumbing, gas and electrical permits pulled by those trades.",
    permits: {
      intro: "A kitchen remodel can involve three or more separate permits. In Massachusetts:",
      table: {
        caption: "Kitchen remodeling permits and rules in Massachusetts",
        head: ["Permit or rule", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "When the remodel moves walls or changes the structure. Replacing cabinets, countertops and finishes alone needs none under the state building code.", CSL_PERMIT],
          ["Plumbing and gas permits", "Moving the sink or a gas line, and any new drain or water line.", "A plumber or gas fitter holding a Massachusetts license, who pulls the permit in their own name."],
          ["Electrical permit", "New range or lighting circuits, outlets or appliance wiring.", "An electrician holding a Massachusetts license."],
          SMOKE_CO_ROW,
          LEAD_ROW("Homes built before 1978, when the work disturbs more than 6 sq ft of painted surface in a room."),
          CONTRACT_ROW,
        ],
      },
      nh: NH_TRADES,
    },
    leadSafe: { intro: "Kitchens in older homes often have layers of paint on the walls, trim and window casings. On a pre-1978 home, a kitchen remodel that disturbs more than 6 square feet of painted surface in the room falls under the lead-safe renovation rules." },
    process: {
      steps: [
        { step: "Estimate visit", detail: "We measure, look at the plumbing, electrical and ventilation, and talk through layout, finishes and budget. You get an itemized written estimate." },
        { step: "Selections and ordering", detail: "Cabinets, counters, fixtures and appliances are chosen and ordered; cabinet lead times often set the start date." },
        { step: "Permits", detail: "Building permit where needed; plumbing, gas and electrical permits are pulled by those trades." },
        { step: "Demolition and rough work", detail: "Old finishes come out; framing, plumbing, electrical and ventilation are roughed in and inspected." },
        { step: "Walls", detail: "Drywall goes up and is finished, ready for the cabinets and backsplash." },
        { step: "Cabinets, counters and fixtures", detail: "Cabinets are set, counters templated and installed, then the backsplash, fixtures, lighting and appliances." },
        { step: "Final inspections and walkthrough", detail: "Trade and building final inspections, touch-ups and a walkthrough with you." },
      ],
    },
    faqs: [
      { q: "How much does a kitchen remodel cost in Massachusetts?", a: "Remodeling magazine's 2025 Cost vs. Value report puts the New England average for a midrange minor kitchen remodel at $28,936, covering new cabinet fronts, counters, sink, appliances and flooring in a 200-square-foot kitchen. New layouts and new cabinets cost more; we price your kitchen after a free visit.", more: { href: "/blog/kitchen-remodel-cost-massachusetts", label: "Kitchen remodel cost guide" } },
      { q: "How long does a kitchen remodel take?", a: "Kitchens typically take about 3–6 weeks once materials are in. Cabinet lead times, inspections and hidden damage found during demolition can extend that." },
      { q: "Can we stay home during the kitchen remodel?", a: "In most cases, yes. We set up dust containment, keep the work area clean and plan the work to limit disruption. Plan on a temporary setup elsewhere in the house for simple cooking." },
      { q: "Who pulls the permits for a kitchen remodel?", a: "In Massachusetts, plumbing and gas permits are pulled by the plumber or gas fitter who holds the state license, and electrical permits by the electrician. The building permit, when one is needed, is taken out by the contractor's Construction Supervisor License holder." },
      { q: "Can the sink or range be moved?", a: "Usually, yes. Moving a sink means new drain, vent and supply lines, and moving a range may mean a new gas line or circuit, all under permits. Keeping them where they are is one of the most effective ways to control cost." },
      { q: "Quartz or granite countertops?", a: "Quartz is engineered, consistent in color and needs no sealing. Granite and other natural stone vary slab to slab, handle heat well and may need periodic sealing. Both are durable; the choice usually comes down to look and budget." },
      { q: "Should I reface or replace my kitchen cabinets?", a: "Refacing keeps the existing cabinet boxes and replaces the doors and drawer fronts, so it suits a layout that already works and boxes that are sound. New cabinets let you change the layout and sizes; stock, semi-custom and custom lines differ mainly in sizes, finishes and how closely they fit odd spaces." },
      { q: "Ducted or recirculating range hood?", a: "A hood ducted outdoors removes moisture and cooking fumes from the house, while a recirculating hood filters the air and returns it to the kitchen. Very large hoods, over 400 cfm, can trigger a make-up air requirement." },
    ],
    related: ["bathroom-remodeling", "home-remodeling", "interior-painting"],
    guides: ["kitchen-remodel-cost-massachusetts", "5-remodels-that-add-the-most-home-value", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts"],
    sources: [SOURCES.cvv, SOURCES.lead, SOURCES.contract],
  },

  // ===================== BATHROOM REMODELING =====================
  // The bathroom photos come from several jobs whose towns were not recorded: never name a town for them.
  {
    slug: "bathroom-remodeling",
    metaTitle: "Bathroom Remodeling in Central & Eastern MA",
    metaDescription: "Bathroom remodels with waterproofed tile showers, frameless glass, vanities and fixtures; plumbing and electrical by licensed trades. See our bathroom photos.",
    h1: "Bathroom Remodeling in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, remodels bathrooms from demolition to final finish: tile and walk-in showers with waterproofing behind the tile, vanities, fixtures and frameless glass. Plumbing and electrical work goes to trades who hold the required licenses. Bathrooms typically take about 2–3 weeks once materials are in.",
    cardSummary: "Tile and walk-in showers, waterproofing, vanities, fixtures and glass, with plumbing and electrical trades coordinated.",
    noun: "bathroom remodel",
    og: { slug: "service-bathroom-remodeling", alt: "Walk-in shower with marble-look tile walls, a hexagon mosaic floor and a hinged glass door" },
    intro: [
      "A bathroom packs plumbing, electrical, ventilation, waterproofing, tile and finish carpentry into a small room, and most of what decides how long it lasts is hidden behind the tile. Good results come from planning the order of work and getting right the details you will not see later, like waterproofing behind tile and blocking for future grab bars.",
      "We manage the whole remodel and schedule each trade. Plumbing and electrical work is done by trades who hold the required licenses and pull their own permits. The photos on this page come from several of our bathroom remodels; the town of each one is not recorded.",
    ],
    sections: [
      {
        id: "behind-the-tile", nav: "Behind the tile", h2: "Bathroom remodeling: what matters behind the tile",
        bullets: [
          "Walk-in showers and tub-to-shower conversions: the drain location, a curb or curbless entry and the type of glass set most of the scope.",
          "Waterproofing: cement board and grout are not waterproof on their own. Showers need a waterproof membrane or a properly lapped liner behind the tile.",
          "Ventilation: the exhaust fan must vent directly to the outdoors, not into the attic.",
          "Electrical safety: every receptacle in a bathroom needs GFCI protection.",
          "Planning ahead: blocking in the walls now makes it easy to add grab bars later.",
          "Glass: frameless and semi-frameless enclosures are measured after the tile is finished.",
        ],
      },
    ],
    cost: {
      h2: "What does a bathroom remodel cost in Massachusetts?",
      answer: "As a regional benchmark, Remodeling magazine's 2025 Cost vs. Value report puts the New England average at $27,559 for a midrange bathroom remodel. Custom tile showers, glass enclosures and moved plumbing raise the price; we price each bathroom after a free visit.",
      benchmark: [CVV.bath],
      drivers: [
        "Size of the bathroom and how much of it changes",
        "Moving the toilet, shower, tub, walls or windows",
        "Shower type: a tub, a tub-to-shower conversion or a walk-in shower, and its glass",
        "Tile size, pattern and how much wall area is tiled",
        "Hidden conditions in older homes, such as rot under a tub, old wiring or uneven floors",
        "Vanity and fixture level",
      ],
      guides: ["bathroom-remodel-cost-massachusetts"],
    },
    permitShort: "None for new tile, a vanity and finishes alone; a building permit when walls or structure change, plus plumbing and electrical permits pulled by those trades.",
    permits: {
      intro: "A bathroom remodel can involve several separate permits. In Massachusetts:",
      table: {
        caption: "Bathroom remodeling permits and rules in Massachusetts",
        head: ["Permit or rule", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "When the remodel moves walls or changes the structure. Replacing tile, a vanity and other finishes alone needs none under the state building code.", CSL_PERMIT],
          ["Plumbing permit", "Any new or moved toilet, shower, tub, sink, drain or water line.", "A plumber holding a Massachusetts license, who pulls the permit in their own name."],
          ["Electrical permit", "New circuits, outlets, lighting or fan wiring; every bathroom receptacle needs GFCI protection.", "An electrician holding a Massachusetts license."],
          SMOKE_CO_ROW,
          LEAD_ROW("Homes built before 1978, when the work disturbs more than 6 sq ft of painted surface in a room."),
          CONTRACT_ROW,
        ],
      },
      nh: NH_TRADES,
    },
    leadSafe: { intro: "Taking out old tile, a vanity or a medicine cabinet in an older home often disturbs painted walls and trim. On a pre-1978 home, a bathroom remodel that disturbs more than 6 square feet of painted surface in the room falls under the lead-safe renovation rules." },
    process: {
      steps: [
        { step: "Estimate visit", detail: "We measure, look at the plumbing, electrical and ventilation, and talk through layout, finishes and budget. You get an itemized written estimate." },
        { step: "Selections and ordering", detail: "Tile, the vanity, fixtures and the shower glass are chosen; the glass is ordered once the tile is in." },
        { step: "Permits", detail: "Building permit where needed; plumbing and electrical permits are pulled by those trades." },
        { step: "Demolition and rough work", detail: "Old finishes come out; framing, plumbing, electrical and the exhaust fan are roughed in and inspected." },
        { step: "Waterproofing and tile", detail: "Tile backer, the shower's waterproof membrane, then tile." },
        { step: "Vanity, fixtures and glass", detail: "The vanity, toilet and fixtures go in, and the glass enclosure is installed after it is measured on the finished tile." },
        { step: "Final inspections and walkthrough", detail: "Trade and building final inspections, touch-ups and a walkthrough with you." },
      ],
    },
    faqs: [
      { q: "How much does a bathroom remodel cost in Massachusetts?", a: "Remodeling magazine's 2025 Cost vs. Value report puts the New England average for a midrange bathroom remodel at $27,559, covering new fixtures, a tile tub surround and a tile floor in a 5-by-7-foot bathroom. Custom tile showers, glass enclosures and moved plumbing raise the price.", more: { href: "/blog/bathroom-remodel-cost-massachusetts", label: "Bathroom remodel cost guide" } },
      { q: "How long does a bathroom remodel take?", a: "Bathrooms typically take about 2–3 weeks once materials are in. Custom glass is measured after the tile is finished, so its lead time, inspections and hidden damage found during demolition can extend that." },
      { q: "What is involved in a tub-to-shower conversion?", a: "The tub comes out, the drain is moved or adapted for a shower, and the walls and floor get a waterproof shower system before tile. The glass is measured after tiling. Expect a plumbing permit, and consider keeping at least one tub in the house." },
      { q: "Why does waterproofing behind tile matter?", a: "Grout and cement board let water through. A waterproof membrane or properly lapped liner behind the tile keeps water out of the wall and floor framing, where slow leaks can cause rot that stays hidden for years." },
      { q: "Does a bathroom exhaust fan have to vent outside?", a: "Yes. A bathroom exhaust fan must vent directly to the outdoors, not into the attic, a soffit or a crawl space, so the moisture does not cause mold or rot." },
      { q: "Can the toilet or shower drain be moved?", a: "Usually, yes, but it means new drain, vent and supply lines under a plumbing permit, and sometimes changes to the floor framing. Keeping the toilet and shower where they are is one of the most effective ways to control a bathroom's cost." },
      { q: "Who does the plumbing and electrical work in a bathroom remodel?", a: "Massachusetts-licensed trades. The plumber pulls the plumbing permit in their own name for any new or moved fixture, and the electrician pulls the electrical permit for new circuits, outlets, lighting or fan wiring. We schedule them around the rest of the work." },
      { q: "Should I plan for grab bars now?", a: "It helps. Blocking added inside the walls while they are open makes it easy to install grab bars later, wherever you may want them, without opening the tile again." },
    ],
    related: ["kitchen-remodeling", "home-remodeling", "interior-painting"],
    guides: ["bathroom-remodel-cost-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts"],
    sources: [SOURCES.cvv, SOURCES.lead, SOURCES.contract],
  },

  // ===================== HOME ADDITIONS =====================
  // Basement finishing and whole-home remodels moved to home-remodeling (D3). No dollar figure anywhere (NO_CVV).
  {
    slug: "home-additions",
    metaTitle: "Home Addition Contractor in Central & Eastern MA",
    metaDescription: "Room and second-story additions, in-law suites, sunrooms and porches, from foundation to finish. See our Needham and Lynnfield additions. Free estimates.",
    h1: "Home Additions in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, builds room and second-story additions, in-law suites, sunrooms and porches, from the foundation to the finish. Larger additions typically take 2–4 months of construction after design and permits. See our Needham and Lynnfield additions below.",
    cardSummary: "Room and second-story additions, in-law suites, sunrooms and porches, from foundation to finish.",
    noun: "home addition",
    og: { slug: "service-home-additions", alt: "Two-story home addition in green sheathing beside the house-wrapped main house in Lynnfield, MA" },
    intro: [
      "An addition is one of the biggest projects a homeowner can take on: a new foundation, framing that ties into the existing house, a roof that has to shed water where old and new meet, and heating, plumbing and electrical extended into new space. Most of the risk sits in the early decisions: what zoning allows on your lot, whether the existing structure can carry more, and how the new space connects to the old.",
      "We build additions and coordinate the designer or architect and a structural engineer when the project needs stamped plans. Our Needham and Lynnfield case studies show additions from excavation through framing and sheathing.",
    ],
    sections: [
      {
        id: "types", nav: "Types of additions", h2: "Types of additions",
        table: {
          caption: "Addition types",
          head: ["Type", "What it is", "Typical considerations"],
          rows: [
            ["Single-room addition", "A new room on a new foundation", "Needs a foundation, a roof tie-in, and heating and electrical extended to the new space; limited by zoning setbacks."],
            ["Second-story addition", "Building up on the existing footprint", "An engineer must confirm the foundation and framing can carry the load, and the roof comes off during construction."],
            ["In-law suite or ADU", "A self-contained unit with its own kitchen and bathroom", "Massachusetts now allows one accessory dwelling unit by right in single-family zones, within size limits and local rules."],
            ["Sunroom or porch", "A three- or four-season room, or a covered porch", "A four-season room is heated living space and must meet the energy code."],
          ],
        },
      },
      {
        id: "feasibility", nav: "Feasibility", h2: "Before you design: feasibility checks in Massachusetts",
        bullets: [
          "Zoning: setbacks, lot coverage and height limits decide where and how big you can build. Homes that already do not meet current zoning may need a finding or special permit from the Zoning Board of Appeals.",
          "Septic: adding a bedroom on a septic system triggers Board of Health review under Title 5, because septic systems are sized by the number of bedrooms.",
          "Structure: a second story needs an engineer's review of the existing foundation and framing.",
          "Energy code: new additions must meet the Massachusetts energy code, and many towns have adopted the Stretch Energy Code or the Specialized Opt-in Code, which add requirements.",
          "Other local reviews: wetlands, local historic districts and demolition-delay bylaws can add a review step in some towns.",
          // verify on mass.gov (EOHLC, 760 CMR 71.00) before next update
          "Accessory dwelling units: since February 2, 2025, Massachusetts law allows one ADU by right on a lot in a single-family zoning district, up to 900 square feet or half the main home's floor area, whichever is smaller, subject to reasonable local rules.",
        ],
      },
      {
        id: "who-does-what", nav: "Who does what", h2: "Who does what on an addition",
        table: {
          caption: "Roles on a typical addition",
          head: ["Role", "Responsibility"],
          rows: [
            ["Designer or architect", "Floor plans and elevations for the permit set."],
            ["Structural engineer", "Stamped calculations or details when beams, foundations or a second story require them."],
            ...(hasCsl
              ? [["General contractor (us)", "The building permit, taken out by the Construction Supervisor License holder; the schedule; foundation, framing, exterior and finishes; and the inspections."]]
              : [
                  ["General contractor (us)", "The schedule; foundation, framing, exterior and finishes; and coordinating the trades."],
                  ["Construction Supervisor License holder", "Takes out the building permit for the contractor's work and schedules the building inspections; the written contract must say who obtains each permit."],
                ]),
            ["Plumber, gas fitter and electrician", "Their own permits and inspections, under their Massachusetts licenses."],
            ["Town departments", "Building, zoning, Board of Health and conservation reviews, as they apply."],
          ],
        },
      },
    ],
    cost: {
      h2: "What does a home addition cost in Massachusetts?",
      answer: "There is no reliable single figure: additions are priced from their plans, and size, building out or up, the foundation, the roof tie-in, heating and electrical capacity, and the finish level all move the price. We price each addition after a site visit and a review of the plans, with an itemized estimate.",
      drivers: [
        "Size and number of stories",
        "Building out (a new foundation) versus up (reinforcing the structure and removing the roof)",
        "Foundation type and site work, including ledge, access and drainage",
        "The roof tie-in, where new rooflines meet the old",
        "Whether the existing heating, cooling and electrical service can carry the new space",
        "Kitchens and bathrooms in the addition",
        "Design, engineering, zoning relief or septic upgrades",
        "Energy code requirements in Stretch or Specialized Code towns",
      ],
      guides: ["home-addition-cost-massachusetts"],
    },
    permitShort: "Always: a building permit with plans, plus zoning, Board of Health or conservation review where they apply.",
    permits: {
      intro: "Additions touch more town departments than any other remodel. In Massachusetts:",
      table: {
        caption: "Addition permits, reviews and rules in Massachusetts",
        head: ["Permit or review", "When it applies", "Who handles it"],
        rows: [
          ["Building permit with plans", "Every addition.", CSL_PERMIT],
          ["Zoning review or relief", "When the addition affects setbacks, lot coverage or height, or the house is pre-existing nonconforming.", "The zoning officer or Zoning Board of Appeals; usually applied for by the property owner with the design team's plans."],
          ["Board of Health (Title 5)", "Adding a bedroom on a septic system.", "The town's Board of Health; may require a septic inspection or upgrade."],
          ["Plumbing, gas and electrical permits", "Plumbing, gas and electrical work in the addition.", "Each trade, under its own Massachusetts license."],
          ["Inspections", "Foundation, framing, rough trades, insulation and final.", weOr("We schedule the building inspections; each trade schedules its own.", "The building permit holder schedules the building inspections; each trade schedules its own.")],
          ["Conservation and historic reviews", "Lots near wetlands or rivers, or in a local historic district.", "The Conservation Commission or historic district commission."],
          LEAD_ROW("Homes built before 1978, when connecting to the existing house disturbs more than 6 sq ft of painted surface per room inside or 20 sq ft in total outside."),
          CONTRACT_ROW_PLAIN,
        ],
      },
      nh: NH_NOTE,
    },
    leadSafe: { intro: "Connecting an addition to a pre-1978 house disturbs painted surfaces where old and new meet. When that work disturbs more than 6 square feet of painted surface per room inside, or 20 square feet in total outside, it falls under the lead-safe renovation rules." },
    process: {
      steps: [
        { step: "Feasibility and budget", detail: "Zoning, septic, structure and a working budget, before money is spent on design." },
        { step: "Design and engineering", detail: "Plans, structural details and energy-code compliance." },
        { step: "Zoning relief, if needed", detail: "Can add weeks to months, depending on hearing schedules." },
        { step: "Permits", detail: "The town reviews the plans; trade permits are filed." },
        { step: "Foundation", detail: "Excavation, footings and foundation, inspected before backfill." },
        { step: "Framing and dry-in", detail: "Walls, roof and sheathing go up, then windows, doors and the weather barrier close in the shell — our Lynnfield photos show the sheathing and window stage." },
        { step: "Rough-ins and inspections", detail: "Plumbing, electrical and heating, rough inspections, then the insulation inspection." },
        { step: "Finishes", detail: "Drywall, trim, flooring, cabinets, paint and exterior siding." },
        { step: "Final inspections", detail: "Trade and building final inspections, then sign-off to use the new space." },
      ],
    },
    faqs: [
      { q: "How much does a home addition cost in Massachusetts?", a: "There is no reliable single figure, because size, building out or up, the foundation, the roof tie-in and the finish level change the price a lot. We price each addition from its plans after a site visit, with an itemized estimate.", more: { href: "/blog/home-addition-cost-massachusetts", label: "Home addition cost guide" } },
      { q: "Is adding on cheaper than moving?", a: "It depends. Compare the addition's full cost, including design, permits and finishes, with the cost of selling, moving and buying a house that already has the space you need. An addition keeps your lot and neighborhood; moving may make more sense if zoning or septic limits what you can build." },
      { q: "Can my house support a second story?", a: "Only an engineer can confirm that. The existing foundation and first-floor framing must carry the new load, and older homes often need reinforcement. A structural review is one of the first steps before second-story design." },
      { q: "Do I need an architect for an addition?", a: "You need permit drawings, and many additions need a structural engineer's stamped details. Whether the plans come from an architect or a residential designer depends on the size and complexity of the project; we coordinate with whoever prepares them." },
      { q: "I'm on septic. Can I add a bedroom?", a: "Possibly, but the Board of Health has to review it first. Under Massachusetts Title 5, septic systems are sized by the number of bedrooms, so adding one can require an inspection or a larger system. Check this before design." },
      { q: "Can I build an in-law apartment (ADU) in Massachusetts?", a: "Since February 2, 2025, Massachusetts law allows one accessory dwelling unit by right on a lot in a single-family zoning district, up to 900 square feet or half the main home's floor area, whichever is smaller. Towns can still apply reasonable rules, such as setbacks and design standards, and septic capacity still applies." },
      { q: "How long does a home addition take?", a: "Larger additions typically take 2–4 months of construction after design and permits. Design, engineering and any zoning relief come first and can add weeks to months." },
      { q: "Can we live at home during construction?", a: "Usually, yes. Most of the work happens outside the existing house until the new space is weather-tight, and the opening between old and new is sealed with dust barriers. Work on a kitchen or bathroom inside the house affects daily routines the most." },
      { q: "Will the addition match my house?", a: "That is the goal of the design: matching rooflines, siding, trim and windows so the addition looks like part of the house. On the Lynnfield project, the addition and the main house's second floor were sided at the same time, with vertical siding on the addition and lap siding on the house." },
      { q: "Who handles permits and inspections?", a: `${weOr("We apply for the building permit and schedule the building inspections.", "The contractor's Construction Supervisor License holder applies for the building permit and schedules the building inspections, and the written contract must say who obtains each permit.")} Plumbing, gas and electrical permits are pulled by those trades, and zoning or Board of Health applications are usually filed by the property owner with the design team's plans.` },
    ],
    related: ["home-remodeling", "decks", "siding"],
    guides: ["home-addition-cost-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts"],
    sources: [SOURCES.lead, SOURCES.contract],
  },

  // ===================== WHOLE-HOME & INTERIOR REMODELING =====================
  // No published case study and no photo (owner items O5, O14): text-only hero, typographic OG card. No dollar figure.
  {
    slug: "home-remodeling",
    metaTitle: "Whole-Home Remodeling in Central & Eastern MA",
    metaDescription: "First-floor and whole-home remodels, layout changes and basement finishing, with licensed trades coordinated. Owner-led, Northborough, MA. Free estimates.",
    h1: "Whole-Home & Interior Remodeling in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, remodels whole homes and whole floors: first-floor remodels, layout and wall changes, and basement finishing, with the licensed trades coordinated. Whole-home remodels typically take 2–4 months of construction after design and permits.",
    cardSummary: "First-floor and whole-home remodels, layout and wall changes and basement finishing, with licensed trades coordinated.",
    noun: "whole-home remodel",
    og: { slug: "service-home-remodeling", alt: "Whole-Home & Interior Remodeling, Waterfront Construction, Northborough, MA" },
    intro: [
      "A whole-home or whole-floor remodel reworks several rooms at once, and often the structure, plumbing, electrical and heating behind them, so permits and sequencing matter as much as finishes. Finishing a basement adds its own checks: moisture control, ceiling height, and an escape opening for any bedroom.",
      "We manage the remodel and coordinate the licensed plumbers, gas fitters and electricians, who pull their own permits, and a designer or structural engineer when the project needs stamped plans. We have not published a whole-home remodeling case study on this site yet.",
    ],
    sections: [
      {
        id: "types", nav: "Types of remodels", h2: "Whole-home, first-floor and basement remodels",
        table: {
          caption: "Whole-home and interior remodel types",
          head: ["Type", "What it is", "Typical considerations"],
          rows: [
            ["Whole-home remodel", "Reworking several rooms or a whole floor", "Often touches structure, plumbing, electrical and heating at once, so permits and sequencing matter."],
            ["Layout and wall changes", "Opening up, moving or removing walls between rooms", "A wall that carries load needs a new beam or other support, sometimes with an engineer's details; moving walls needs a building permit."],
            ["Basement finishing", "Turning a basement into living space", "Moisture control, ceiling height, and an escape opening for any bedroom."],
          ],
        },
      },
      {
        id: "who-does-what", nav: "Who does what", h2: "Who does what on a whole-home remodel",
        table: {
          caption: "Roles on a typical whole-home remodel",
          head: ["Role", "Responsibility"],
          rows: [
            ["Designer or architect", "Plans for the permit set when the layout or structure changes."],
            ["Structural engineer", "Details or calculations when a load-bearing wall moves or a beam is added."],
            ...(hasCsl
              ? [["General contractor (us)", "The building permit, taken out by the Construction Supervisor License holder; the schedule; demolition, framing and finishes; and the inspections."]]
              : [
                  ["General contractor (us)", "The schedule; demolition, framing and finishes; and coordinating the trades."],
                  ["Construction Supervisor License holder", "Takes out the building permit for the contractor's work and schedules the building inspections; the written contract must say who obtains each permit."],
                ]),
            ["Plumber, gas fitter and electrician", "Their own permits and inspections, under their Massachusetts licenses."],
          ],
        },
      },
    ],
    cost: {
      h2: "What does a whole-home remodel cost in Massachusetts?",
      answer: "There is no reliable single figure: a whole-home or first-floor remodel is priced from its scope, and the number of rooms, wall and layout changes, plumbing, electrical and heating work, and the finish level all move the price. We price each remodel after a site visit, with an itemized estimate.",
      drivers: [
        "Number of rooms and how much of each changes",
        "Walls moved or removed, and any new beams",
        "Plumbing, gas and electrical work moved or added",
        "Heating and cooling changes",
        "Basement moisture control, and an escape opening for a bedroom",
        "Hidden conditions in older homes, such as old wiring or rot",
        "Finish level: flooring, trim, cabinets and fixtures",
        "Lead-safe rules (containment and cleanup) on pre-1978 homes",
      ],
      guides: [],
    },
    permitShort: "Needed when walls or structure change; plumbing, gas and electrical permits are separate and pulled by those trades.",
    permits: {
      intro: "A remodel that spans several rooms usually involves more than one permit. In Massachusetts:",
      table: {
        caption: "Whole-home remodeling permits and rules in Massachusetts",
        head: ["Permit or rule", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "When the remodel moves walls or changes the structure or layout.", CSL_PERMIT],
          ["Plumbing and gas permits", "Any new or moved fixture, drain, water line or gas line.", "A plumber or gas fitter holding a Massachusetts license, who pulls the permit in their own name."],
          ["Electrical permit", "New circuits, outlets, lighting or appliance wiring.", "An electrician holding a Massachusetts license."],
          SMOKE_CO_ROW,
          ["Bedroom escape opening", "Every bedroom, including a new one in a basement, needs an emergency escape opening (an egress window or door).", "Your building department, as part of the building permit."],
          LEAD_ROW("Homes built before 1978, when the work disturbs more than 6 sq ft of painted surface per room inside or 20 sq ft in total outside."),
          CONTRACT_ROW_PLAIN,
        ],
      },
      nh: NH_TRADES,
    },
    leadSafe: { intro: "Older homes often have layers of paint on walls, trim and doors, and a remodel that spans several rooms disturbs a lot of it. On a pre-1978 home, work that disturbs more than 6 square feet of painted surface per room inside, or 20 in total outside, falls under the lead-safe renovation rules." },
    process: {
      steps: [
        { step: "Scope and budget", detail: "We walk the house with you, look at the structure, plumbing, electrical and heating, and agree the scope and a working budget. You get an itemized estimate." },
        { step: "Design and engineering", detail: "Plans when walls or layout change, and structural details when a load-bearing wall moves." },
        { step: "Permits", detail: "The town reviews the plans; trade permits are filed." },
        { step: "Demolition and structure", detail: "Dust barriers go up, finishes come out where the work happens, and walls, beams and framing are changed." },
        { step: "Rough-ins and inspections", detail: "Plumbing, electrical and heating, rough inspections, then the insulation inspection." },
        { step: "Finishes", detail: "Drywall, trim, flooring, cabinets and paint." },
        { step: "Final inspections and walkthrough", detail: "Trade and building final inspections, then a walkthrough with you." },
      ],
    },
    faqs: [
      { q: "How much does a whole-home remodel cost in Massachusetts?", a: "There is no reliable single figure: the number of rooms, wall and layout changes, trade work and the finish level set the price. We price each remodel after a site visit, with an itemized estimate.", more: { href: "#cost", label: "What drives whole-home remodeling cost" } },
      { q: "Do I need a permit for a whole-home or first-floor remodel?", a: "Usually, when the remodel moves walls or changes the structure or layout: in Massachusetts that needs a building permit from the town. Moving plumbing, gas or wiring needs separate permits taken out by licensed trades. Replacing finishes in place is usually treated as finish work; ask your town's building department what your project needs.", more: { href: `${PERMIT_GUIDE}#overview`, label: "Which projects need a permit" } },
      { q: "Can we live at home during a whole-home remodel?", a: "Often, if the work can be phased. The work area is sealed with dust barriers, and the order of work can keep a bathroom and a basic kitchen setup usable as long as possible; when the kitchen and every bathroom are out at once, a short stay elsewhere may be easier." },
      { q: "What does a basement bedroom need?", a: "Its own emergency escape opening, an egress window or door, plus the moisture control and ceiling height any finished basement needs. Your building department confirms the requirements when it reviews the permit plans." },
      { q: "Who takes out the trade permits on a whole-home remodel?", a: `Each licensed trade takes out its own: the plumber or gas fitter for plumbing and gas, and the electrician for wiring, in their own names. ${weOr("We apply for the building permit and schedule the building inspections.", "The building permit is applied for by the contractor's Construction Supervisor License holder, and the written contract must say who obtains each permit.")}` },
      { q: "Can a load-bearing wall be removed?", a: "Often, yes, with a new beam or other support that carries the load the wall carried, sized by an engineer when needed, and under a building permit. Opening a wall can also reveal wiring, plumbing or ductwork that has to be rerouted." },
      { q: "How long does a whole-home remodel take?", a: "Whole-home remodels typically take 2–4 months of construction after design and permits. Plans, any engineering and the town's permit review come first." },
    ],
    related: ["kitchen-remodeling", "bathroom-remodeling", "home-additions"],
    guides: ["how-to-choose-a-contractor-in-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts"],
    sources: [SOURCES.lead, SOURCES.contract],
  },

  // ===================== INTERIOR PAINTING =====================
  // No photo (owner items O3, O14): text-only hero, typographic OG card. "Ceilings" stays only while the owner confirms it (O3).
  {
    slug: "interior-painting",
    metaTitle: "Interior Painting in Central & Eastern MA",
    metaDescription: "Interior walls, ceilings, trim and cabinets painted after patching, sanding, caulking and priming. Lead-safe rules for pre-1978 homes explained.",
    h1: "Interior Painting in Central & Eastern Massachusetts",
    summary: "Waterfront Construction Inc, an owner-led general contractor based in Northborough, MA, paints interior walls, ceilings, trim, doors and cabinets, after the prep that makes paint last: patching, sanding, caulking and priming. Interior painting normally needs no building permit, but homes built before 1978 fall under lead-safe renovation rules.",
    cardSummary: "Walls, ceilings, trim, doors and cabinets, painted after patching, sanding, caulking and priming.",
    noun: "painting project",
    og: { slug: "service-interior-painting", alt: "Interior Painting, Waterfront Construction, Northborough, MA" },
    intro: [
      "Most interior paint problems start before the first coat: holes and cracks painted over, glossy trim left unsanded, stains that bleed through, or a sheen that shows every flaw. Prep is most of the job, and the right sheen for each surface decides how well it holds up to cleaning.",
      "We paint interior walls, ceilings, trim, doors and cabinets. We have not published a painting case study on this site yet.",
    ],
    sections: [
      {
        id: "prep", nav: "Prep", h2: "The prep that makes interior paint last",
        table: {
          caption: "Interior painting prep steps and why they matter",
          head: ["Step", "Why it matters"],
          rows: [
            ["Clean", "Removes dirt and grease so the new paint can bond."],
            ["Patch", "Holes and cracks are filled and sanded smooth before painting."],
            ["Sand", "Glossy surfaces are dulled so the new coat adheres."],
            ["Caulk", "Gaps where trim meets the wall are filled for a clean, continuous line."],
            ["Prime", "Bare wood, patches and stains get primer; a stain-blocking primer stops bleed-through."],
            ["Finish coats", "The number of coats depends on the color change and the surface; label coverage and recoat times are followed."],
          ],
        },
      },
      {
        id: "products", nav: "Paint and sheen", h2: "Choosing interior paint and sheen",
        bullets: [
          "Interior walls: low-VOC paints reduce odor; flat and matte finishes hide surface flaws, while eggshell and satin wipe clean more easily.",
          "Trim, doors and cabinets: semi-gloss and enamel finishes stand up to handling and cleaning.",
        ],
      },
    ],
    cost: {
      h2: "What does interior painting cost in Massachusetts?",
      answer: "Interior painting prices depend on the number and size of the rooms, the condition of the walls and trim, ceiling height, the amount of trim and the number of colors, and prep is often the largest part of the labor. We give an itemized estimate after looking at the rooms.",
      drivers: [
        "Wall area and the number of rooms",
        "Surface condition: how much patching and sanding is needed",
        "Ceiling height and access, including stairwells",
        "Amount and detail of trim, windows and doors",
        "Number of colors and sheens",
        "Lead-safe rules (containment and cleanup) on pre-1978 homes",
        "Cabinet painting, which takes more prep and drying time than walls",
      ],
      guides: [],
    },
    permitShort: "Painting alone normally needs no building permit; lead-safe rules apply in homes built before 1978.",
    permits: {
      intro: "Interior painting has fewer permit steps than other work, but one important rule. In Massachusetts:",
      table: {
        caption: "Interior painting rules in Massachusetts",
        head: ["Permit or rule", "When it applies", "Who handles it"],
        rows: [
          ["Building permit", "Painting alone normally does not need one.", "No application in most cases."],
          LEAD_ROW("Homes built before 1978, when prep disturbs more than 6 sq ft of painted surface in a room."),
        ],
      },
      nh: NH_NOTE,
    },
    leadSafe: { intro: "Sanding and scraping old interior paint on walls, trim, doors and windows can release lead dust. In a home built before 1978, prep that disturbs more than 6 square feet of painted surface in a room falls under the lead-safe renovation rules." },
    process: {
      steps: [
        { step: "Estimate visit", detail: "We look at every room, note repairs and the age of the paint, and talk through colors and sheens. You get an itemized estimate." },
        { step: "Color selection", detail: "We help you narrow down colors for each room and its light." },
        { step: "Protection", detail: "Furniture is moved to the center of the room and covered, and floors are protected with drop cloths." },
        { step: "Prep", detail: "Cleaning, patching, sanding, caulking and priming." },
        { step: "Painting", detail: "Ceilings, walls, then trim, with each coat applied within the label's recoat times." },
        { step: "Cleanup and walkthrough", detail: "Touch-ups, cleanup and a walkthrough with you." },
      ],
    },
    faqs: [
      { q: "How much does interior painting cost in Massachusetts?", a: "It depends on the number and size of the rooms, the condition of the walls and trim, ceiling height, trim detail and the number of colors, and prep is often the largest part of the labor. We price each job with an itemized estimate after looking at the rooms.", more: { href: "#cost", label: "What drives interior painting cost" } },
      { q: "Is there lead paint inside my house?", a: "If the house was built before 1978, assume painted walls, trim, doors and windows may contain lead until a test shows otherwise. Prep that disturbs more than 6 square feet of painted surface in a room then falls under the lead-safe rules: containment, no open-flame burning or uncontrolled power sanding, and HEPA cleanup with a cleaning verification check.", more: { href: LEAD_SAFE_HREF, label: "Lead-safe rules for pre-1978 homes" } },
      { q: "Do I need a permit to paint inside my house?", a: "No building permit is normally needed for interior painting. In a home built before 1978, lead-safe rules still apply when prep disturbs more than 6 square feet of painted surface in a room.", more: { href: `${PERMIT_GUIDE}#exempt`, label: "Work that usually needs no permit" } },
      { q: "Do you paint kitchen cabinets?", a: "Yes. Cabinet painting means removing the doors and hardware, degreasing, sanding, priming with a bonding primer and applying a hard-wearing enamel. It takes longer than painting walls because each coat must dry and cure." },
      { q: "Do I need to move furniture before interior painting?", a: "Move small items, valuables and wall hangings. Larger furniture is usually moved to the center of the room and covered, and floors are protected with drop cloths." },
      { q: "How many coats of paint are needed?", a: "Usually two finish coats over a properly prepared and primed surface. Big color changes, bare or patched surfaces and some deep colors need a primer coat or an extra finish coat for even color." },
      { q: "What sheen should I use on walls and trim?", a: "Flat and matte finishes hide surface flaws on walls and ceilings, eggshell and satin wipe clean more easily, and semi-gloss or enamel finishes stand up to handling on trim, doors and cabinets. Low-VOC paints reduce odor while you live in the house." },
      { q: "Can you help me choose interior colors?", a: "Yes. We help you narrow down colors for each room. Paint test samples on the wall and look at them in daylight and at night before committing, because a room's light changes how a color reads." },
    ],
    related: ["exterior-painting", "home-remodeling", "kitchen-remodeling"],
    guides: ["how-to-choose-a-contractor-in-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts"],
    sources: [SOURCES.lead],
  },
];

// Hero photos (real photos only; exterior painting, whole-home and interior painting have none → gradient hero).
// Each hero must be in its service's gallery (lib/services.ts); the throw below keeps that true.
const HERO_SRC: Partial<Record<ServiceSlug, string>> = {
  siding: "/images/projects/home-addition-exterior-lynnfield-ma-18.webp",
  "window-replacement": "/images/projects/home-addition-exterior-lynnfield-ma-13.webp",
  "door-installation": "/images/projects/home-addition-exterior-lynnfield-ma-14.webp",
  decks: "/images/projects/deck-salem-nh-02.webp",
  "kitchen-remodeling": "/images/projects/kitchen-remodel-mansfield-ma-01.webp",
  "bathroom-remodeling": "/images/projects/bathroom-remodels-03.webp",
  "home-additions": "/images/projects/home-addition-exterior-lynnfield-ma-12.webp",
};

if (CONTENT.map((c) => c.slug).join() !== services.map((s) => s.slug).join()) {
  throw new Error("service-content: CONTENT must hold one entry per service, in SERVICE_SLUGS order (D10)");
}

const BY_SLUG = new Map<string, ServiceContent>(CONTENT.map((c) => {
  const s = services.find((x) => x.slug === c.slug);
  if (!s) throw new Error(`service-content: unknown service ${c.slug}`);
  const heroSrc = HERO_SRC[c.slug];
  const hero = heroSrc ? s.gallery.find((g) => g.src === heroSrc) : undefined;
  if (heroSrc && !hero) throw new Error(`service-content: hero ${heroSrc} is not in the ${c.slug} gallery`);
  return [c.slug, { ...c, hero }];
}));

export function getContent(slug: string): ServiceContent | undefined {
  return BY_SLUG.get(slug);
}

// ---------- derived proof (never hand-typed towns) ----------
/** Case studies that document this service (lib/projects.ts services[]). */
export function serviceProjects(slug: ServiceSlug): Project[] {
  return projects.filter((p) => p.services.includes(slug));
}

/** Guides that exist in lib/posts.ts, in the order listed. */
export function serviceGuides(slugs: string[]) {
  return slugs.map((g) => posts.find((p) => p.slug === g)).filter((p): p is (typeof posts)[number] => Boolean(p));
}

/** Services a testimonial is about: the ONE mapping, TESTIMONIAL_SERVICES (lib/services.ts, lead ruling O6). */
export const testimonialServices = (name: string): ServiceSlug[] => TESTIMONIAL_SERVICES[name]?.services ?? [];

/** Real testimonials for this service (verbatim from lib/site.ts), derived from TESTIMONIAL_SERVICES. */
export function serviceTestimonials(c: ServiceContent) {
  return testimonials.filter((t) => testimonialServices(t.name).includes(c.slug));
}

/** "Lynnfield, MA" → the served City (undefined for "Massachusetts" or unknown labels). */
export const cityFromLabel = (label: string): City | undefined => {
  const m = label.match(/^(.+), (MA|NH)$/);
  return m ? allCities.find((c) => c.n === m[1] && (c.s ?? "MA") === m[2]) : undefined;
};

export type ProofPlace = { city: City; label: string; projects: Project[]; clients: string[] };
/** Towns where this service is documented: case-study towns + towns of real clients whose testimonial covers it. */
export function proofPlaces(c: ServiceContent): ProofPlace[] {
  const out = new Map<string, ProofPlace>();
  const add = (city: City, label: string) => {
    const k = citySlug(city);
    if (!out.has(k)) out.set(k, { city, label, projects: [], clients: [] });
    return out.get(k)!;
  };
  for (const p of serviceProjects(c.slug)) {
    const city = cityFromLabel(p.location);
    if (city) add(city, p.location).projects.push(p);
  }
  for (const t of serviceTestimonials(c)) {
    const city = cityFromLabel(t.town);
    if (city) add(city, t.town).clients.push(t.name);
  }
  return [...out.values()];
}

/** Card photo candidates for each case study (captioned photos), in order of preference. The hub picks the first
 *  one not already shown on the page (hero/gallery), so the same photo never appears twice. */
const PROJECT_CARD: Record<string, string[]> = {
  "kitchen-remodel-mansfield-ma": ["/images/projects/kitchen-remodel-mansfield-ma-03.webp", "/images/projects/kitchen-remodel-mansfield-ma-01.webp"],
  // BATH03 leads the bathroom hub's hero, so that hub's card falls back to BATH01.
  "bathroom-remodels": ["/images/projects/bathroom-remodels-03.webp", "/images/projects/bathroom-remodels-01.webp"],
  "pool-deck-salem-nh": ["/images/projects/deck-salem-nh-06.webp", "/images/projects/deck-salem-nh-02.webp"],
  "home-addition-needham-ma": ["/images/projects/home-addition-needham-ma-05.webp"],
  "home-addition-exterior-lynnfield-ma": ["/images/projects/home-addition-exterior-lynnfield-ma-16.webp", "/images/projects/home-addition-exterior-lynnfield-ma-12.webp"],
  "home-addition-framing-lynnfield-ma": ["/images/projects/home-addition-lynnfield-ma-06.webp"],
  "exterior-remodel-siding-deck": ["/images/projects/exterior-remodel-siding-deck-ma-01.webp"],
};
// Video stills (low resolution) — described, never used as heroes.
const STILL_ALTS: Record<string, string> = {
  "/images/projects/home-addition-lynnfield-ma-06.webp": "Addition walls sheathed in green and red panels in winter, with a work van parked beside it (video still)",
  "/images/projects/exterior-remodel-siding-deck-ma-01.webp": "New pressure-treated stairs and railings with white lattice skirting beside a house (video still)",
};
export function projectCardImage(p: Project, avoid: Set<string> = new Set()): { src: string; alt: string } {
  const list = PROJECT_CARD[p.slug] ?? [p.cover];
  const src = list.find((x) => !avoid.has(x)) ?? list[0];
  return { src, alt: PHOTO_CAPTIONS[src]?.alt ?? STILL_ALTS[src] ?? "" };
}

export const allContent = () => services.map((s) => ({ service: s, content: getContent(s.slug)! }));
export type { Service };
