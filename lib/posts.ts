// lib/posts.ts — blog content (audit 04-blog.md §3–§4, 09-aeo-geo.md AEO-H3/H5).
//
// Truth rules for this file:
// - Every number is either from the Remodeling 2025 Cost vs. Value report (New England division, cited on the
//   page with its credit line) or derived arithmetically from it. No company price ranges are published until
//   the owner supplies real bands from invoices (with counts).
// - Massachusetts legal and permit statements use the cautious wording of study/04 §8–§9; sources link only to
//   URLs that appear in the audit/study notes.
// - Photos are real Waterfront Construction project photos; captions describe only what is visible.
// - Dates: `published` = first git commit that added the post (GitHub history of lib/posts.ts);
//   `modified` = last SUBSTANTIVE edit. Never re-date a post to look fresh.
import { site, type City } from "./site";
import type { ServiceSlug } from "./services";
import { licensingAnswer, hasCsl } from "./credentials";

export type PostCategory = "Cost guides" | "Planning, permits & hiring" | "Exteriors: siding & windows";
export const CATEGORIES: { name: PostCategory; id: string; intro: string }[] = [
  { name: "Cost guides", id: "cost-guides", intro: "What remodeling projects cost in New England, what moves the price in Massachusetts, and what pays back at resale." },
  { name: "Planning, permits & hiring", id: "planning", intro: "Massachusetts permit rules and a pre-hire checklist built on the state's contractor and contract laws." },
  { name: "Exteriors: siding & windows", id: "exteriors", intro: "When to repair or replace siding and windows, and how the main siding materials compare." },
];

export type Faq = { q: string; a: string };
export type Source = { label: string; url: string };
export type Table = { caption: string; head: string[]; rows: string[][]; note?: string };
export type Figure = {
  src: string;
  alt: string;
  caption: string;
  href?: string; // the project page the photo belongs to
  hrefLabel?: string;
  place?: City; // town where the photo was taken (omit when unknown)
  aspect?: string; // CSS aspect-ratio used to crop a baked-in banner off the bottom of the photo
};
export type Step = { t: string; d: string };
// Text in p / ul / ol / table cells / callouts may contain inline links: [label](/path) or [label](https://…).
export type Block =
  | { p: string }
  | { ul: string[]; marker?: "check" | "warn" }
  | { ol: Step[] }
  | { table: Table }
  | { figure: Figure }
  | { callout: string }
  | { testimonial: string }; // a name from lib/site.ts `testimonials` (real, shared with permission) — rendered verbatim
export type Section = { id: string; h: string; blocks: Block[] };

export type Post = {
  slug: string;
  title: string; // H1 (visible), also used by llms.txt and the service hubs
  seoTitle: string; // <title> WITHOUT the brand (root template appends " | Waterfront Construction"); ≤ ~60 chars
  description: string; // unique meta description, 120–160 chars, with a sourced fact
  excerpt: string; // card text on /blog and the hubs
  answer: string; // 40–60-word direct answer, rendered first
  category: PostCategory;
  published: string; // ISO 8601 with offset — first commit that added the post
  modified: string; // ISO 8601 with offset — last substantive edit
  image: string; // real project photo: in-article figure, BlogPosting image, sitemap image
  photo: Omit<Figure, "src">;
  related: { services: ServiceSlug[]; projects: string[]; posts: string[] };
  sections: Section[];
  faqs: Faq[];
  sources: Source[];
  tags: string[];
};

// ---------- dates (git: GitHub commit history of lib/posts.ts; converted to America/New_York) ----------
const FIRST_COMMIT = "2026-06-04T15:31:54-04:00"; // 4c5dd0b "Waterfront Construction marketing site" (5-remodels, signs-siding, contractor)
const KITCHEN_COMMIT = "2026-06-25T14:47:56-04:00"; // da28d22 "… kitchen cost blog post"
const SIX_POSTS_COMMIT = "2026-06-29T21:53:31-04:00"; // 6ff97c3 "Add 6 new SEO/AEO blog posts …"
const REWRITE = "2026-10-05T09:41:19-04:00"; // full fact-checked rewrite (audit 04 §3) — also the first publication of the 2 new cost guides

// ---------- sources (URLs taken from the audit/study notes only) ----------
const S = {
  cvv: { label: "Remodeling 2025 Cost vs. Value Report: New England (JLC / Zonda Media)", url: "https://www.jlconline.com/cost-vs-value/2025/new-england/" },
  cvvData: { label: "Cost vs. Value report data, free download (costvsvalue.com)", url: "https://www.costvsvalue.com" },
  c142a2: { label: "M.G.L. c.142A §2: requirements for home improvement contracts", url: "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXX/Chapter142A/Section2" },
  c142a17: { label: "M.G.L. c.142A §17: prohibited acts, including advertising without a registration number", url: "https://law.justia.com/codes/massachusetts/2017/part-i/title-xx/chapter-142a/section-17/" },
  cmr18: { label: "Mass.gov: 201 CMR 18.00, Home Improvement Contractor registration and enforcement", url: "https://www.mass.gov/regulations/201-CMR-1800-registration-and-enforcement-of-home-improvement-contractor-program" },
  cmr1802: { label: "201 CMR 18.02: definitions, including what counts as an advertisement (Cornell LII)", url: "https://www.law.cornell.edu/regulations/massachusetts/201-CMR-18-02" },
  contract: { label: "Mass.gov: Home improvement contract requirements, details and sample language", url: "https://www.mass.gov/info-details/home-improvement-contract-requirements-details-and-sample-language" },
  hic: { label: "Mass.gov: Home Improvement Contractor program resources", url: "https://www.mass.gov/info-details/hic-contractor-resources" },
  lead: { label: "Mass.gov: Lead-safe renovation for contractors (454 CMR 22.00)", url: "https://www.mass.gov/info-details/lead-safe-renovation-for-contractors" },
  nh: { label: "SimplyWise: New Hampshire contractor license requirements", url: "https://www.simplywise.com/blog/new-hampshire-contractor-license/" },
} satisfies Record<string, Source>;

// ---------- Remodeling 2025 Cost vs. Value, New England division ----------
// Figures: ONLY the 8 approved projects in study/03-aeo-geo.md §10A (lines ~398-407). The report's other projects
// (major kitchen remodels, upscale bathroom remodels, bathroom and suite additions) are described qualitatively and
// sent to the full report: their numbers were never checked on jlconline (verification V3.1). Add one here only
// after it has been checked on the jlconline 2025 New England page and added to the study notes.
// verify against jlconline before next update — figures, scope wording and the credit line (swap in the 2026 edition when it is out).
export const CVV_CREDIT = "© 2025 Zonda Media, a Delaware corporation. Complete data from the Remodeling 2025 Cost vs. Value Report can be downloaded free at www.costvsvalue.com.";
const CVV_NOTE = `New England average, 2025. ${CVV_CREDIT} These are regional averages for standard projects, not quotes: your price depends on your house, your choices and the conditions found once work starts.`;
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const CVV = {
  minorKitchen: { job: 28936, rec: "134.3%" },
  bathMid: { job: 27559, rec: "90.5%" },
  fiberCement: { job: 20678, rec: "144.9%" },
  vinylSiding: { job: 17590, rec: "92.7%" },
  vinylWindows: { job: 21922, rec: "71.2%" },
  woodWindows: { job: 27226, rec: "69.7%" },
  compositeDeck: { job: 25817, rec: "95.8%" },
  woodDeck: { job: 20603, rec: "79.1%" },
} as const;
const $ = (k: keyof typeof CVV) => money(CVV[k].job);
const pct = (k: keyof typeof CVV) => CVV[k].rec;
// Derived figures (simple arithmetic on the benchmark; always labelled "about" or "roughly" on the page).
const perEach = (k: keyof typeof CVV, units: number, round = 1) => money(Math.round(CVV[k].job / units / round) * round);
const perSqFt = (k: keyof typeof CVV, sqft: number) => `$${(CVV[k].job / sqft).toFixed(2)}`;
const diff = (a: keyof typeof CVV, b: keyof typeof CVV, round = 1) => money(Math.round((CVV[a].job - CVV[b].job) / round) * round);

// ---------- photos (real project photos; captions describe only what is visible) ----------
const PR = "/images/projects";
const MANSFIELD: City = { n: "Mansfield" };
const NEEDHAM: City = { n: "Needham" };
const LYNNFIELD: City = { n: "Lynnfield" };
const SALEM_NH: City = { n: "Salem", s: "NH" };

// The full lead-safe rule set is published ONCE in the blog (signs-its-time-to-replace-your-siding#lead) and site-wide
// on /faq#pre-1978-homes. Other posts give one sentence specific to their work plus a link (verification V3.10).
const LEAD_RULE = "In homes built before 1978, paid renovation that disturbs more than 6 square feet of painted surface per room inside, or more than 20 square feet outside, and any window replacement, must follow lead-safe work rules. In Massachusetts the company doing the work needs a Lead-Safe Renovation Contractor license from the Department of Labor Standards, with a certified renovator directing the job. That license is separate from Home Improvement Contractor registration and the Construction Supervisor License.";
const LEAD_LINK = "[lead-safe rules for pre-1978 homes](/faq#pre-1978-homes)";
/** "the full report" pointer for Cost vs. Value projects whose figures are not repeated here (V3.1). */
const FULL_REPORT = "the full New England data is free at [costvsvalue.com](https://www.costvsvalue.com)";
const CONTRACT_RULE = "Massachusetts requires a written contract for home improvement work over $1,000 on an owner-occupied home. The deposit can't be more than one-third of the total price, or the cost of special-order materials if that is greater.";
const OWNER_LINE = `${site.owner} has ${site.experience}+ years of hands-on construction experience and founded ${site.name} in ${site.founded}.`;

export const posts: Post[] = [
  // =====================================================================================================
  {
    slug: "kitchen-remodel-cost-massachusetts",
    title: "How Much Does a Kitchen Remodel Cost in Massachusetts?",
    seoTitle: "Kitchen Remodel Cost in Massachusetts (2026 Guide)",
    description: "A midrange minor kitchen remodel averaged $28,936 in New England and recouped 134.3% (Cost vs. Value 2025). What drives kitchen prices in Massachusetts.",
    excerpt: "A New England cost benchmark for a minor kitchen remodel, how a major remodel differs, what moves the price in Massachusetts, permits, timing and a kitchen we remodeled in Mansfield.",
    answer: `Remodeling magazine's 2025 Cost vs. Value report puts the New England average for a midrange minor kitchen remodel, which keeps the layout and cabinet boxes, at ${$("minorKitchen")}. A major remodel with new cabinets and a new layout costs more. In Massachusetts, new cabinets, layout changes and what turns up behind old walls move the price most.`,
    category: "Cost guides",
    published: KITCHEN_COMMIT,
    modified: REWRITE,
    image: `${PR}/kitchen-remodel-mansfield-ma-01.webp`,
    photo: {
      alt: "Remodeled kitchen in Mansfield, MA with white shaker-style cabinets, a stainless refrigerator, a dark stone-look island and three glass pendant lights",
      caption: "A kitchen we remodeled in Mansfield, MA.",
      href: "/projects/kitchen-remodel-mansfield-ma",
      hrefLabel: "See the Mansfield kitchen project",
      place: MANSFIELD,
    },
    related: {
      services: ["kitchen-remodeling"],
      projects: ["kitchen-remodel-mansfield-ma", "bathroom-remodels"],
      posts: ["bathroom-remodel-cost-massachusetts", "5-remodels-that-add-the-most-home-value", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts"],
    },
    sections: [
      {
        id: "cost-table", h: "What does a kitchen remodel cost in New England?", blocks: [
          { table: {
            caption: "Minor kitchen remodel cost: New England average (Cost vs. Value 2025)",
            head: ["Project", "Typical scope (about 200 sq ft kitchen)", "New England average, 2025", "Cost recouped at resale"],
            rows: [
              ["Minor remodel, midrange", "New cabinet fronts and hardware, laminate counters, sink and faucet, oven and cooktop, flooring and paint; layout and cabinet boxes stay", $("minorKitchen"), pct("minorKitchen")],
            ],
            note: CVV_NOTE,
          } },
          { p: `The same report also prices midrange and upscale major kitchen remodels, with new cabinets, an island or a new layout. Those cost more than a minor remodel and recoup a smaller share of their cost at resale; we don't repeat their figures here, and ${FULL_REPORT}.` },
          { p: "Use this number as a reference point, not a price list. It describes a standard project in a typical New England house. We don't publish our own price ranges; we price each kitchen from an itemized estimate after a free visit, so you can see where the money goes." },
        ],
      },
      {
        id: "minor-vs-major", h: "What's the difference between a minor and a major kitchen remodel?", blocks: [
          { p: "A minor remodel keeps the layout and the cabinet boxes. A major remodel replaces the cabinets and usually changes how the room works." },
          { ul: [
            "Minor: new doors and drawer fronts (or painted cabinets), new counters, sink and faucet, new appliances, flooring, lighting fixtures and paint. Plumbing and gas stay where they are.",
            "Major: new cabinets, often an island or a new layout, new counters and appliances, new lighting circuits, and sometimes moved plumbing, a moved gas line or a removed wall.",
          ] },
          { p: "The extra cost of a major remodel is mostly new cabinetry, layout changes and the trade work that comes with them." },
        ],
      },
      {
        id: "cost-drivers", h: "What drives the cost of a kitchen remodel in Massachusetts?", blocks: [
          { ul: [
            "Cabinets: stock, semi-custom and custom cabinets differ widely in price, and cabinetry is often the largest single line item.",
            "Countertops: laminate, quartz and natural stone cover a wide range, and edge details and cutouts add to it.",
            "Moving the sink, range or gas line: plumbing and gas work is done by licensed plumbers and gas fitters, who pull their own permits.",
            "Electrical work: new circuits, under-cabinet lighting and outlets are done by a licensed electrician under an electrical permit.",
            "Removing or moving walls: structural changes need a building permit, and a bearing wall may need an engineered beam.",
            "Older houses: opening walls can uncover outdated wiring, old plumbing or water damage. In homes built before 1978, disturbing painted surfaces triggers lead-safe work rules.",
            "Appliances: the step from standard to professional-grade appliances is a large swing on its own.",
          ] },
          { p: "Our [Massachusetts permit guide](/blog/do-you-need-a-permit-to-remodel-massachusetts#kitchens-baths) explains which kitchen work needs which permit." },
        ],
      },
      {
        id: "permits", h: "Do you need a permit for a kitchen remodel in Massachusetts?", blocks: [
          { p: "Usually, once the work goes beyond replacing finishes. Moving walls or changing the structure needs a building permit, and plumbing, gas and electrical work need separate permits pulled by the licensed tradespeople doing it. Replacing cabinets and counters in place usually doesn't need a building permit, but your town's building department has the final word." },
        ],
      },
      {
        id: "timeline", h: "How long does a kitchen remodel take?", blocks: [
          { p: "Kitchens typically take about 3 to 6 weeks of work once materials are in. Cabinets are often the item with the longest lead time, so the order date matters as much as the construction schedule. Permits add time before work starts." },
        ],
      },
      {
        id: "save", h: "Where can you save on a kitchen remodel?", blocks: [
          { p: `The resale data favors restraint: in New England, the midrange minor remodel recouped ${pct("minorKitchen")} of its cost, while major remodels recouped a smaller share. Ways to get the most change per dollar:` },
          { ul: [
            "Keep the sink, range and dishwasher where they are, so plumbing and gas lines don't move.",
            "Keep solid cabinet boxes and replace the doors and drawer fronts, or paint them.",
            "Choose mid-range counters and spend where you touch every day: drawers, hardware, the faucet and lighting.",
            "Settle every selection before work starts. Changes after cabinets are ordered are the most expensive kind.",
          ], marker: "check" },
        ],
      },
      {
        id: "example", h: "What did our Mansfield kitchen remodel include?", blocks: [
          { p: "The kitchen in the photo at the top of this guide is a remodel we did in Mansfield. The finished room has white shaker-style cabinets, a large island with a dark stone-look countertop and a waterfall edge, stainless appliances and three glass pendant lights over the island. See more photos on the [Mansfield kitchen project page](/projects/kitchen-remodel-mansfield-ma)." },
          { figure: {
            src: `${PR}/kitchen-remodel-mansfield-ma-02.webp`,
            alt: "Kitchen island with a dark veined stone-look countertop and waterfall edge, white cabinets and a sliding door, Mansfield, MA",
            caption: "The island's waterfall countertop edge in the Mansfield kitchen.",
            href: "/projects/kitchen-remodel-mansfield-ma",
            hrefLabel: "See the project",
            place: MANSFIELD,
          } },
          { p: "We remodel kitchens across our service area, including [kitchen remodeling in Mansfield](/services/kitchen-remodeling/mansfield) and [in Framingham](/services/kitchen-remodeling/framingham), where a client shared this about their new kitchen:" },
          { testimonial: "Susan D." },
        ],
      },
      {
        // Never use the id "estimate" for content: it is reserved for the estimate form (global "Free estimate" CTAs scroll to it; V5.1).
        id: "accurate-estimate", h: "How do you get an accurate kitchen estimate?", blocks: [
          { ul: [
            "Ask for an itemized estimate that lists cabinets, counters, appliances, trade work, permits and any allowances separately.",
            "Ask what each allowance covers. A low allowance for cabinets or tile makes a bid look cheaper than it is.",
            `Get it in writing. ${CONTRACT_RULE}`,
            "Check the contractor before you sign: our [pre-hire checklist](/blog/how-to-choose-a-contractor-in-massachusetts) covers the registration, license and insurance to look up.",
          ] },
          { p: "For the full scope of what we build, see our [kitchen remodeling service](/services/kitchen-remodeling)." },
        ],
      },
    ],
    faqs: [
      { q: "Is a kitchen remodel worth it for resale in Massachusetts?", a: `Smaller updates pay back more. In the 2025 Cost vs. Value data for New England, a midrange minor kitchen remodel recouped ${pct("minorKitchen")} of its cost at resale, while major remodels recouped a smaller share. A major remodel is usually about how you live, not resale.` },
      { q: "What's the most expensive part of a kitchen remodel?", a: "Usually the cabinets, followed by counters, appliances and any trade work needed to move plumbing, gas or walls." },
      { q: "Can we keep using the kitchen during the remodel?", a: "Not during demolition and installation. Many families set up a temporary kitchen in another room with the refrigerator and a microwave for those weeks." },
      { q: "What should a kitchen remodel contract include?", a: "Both parties' names and addresses, the contractor's Home Improvement Contractor registration number, start and completion dates, the detailed scope and materials, the total price and payment schedule, and who obtains the permits. The deposit is capped at one-third of the price or the cost of special-order materials, whichever is greater." },
    ],
    sources: [S.cvv, S.cvvData, S.c142a2, S.contract, S.lead],
    tags: ["kitchen remodeling", "remodeling costs", "Massachusetts"],
  },

  // =====================================================================================================
  {
    slug: "bathroom-remodel-cost-massachusetts",
    title: "How Much Does a Bathroom Remodel Cost in Massachusetts?",
    seoTitle: "Bathroom Remodel Cost in Massachusetts (2026 Guide)",
    description: "A midrange 5x7-foot bathroom remodel averaged $27,559 in New England and recouped 90.5% (Cost vs. Value 2025). How tile, layout and plumbing move the price.",
    excerpt: "A New England cost benchmark for a midrange bathroom remodel, how an upscale remodel differs, what moves the price in Massachusetts, permits, timing and why waterproofing matters.",
    answer: `Remodeling magazine's 2025 Cost vs. Value report puts the New England average for a midrange remodel of a 5-by-7-foot bathroom at ${$("bathMid")}. An upscale remodel that enlarges and re-plans the room costs more. In Massachusetts, moving plumbing, the amount of tile and water damage found behind old walls move the price most.`,
    category: "Cost guides",
    published: SIX_POSTS_COMMIT,
    modified: REWRITE,
    image: `${PR}/bathroom-remodels-03.webp`, // the file itself is now cropped (no baked-in banner), so no CSS crop
    photo: {
      alt: "Walk-in shower with marble-look tile walls, a hexagon mosaic floor and a hinged glass door, next to a toilet",
      caption: "A walk-in shower from one of our recent bathroom remodels in Massachusetts.",
      href: "/projects/bathroom-remodels",
      hrefLabel: "See more of our bathroom remodels",
    },
    related: {
      services: ["bathroom-remodeling"],
      projects: ["bathroom-remodels", "kitchen-remodel-mansfield-ma"],
      posts: ["kitchen-remodel-cost-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts", "5-remodels-that-add-the-most-home-value"],
    },
    sections: [
      {
        id: "cost-table", h: "What does a bathroom remodel cost in New England?", blocks: [
          { table: {
            caption: "Bathroom remodel cost: New England average (Cost vs. Value 2025)",
            head: ["Project", "Typical scope", "New England average, 2025", "Cost recouped at resale"],
            rows: [
              ["Bathroom remodel, midrange", "Update a 5 × 7 ft bathroom: new tub with ceramic tile surround, toilet, fixtures, vanity with solid-surface top and tile floor", $("bathMid"), pct("bathMid")],
            ],
            note: CVV_NOTE,
          } },
          { p: `The same report also prices an upscale bathroom remodel, which enlarges the room and moves fixtures, and bathroom additions. Those larger projects cost more and recoup a smaller share of their cost at resale; we don't repeat their figures here, and ${FULL_REPORT}.` },
          { p: "We don't publish our own price ranges. Every bathroom is priced from an itemized estimate after a free visit, because tile choices, the shower design and what's behind the walls vary so much from house to house." },
        ],
      },
      {
        id: "midrange-vs-upscale", h: "What's the difference between a midrange and an upscale bathroom remodel?", blocks: [
          { ul: [
            "Midrange: the bathroom keeps its size and layout. The tub, toilet, vanity, tile and fixtures are replaced with standard-grade products, and the plumbing stays where it is.",
            "Upscale: the room gets bigger or is re-planned, so drains and supply lines move. It typically adds a custom tile shower with frameless glass, a separate tub, a double vanity and higher-end fixtures and lighting.",
          ] },
        ],
      },
      {
        id: "cost-drivers", h: "What drives bathroom remodel costs in Massachusetts?", blocks: [
          { ul: [
            "Tile area and pattern: tile is labor-heavy, and full-height walls, small mosaics and niches add hours.",
            "Shower versus tub: a custom tile shower with a glass door costs more than a tub with a tile surround. Tub-to-shower conversions also change the drain.",
            "Moving fixtures: relocating a toilet, shower or vanity means new drain and supply lines, done by a licensed plumber under a plumbing permit.",
            "Electrical and ventilation: the exhaust fan, lighting and ground-fault (GFCI) protected outlets near water are installed by a licensed electrician.",
            "Hidden damage: slow leaks often rot the subfloor or wall framing around a tub or toilet, and it only shows once the old floor and walls come out.",
            "Older houses: in homes built before 1978, disturbing painted surfaces triggers lead-safe work rules.",
            "Glass and fixtures: frameless glass, thermostatic valves and designer fixtures widen the range quickly.",
          ] },
        ],
      },
      {
        id: "waterproofing", h: "Why does waterproofing matter in a tiled shower?", blocks: [
          { p: "Tile and grout are not waterproof. What keeps water out of the wall and floor framing is the layer behind the tile: a waterproofing membrane or a sealed backer-board system, with the shower floor sloped to the drain and every niche, bench and corner sealed. When it is skipped or done poorly, leaks can go unnoticed for years." },
          { callout: "When you compare bids, ask each contractor which waterproofing system goes behind the tile and how the shower pan is tested before tile is set." },
        ],
      },
      {
        id: "timeline", h: "How long does a bathroom remodel take?", blocks: [
          { p: "Bathrooms typically take 2 to 3 weeks of work once materials are in. A frameless glass door is measured after the tile is finished and made to fit, which adds time at the end. If it's your only bathroom, plan for how the household will manage during those weeks." },
        ],
      },
      {
        id: "permits", h: "Do you need a permit to remodel a bathroom in Massachusetts?", blocks: [
          { p: "It depends on the work. Moving or adding fixtures needs a plumbing permit pulled by a licensed plumber, and new circuits need an electrical permit pulled by a licensed electrician. Changes to walls or structure need a building permit. Replacing finishes in place, such as tile, a vanity top or paint, is usually treated as finish work. Our [permit guide](/blog/do-you-need-a-permit-to-remodel-massachusetts#kitchens-baths) has the details, and your town's building department has the final word." },
        ],
      },
      {
        id: "examples", h: "What do our recent bathroom remodels look like?", blocks: [
          { p: "The shower at the top of this guide is from one of our recent bathroom remodels: marble-look tile walls, a hexagon mosaic floor and a hinged glass door. Our [bathroom projects page](/projects/bathroom-remodels) shows more, including walk-in showers with frameless glass, a tub with a glass panel and subway tile, and a corner shower beside a soaking tub." },
          { p: "We remodel bathrooms across our service area, including [bathroom remodeling in Hudson](/services/bathroom-remodeling/hudson) and [in Northborough](/services/bathroom-remodeling/northborough), where we're based. A client in Hudson shared this:" },
          { testimonial: "Rafael C." },
          { p: "See our [bathroom remodeling service](/services/bathroom-remodeling) for the full scope of what we do." },
        ],
      },
    ],
    faqs: [
      { q: "Is a bathroom remodel worth it for resale?", a: `A midrange remodel comes close: in the 2025 Cost vs. Value data for New England, it recouped ${pct("bathMid")} of its cost at resale. An upscale remodel recoups a smaller share, so the extra spending is mostly for your own use.` },
      { q: "Can I keep my tub and still update the bathroom?", a: "Yes. Keeping the tub and toilet where they are avoids moving drains, one of the bigger cost drivers. New tile, a new vanity, fixtures and lighting can go in around the existing layout." },
      { q: "Do I need a permit to replace a vanity or toilet?", a: "When a contractor does the work, plumbing is done by a licensed plumber under a plumbing permit. Ask your plumber or your town whether a like-for-like fixture swap needs a permit; moving or adding fixtures does." },
      { q: "How long will we be without the bathroom?", a: "Typically 2 to 3 weeks of work once materials are in, plus a short wait at the end if a custom glass door is made to fit after the tile is finished." },
    ],
    sources: [S.cvv, S.cvvData, S.lead],
    tags: ["bathroom remodeling", "remodeling costs", "Massachusetts"],
  },

  // =====================================================================================================
  {
    slug: "home-addition-cost-massachusetts",
    title: "How Much Does a Home Addition Cost in Massachusetts?",
    seoTitle: "Home Addition Cost in Massachusetts (2026 Guide)",
    description: "No single figure fits every addition. What drives home addition costs in Massachusetts: foundation, zoning, septic, wetlands, energy code and engineering.",
    excerpt: "Why no single figure fits every addition, the Massachusetts costs to budget for (zoning, septic, wetlands, energy code), timelines and our addition projects in Needham and Lynnfield.",
    answer: "No single figure fits every home addition, and this guide doesn't quote one: the size, the foundation, the site and how the new space ties into the house vary too much. In Massachusetts, foundation work, zoning, septic rules, wetlands review and engineering are the biggest swing factors. An itemized estimate based on your plans is the dependable number.",
    category: "Cost guides",
    published: SIX_POSTS_COMMIT,
    modified: REWRITE,
    image: `${PR}/home-addition-needham-ma-05.webp`,
    photo: {
      alt: "Colonial house in Needham, MA with a new front porch roof frame, house wrap along the base and a plywood-sheathed section at the side",
      caption: "Framing stage of a front porch addition on our Needham, MA project.",
      href: "/projects/home-addition-needham-ma",
      hrefLabel: "See the Needham addition project",
      place: NEEDHAM,
    },
    related: {
      services: ["home-additions"],
      projects: ["home-addition-needham-ma", "home-addition-exterior-lynnfield-ma", "home-addition-framing-lynnfield-ma"],
      posts: ["do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts", "5-remodels-that-add-the-most-home-value", "bathroom-remodel-cost-massachusetts"],
    },
    sections: [
      {
        id: "benchmark", h: "Is there a typical cost for a home addition in New England?", blocks: [
          { p: `Not one you can rely on for your house. This guide doesn't quote a dollar figure for additions. Remodeling magazine's Cost vs. Value report does price standard bathroom and primary-suite additions for New England, and ${FULL_REPORT}, but an addition's real cost depends on its size, foundation, plans and site far more than on a regional average.` },
          { p: "Even a small addition costs more than its size suggests. Every new room needs its own foundation, framing, roof, insulation, windows, plumbing, electrical work and finishes, and it has to be tied into the existing house. Those fixed costs don't shrink much as the room gets smaller." },
          { p: "We don't publish our own price ranges for additions either. Each one is priced from its plans after a site visit, with an itemized estimate. The sections below cover what moves that number in Massachusetts." },
        ],
      },
      {
        id: "out-or-up", h: "Is it cheaper to build out or build up?", blocks: [
          { p: "It depends on the house. Building out needs a new foundation: excavation, footings below the frost line and foundation walls or piers, and it uses yard space that zoning setbacks may limit. Building up avoids a new foundation, but the existing walls and foundation have to carry the new floor, which usually means an engineer's review and often reinforcement, and the roof comes off during construction." },
          { figure: {
            src: `${PR}/home-addition-exterior-lynnfield-ma-12.webp`,
            alt: "Main house in white house wrap beside a two-story addition sheathed in green panels with taped seams, Lynnfield, MA",
            caption: "A two-story addition sheathed in ZIP System panels, with house wrap on the main house, on our Lynnfield project.",
            href: "/projects/home-addition-exterior-lynnfield-ma",
            hrefLabel: "See the Lynnfield project",
            place: LYNNFIELD,
          } },
          { p: "Our projects show what building out involves: the [Needham addition](/projects/home-addition-needham-ma) is documented from the excavation to the framed porch, and the [Lynnfield addition and exterior project](/projects/home-addition-exterior-lynnfield-ma) added a two-story addition beside the original house." },
        ],
      },
      {
        id: "ma-costs", h: "What Massachusetts-specific costs should you budget for?", blocks: [
          { ul: [
            "Zoning: setbacks, lot coverage and height limits decide where and how big you can build. If your house doesn't meet current zoning (a pre-existing nonconforming house), an addition may need a finding or special permit from the zoning board under M.G.L. c.40A §6.",
            "Septic (Title 5): if the house is on a septic system, adding a bedroom can trigger Board of Health review under 310 CMR 15.00, and sometimes a septic upgrade.",
            "Wetlands: work near wetlands, streams or rivers may need Conservation Commission approval under the state Wetlands Protection Act, commonly within 100 feet of a wetland or 200 feet of a river.",
            "Energy code: additions must meet the state energy code, and many towns have adopted the stretch or specialized energy code, which adds requirements.",
            "Plans and engineering: most additions need permit drawings, plus structural engineering for beams, foundations or a second story.",
            "Trade permits: plumbing, gas and electrical work need separate permits pulled by licensed tradespeople.",
            "Historic districts: in a local historic district, exterior changes need the historic commission's approval.",
          ] },
          { p: `Contract rules apply to the money side. ${CONTRACT_RULE} On a large addition, that limit shapes the payment schedule.` },
          { p: "The items above vary by town and by lot, so check them with your building department and zoning office early. Approvals can add weeks or months before construction starts. Our [permit guide](/blog/do-you-need-a-permit-to-remodel-massachusetts#additions) covers the permit side in more detail." },
        ],
      },
      {
        id: "timeline", h: "How long does a home addition take?", blocks: [
          { p: "Larger additions typically take 2 to 4 months of construction after design and permits. Design, engineering and any zoning or Conservation Commission approvals come first and can add weeks to months." },
        ],
      },
      {
        id: "add-or-move", h: "Is adding on cheaper than moving?", blocks: [
          { p: "Sometimes, but not always, and money is only part of it. Put both options on paper before deciding:" },
          { ul: [
            "Moving: agent commission, the Massachusetts deed excise tax (customarily paid by the seller), closing costs on the new house, moving costs, and the price difference between your house and a bigger one in the area you want.",
            "Adding on: design and engineering, permits and approvals, construction, possible changes to your property tax assessment, and living with construction for several months.",
          ] },
          { p: `At resale, additions rarely pay for themselves: in the Cost vs. Value data, additions recoup a smaller share of their cost than smaller projects such as new siding or a minor kitchen remodel (see our [resale value guide](/blog/5-remodels-that-add-the-most-home-value)). An addition makes the most sense when you plan to stay and the extra space changes how you live.` },
        ],
      },
      {
        id: "examples", h: "What addition projects have we documented?", blocks: [
          { ul: [
            "[Home addition in Needham, MA](/projects/home-addition-needham-ma): a front porch addition documented from the excavation to the framed porch posts and roof.",
            "[Home addition and exterior remodel in Lynnfield, MA](/projects/home-addition-exterior-lynnfield-ma): a two-story addition beside the original house, with new windows and siding and front porch work.",
            "[Home addition framing in Lynnfield, MA](/projects/home-addition-framing-lynnfield-ma): an addition filmed in winter while its walls and roof were framed and sheathed.",
          ] },
          { p: "We build [home additions in Needham](/services/home-additions/needham), [in Lynnfield](/services/home-additions/lynnfield) and across our service area. A client in Northborough, where we're based, shared this about their deck and small addition:" },
          { testimonial: "Priya S." },
          { p: "See our [home additions service](/services/home-additions) for how we plan and build additions." },
        ],
      },
    ],
    faqs: [
      { q: "Do I need an architect for a home addition in Massachusetts?", a: "You need drawings good enough for a building permit, and often a structural engineer for foundations, beams or a second story. Ask your building department what it requires for your project before you hire a designer." },
      { q: "Can we live at home during an addition?", a: "Often, yes. Much of the work happens outside the existing rooms until the new space is tied in. Expect noise, short utility shutoffs and a stretch when the opening between old and new is made. Second-story additions are harder to live through because the roof comes off." },
      { q: "Does an addition raise property taxes?", a: "Usually, because it raises the assessed value of the house. Your town's assessor can explain how improvements are assessed." },
      { q: "Do additions pay for themselves at resale?", a: "Rarely. In the 2025 Cost vs. Value data for New England, additions recoup a smaller share of their cost at resale than smaller projects such as new siding or a minor kitchen remodel. An addition makes the most sense when you plan to stay." },
    ],
    sources: [S.cvv, S.cvvData, S.contract, S.c142a2],
    tags: ["home additions", "remodeling costs", "Massachusetts"],
  },

  // =====================================================================================================
  {
    slug: "siding-replacement-cost-massachusetts",
    title: "How Much Does Siding Replacement Cost in Massachusetts?",
    seoTitle: "Siding Replacement Cost in Massachusetts (2026 Guide)",
    description: "Re-siding 1,250 sq ft averaged $17,590 in vinyl and $20,678 in fiber cement in New England (Cost vs. Value 2025). What changes the price in Massachusetts.",
    excerpt: "New England benchmarks for vinyl and fiber-cement siding, how to estimate your own wall area, what a proper siding job includes, and Massachusetts permit and lead-safe rules.",
    answer: `In Remodeling magazine's 2025 Cost vs. Value report, replacing about 1,250 square feet of siding in New England averaged ${$("vinylSiding")} in vinyl and ${$("fiberCement")} in fiber cement. Your total scales with wall area, the number of stories, trim detail and any rotted sheathing found after tear-off. Houses built before 1978 also need lead-safe work practices.`,
    category: "Cost guides",
    published: SIX_POSTS_COMMIT,
    modified: REWRITE,
    image: `${PR}/home-addition-exterior-lynnfield-ma-17.webp`,
    photo: {
      alt: "Two-story addition in Lynnfield, MA with new white vertical siding on the upper walls and green sheathing still showing around three arched windows",
      caption: "Siding going up on the addition in our Lynnfield project.",
      href: "/projects/home-addition-exterior-lynnfield-ma",
      hrefLabel: "See the Lynnfield project",
      place: LYNNFIELD,
    },
    related: {
      services: ["siding"],
      projects: ["home-addition-exterior-lynnfield-ma", "exterior-remodel-siding-deck"],
      posts: ["vinyl-vs-fiber-cement-siding", "signs-its-time-to-replace-your-siding", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts"],
    },
    sections: [
      {
        id: "cost-table", h: "What does siding replacement cost in New England?", blocks: [
          { table: {
            caption: "Siding replacement: New England averages (Cost vs. Value 2025)",
            head: ["Project", "Typical scope", "New England average, 2025", "About per sq ft of wall", "Cost recouped at resale"],
            rows: [
              ["Vinyl siding replacement", "Replace about 1,250 sq ft of siding with vinyl, including trim", $("vinylSiding"), perSqFt("vinylSiding", 1250), pct("vinylSiding")],
              ["Fiber-cement siding replacement", "Replace about 1,250 sq ft of siding with fiber cement, including trim", $("fiberCement"), perSqFt("fiberCement", 1250), pct("fiberCement")],
            ],
            note: `${CVV_NOTE} The per-square-foot column is the benchmark job cost divided by 1,250 sq ft.`,
          } },
          { p: "1,250 square feet of wall is a small house. Many two-story houses have considerably more wall area, so measure yours before comparing. We don't publish our own price ranges; we measure the house and give you an itemized estimate after a free visit." },
        ],
      },
      {
        // Never use the id "estimate" for content: it is reserved for the estimate form (V5.1).
        id: "estimate-your-siding", h: "How do you estimate siding for your house?", blocks: [
          { ol: [
            { t: "Measure each wall.", d: "Multiply length by height for each wall, and add the triangles of the gable ends (half the base times the height)." },
            { t: "Subtract the large openings.", d: "Garage doors and big window groups come out; small windows usually don't, because of the waste around them." },
            { t: "Add waste.", d: "Siding is cut around every opening and corner, so contractors add a waste allowance, more on complicated walls." },
            { t: "Convert to squares.", d: "Siding is usually priced by the square, which is 100 square feet of wall." },
            { t: "Price trim separately.", d: "Corner boards, window and door trim, soffit and fascia are usually priced by the linear foot." },
          ] },
        ],
      },
      {
        id: "included", h: "What's included in a siding replacement?", blocks: [
          { ul: [
            "Tear-off and disposal of the old siding.",
            "Inspection and repair of rotted or damaged sheathing.",
            "A water-resistive barrier (house wrap or taped sheathing) behind the new siding.",
            "Flashing at windows, doors and roof-to-wall intersections, including kick-out flashing where a roof edge meets a wall.",
            "Trim, corners, soffit and fascia.",
            "Cleanup and a final walkthrough.",
          ], marker: "check" },
          { p: "Our [siding service page](/services/siding) explains how we install each part." },
        ],
      },
      {
        id: "permits-lead", h: "Do you need a permit and lead-safe work for new siding in Massachusetts?", blocks: [
          { p: "Usually, yes. Most Massachusetts towns require a building permit for re-siding, often a short-form permit, taken out by a Construction Supervisor License holder. Homes in a local historic district may also need the historic commission's approval first. See the [siding section of our permit guide](/blog/do-you-need-a-permit-to-remodel-massachusetts#siding)." },
          { p: `If the house was built before 1978 and the work disturbs more than 20 square feet of painted siding or trim, Massachusetts lead-safe rules apply, including a Lead-Safe Renovation Contractor license for the company doing the work; see ${LEAD_LINK}.` },
        ],
      },
      {
        id: "material", h: "Which siding material should you choose?", blocks: [
          { p: `Fiber cement costs more up front but recouped more at resale in the 2025 data (${pct("fiberCement")} versus ${pct("vinylSiding")} for vinyl); vinyl costs less and never needs paint. Our [vinyl vs. fiber-cement comparison](/blog/vinyl-vs-fiber-cement-siding) goes through durability, upkeep and looks. Engineered wood and cedar shingles, common on older New England houses, are other options to price separately.` },
        ],
      },
      {
        id: "example", h: "What does a siding project look like in practice?", blocks: [
          { p: "On our [Lynnfield addition and exterior project](/projects/home-addition-exterior-lynnfield-ma), the new two-story addition was sheathed and taped before new white siding went on, as the photo at the top of this guide shows. We do [siding work in Lynnfield](/services/siding/lynnfield) and across our service area, including [Westborough](/services/siding/westborough), where a client shared this:" },
          { testimonial: "Dave R." },
        ],
      },
    ],
    faqs: [
      { q: "How long does siding replacement take?", a: "Most single-family re-siding jobs take about 1 to 2 weeks of work once materials arrive. The size of the house, the material and repairs found under the old siding set the exact schedule." },
      { q: "Can new siding go over old siding?", a: "Sometimes, but tear-off is usually the better choice. Going over old siding hides rot and skips the chance to repair sheathing and fix the weather barrier and flashing. Check the manufacturer's instructions and your building department." },
      { q: "What's the best time of year to replace siding in Massachusetts?", a: "Siding can go on most of the year. Very cold days limit some steps: sealants and paints have minimum application temperatures, and vinyl is more brittle in deep cold. Spring through fall is easiest to schedule." },
      { q: "Will new siding lower my energy bills?", a: "Siding by itself adds little insulation. Savings come from sealing air leaks and fixing the weather barrier during re-siding, or from insulated siding or rigid foam added under it." },
    ],
    sources: [S.cvv, S.cvvData, S.lead],
    tags: ["siding", "remodeling costs", "Massachusetts"],
  },

  // =====================================================================================================
  {
    slug: "5-remodels-that-add-the-most-home-value",
    title: "Which Remodels Add the Most Resale Value in Massachusetts?",
    seoTitle: "Which Remodels Pay Back Most in Massachusetts? (2025 Data)",
    description: "In New England, fiber-cement siding recouped 144.9% of its cost at resale, a minor kitchen remodel 134.3% and a composite deck 95.8% (Cost vs. Value 2025).",
    excerpt: "Five common remodels ranked by how much of their cost they recouped at resale in New England, plus the projects that are about how you live rather than resale.",
    answer: `In New England, smaller exterior and cosmetic projects recoup the most at resale. In Remodeling magazine's 2025 Cost vs. Value report, fiber-cement siding recouped ${pct("fiberCement")} of its cost and a midrange minor kitchen remodel ${pct("minorKitchen")}. Larger projects, such as major kitchen remodels, upscale bathrooms and additions, recouped a smaller share.`,
    category: "Cost guides",
    published: FIRST_COMMIT,
    modified: REWRITE,
    image: `${PR}/kitchen-remodel-mansfield-ma-06.webp`,
    photo: {
      alt: "Kitchen island with a dark stone-look countertop and a sink, white cabinets and a stainless refrigerator, Mansfield, MA",
      caption: "A kitchen we remodeled in Mansfield, MA.",
      href: "/projects/kitchen-remodel-mansfield-ma",
      hrefLabel: "See the Mansfield kitchen project",
      place: MANSFIELD,
    },
    related: {
      services: ["siding", "kitchen-remodeling", "decks", "window-replacement", "door-installation"],
      projects: ["home-addition-exterior-lynnfield-ma", "kitchen-remodel-mansfield-ma", "pool-deck-salem-nh"],
      posts: ["siding-replacement-cost-massachusetts", "kitchen-remodel-cost-massachusetts", "deck-cost-massachusetts", "home-addition-cost-massachusetts"],
    },
    sections: [
      {
        id: "ranking", h: "Which common remodels recouped the most in New England?", blocks: [
          { p: "Five common remodeling projects, ranked by the best result for each type in the 2025 Cost vs. Value data for New England:" },
          { ol: [
            { t: `New siding: fiber cement recouped ${pct("fiberCement")}, vinyl ${pct("vinylSiding")}.`, d: `Replacing about 1,250 sq ft of siding averaged ${$("fiberCement")} in fiber cement and ${$("vinylSiding")} in vinyl. Siding is the first thing buyers see. See our [siding cost guide](/blog/siding-replacement-cost-massachusetts) and [siding service](/services/siding).` },
            { t: `Minor kitchen remodel, midrange: ${pct("minorKitchen")}.`, d: `New cabinet fronts, counters, sink, appliances and flooring in the existing layout averaged ${$("minorKitchen")}. See our [kitchen remodel cost guide](/blog/kitchen-remodel-cost-massachusetts).` },
            { t: `New deck: composite recouped ${pct("compositeDeck")}, wood ${pct("woodDeck")}.`, d: `A 16 × 20 ft deck averaged ${$("compositeDeck")} with composite decking and ${$("woodDeck")} with wood. See our [deck cost guide](/blog/deck-cost-massachusetts) and [deck service](/services/decks).` },
            { t: `Bathroom remodel, midrange: ${pct("bathMid")}.`, d: `Updating a 5 × 7 ft bathroom averaged ${$("bathMid")}. See our [bathroom remodel cost guide](/blog/bathroom-remodel-cost-massachusetts).` },
            { t: `Window replacement: vinyl recouped ${pct("vinylWindows")}, wood ${pct("woodWindows")}.`, d: `Replacing ten double-hung windows averaged ${$("vinylWindows")} in vinyl and ${$("woodWindows")} in wood. See our [window replacement cost guide](/blog/window-replacement-cost-massachusetts) and [window replacement service](/services/window-replacement).` },
          ] },
        ],
      },
      {
        id: "table", h: "How do the numbers compare across projects?", blocks: [
          { table: {
            caption: "Cost recouped at resale: New England (Cost vs. Value 2025)",
            head: ["Project", "New England average cost, 2025", "Cost recouped at resale"],
            rows: [
              ["Fiber-cement siding replacement", $("fiberCement"), pct("fiberCement")],
              ["Minor kitchen remodel, midrange", $("minorKitchen"), pct("minorKitchen")],
              ["Deck addition, composite", $("compositeDeck"), pct("compositeDeck")],
              ["Vinyl siding replacement", $("vinylSiding"), pct("vinylSiding")],
              ["Bathroom remodel, midrange", $("bathMid"), pct("bathMid")],
              ["Deck addition, wood", $("woodDeck"), pct("woodDeck")],
              ["Vinyl window replacement", $("vinylWindows"), pct("vinylWindows")],
              ["Wood window replacement", $("woodWindows"), pct("woodWindows")],
            ],
            note: CVV_NOTE,
          } },
          { p: `The full report also covers larger projects, such as major kitchen remodels, upscale bathroom remodels and additions. We don't repeat their figures here; they recouped a smaller share of their cost than the siding, kitchen and deck projects at the top of the table, and ${FULL_REPORT}.` },
        ],
      },
      {
        id: "cost-recouped", h: "What does \"cost recouped\" actually mean?", blocks: [
          { p: "It is the estimated value a project adds when the house is sold, divided by what the project cost. The resale values are estimates, not measured sale prices, and the result for any one house depends on its condition, its neighborhood and the market. Use the ranking to compare projects, not to predict your own sale price." },
        ],
      },
      {
        // National ranking of garage/entry doors: study/04 §10 (stable across 2023–2025 editions). verify against jlconline before next update
        id: "doors", h: "What about entry and garage doors?", blocks: [
          { p: "Nationally, garage-door and steel entry-door replacements have ranked at or near the top of recent Cost vs. Value reports. They aren't in the table above; check the full report for the current New England figures. We replace [entry and patio doors](/services/door-installation) as part of our window and door work." },
        ],
      },
      {
        id: "live-not-resale", h: "Which remodels are about how you live, not resale?", blocks: [
          { p: "Major kitchen remodels, upscale bathroom remodels and additions recoup a smaller share of their cost than the siding, kitchen and deck projects at the top of the table above. They rarely pay for themselves at sale, but they can still be the right call when you plan to stay: more room for a growing family, a kitchen that works, a second bathroom." },
          { p: "If that's your situation, our [home addition cost guide](/blog/home-addition-cost-massachusetts) and [home additions service](/services/home-additions) are the place to start." },
        ],
      },
      {
        id: "use-the-numbers", h: "How should you use these numbers?", blocks: [
          { ul: [
            "Fix problems first. Water getting into walls, rot and failed flashing come before any upgrade.",
            "Match the project to your timeline. If you may sell within a few years, favor the projects at the top of the table.",
            "Don't over-improve for the street. A project far above the neighborhood's level is less likely to come back at sale.",
            "Compare itemized estimates. The averages describe standard projects; your own quotes are what matter.",
          ] },
          { p: "See real examples on our [projects page](/gallery), including the [Lynnfield addition and exterior project](/projects/home-addition-exterior-lynnfield-ma) with new siding, windows and an entry door, and the [Mansfield kitchen](/projects/kitchen-remodel-mansfield-ma). We do this work across our service area, from [kitchen remodeling in Mansfield](/services/kitchen-remodeling/mansfield) to [siding in Lynnfield](/services/siding/lynnfield)." },
        ],
      },
    ],
    faqs: [
      { q: "What remodel adds the most value to a house in Massachusetts?", a: `Of the projects compared in this guide, fiber-cement siding replacement recouped the most in the 2025 Cost vs. Value data for New England (${pct("fiberCement")}), followed by a midrange minor kitchen remodel (${pct("minorKitchen")}). Nationally, garage-door and steel entry-door replacements have also ranked at or near the top of recent reports.` },
      { q: "Is a kitchen remodel worth it before selling?", a: `A modest one can be: the midrange minor kitchen remodel recouped ${pct("minorKitchen")} in New England. Major remodels recouped a smaller share, so they are rarely worth doing just to sell.` },
      { q: "Do additions pay for themselves?", a: "Usually not at resale. In the 2025 Cost vs. Value data for New England, additions recouped a smaller share of their cost than smaller projects such as new siding or a minor kitchen remodel. Additions make sense when you plan to stay." },
    ],
    sources: [S.cvv, S.cvvData],
    tags: ["home value", "resale", "remodeling costs", "New England"],
  },

  // =====================================================================================================
  {
    slug: "signs-its-time-to-replace-your-siding",
    title: "7 Signs It's Time to Replace Your Siding",
    seoTitle: "7 Signs You Need New Siding (and When Repair Is Enough)",
    description: "Soft or rotted boards, cracked panels, paint that keeps failing: how to tell siding repair from replacement on a New England home and what replacement involves.",
    excerpt: "How to tell when siding damage is isolated and repairable, when it means water is getting into the wall, and what to check on an older New England house.",
    answer: "Replace siding when damage is widespread rather than isolated: soft or rotted boards in several areas, panels cracked or warped across a whole wall, paint that fails within a few years, or moisture showing up inside. One or two damaged boards can usually be repaired; repeated failures usually mean water is getting behind the siding.",
    category: "Exteriors: siding & windows",
    published: FIRST_COMMIT,
    modified: REWRITE,
    image: `${PR}/home-addition-exterior-lynnfield-ma-05.webp`,
    photo: {
      alt: "Two-story addition in Lynnfield, MA in taped green sheathing with its windows installed, seen from the driveway",
      caption: "The layer behind the siding: taped sheathing on the addition in our Lynnfield project, before the siding went on.",
      href: "/projects/home-addition-exterior-lynnfield-ma",
      hrefLabel: "See the Lynnfield project",
      place: LYNNFIELD,
    },
    related: {
      services: ["siding"],
      projects: ["home-addition-exterior-lynnfield-ma", "exterior-remodel-siding-deck"],
      posts: ["siding-replacement-cost-massachusetts", "vinyl-vs-fiber-cement-siding", "how-to-choose-a-contractor-in-massachusetts"],
    },
    sections: [
      {
        id: "signs", h: "What are the signs your siding needs replacing?", blocks: [
          { ol: [
            { t: "Soft, rotted or crumbling boards.", d: "Press a screwdriver into suspect spots near the bottom of walls, under windows and at corners. Soft wood means water has been getting in, so the sheathing behind it needs checking too." },
            { t: "Cracked, warped or loose panels across a wall.", d: "A few cracked vinyl panels can be swapped. Buckling or cracking across a whole wall usually means the siding was nailed too tight to move, or it has reached the end of its life." },
            { t: "Paint that peels within a few years.", d: "On wood siding, paint that keeps failing often points to moisture moving through the wall, not just a bad paint job." },
            { t: "Signs of moisture inside.", d: "Peeling paint, stains or mold on the inside of exterior walls can mean water is getting into the wall. Have the cause found before choosing a fix." },
            { t: "Gaps, holes and pest damage.", d: "Openings let water, insects and animals into the wall." },
            { t: "Brittle vinyl.", d: "Fading alone is cosmetic. Vinyl that cracks when pressed in cold weather has become brittle and will keep breaking." },
            { t: "Repairs every year.", d: "If you're patching the same walls every season, that money may be better spent on replacement that also fixes the weather barrier behind the siding." },
          ] },
        ],
      },
      {
        id: "repair-or-replace", h: "Should you repair or replace your siding?", blocks: [
          { table: {
            caption: "Siding repair or replacement: what each problem usually means",
            head: ["What you see", "What it usually means", "Typical fix"],
            rows: [
              ["One or two cracked or loose boards", "Impact damage or a failed fastener", "Repair: replace the damaged pieces"],
              ["Soft wood under one window or at the base of one wall", "A local leak, often missing or failed flashing", "Repair the boards and the flashing, and check the sheathing"],
              ["Soft spots or rot on several walls", "Water getting behind the siding in many places", "Replace, with a new weather barrier and flashing"],
              ["Vinyl buckled or cracking across whole walls", "Installed too tight, or brittle with age", "Replace"],
              ["Paint failing everywhere within a few years", "Moisture moving through the wall, or old wood that no longer holds paint", "Find the cause first; often replace"],
            ],
          } },
          { callout: "If you're patching siding every year, you're paying for a replacement in installments." },
        ],
      },
      {
        id: "behind-siding", h: "What's behind your siding, and why does it matter?", blocks: [
          { p: "Siding is only the outer layer. Behind it are the sheathing (the wood panels nailed to the framing), a water-resistive barrier such as house wrap or taped sheathing, and flashing at every window, door and roof-to-wall joint. Those layers are what keep water and air out. Replacement is the time to inspect the sheathing and fix the barrier and flashing; patching the siding alone doesn't. The photo at the top of this guide shows that layer on our [Lynnfield addition and exterior project](/projects/home-addition-exterior-lynnfield-ma) before the siding went on." },
          { figure: {
            src: `${PR}/home-addition-exterior-lynnfield-ma-12.webp`,
            alt: "Main house in white house wrap beside a two-story addition sheathed in green panels with taped seams, Lynnfield, MA",
            caption: "Two kinds of weather barrier on our Lynnfield project: house wrap on the original house, taped sheathing on the new addition.",
            href: "/projects/home-addition-exterior-lynnfield-ma",
            hrefLabel: "See the project",
            place: LYNNFIELD,
          } },
        ],
      },
      {
        id: "energy", h: "Will new siding lower your energy bills?", blocks: [
          { p: "Siding by itself adds little insulation. Comfort and energy improve when re-siding includes sealing air leaks and fixing the weather barrier, or when insulated siding or rigid foam is added under it. Ask what's included rather than expecting the siding itself to cut your bills." },
        ],
      },
      {
        id: "lead", h: "What if your house was built before 1978?", blocks: [
          { p: `Many New England houses have old painted siding or trim. ${LEAD_RULE} Ask any contractor for their lead-safe license number before work starts. In New Hampshire, the federal EPA renovation rule applies instead.` },
        ],
      },
      {
        id: "next-steps", h: "What should you do next?", blocks: [
          { ul: [
            "Walk the house with a screwdriver and a flashlight and note where the problems are.",
            "Get the cause checked: a local leak gets a local repair.",
            "If replacement makes sense, read our [siding replacement cost guide](/blog/siding-replacement-cost-massachusetts) and our [vinyl vs. fiber-cement comparison](/blog/vinyl-vs-fiber-cement-siding).",
            `Get a written contract. ${CONTRACT_RULE}`,
          ] },
          { p: "We repair and replace siding through our [siding service](/services/siding), including [siding in Northborough](/services/siding/northborough), where we're based, and [in Westborough](/services/siding/westborough)." },
        ],
      },
    ],
    faqs: [
      { q: "Can you replace siding on just one wall?", a: "Yes, if matching material is available. Exact color matches on faded vinyl or weathered wood are hard, so a single-wall replacement works best on a less visible side, or on painted wood that gets repainted afterward." },
      { q: "Does homeowners insurance cover siding damage?", a: "Sudden damage from a storm or a falling tree is often covered; wear, rot and slow leaks usually aren't. Check your policy and talk to your insurer before work starts." },
      { q: "How long does siding replacement take?", a: "Most single-family re-siding jobs take about 1 to 2 weeks of work once materials arrive." },
    ],
    sources: [S.lead, S.contract, S.c142a2],
    tags: ["siding", "home maintenance", "New England"],
  },

  // =====================================================================================================
  {
    slug: "how-to-choose-a-contractor-in-massachusetts",
    title: "How to Choose a Remodeling Contractor in Massachusetts: A Pre-Hire Checklist",
    seoTitle: "How to Hire a Remodeling Contractor in Massachusetts",
    description: "Check the HIC registration and CSL, get proof of insurance and a written contract with a deposit of no more than one-third. A Massachusetts pre-hire checklist.",
    excerpt: "A 10-step Massachusetts pre-hire checklist: HIC registration, the Construction Supervisor License, insurance, contract rules, the deposit limit and who pulls the permit.",
    answer: "Before you hire a remodeler in Massachusetts, look up their Home Improvement Contractor (HIC) registration and the Construction Supervisor License of whoever will pull your building permit, get a certificate of insurance, and insist on a written contract that lists the scope, start and completion dates, payment schedule and a deposit of no more than one-third of the price.",
    category: "Planning, permits & hiring",
    published: FIRST_COMMIT,
    modified: REWRITE,
    image: `${PR}/home-addition-exterior-lynnfield-ma-03.webp`,
    photo: {
      alt: "Two-story addition framed beside a house with a tarp-covered roof in Lynnfield, MA, its upper story sheathed in green panels and its lower level still open framing",
      caption: "Framing for a two-story addition on our Lynnfield project. Structural work like this needs a building permit taken out by a Construction Supervisor License holder.",
      href: "/projects/home-addition-exterior-lynnfield-ma",
      hrefLabel: "See the Lynnfield project",
      place: LYNNFIELD,
    },
    related: {
      services: ["home-remodeling", "home-additions", "kitchen-remodeling", "bathroom-remodeling"],
      projects: ["home-addition-needham-ma", "home-addition-exterior-lynnfield-ma"],
      posts: ["do-you-need-a-permit-to-remodel-massachusetts", "kitchen-remodel-cost-massachusetts", "home-addition-cost-massachusetts"],
    },
    sections: [
      {
        id: "checklist", h: "What should you check before hiring a contractor in Massachusetts?", blocks: [
          { ol: [
            { t: "Look up the HIC registration.", d: "Contractors who remodel existing owner-occupied homes of one to four units must be registered with the state's Home Improvement Contractor program, run by the Office of Consumer Affairs and Business Regulation. HIC is a registration, not a license. The number must appear on the contractor's advertising, including its website, and on the contract. Look it up on Mass.gov's online license lookup." },
            { t: "Check the Construction Supervisor License.", d: "Structural work needs a building permit taken out by an individual who holds a Construction Supervisor License (CSL), issued by the state Board of Building Regulations and Standards. Ask whose CSL will be on your permit and look that person up too." },
            { t: "For a house built before 1978, ask for the lead-safe license.", d: "Work that disturbs painted surfaces beyond small thresholds, and any window replacement, must be done by a company with a Massachusetts Lead-Safe Renovation Contractor license." },
            { t: "Get a certificate of insurance.", d: "Ask for a certificate showing general liability coverage and, if the contractor has employees, workers' compensation, which Massachusetts requires of employers. Ask for it to come from the insurance agent so you know it's current." },
            { t: "Get a written contract.", d: "Massachusetts requires a written contract for home improvement work over $1,000. It should include both parties' names and addresses, the contractor's HIC number, the start and substantial completion dates, a detailed scope with materials, the total price and payment schedule, and who obtains the permits. Our [kitchen cost guide](/blog/kitchen-remodel-cost-massachusetts#accurate-estimate) shows what an itemized estimate should list." },
            { t: "Keep the deposit within the legal limit.", d: "The deposit can't be more than one-third of the total price, or the cost of special-order materials if that is greater." },
            { t: "Know your three-day cancellation right.", d: "If you sign the contract somewhere other than the contractor's place of business, such as at home, Massachusetts law generally gives you three business days to cancel." },
            { t: "Make sure the permit is in the contractor's name.", d: "The building permit should be taken out by the contractor's CSL holder. If you pull it yourself as the homeowner for work a contractor does, you generally lose access to the state's Home Improvement Contractor Guaranty Fund. Our [permit guide](/blog/do-you-need-a-permit-to-remodel-massachusetts#who-pulls) explains who pulls which permit." },
            { t: "Check references and real project photos.", d: "Ask for recent jobs like yours, with the town and year, and call those homeowners. Photos should show the contractor's own work." },
            { t: "Ask who runs the job every day.", d: "Know who is on site, who answers your questions, and which trades are subcontracted. Licensed plumbers, gas fitters and electricians pull their own permits." },
          ] },
        ],
      },
      {
        id: "red-flags", h: "What are the red flags when hiring a contractor?", blocks: [
          { table: {
            caption: "Red flags when hiring a home improvement contractor in Massachusetts",
            head: ["Red flag", "Why it matters"],
            rows: [
              ["You're asked to pull the permit yourself", "It shifts responsibility to you and generally removes Guaranty Fund protection."],
              ["A deposit above one-third of the price", "That exceeds the legal limit unless it covers special-order materials."],
              ["No HIC number on the website, truck or contract", "Massachusetts requires the registration number on advertising and contracts."],
              ["Cash only, or no written contract", "You lose the paper trail and the protections the contract law gives you."],
              ["Pressure to sign today", "A fair price is still fair next week. Take time to compare written estimates."],
              ["Photos without a town, a year or a reference", "You can't confirm the work is theirs."],
            ],
          } },
        ],
      },
      {
        id: "guaranty-fund", h: "What is the Home Improvement Contractor Guaranty Fund?", blocks: [
          { p: "It is a state fund that can reimburse homeowners who win a judgment against a registered contractor and can't collect it, up to a limit set by law. It isn't available if the contractor wasn't registered, or if the homeowner pulled the permit for the contractor's work. Mass.gov's [Home Improvement Contractor pages](https://www.mass.gov/info-details/hic-contractor-resources) explain the program." },
        ],
      },
      {
        // Not "How can you check Waterfront Construction?": until site.hic is set, the page must not invite a check
        // that its own checklist says we would fail (verification V3.3). licensingAnswer() adds the numbers once set.
        id: "about-publisher", h: "Who publishes this checklist?", blocks: [
          { p: `This checklist is published by ${site.name}, an owner-led home remodeling contractor based in Northborough, Massachusetts. ${licensingAnswer("MA")}` },
          { p: `${OWNER_LINE} You can read more [about Ernando](/about/ernando-nunes), see [our projects](/gallery), such as the [Needham addition](/projects/home-addition-needham-ma) and the [Lynnfield addition and exterior project](/projects/home-addition-exterior-lynnfield-ma), and read [what our clients say](/reviews). Our [kitchen](/services/kitchen-remodeling), [bathroom remodeling](/services/bathroom-remodeling) and [home additions](/services/home-additions) pages explain how we run each kind of job, and our [Northborough page](/service-areas/northborough) covers the town where we're based.` },
        ],
      },
      {
        id: "nh", h: "Hiring a contractor in New Hampshire?", blocks: [
          { p: "New Hampshire has no statewide general-contractor or home-improvement license. Building permits come from each town's building department, electricians and plumbers are licensed by the state, and the federal EPA renovation rule governs lead-safe work on pre-1978 homes. Massachusetts protections such as the Guaranty Fund don't apply there, so a clear written contract matters even more." },
        ],
      },
    ],
    faqs: [
      { q: "Does a general contractor need a license in Massachusetts?", a: "For remodeling an existing owner-occupied home, the company must be registered as a Home Improvement Contractor, and structural work needs a permit taken out by an individual who holds a Construction Supervisor License. Plumbers, gas fitters and electricians hold their own trade licenses." },
      { q: "How much deposit can a contractor ask for in Massachusetts?", a: "No more than one-third of the total price, or the cost of special-order materials if that is greater." },
      { q: "Do I need a written contract for a small job?", a: "Massachusetts requires one for home improvement work over $1,000. For smaller jobs, a written estimate that lists the scope and price is still a good idea." },
      { q: "Can I cancel a home improvement contract after signing?", a: "If you signed it away from the contractor's place of business, such as at home, Massachusetts law generally gives you three business days to cancel. Check the notice in the contract for the exact terms." },
    ],
    sources: [S.cmr18, S.cmr1802, S.c142a2, S.c142a17, S.contract, S.hic, S.lead, S.nh],
    tags: ["hiring a contractor", "Massachusetts law", "home improvement contracts"],
  },

  // =====================================================================================================
  {
    slug: "signs-you-need-new-windows",
    title: "6 Signs It's Time to Replace Your Windows",
    seoTitle: "6 Signs It's Time to Replace Your Windows (New England)",
    description: "Rotting frames, fogged glass, sashes that won't stay up: when window repair is enough, when replacement makes sense, and Massachusetts permit and lead rules.",
    excerpt: "How to tell a window that needs repair from one that needs replacing, plus permits, lead-safe rules for older homes and what changed with the federal tax credit.",
    answer: "It's usually time to replace a window when the frame or sill is rotting, the sash won't open, stay up or lock, or several sealed units have fogged between the panes. A single fogged unit can often be fixed by replacing just the glass. In Massachusetts, replacement windows generally need a building permit, and pre-1978 homes need lead-safe work.",
    category: "Exteriors: siding & windows",
    published: SIX_POSTS_COMMIT,
    modified: REWRITE,
    image: `${PR}/home-addition-exterior-lynnfield-ma-13.webp`,
    photo: {
      alt: "Three new arched windows with factory labels still on, set into green sheathing with taped seams, Lynnfield, MA",
      caption: "New arched windows set into the addition's sheathing on our Lynnfield project, before trim and siding.",
      href: "/projects/home-addition-exterior-lynnfield-ma",
      hrefLabel: "See the Lynnfield project",
      place: LYNNFIELD,
    },
    related: {
      services: ["window-replacement", "door-installation"],
      projects: ["home-addition-exterior-lynnfield-ma"],
      posts: ["window-replacement-cost-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts", "how-to-choose-a-contractor-in-massachusetts", "signs-its-time-to-replace-your-siding"],
    },
    sections: [
      {
        id: "signs", h: "What are the signs your windows need replacing?", blocks: [
          { ol: [
            { t: "Rot in the frame or sill.", d: "Probe the sill and the bottom of the frame. Small soft spots can often be repaired; rot that runs through the frame usually means replacement." },
            { t: "Fog between the panes.", d: "Fog or film you can't wipe off means the seal of an insulated glass unit has failed. One unit can often be fixed with new glass; many failed units in old frames point to replacement." },
            { t: "Sashes that stick, won't stay up or won't lock.", d: "Broken balances, cords and locks are often repairable. Warped sashes or frames that keep binding usually aren't worth the labor." },
            { t: "Drafts you can feel.", d: "First check the weatherstripping and the seal between the frame and the wall; both are cheaper to fix. Drafts through single-pane or worn units are a reason to replace." },
            { t: "Heavy condensation or ice on the inside.", d: "It points to cold glass and high indoor humidity. Better glass helps, and so does controlling humidity." },
            { t: "Water stains below the window or rotted trim.", d: "Water is getting in around the unit. Replacement is the time to flash the opening properly." },
          ] },
        ],
      },
      {
        id: "repair-or-replace", h: "Should you repair or replace a window?", blocks: [
          { table: {
            caption: "Window repair or replacement",
            head: ["Problem", "Often repairable?", "When replacement makes sense"],
            rows: [
              ["One fogged glass unit", "Yes: replace the glass unit", "Many units fogged, or the frame is failing too"],
              ["Broken balance, cord or lock", "Yes: replace the hardware", "Parts aren't available, or the sash is warped"],
              ["Soft spot on the sill", "Often, with a repair or a new sill", "Rot runs through the frame"],
              ["Drafts", "Often, with new weatherstripping and sealing", "Single-pane or badly worn units"],
            ],
          } },
        ],
      },
      {
        id: "cost", h: "What does window replacement cost in New England?", blocks: [
          { p: `In the 2025 Cost vs. Value report, replacing ten 3-by-5-foot double-hung windows averaged ${$("vinylWindows")} in vinyl and ${$("woodWindows")} in wood in New England. Our [window replacement cost guide](/blog/window-replacement-cost-massachusetts) explains what changes the price.` },
        ],
      },
      {
        // 25C end date (property placed in service after 2025-12-31): study/04 §8.5 — verify on irs.gov before next update
        id: "energy", h: "Will new windows lower your energy bills?", blocks: [
          { p: "New windows can make rooms noticeably more comfortable and reduce drafts and condensation. Energy savings depend on what you're replacing and how well the new units are installed and sealed, so we don't promise a payback period." },
          { p: "The federal Energy Efficient Home Improvement Credit (Section 25C), which covered qualifying windows, ended for property placed in service after December 31, 2025, so windows installed in 2026 don't qualify for it." },
        ],
      },
      {
        id: "insert-vs-full-frame", h: "What's the difference between insert and full-frame replacement?", blocks: [
          { ul: [
            "Insert (pocket) replacement: a new unit fits inside the existing frame. Interior trim and siding stay in place, it costs less, and the glass area gets slightly smaller. It suits sound, square frames.",
            "Full-frame replacement: the old window comes out down to the rough opening. It allows rot repair, new flashing and insulation around the unit, and it's the better choice when the frame or sill is damaged.",
          ] },
          { figure: {
            src: `${PR}/home-addition-exterior-lynnfield-ma-14.webp`,
            alt: "New entry door in protective plastic, with flashing membrane at the sill and a wood form for the step, Lynnfield, MA",
            caption: "Flashing membrane at the sill of a new entry door on our Lynnfield project. Openings for new windows get the same kind of sill flashing.",
            href: "/projects/home-addition-exterior-lynnfield-ma",
            hrefLabel: "See the project",
            place: LYNNFIELD,
          } },
        ],
      },
      {
        id: "permits", h: "Do you need a permit to replace windows in Massachusetts?", blocks: [
          { p: "Usually, yes. Most Massachusetts towns require a building permit for replacement windows, often a short-form permit taken out by a Construction Supervisor License holder. New units must meet the energy code, a replacement in a bedroom's emergency escape opening must not make that opening smaller, and glass near doors, tubs and stairs must be safety glass. In a local historic district, visible changes may need the commission's approval. See the [windows section of our permit guide](/blog/do-you-need-a-permit-to-remodel-massachusetts#windows)." },
        ],
      },
      {
        id: "lead", h: "What if your house was built before 1978?", blocks: [
          { p: `Replacing even one window in a pre-1978 home falls under the lead-safe rules, however little painted surface it disturbs: in Massachusetts the company doing it needs a Lead-Safe Renovation Contractor license, and in New Hampshire the federal EPA renovation rule applies. See ${LEAD_LINK}.` },
        ],
      },
      {
        id: "example", h: "What does a window installation look like on a real project?", blocks: [
          { p: "On our [Lynnfield addition and exterior project](/projects/home-addition-exterior-lynnfield-ma), three arched windows went into the taped sheathing of the new addition before trim and siding (photo at the top). We do [window work in Lynnfield](/services/window-replacement/lynnfield) and across our service area; see our [window replacement service](/services/window-replacement)." },
        ],
      },
    ],
    faqs: [
      { q: "Can I replace just the fogged glass instead of the whole window?", a: "Often, yes. If the frame and sash are sound, a new insulated glass unit can be made to fit, which costs much less than a new window." },
      { q: "How long does window replacement take?", a: "Most window replacements take 1 to 3 days of installation, depending on the number of openings. Ordering made-to-size windows adds lead time before that." },
      { q: "Are new windows eligible for a federal tax credit in 2026?", a: "No. The Section 25C Energy Efficient Home Improvement Credit ended for property placed in service after December 31, 2025." },
      { q: "Do replacement windows need a permit in Massachusetts?", a: "Usually, yes: most towns require a building permit for replacement windows, often a short-form permit." },
    ],
    sources: [S.cvv, S.cvvData, S.lead],
    tags: ["windows", "home maintenance", "New England"],
  },

  // =====================================================================================================
  {
    slug: "vinyl-vs-fiber-cement-siding",
    title: "Vinyl vs. Fiber-Cement Siding: Which Is Better for a New England Home?",
    seoTitle: "Vinyl vs. Fiber-Cement Siding in New England: Cost & ROI",
    description: "Fiber cement averaged $20,678 and recouped 144.9% in New England vs. $17,590 and 92.7% for vinyl (Cost vs. Value 2025). Durability, upkeep and fire compared.",
    excerpt: "A side-by-side comparison of vinyl and fiber-cement siding for New England homes: cost, resale, cold weather, upkeep, fire, installation and looks.",
    answer: `For most New England homes, fiber cement is the more durable, fire-resistant and better-resale choice, and vinyl is the lower-cost, lower-maintenance one. In Remodeling magazine's 2025 Cost vs. Value report, replacing about 1,250 square feet of siding in New England cost ${$("fiberCement")} in fiber cement (${pct("fiberCement")} recouped) versus ${$("vinylSiding")} in vinyl (${pct("vinylSiding")}).`,
    category: "Exteriors: siding & windows",
    published: SIX_POSTS_COMMIT,
    modified: REWRITE,
    image: `${PR}/home-addition-exterior-lynnfield-ma-19.webp`,
    photo: {
      alt: "White vertical siding nearly finished around three arched windows and a new entry door on a home addition in Lynnfield, MA",
      caption: "New siding on the addition in our Lynnfield project.",
      href: "/projects/home-addition-exterior-lynnfield-ma",
      hrefLabel: "See the Lynnfield project",
      place: LYNNFIELD,
    },
    related: {
      services: ["siding"],
      projects: ["home-addition-exterior-lynnfield-ma", "exterior-remodel-siding-deck"],
      posts: ["siding-replacement-cost-massachusetts", "signs-its-time-to-replace-your-siding", "5-remodels-that-add-the-most-home-value"],
    },
    sections: [
      {
        id: "comparison", h: "How do vinyl and fiber-cement siding compare?", blocks: [
          { table: {
            caption: "Vinyl vs. fiber-cement siding",
            head: ["Feature", "Vinyl", "Fiber cement"],
            rows: [
              ["Cost (New England average, about 1,250 sq ft, 2025)", $("vinylSiding"), $("fiberCement")],
              ["Cost recouped at resale", pct("vinylSiding"), pct("fiberCement")],
              ["Cold weather", "More brittle in deep cold; can crack on impact", "Stable in cold; resists impact better"],
              ["Upkeep", "No painting; wash occasionally", "Needs repainting over time; factory finishes carry their own manufacturer warranty"],
              ["Fire", "Softens and melts near high heat, such as a grill", "Noncombustible"],
              ["Moisture and rot", "Doesn't rot, but water that gets behind it can reach the sheathing", "Resists rot; cut edges and clearances must follow the manufacturer's instructions"],
              ["Weight and installation", "Light; hung loosely so it can expand and contract", "Heavy; more labor, special cutting tools and dust control"],
              ["Looks", "Many colors and profiles; seams and trim show up close", "Closer to painted wood; can be painted any color"],
              ["Best for", "Tighter budgets and owners who never want to paint", "Owners staying long-term who want durability and resale value"],
            ],
            note: `Cost rows: New England averages, 2025. ${CVV_CREDIT}`,
          } },
        ],
      },
      {
        id: "vinyl", h: "When is vinyl the better choice?", blocks: [
          { p: `When the budget is tight, you want no painting, and the house isn't exposed to frequent impacts. Vinyl was the less expensive job in the 2025 benchmark (${$("vinylSiding")} versus ${$("fiberCement")}) and still recouped ${pct("vinylSiding")} of its cost at resale. Thicker panels and good installation make a visible difference in how flat and straight it looks.` },
        ],
      },
      {
        id: "fiber-cement", h: "When is fiber cement worth the extra cost?", blocks: [
          { p: `When you plan to stay, want a look closer to painted wood, or care about fire and impact resistance. In the 2025 data it cost ${diff("fiberCement", "vinylSiding")} more than vinyl for the same job and recouped ${pct("fiberCement")} of its cost at resale, against ${pct("vinylSiding")} for vinyl. Budget for repainting over the years.` },
        ],
      },
      {
        id: "installation", h: "How is each material installed correctly?", blocks: [
          { ul: [
            "Both go over a water-resistive barrier, with flashing at every window, door and roof-to-wall joint. The siding sheds most water; the layers behind it handle the rest.",
            "Vinyl is hung, not nailed tight: nails go in the center of the slots and stop short of the panel so it can move, with gaps at trim and corners for expansion.",
            "Fiber cement is fastened as its manufacturer specifies, with clearances from roofs, decks and the ground, and cut edges treated as the instructions require.",
            "Cutting fiber cement creates silica dust, which OSHA's construction standard for respirable crystalline silica (29 CFR 1926.1153) regulates. Proper methods include fiber-cement shears or saws with dust collection.",
          ] },
        ],
      },
      {
        id: "other-materials", h: "What about engineered wood and cedar shingles?", blocks: [
          { p: "Engineered wood siding is lighter than fiber cement, comes primed or prefinished, and is painted like wood; it needs the manufacturer's clearances and a sound paint finish. Cedar shingles are traditional on older New England houses and look right on them, but they need regular maintenance. Neither is in the Cost vs. Value report, so ask for a separate price." },
        ],
      },
      {
        id: "example", h: "What does new siding look like on a real project?", blocks: [
          { p: "On our [Lynnfield addition and exterior project](/projects/home-addition-exterior-lynnfield-ma), the new addition got white vertical siding and the main house's second floor got white lap siding, two profiles on one house." },
          { figure: {
            src: `${PR}/home-addition-exterior-lynnfield-ma-11.webp`,
            alt: "Upper story of a house in Lynnfield, MA with new white lap siding and black windows above a new front porch frame, in snow",
            caption: "New white lap siding on the main house's second floor in our Lynnfield project.",
            href: "/projects/home-addition-exterior-lynnfield-ma",
            hrefLabel: "See the project",
            place: LYNNFIELD,
          } },
          { p: "We install vinyl, fiber-cement and engineered-wood siding through our [siding service](/services/siding), including [siding work in Lynnfield](/services/siding/lynnfield). If your house was built before 1978, read the [lead-safe section](/blog/signs-its-time-to-replace-your-siding#lead) of our siding signs guide, and see our [siding replacement cost guide](/blog/siding-replacement-cost-massachusetts) for what changes the price." },
        ],
      },
    ],
    faqs: [
      { q: "Is fiber-cement siding worth it in Massachusetts?", a: `For owners staying long-term, often yes. In the 2025 Cost vs. Value data for New England, fiber cement cost ${$("fiberCement")} for about 1,250 sq ft and recouped ${pct("fiberCement")} at resale, versus ${$("vinylSiding")} and ${pct("vinylSiding")} for vinyl.` },
      { q: "Does vinyl siding crack in the cold?", a: "Vinyl becomes more brittle in deep cold, so a hard impact on a cold day can crack it. Correct installation that lets it move also prevents buckling." },
      { q: "Which siding needs less maintenance?", a: "Vinyl. It never needs paint, only occasional washing. Fiber cement needs repainting over the years." },
    ],
    sources: [S.cvv, S.cvvData, S.lead],
    tags: ["siding", "vinyl siding", "fiber-cement siding", "New England"],
  },

  // =====================================================================================================
  {
    slug: "do-you-need-a-permit-to-remodel-massachusetts",
    title: "Do You Need a Permit to Remodel in Massachusetts?",
    seoTitle: "Do You Need a Permit to Remodel in Massachusetts? (2026)",
    description: "Additions, decks, re-siding and replacement windows generally need a building permit in Massachusetts; painting usually doesn't. Who pulls which permit and why.",
    excerpt: "Which remodeling projects need a building permit in Massachusetts, who pulls each permit, what varies by town, and how New Hampshire differs.",
    answer: "Usually, yes. Under the Massachusetts State Building Code, additions, decks, structural changes, re-siding, re-roofing and replacement windows generally need a building permit, and plumbing, gas and electrical work need separate permits pulled by licensed tradespeople. Purely cosmetic work, such as painting and flooring, typically doesn't. Your town's building department has the final word.",
    category: "Planning, permits & hiring",
    published: SIX_POSTS_COMMIT,
    modified: REWRITE,
    image: `${PR}/home-addition-needham-ma-progress-05.webp`,
    photo: {
      alt: "Mini excavator digging beside a colonial house in Needham, MA, next to a Waterfront Construction job sign",
      caption: "Site work for the front porch addition on our Needham, MA project.",
      href: "/projects/home-addition-needham-ma",
      hrefLabel: "See the Needham addition project",
      place: NEEDHAM,
    },
    related: {
      services: ["home-additions", "home-remodeling", "decks", "siding", "window-replacement", "kitchen-remodeling", "bathroom-remodeling"],
      projects: ["home-addition-needham-ma", "pool-deck-salem-nh"],
      posts: ["how-to-choose-a-contractor-in-massachusetts", "home-addition-cost-massachusetts", "deck-cost-massachusetts"],
    },
    sections: [
      {
        id: "code", h: "Which building code applies in Massachusetts?", blocks: [
          { p: "Massachusetts has one statewide building code, 780 CMR, now in its 10th edition and based on the 2021 International Codes. One- and two-family homes fall under its residential volume, based on the 2021 International Residential Code with Massachusetts amendments. Towns enforce the code; they don't write their own building code. What does vary by town is zoning, wetlands review, historic districts, septic rules, energy-code options, fees and paperwork." },
        ],
      },
      {
        id: "overview", h: "Which projects need a permit?", blocks: [
          { table: {
            caption: "Typical Massachusetts permits by project (confirm with your building department)",
            head: ["Project", "Building permit?", "Other permits and reviews"],
            rows: [
              ["Addition", "Yes, with plans", "Zoning; septic (Title 5) if adding bedrooms; Conservation Commission near wetlands; plumbing, gas and electrical permits"],
              ["Deck", "Yes for attached decks, and for most others", "Zoning setbacks; footing, framing and final inspections"],
              ["Re-siding", "Usually, often a short-form permit", "Lead-safe rules on pre-1978 homes; historic-district review where one applies"],
              ["Replacement windows and doors", "Usually, often a short-form permit", "Energy code, egress and safety glass; lead-safe rules for any window replacement in a pre-1978 home"],
              ["Re-roofing", "Usually", "Historic-district review where one applies"],
              ["Kitchen or bathroom remodel", "When walls or the structure change", "Moving plumbing, gas or wiring needs separate permits pulled by the licensed trades"],
              ["Painting, flooring, cabinets and counters replaced in place", "Usually not", "Lead-safe rules still apply to painted surfaces in pre-1978 homes"],
            ],
          } },
        ],
      },
      {
        id: "additions", h: "Do you need a permit for a home addition?", blocks: [
          { p: "Yes. An addition needs a building permit with construction drawings, and often structural engineering. Before the building permit, check zoning (setbacks, lot coverage, height and any special permit for a nonconforming house), septic capacity under Title 5 if you're adding bedrooms on a septic system, and Conservation Commission approval for work near wetlands. Many towns have also adopted the stretch or specialized energy code, which adds energy requirements. Our [Needham addition project](/projects/home-addition-needham-ma) shows the excavation and foundation stage of an addition. Our [home addition cost guide](/blog/home-addition-cost-massachusetts) covers what these add to the budget, and we build [home additions in Needham](/services/home-additions/needham) and across our service area." },
        ],
      },
      {
        id: "decks", h: "Do you need a permit for a deck?", blocks: [
          { p: "Attached decks need a building permit, and most freestanding decks do too. The building department typically inspects the footing holes, the framing and the finished deck. Footings must reach below the frost line, commonly 48 inches in Massachusetts; your building official confirms the local requirement. Zoning setbacks apply, and decks near wetlands may need Conservation Commission approval. See our [deck cost guide](/blog/deck-cost-massachusetts), our [deck service](/services/decks) and the framing stage of our [Salem, NH pool deck](/projects/pool-deck-salem-nh) below." },
          { figure: {
            src: "/images/projects/deck-salem-nh-before-04.webp",
            alt: "Pressure-treated joists framed around an above-ground pool before the decking was installed, Salem, NH",
            caption: "Deck framing on our Salem, NH pool deck: the stage a framing inspection looks at before decking goes on.",
            href: "/projects/pool-deck-salem-nh",
            hrefLabel: "See the Salem, NH deck project",
            place: SALEM_NH,
          } },
        ],
      },
      {
        id: "siding", h: "Do you need a permit to replace siding?", blocks: [
          { p: "Usually, yes. Most Massachusetts towns require a building permit for re-siding, often a short-form permit, taken out by a Construction Supervisor License holder. On a house built before 1978, removing painted siding or trim also falls under the lead-safe rules. See our [siding replacement cost guide](/blog/siding-replacement-cost-massachusetts) and [siding service](/services/siding)." },
        ],
      },
      {
        id: "windows", h: "Do you need a permit to replace windows or doors?", blocks: [
          { p: "Usually, yes, even when the new windows go in the same openings. Most towns require a building permit, often a short-form permit. New units must meet the energy code, a replacement in a bedroom's emergency escape opening must not make that opening smaller, and glass near doors, tubs and stairs must be safety glass. Any window replacement in a pre-1978 home falls under the lead-safe rules. See our [window replacement cost guide](/blog/window-replacement-cost-massachusetts) and [window replacement service](/services/window-replacement)." },
        ],
      },
      {
        id: "kitchens-baths", h: "Do kitchen and bathroom remodels need permits?", blocks: [
          { p: "A remodel that moves walls or changes the structure needs a building permit. Moving plumbing, gas or wiring needs separate permits: plumbing and gas permits pulled by a licensed plumber or gas fitter, and an electrical permit pulled by a licensed electrician. Replacing cabinets, counters, tile or fixtures in place is usually treated as finish work, though any plumbing in a contractor's remodel is still done by a licensed plumber. See our [kitchen remodel cost guide](/blog/kitchen-remodel-cost-massachusetts), [bathroom remodel cost guide](/blog/bathroom-remodel-cost-massachusetts), [kitchen remodeling service](/services/kitchen-remodeling) and [bathroom remodeling service](/services/bathroom-remodeling)." },
        ],
      },
      {
        id: "exempt", h: "What work usually doesn't need a permit?", blocks: [
          { ul: [
            "Painting and wallpaper.",
            "Flooring.",
            "Replacing cabinets and countertops in place, without moving plumbing, gas or electrical.",
            "Minor repairs.",
          ] },
          { p: "Lead-safe rules still apply to painted surfaces in pre-1978 homes even when no permit is needed. When in doubt, call your building department before work starts." },
        ],
      },
      {
        id: "who-pulls", h: "Who pulls the permit: you or your contractor?", blocks: [
          { p: "The building permit should be taken out by the contractor's Construction Supervisor License holder, whose license number goes on the permit, along with the company's Home Improvement Contractor registration number. Plumbers, gas fitters and electricians pull their own trade permits. Permit applications also ask for proof of workers' compensation coverage, and a Massachusetts home improvement contract should state who obtains the permits." },
          // V3.2: the first-person "we apply for the building permit" renders only once site.csl is set.
          { p: `Don't pull the permit yourself for work a contractor is doing. Homeowners who do generally lose access to the state's Home Improvement Contractor Guaranty Fund. ${hasCsl ? "On our jobs, we apply for the building permit and schedule the inspections, and we coordinate the licensed plumbers and electricians, who pull their own permits." : "Whoever you hire, the written contract should name who obtains each permit, and the building permit should carry the contractor's Construction Supervisor License number."} Our [pre-hire checklist](/blog/how-to-choose-a-contractor-in-massachusetts) covers what else to confirm before you sign.` },
        ],
      },
      {
        id: "local", h: "What varies from town to town?", blocks: [
          { ul: [
            "Zoning: setbacks, lot coverage, height and the rules for nonconforming houses.",
            "Conservation Commission review for work near wetlands, streams and rivers.",
            "Local historic districts, where exterior changes need the commission's approval.",
            "Board of Health review and Title 5 septic rules.",
            "Whether the town adopted the stretch or specialized energy code.",
            "Permit fees, application forms and online portals.",
          ] },
          { p: "Don't assume a neighbor's permit answer applies to your house. The building department and zoning office can tell you what applies to your lot." },
        ],
      },
      {
        id: "skip", h: "What happens if you skip a permit?", blocks: [
          { p: "Unpermitted work can complicate insurance claims and home sales, and a town can require finished work to be opened up for inspection or brought up to code. Fixing it later usually costs more than the permit would have." },
        ],
      },
      {
        id: "nh", h: "How do permits work in New Hampshire?", blocks: [
          { p: "New Hampshire has no statewide contractor license. Building permits come from each town's building department under the state building code, electricians and plumbers are licensed by the state, and the federal EPA renovation rule governs lead-safe work on pre-1978 homes. Requirements and fees vary by town, so check with the town's building department." },
        ],
      },
    ],
    faqs: [
      { q: "Can I pull the permit myself to save money?", a: "For work you do yourself, yes. When a contractor does the work, the contractor's Construction Supervisor License holder should pull it. Homeowners who pull the permit for a contractor's work generally lose access to the state's Guaranty Fund." },
      { q: "How long does a building permit take in Massachusetts?", a: "It varies by town and project. Simple short-form permits can be quick; additions with zoning or Conservation Commission review take longer. Your building department can tell you its current timing." },
      { q: "Do I need a permit to replace deck boards?", a: "Replacing boards in kind is often treated as a repair, but structural work, new stairs or new railings may need a permit. Ask your building department." },
      { q: "Do replacement windows need a permit even in the same openings?", a: "Usually, yes. Most Massachusetts towns require a building permit for replacement windows, often a short-form permit." },
    ],
    sources: [S.cmr18, S.c142a2, S.contract, S.hic, S.lead, S.nh],
    tags: ["building permits", "Massachusetts", "home remodeling"],
  },

  // =====================================================================================================
  {
    slug: "window-replacement-cost-massachusetts",
    title: "How Much Does Window Replacement Cost in Massachusetts?",
    seoTitle: "Window Replacement Cost in Massachusetts (2026 Guide)",
    description: "Replacing ten double-hung windows averaged $21,922 in vinyl and $27,226 in wood in New England (Cost vs. Value 2025). What changes the price in Massachusetts.",
    excerpt: "New England benchmarks for vinyl and wood replacement windows, what drives the price per window, permits, lead-safe rules and the end of the federal tax credit.",
    answer: `In Remodeling magazine's 2025 Cost vs. Value report, replacing ten 3-by-5-foot double-hung windows in New England averaged ${$("vinylWindows")} with vinyl windows and ${$("woodWindows")} with wood windows, roughly ${perEach("vinylWindows", 10, 100)} to ${perEach("woodWindows", 10, 100)} per window. Frame material, size and shape, insert or full-frame installation and rot around the openings move the price most.`,
    category: "Cost guides",
    published: REWRITE,
    modified: REWRITE,
    image: `${PR}/home-addition-exterior-lynnfield-ma-18.webp`,
    photo: {
      alt: "Two-story addition in Lynnfield, MA with new white vertical siding on the upper story, three arched windows and bundles of siding staged in the yard",
      caption: "New windows and siding on the addition in our Lynnfield project.",
      href: "/projects/home-addition-exterior-lynnfield-ma",
      hrefLabel: "See the Lynnfield project",
      place: LYNNFIELD,
    },
    related: {
      services: ["window-replacement"],
      projects: ["home-addition-exterior-lynnfield-ma"],
      posts: ["signs-you-need-new-windows", "do-you-need-a-permit-to-remodel-massachusetts", "5-remodels-that-add-the-most-home-value", "how-to-choose-a-contractor-in-massachusetts"],
    },
    sections: [
      {
        id: "cost-table", h: "What does window replacement cost in New England?", blocks: [
          { table: {
            caption: "Window replacement: New England averages (Cost vs. Value 2025)",
            head: ["Project", "Typical scope", "New England average, 2025", "About per window", "Cost recouped at resale"],
            rows: [
              ["Vinyl window replacement", "Replace ten 3 × 5 ft double-hung windows with vinyl windows", $("vinylWindows"), perEach("vinylWindows", 10), pct("vinylWindows")],
              ["Wood window replacement", "Replace ten 3 × 5 ft double-hung windows with wood windows", $("woodWindows"), perEach("woodWindows", 10), pct("woodWindows")],
            ],
            note: `${CVV_NOTE} The per-window column is the benchmark job cost divided by ten.`,
          } },
          { p: "A single window usually costs more per unit than ten done together, because setup, the permit and staging are shared across the job. We don't publish our own price ranges; we measure each opening and give you an itemized estimate after a free visit." },
        ],
      },
      {
        id: "drivers", h: "What drives the cost of replacement windows?", blocks: [
          { ul: [
            "Frame material: vinyl costs least; wood, clad-wood and fiberglass cost more.",
            "Size and shape: arched tops, bays, bows and made-to-size units cost more than standard rectangles.",
            "Glass: double or triple glazing and low-E coatings change the price, and safety glass is required near doors, tubs and stairs.",
            "Installation method: insert replacement keeps the old frame and costs less; full-frame replacement allows rot repair and new flashing. Our [window signs guide](/blog/signs-you-need-new-windows#insert-vs-full-frame) explains the difference.",
            "Condition of the opening: rotted sills, framing or sheathing found during removal add repair work.",
            "Trim and finish: exterior trim, interior casing, paint or stain.",
            "Older houses: in pre-1978 homes, every window replacement follows lead-safe work rules.",
            "Access: upper floors and steep grades need ladders or staging.",
          ] },
        ],
      },
      {
        id: "permits-lead", h: "Do replacement windows need a permit and lead-safe work?", blocks: [
          { p: "Usually, yes, to both. Most Massachusetts towns require a building permit for replacement windows, often a short-form permit, and new units must meet the energy code, egress and safety-glass rules. See the [windows section of our permit guide](/blog/do-you-need-a-permit-to-remodel-massachusetts#windows)." },
          { p: `In a home built before 1978, every window replacement falls under the lead-safe rules, and in Massachusetts the company doing it needs a Lead-Safe Renovation Contractor license; see ${LEAD_LINK}.` },
        ],
      },
      {
        // 25C end date: study/04 §8.5 — verify on irs.gov before next update
        id: "tax-credit", h: "Are there tax credits for new windows in 2026?", blocks: [
          { p: "Not federally. The Energy Efficient Home Improvement Credit (Section 25C), which covered qualifying windows, ended for property placed in service after December 31, 2025. Check with your electric or gas utility for any current incentive programs before you buy." },
        ],
      },
      {
        id: "resale", h: "Do new windows pay back at resale?", blocks: [
          { p: `Partly. In the 2025 data for New England, vinyl window replacement recouped ${pct("vinylWindows")} of its cost and wood ${pct("woodWindows")}. The rest of the value is comfort: fewer drafts, less condensation and windows that open and lock. Energy savings depend on what you're replacing and how well the new units are installed, so we don't promise a payback period.` },
        ],
      },
      {
        id: "timeline", h: "How long does window replacement take?", blocks: [
          { p: "Most window replacements take 1 to 3 days of installation, depending on the number of openings. Made-to-size windows have to be ordered first, which adds lead time before installation." },
        ],
      },
      {
        id: "example", h: "Where have we installed new windows?", blocks: [
          { p: "On our [Lynnfield addition and exterior project](/projects/home-addition-exterior-lynnfield-ma), three arched windows and a new entry door went into the new addition before the siding (photo at the top). We do [window work in Lynnfield](/services/window-replacement/lynnfield) and [in Westborough](/services/window-replacement/westborough), where a client shared this after new siding and windows:" },
          { testimonial: "Dave R." },
          { p: "See our [window replacement service](/services/window-replacement) for what's included." },
        ],
      },
    ],
    faqs: [
      { q: "Is it cheaper to replace all the windows at once?", a: "Often, per window, because setup, the permit and staging are shared. Replacing in phases, worst windows first, is also common." },
      { q: "Should I choose vinyl or wood windows?", a: `Vinyl costs less and needs little upkeep: ${$("vinylWindows")} versus ${$("woodWindows")} for ten windows in the 2025 New England benchmark. Wood can be painted or stained and suits older houses, but the outside needs maintenance unless it is clad.` },
      { q: "How much does it cost to replace one window?", a: `It depends on size, type and the condition of the opening, and a single window carries the same setup and permit costs as several. The 2025 benchmark works out to about ${perEach("vinylWindows", 10)} (vinyl) to ${perEach("woodWindows", 10)} (wood) per window when ten are replaced together.` },
    ],
    sources: [S.cvv, S.cvvData, S.lead],
    tags: ["windows", "remodeling costs", "Massachusetts"],
  },

  // =====================================================================================================
  {
    slug: "deck-cost-massachusetts",
    title: "How Much Does a New Deck Cost in Massachusetts?",
    seoTitle: "Deck Cost in Massachusetts: Composite vs. Wood (2026)",
    description: "A 16x20-foot deck averaged $25,817 with composite decking and $20,603 with wood in New England (Cost vs. Value 2025). What changes a Massachusetts deck's price.",
    excerpt: "New England benchmarks for composite and wood decks, what drives the price, Massachusetts permits and footings, and a pool deck we built in Salem, NH.",
    answer: `In Remodeling magazine's 2025 Cost vs. Value report, adding a 16-by-20-foot deck in New England averaged ${$("compositeDeck")} with composite decking and ${$("woodDeck")} with pressure-treated wood decking, both on a pressure-treated frame. Size, height above the ground, stairs, railings, footings and the decking material move a Massachusetts deck's price most.`,
    category: "Cost guides",
    published: REWRITE,
    modified: REWRITE,
    image: "/images/projects/deck-salem-nh-02.webp",
    photo: {
      alt: "Deck with gray decking, a contrasting border and white railings wrapped around an above-ground pool, on a pressure-treated frame, Salem, NH",
      caption: "A pool deck we built in Salem, NH.",
      href: "/projects/pool-deck-salem-nh",
      hrefLabel: "See the Salem, NH deck project",
      place: SALEM_NH,
    },
    related: {
      services: ["decks"],
      projects: ["pool-deck-salem-nh", "exterior-remodel-siding-deck"],
      posts: ["do-you-need-a-permit-to-remodel-massachusetts", "5-remodels-that-add-the-most-home-value", "how-to-choose-a-contractor-in-massachusetts"],
    },
    sections: [
      {
        id: "cost-table", h: "What does a new deck cost in New England?", blocks: [
          { table: {
            caption: "Deck additions: New England averages (Cost vs. Value 2025)",
            head: ["Project", "Typical scope", "New England average, 2025", "About per sq ft of deck", "Cost recouped at resale"],
            rows: [
              ["Deck addition, composite", "Add a 16 × 20 ft deck on a pressure-treated frame, with composite decking, railing and stairs", $("compositeDeck"), perSqFt("compositeDeck", 320), pct("compositeDeck")],
              ["Deck addition, wood", "Add a 16 × 20 ft deck with pressure-treated decking, railing and stairs", $("woodDeck"), perSqFt("woodDeck", 320), pct("woodDeck")],
            ],
            note: `${CVV_NOTE} The per-square-foot column is the benchmark job cost divided by 320 sq ft.`,
          } },
          { p: "We don't publish our own price ranges. Every deck is priced from a site visit and a drawing, with an itemized estimate." },
        ],
      },
      {
        id: "drivers", h: "What drives the cost of a deck?", blocks: [
          { ul: [
            "Size and shape: angles, curves and multiple levels take more framing and cutting than a rectangle.",
            "Height above the ground: taller decks need longer posts, bracing and guards, and more stairs.",
            "Decking: pressure-treated wood costs least; composite and PVC cost more but don't need staining.",
            "Railings: wood, composite, aluminum and cable systems differ widely in price.",
            "Stairs and landings: each run of stairs adds framing, treads and railings.",
            "Footings: they must go below the frost line, commonly 48 inches in Massachusetts, and rock or poor soil makes digging harder.",
            "Attachment: a deck attached to the house needs a properly flashed and bolted ledger; a freestanding deck needs more posts and footings instead.",
            "Removing an old deck, and extras such as lighting, built-in benches or privacy screens.",
          ] },
        ],
      },
      {
        id: "composite-vs-wood", h: "Is composite decking worth the extra cost?", blocks: [
          { p: `Composite cost ${diff("compositeDeck", "woodDeck")} more for the same 16 × 20 ft deck in the 2025 benchmark, and it recouped more at resale (${pct("compositeDeck")} versus ${pct("woodDeck")}). It doesn't need staining or sealing. Wood decking costs less up front but needs regular cleaning and a fresh stain or sealer every few years. In both cases the frame underneath is usually pressure-treated lumber, so the frame details matter as much as the decking.` },
        ],
      },
      {
        id: "permits", h: "Do you need a permit to build a deck in Massachusetts?", blocks: [
          { p: "Yes for attached decks, and for most freestanding ones. The building department typically inspects the footing holes, the framing and the finished deck. Zoning setbacks apply, and decks near wetlands may need Conservation Commission approval. The residential code requires guards on decks more than 30 inches above the ground below. See the [deck section of our permit guide](/blog/do-you-need-a-permit-to-remodel-massachusetts#decks)." },
          { figure: {
            src: "/images/projects/deck-salem-nh-03.webp",
            alt: "Pressure-treated posts and beams supporting a deck frame beside an above-ground pool, Salem, NH",
            caption: "Posts and beams supporting the deck frame on our Salem, NH pool deck.",
            href: "/projects/pool-deck-salem-nh",
            hrefLabel: "See the project",
            place: SALEM_NH,
          } },
        ],
      },
      {
        id: "timeline", h: "How long does it take to build a deck?", blocks: [
          { p: "Most decks take about 1 to 2 weeks to build, depending on size and features. The permit, the footing inspection and material orders come first, so plan a few weeks ahead if you want the deck ready for summer." },
        ],
      },
      {
        id: "example", h: "What did our Salem, NH pool deck involve?", blocks: [
          { p: "The deck at the top of this guide wraps an above-ground pool in Salem, New Hampshire. The photos on the [project page](/projects/pool-deck-salem-nh) show pressure-treated joists framed around the pool, gray decking angled to follow the pool's edge, white railings and stairs. In New Hampshire, deck permits come from each town's building department; see our [deck work in Salem, NH](/services/decks/salem-nh)." },
          { p: "In Massachusetts we build decks from our base in [Northborough](/services/decks/northborough) and across our service area. A Northborough client shared this about their deck and small addition:" },
          { testimonial: "Priya S." },
          { p: "See our [deck design and construction service](/services/decks) for what we build." },
        ],
      },
    ],
    faqs: [
      { q: "Is a new deck a good investment?", a: `Decks recoup more of their cost than larger remodels such as major kitchens and additions: in the 2025 Cost vs. Value data for New England, a composite deck recouped ${pct("compositeDeck")} of its cost at resale and a wood deck ${pct("woodDeck")}.` },
      { q: "Can new decking go on my old deck frame?", a: "Sometimes. If the frame, ledger, footings and connectors are sound, new decking and railings can go on the existing frame. If the ledger isn't flashed and bolted, or the posts and joists are rotting, the frame should be rebuilt first." },
      { q: "When does a deck need railings?", a: "The residential code requires guards where the deck surface is more than 30 inches above the ground below, with a minimum height and a limit on the gap between balusters. Stairs with four or more risers need a handrail." },
    ],
    sources: [S.cvv, S.cvvData],
    tags: ["decks", "remodeling costs", "Massachusetts"],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
