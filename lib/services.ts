// The 10 services: shared data for the service hubs, service×town pages, home cards, schema, sitemap and llms.txt.
// Hub-only pillar content (tables, cost benchmarks, permits, FAQs) lives in lib/service-content.ts.
//
// Truth rules for this file (audit 02 / IMPLEMENTATION.md §2):
// - Every string must be true on ANY page that shows it, including New Hampshire town pages:
//   no Massachusetts-only law here (keep MA permit/HIC/lead-license wording in lib/service-content.ts).
// - No "licensed" self-claims until site.hic is set; no hype; no invented prices, brands or warranties.
// - No first-person permit claims ("we apply for the permit", "permits handled") here: they are true only once
//   site.csl is set, and this file cannot import lib/credentials.ts (lib/site.ts re-exports this module, so the
//   import would be circular). Gated permit wording lives in lib/service-content.ts (weOr / CSL_PERMIT). V3.2.
// - `features` is the SUPERSET for each service: town pages (lib/local-rules.ts scope) may only list a subset (V3.9).
// - Photos: real Waterfront Construction job photos only, with captions that say what the photo shows and
//   where it was taken. Stock images (public/images/*.jpg) are decorative only (imageIsStock).

export type Faq = { q: string; a: string };

/** A real job photo with a true caption. `place` is the TRUE location (omit when unknown). */
export type Photo = {
  src: string;
  alt: string; // what the photo shows (screen readers, image search)
  caption: string; // visible caption, without the place (rendered separately)
  project?: string; // case-study slug in lib/projects.ts → /projects/{slug}
  place?: string; // e.g. "Lynnfield, MA" — never a town where the photo was not taken
  stage?: "before" | "progress" | "finished";
};

// ONE ordered list of service slugs (D10: outside the house first, then inside). Every slug-keyed map in the
// codebase is typed Record<ServiceSlug, …> (or Partial<…>), so a missing or stale slug fails the build (spec §2.6).
// A slug is never renamed after launch (old slugs live on only as redirects in lib/redirects.ts).
export const SERVICE_SLUGS = [
  "siding", "window-replacement", "door-installation", "decks", "exterior-painting",
  "kitchen-remodeling", "bathroom-remodeling", "home-additions", "home-remodeling", "interior-painting",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];
export const isServiceSlug = (s: string): s is ServiceSlug => (SERVICE_SLUGS as readonly string[]).includes(s);
export const SERVICE_GROUPS = { outside: "Outside the house", inside: "Inside & additions" } as const;
export const servicesCountWord = "ten";
if (SERVICE_SLUGS.length !== 10) throw new Error(`servicesCountWord says "ten" but there are ${SERVICE_SLUGS.length} services`);

export type Service = {
  slug: ServiceSlug;
  group: keyof typeof SERVICE_GROUPS;
  name: string; // short label: nav, breadcrumbs ("Siding")
  short: string; // descriptive name: schema Service.name, cards ("Siding Installation & Replacement")
  blurb: string; // one plain sentence (≤ 120 characters): cards, llms.txt
  image: string; // card/cover image (real photo, except where imageIsStock)
  imageAlt: string; // true description of `image`; "" when decorative
  imageIsStock?: boolean; // true = NOT a Waterfront job photo (typographic plate): decorative only (alt=""), never in galleries, og:image, JSON-LD or sitemaps
  features: string[]; // accurate "What's included" — the SUPERSET of the town-page scope (lib/local-rules.ts)
  timeline: string; // the ONE typical-duration statement for this service (audit 01 L6) — reuse it, never restate it
  gallery: Photo[]; // real photos with true captions; [] = no real photos yet (hide the gallery)
  photos?: string[]; // = gallery srcs (kept for backward compatibility)
  updated: string; // ISO 8601 with offset: last substantive edit of this service's hub content (sitemap lastModified, WebPage dateModified)
};

const PR = "/images/projects";
const img = (name: string, n: number) => `${PR}/${name}-${String(n).padStart(2, "0")}.webp`;
const HA = (n: number) => img("home-addition-exterior-lynnfield-ma", n); // Lynnfield addition & exterior (ex-Highland Ave)
const MAN = (n: number) => img("kitchen-remodel-mansfield-ma", n);
const BATH = (n: number) => img("bathroom-remodels", n); // several different bathrooms — town unknown, never name one
const SAL = (n: number) => img("deck-salem-nh", n);
const SALB = (n: number) => img("deck-salem-nh-before", n);
const NEE = (n: number) => img("home-addition-needham-ma", n);

const LYNN = { project: "home-addition-exterior-lynnfield-ma", place: "Lynnfield, MA" } as const;
const MANS = { project: "kitchen-remodel-mansfield-ma", place: "Mansfield, MA" } as const;
const BATHS = { project: "bathroom-remodels" } as const; // location: Massachusetts (town not recorded)
const SALEM = { project: "pool-deck-salem-nh", place: "Salem, NH" } as const;
const NEED = { project: "home-addition-needham-ma", place: "Needham, MA" } as const;

// Captions describe only what is visible. Photos that show a house number, a readable plate,
// a social-media watermark or a baked-in ad overlay with contact text are not used here.
const P = {
  ha05: { src: HA(5), ...LYNN, stage: "progress", alt: "Two-story addition in taped green sheathing with its windows installed, seen from the driveway", caption: "The new two-story addition, sheathed, with its windows in" },
  ha07: { src: HA(7), ...LYNN, stage: "progress", alt: "Back of a two-story addition in taped green sheathing with new windows installed", caption: "Back of the addition: taped sheathing with the new windows in place" },
  ha08: { src: HA(8), ...LYNN, stage: "progress", alt: "Worker fitting a large black window over house wrap under a new porch roof, with white siding above", caption: "Window and house-wrap work under the new porch roof, with finished siding above" },
  ha11: { src: HA(11), ...LYNN, stage: "progress", alt: "Upper story of a house with new white lap siding and black windows above a new front porch frame, in snow", caption: "New white lap siding on the original house, above the new front porch frame" },
  ha12: { src: HA(12), ...LYNN, stage: "progress", alt: "Main house in white house wrap beside a two-story addition sheathed in green panels with taped seams", caption: "House wrap and new windows on the main house, ZIP System sheathing on the new addition" },
  ha13: { src: HA(13), ...LYNN, stage: "progress", alt: "Three new arched windows with factory labels still on, set into green sheathing with taped seams", caption: "New arched windows set into the addition's taped sheathing" },
  ha14: { src: HA(14), ...LYNN, stage: "progress", alt: "New entry door in protective plastic, with flashing membrane at the sill and a wooden form for a concrete step", caption: "Sill flashing under a new entry door, with the form for its step" },
  ha15: { src: HA(15), ...LYNN, stage: "progress", alt: "Two-story addition in ZIP System sheathing with three arched-top windows, and bundles of white siding on the ground", caption: "Siding delivered and ready to go on the addition" }, // caption from lib/projects.ts (HA15)
  ha16: { src: HA(16), ...LYNN, stage: "progress", alt: "Original house in white house wrap with dormers and a new front porch, next to a two-story addition in green sheathing", caption: "Dormers and front porch on the original house, next to the new addition" },
  ha17: { src: HA(17), ...LYNN, stage: "progress", alt: "White vertical siding installed on a two-story addition, with a ladder and three arched-top black windows", caption: "White vertical siding going up on the addition" }, // caption from lib/projects.ts (HA17, featured "Siding")
  ha18: { src: HA(18), ...LYNN, stage: "progress", alt: "Two-story addition with new white vertical siding on the upper story, three arched windows and bundles of siding staged in the yard", caption: "Siding going up on the two-story addition, with bundles of siding staged in the yard" },
  ha19: { src: HA(19), ...LYNN, stage: "progress", alt: "White vertical siding nearly finished around three arched windows and a new entry door on a home addition", caption: "Vertical siding nearly finished around the arched windows and the new entry door" },
  man01: { src: MAN(1), ...MANS, stage: "finished", alt: "Remodeled kitchen with white shaker-style cabinets, a stainless refrigerator, a dark stone-look island and three glass pendant lights", caption: "Finished kitchen with white shaker-style cabinets and glass pendant lights" },
  man02: { src: MAN(2), ...MANS, stage: "finished", alt: "Kitchen island with a dark veined stone-look countertop and waterfall edge, white cabinets and a sliding door", caption: "Island with a waterfall countertop edge" },
  man03: { src: MAN(3), ...MANS, stage: "finished", alt: "Three glass pendant lights over a kitchen island with a dark stone-look countertop, white cabinets and a sliding glass door", caption: "Glass pendant lights over the island" },
  man04: { src: MAN(4), ...MANS, stage: "finished", alt: "Stainless French-door refrigerator between tall white cabinets, with the end of the island in the foreground", caption: "Tall cabinets frame the refrigerator; the island is in the foreground" },
  man05: { src: MAN(5), ...MANS, stage: "finished", alt: "Waterfall island with a dark stone-look countertop and a white sink below a glass pendant light", caption: "Island sink and waterfall counter, with white cabinets behind" },
  bath01: { src: BATH(1), ...BATHS, stage: "finished", alt: "Walk-in shower with large marble-look wall tile, a frameless glass panel, a built-in niche and a window", caption: "Walk-in shower with marble-look tile and frameless glass" },
  bath02: { src: BATH(2), ...BATHS, stage: "finished", alt: "Bathtub with a fixed glass panel, white subway tile, a mosaic accent band and a tiled niche", caption: "Tub with a glass panel and subway tile with a mosaic accent band" },
  bath03: { src: BATH(3), ...BATHS, stage: "finished", alt: "Walk-in shower with marble-look tile walls, a hexagon mosaic floor and a hinged glass door, next to a toilet", caption: "Shower with marble-look walls and a hexagon mosaic floor" },
  bath04: { src: BATH(4), ...BATHS, stage: "finished", alt: "Corner glass shower with brass fixtures next to a freestanding tub and a brass towel warmer", caption: "Corner glass shower with brass fixtures beside a soaking tub" },
  bath05: { src: BATH(5), ...BATHS, stage: "finished", alt: "Neo-angle glass shower in beige stone-look tile with a built-in bench, a recessed niche and a mosaic accent band", caption: "Neo-angle shower in beige stone-look tile with a built-in bench" },
  sal01: { src: SAL(1), ...SALEM, stage: "progress", alt: "Corner of a deck with gray decking and a fascia board over the pressure-treated frame, beside an above-ground pool", caption: "Decking and fascia going on over the pressure-treated frame" },
  sal02: { src: SAL(2), ...SALEM, stage: "finished", alt: "Deck with gray decking, a contrasting border and white railings wrapped around an above-ground pool, on a pressure-treated frame", caption: "Gray decking and white railings wrapped around the above-ground pool" },
  sal03: { src: SAL(3), ...SALEM, stage: "progress", alt: "Pressure-treated posts and beams supporting a deck frame beside an above-ground pool", caption: "Posts and beams supporting the deck frame beside the pool" },
  sal05: { src: SAL(5), ...SALEM, stage: "finished", alt: "Finished deck with outdoor furniture, gray decking and white railings with black balusters, next to the pool steps", caption: "Finished deck with stairs and white railings" },
  sal06: { src: SAL(6), ...SALEM, stage: "finished", alt: "Gray decking boards angled to follow the edge of an above-ground pool, with white railings and stairs", caption: "Decking angled to follow the pool edge" },
  salb04: { src: SALB(4), ...SALEM, stage: "progress", alt: "Pressure-treated joists framed around an above-ground pool before the decking was installed", caption: "Framing stage: pressure-treated joists around the pool" },
  nee05: { src: NEE(5), ...NEED, stage: "progress", alt: "Colonial house with a new front porch roof frame, house wrap along the base and a plywood-sheathed section at the side", caption: "Porch roof framing and a new plywood-sheathed section on a colonial" },
} satisfies Record<string, Photo>;

/** Every captioned photo, by src — lets other templates reuse a true caption for a photo they show. */
export const PHOTO_CAPTIONS: Record<string, Photo> = Object.fromEntries(Object.values(P).map((x) => [x.src, x]));

// Typical durations: every value is an existing sentence or a split of one (spec §2.1) — no new durations.
const TIMELINE: Record<ServiceSlug, string> = {
  siding: "Most single-family re-siding jobs take about 1–2 weeks of work once materials arrive.",
  "window-replacement": "Most window replacements take 1–3 days of installation, depending on the number of openings.",
  "door-installation": "Door installation time depends on the number of doors and the condition of each opening; we give you a schedule with the estimate.",
  decks: "Most decks take about 1–2 weeks to build, depending on size and features.",
  "exterior-painting": "Exterior painting time depends on the size and condition of the house and on the weather; we give you a schedule with the estimate.",
  "kitchen-remodeling": "Kitchens typically take about 3–6 weeks once materials are in.",
  "bathroom-remodeling": "Bathrooms typically take about 2–3 weeks once materials are in.",
  "home-additions": "Larger additions typically take 2–4 months of construction after design and permits.",
  "home-remodeling": "Whole-home remodels typically take 2–4 months of construction after design and permits.",
  "interior-painting": "Interior painting time depends on the number of rooms and the prep they need; we give you a schedule with the estimate.",
};

/** The /faq "how long" answer: the six numeric statements (additions and whole-home remodels share one, the
 *  original sentence), then one merged sentence for the services without a typical duration. */
export const TIMELINE_FAQ = [
  TIMELINE.siding,
  TIMELINE["window-replacement"],
  TIMELINE.decks,
  TIMELINE["kitchen-remodeling"],
  TIMELINE["bathroom-remodeling"],
  "Larger additions and whole-home remodels typically take 2–4 months of construction after design and permits.",
  "Door installation and painting depend on the number of doors or rooms and the condition of the house; we give you a schedule with the estimate.",
].join(" ");

/** The ONLY testimonial → service mapping (spec §2.1, lead ruling O6 from the verbatim texts in lib/site.ts).
 *  Keyed by the testimonial's name, so this file never imports lib/site.ts (no circular import).
 *  Testimonials are shown as quotes only — never Review / AggregateRating markup. */
export const TESTIMONIAL_SERVICES: Record<string, { services: ServiceSlug[]; work: string }> = {
  "Karen M.": { services: ["kitchen-remodeling", "bathroom-remodeling"], work: "kitchen and bathroom remodel" },
  "Dave R.": { services: ["siding", "window-replacement"], work: "new siding and windows" },
  "Priya S.": { services: ["decks", "home-additions"], work: "deck and small addition" },
  "Tom & Lisa B.": { services: ["home-remodeling"], work: "first-floor remodel" },
  "Rafael C.": { services: ["bathroom-remodeling"], work: "bathroom remodel" },
  "Susan D.": { services: ["kitchen-remodeling"], work: "kitchen remodel" },
};

/** Release of the 10-service / city-hub migration: the hubs, the service×town pages (TOWN_PAGES_UPDATED) and
 *  the city hubs (CITY_HUBS_UPDATED) all changed substantively in it. Set to the release commit's timestamp. */
export const SERVICES_RELEASE = "2026-10-06T13:18:29-04:00";
const UPDATED = SERVICES_RELEASE;

// No real photo of finished painting or of a whole-home remodel yet (owner items O4, O5, O14): those three
// services use the typographic monogram plate — never a stock photo, never someone else's work.
const PLATE = { image: "", imageAlt: "", imageIsStock: true } as const;

const raw: Omit<Service, "photos">[] = [
  {
    slug: "siding", group: "outside", name: "Siding", short: "Siding Installation & Replacement",
    image: P.ha18.src, imageAlt: P.ha18.alt,
    blurb: "Vinyl, fiber-cement and engineered-wood siding with trim, soffit and fascia, installed over a proper weather barrier.",
    features: ["Vinyl, fiber-cement and engineered-wood siding", "Trim, soffit and fascia", "Tear-off and sheathing repairs", "House wrap and flashing at every opening", "Color and profile selection help", "Cleanup and haul-away"],
    timeline: TIMELINE.siding,
    gallery: [P.ha17, P.ha18, P.ha19, P.ha15, P.ha11, P.ha12, P.ha16],
    updated: UPDATED,
  },
  {
    slug: "window-replacement", group: "outside", name: "Window Replacement", short: "Window Replacement",
    image: P.ha13.src, imageAlt: P.ha13.alt,
    blurb: "Replacement windows, insert or full-frame, flashed, insulated and sealed, with interior trim and casing.",
    features: ["Replacement windows", "Insert or full-frame installation", "Flashing, insulation & sealing", "Interior trim & casing", "Cleanup and haul-away"],
    timeline: TIMELINE["window-replacement"],
    gallery: [P.ha13, P.ha05, P.ha07, P.ha08, P.ha12, P.ha16],
    updated: UPDATED,
  },
  {
    slug: "door-installation", group: "outside", name: "Door Installation", short: "Entry & Patio Door Installation",
    image: P.ha14.src, imageAlt: P.ha14.alt,
    blurb: "Entry doors and sliding or hinged patio doors, installed with a sill pan, flashing, weatherstripping and trim.",
    features: ["Entry doors", "Patio doors (sliding or hinged)", "Sill pan & flashing", "Weatherstripping & trim"],
    timeline: TIMELINE["door-installation"],
    gallery: [P.ha14, P.ha19, P.ha12],
    updated: UPDATED,
  },
  {
    slug: "decks", group: "outside", name: "Decks", short: "Deck Design & Construction",
    image: P.sal02.src, imageAlt: P.sal02.alt,
    blurb: "Composite and pressure-treated wood decks, railings, stairs and pool decks, built to code from the footings up.",
    features: ["Composite and pressure-treated wood decks", "Railings, stairs and landings", "Pool decks", "Custom design to fit your yard", "Footings, framing and hardware built to code", "Footing, framing and final inspections planned into the schedule"],
    timeline: TIMELINE.decks,
    gallery: [P.sal02, P.sal05, P.sal06, P.sal01, P.sal03, P.salb04],
    updated: UPDATED,
  },
  {
    slug: "exterior-painting", group: "outside", name: "Exterior Painting", short: "Exterior House Painting",
    ...PLATE,
    blurb: "Siding and trim painting after washing, scraping, sanding, rotted-trim repair, caulking and priming bare wood.",
    features: ["Siding & trim painting", "Washing, scraping & sanding", "Caulking & priming bare wood", "Rotted trim repair before painting", "Color selection help"],
    timeline: TIMELINE["exterior-painting"],
    gallery: [],
    updated: UPDATED,
  },
  {
    slug: "kitchen-remodeling", group: "inside", name: "Kitchen Remodeling", short: "Kitchen Remodeling",
    image: P.man01.src, imageAlt: P.man01.alt,
    blurb: "Cabinets, islands, countertops, backsplash and lighting, with the plumbing and electrical trades coordinated.",
    features: ["Cabinets & islands", "Countertops & backsplash", "Lighting", "Plumbing & electrical trades coordinated"],
    timeline: TIMELINE["kitchen-remodeling"],
    gallery: [P.man01, P.man02, P.man03, P.man04, P.man05],
    updated: UPDATED,
  },
  {
    slug: "bathroom-remodeling", group: "inside", name: "Bathroom Remodeling", short: "Bathroom Remodeling",
    image: P.bath03.src, imageAlt: P.bath03.alt,
    blurb: "Tile and walk-in showers with waterproofing behind the tile, vanities, fixtures and frameless glass enclosures.",
    features: ["Tile & walk-in showers", "Waterproofing behind tile", "Vanities & fixtures", "Frameless glass enclosures", "Exhaust fan vented outdoors"],
    timeline: TIMELINE["bathroom-remodeling"],
    gallery: [P.bath01, P.bath02, P.bath03, P.bath04, P.bath05],
    updated: UPDATED,
  },
  {
    slug: "home-additions", group: "inside", name: "Home Additions", short: "Home Additions",
    image: P.ha12.src, imageAlt: P.ha12.alt,
    blurb: "Room and second-story additions, in-law suites, sunrooms and porches, built from the foundation to the finish.",
    features: ["Room & second-story additions", "In-law suites (ADUs)", "Sunrooms & porches", "Designer & engineer coordination", "Foundation to finish"],
    timeline: TIMELINE["home-additions"],
    gallery: [P.ha12, P.ha05, P.ha07, P.ha19, P.ha11, P.nee05],
    updated: UPDATED,
  },
  {
    slug: "home-remodeling", group: "inside", name: "Home Remodeling", short: "Whole-Home & Interior Remodeling",
    ...PLATE,
    blurb: "First-floor and whole-home remodels, layout and wall changes and basement finishing, with licensed trades coordinated.",
    features: ["First-floor & whole-home remodels", "Layout & wall changes", "Basement finishing", "Licensed trades coordinated"],
    timeline: TIMELINE["home-remodeling"],
    gallery: [],
    updated: UPDATED,
  },
  {
    slug: "interior-painting", group: "inside", name: "Interior Painting", short: "Interior Painting",
    ...PLATE,
    blurb: "Walls, ceilings, trim, doors and cabinets painted after patching, sanding and priming, with help choosing colors.",
    features: ["Walls & ceilings", "Trim, doors & cabinets", "Patching, sanding & priming", "Low-VOC paints & sheen selection", "Color selection help"],
    timeline: TIMELINE["interior-painting"],
    gallery: [],
    updated: UPDATED,
  },
];

if (raw.map((s) => s.slug).join() !== SERVICE_SLUGS.join()) throw new Error("lib/services.ts: services must follow SERVICE_SLUGS order (D10)");

export const services: Service[] = raw.map((s) => ({ ...s, photos: s.gallery.map((g) => g.src) }));

export const getService = (slug: string) => services.find((s) => s.slug === slug);
