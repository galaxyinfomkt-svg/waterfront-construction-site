// The 6 services: shared data for the service hubs, service×town pages, home cards, schema, sitemap and llms.txt.
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

export type Service = {
  slug: string;
  name: string; // short label: nav, breadcrumbs ("Siding")
  short: string; // descriptive name: schema Service.name, cards ("Siding Installation & Replacement")
  blurb: string; // one plain sentence: cards, llms.txt
  image: string; // card/cover image (real photo, except where imageIsStock)
  imageAlt: string; // true description of `image`; "" when decorative
  imageIsStock?: boolean; // true = NOT Waterfront's work: decorative only (alt=""), never in galleries, og:image, JSON-LD or sitemaps
  features: string[]; // accurate "What's included"
  long: string[]; // two plain paragraphs (state-neutral)
  timeline: string; // the ONE typical-duration statement for this service (audit 01 L6) — reuse it, never restate it
  faqs: Faq[]; // 3 state-neutral Q&As, safe on MA and NH town pages
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
  ha14: { src: HA(14), ...LYNN, stage: "progress", alt: "New wood entry door in protective plastic, with flashing membrane at the sill and a wooden form for a concrete step", caption: "Sill flashing under a new entry door, with the form for its step" },
  ha16: { src: HA(16), ...LYNN, stage: "progress", alt: "Original house in white house wrap with new second-floor dormers and a new front porch, next to a two-story addition in green sheathing", caption: "New dormers and front porch on the original house, next to the new addition" },
  ha18: { src: HA(18), ...LYNN, stage: "progress", alt: "Two-story addition with new white vertical siding on the upper story, three arched windows and bundles of siding staged in the yard", caption: "Siding going up on the two-story addition, with bundles of siding staged in the yard" },
  ha19: { src: HA(19), ...LYNN, stage: "progress", alt: "White vertical siding nearly finished around three arched windows and a wood entry door on a home addition", caption: "Vertical siding nearly finished around the arched windows and the new entry door" },
  man01: { src: MAN(1), ...MANS, stage: "finished", alt: "Remodeled kitchen with white shaker-style cabinets, a stainless refrigerator, a dark stone-look island and three glass pendant lights", caption: "Finished kitchen with white shaker-style cabinets and glass pendant lights" },
  man02: { src: MAN(2), ...MANS, stage: "finished", alt: "Kitchen island with a dark veined stone-look countertop and waterfall edge, white cabinets and a sliding door", caption: "Island with a waterfall countertop edge" },
  man03: { src: MAN(3), ...MANS, stage: "finished", alt: "Three glass pendant lights over a kitchen island with a dark stone-look countertop, white cabinets and a sliding glass door", caption: "Glass pendant lights over the island" },
  man05: { src: MAN(5), ...MANS, stage: "finished", alt: "Waterfall island with a dark stone-look countertop and a white sink below a glass pendant light", caption: "Island sink and waterfall counter, with white cabinets behind" },
  bath01: { src: BATH(1), ...BATHS, stage: "finished", alt: "Walk-in shower with large marble-look wall tile, a frameless glass panel, a built-in niche and a window", caption: "Walk-in shower with marble-look tile and frameless glass" },
  bath02: { src: BATH(2), ...BATHS, stage: "finished", alt: "Bathtub with a fixed glass panel, white subway tile, a mosaic accent band and a tiled niche", caption: "Tub with a glass panel and subway tile with a mosaic accent band" },
  bath03: { src: BATH(3), ...BATHS, stage: "finished", alt: "Walk-in shower with marble-look tile walls, a hexagon mosaic floor and a hinged glass door, next to a toilet", caption: "Shower with marble-look walls and a hexagon mosaic floor" },
  bath04: { src: BATH(4), ...BATHS, stage: "finished", alt: "Corner glass shower with brass fixtures next to a freestanding tub and a brass towel warmer", caption: "Corner glass shower with brass fixtures beside a soaking tub" },
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

const TIMELINE = {
  siding: "Most single-family re-siding jobs take about 1–2 weeks of work once materials arrive.",
  windows: "Most window replacements take 1–3 days of installation, depending on the number of openings.",
  kb: "Bathrooms typically take 2–3 weeks and kitchens about 3–6 weeks once materials are in.",
  decks: "Most decks take about 1–2 weeks to build, depending on size and features.",
  additions: "Larger additions and whole-home remodels typically take 2–4 months of construction after design and permits.",
  painting: "Painting time depends on the number of rooms or the size and condition of the house; we give you a schedule with the estimate.",
};

// Last substantive edit of the hub content (2026-10-05 SEO/content overhaul). Change only on real content edits.
const UPDATED = "2026-10-05T09:15:42-04:00";

const raw: Omit<Service, "photos">[] = [
  {
    slug: "siding", name: "Siding", short: "Siding Installation & Replacement",
    image: P.ha18.src, imageAlt: P.ha18.alt,
    blurb: "Vinyl, fiber-cement and engineered-wood siding with trim, soffit and fascia, installed over a proper weather barrier.",
    features: ["Vinyl, fiber-cement and engineered-wood siding", "Trim, soffit and fascia", "Tear-off and sheathing repairs", "House wrap and flashing at every opening", "Color and profile selection help", "Cleanup and haul-away"],
    long: [
      "Siding is the first layer between New England weather and your walls. Installed correctly, over a water-resistive barrier with flashing at every opening, it keeps rain and snowmelt out of the framing and gives the house a clean, finished look.",
      "We install and replace vinyl, fiber-cement and engineered-wood siding, including removal of the old siding, sheathing repairs, house wrap and flashing, trim, soffit and fascia, and full cleanup.",
    ],
    timeline: TIMELINE.siding,
    faqs: [
      { q: "How long does siding replacement take?", a: `${TIMELINE.siding} The size of the house, the material and any repairs found under the old siding set the exact schedule, which we give you before work starts.` },
      { q: "What siding material holds up best in New England?", a: "Vinyl and fiber cement both perform well when installed correctly. Vinyl costs less and needs no painting; fiber cement costs more, is heavier and resists fire and impact better. Engineered wood is a lighter, paintable option. We help you compare them for your house and budget." },
      { q: "Will new siding lower my energy bills?", a: "Siding by itself adds little insulation. Savings come from sealing air leaks and fixing the weather barrier during re-siding, or from choosing insulated siding or adding rigid foam under it. We can tell you whether that is worth it for your house." },
    ],
    gallery: [P.ha18, P.ha19, P.ha11, P.ha12, P.ha08],
    updated: UPDATED,
  },
  {
    slug: "windows-and-doors", name: "Windows & Doors", short: "Window & Door Replacement",
    image: P.ha13.src, imageAlt: P.ha13.alt,
    blurb: "Replacement windows and entry and patio doors, flashed, sealed and trimmed to keep drafts and water out.",
    features: ["Replacement windows", "Entry and patio doors", "Flashing, insulation and sealing around each unit", "Interior trim and casing", "Help choosing styles, glass and colors", "Cleanup and haul-away of old units"],
    long: [
      "Drafty, fogged or hard-to-open windows and worn entry doors let in cold air and water. New units help only when they are installed well: flashed into the wall, insulated around the frame and sealed.",
      "We replace windows and install entry and patio doors, with flashing, sealing and interior trim and casing, and we help you choose styles, colors and glass options that suit the house.",
    ],
    timeline: TIMELINE.windows,
    faqs: [
      { q: "How long does window replacement take?", a: `${TIMELINE.windows} Windows are usually made to order, so the install date depends on the manufacturer's delivery time.` },
      { q: "Do new windows really save energy?", a: "Replacing single-pane or failed double-pane windows reduces heat loss and drafts. How much you save depends on what you are replacing, how well the new units are installed and sealed, and the rest of the house, so we do not quote a savings figure." },
      { q: "Can you match my home's existing style?", a: "Yes. We help you choose window and door styles, colors, grille patterns and trim that suit the house, whether it is a colonial, a cape or a newer home." },
    ],
    gallery: [P.ha13, P.ha19, P.ha14, P.ha07, P.ha08],
    updated: UPDATED,
  },
  {
    slug: "kitchen-bathroom-remodeling", name: "Kitchen & Bath Remodeling", short: "Kitchen & Bathroom Remodeling",
    image: P.man01.src, imageAlt: P.man01.alt,
    blurb: "Kitchen and bathroom remodels managed start to finish: cabinets, counters, tile showers, fixtures and lighting.",
    features: ["Cabinets and islands", "Countertops and backsplashes", "Tile showers and walk-in showers", "Vanities, fixtures and lighting", "Waterproofing behind tile", "Plumbing and electrical trades scheduled and coordinated"],
    long: [
      "Kitchens and bathrooms combine the most trades in the smallest space: demolition, framing, plumbing, electrical, ventilation, tile, cabinets and finish carpentry. Planning the order of work, and the details hidden behind the walls, decides how the room holds up.",
      "We manage the remodel from start to finish: cabinets, countertops, tile, vanities, fixtures and lighting, with waterproofing behind the tile. Plumbing, gas and electrical work is done by trades who hold the required licenses and pull their own permits.",
    ],
    timeline: TIMELINE.kb,
    faqs: [
      { q: "How long does a kitchen or bathroom remodel take?", a: `${TIMELINE.kb} We give you a schedule before work starts and keep you updated if anything changes.` },
      { q: "Can I stay in my home during the remodel?", a: "In most cases, yes. We set up dust containment, keep the work area clean and plan the work to limit disruption to your daily routine." },
      { q: "Who does the plumbing and electrical work?", a: "Plumbing, gas and electrical work is done by trades who hold the required licenses and pull their own permits; we schedule and coordinate them as part of the project." },
    ],
    gallery: [P.man01, P.man02, P.man05, P.bath01, P.bath03, P.bath04, P.bath02],
    updated: UPDATED,
  },
  {
    slug: "decks", name: "Decks", short: "Deck Design & Construction",
    image: P.sal02.src, imageAlt: P.sal02.alt,
    blurb: "Composite and pressure-treated wood decks, railings, stairs and pool decks, built to code from the footings up.",
    features: ["Composite and pressure-treated wood decks", "Railings, stairs and landings", "Pool decks", "Custom design to fit your yard", "Footings, framing and hardware built to code", "Footing, framing and final inspections planned into the schedule"],
    long: [
      "A deck adds outdoor living space, and it is also a structure people stand on, often well above the ground. Footings below the frost line, a flashed and bolted ledger, rated hardware and code-compliant guards matter as much as the decking you see.",
      "We build decks in composite and pressure-treated wood, with railings, stairs and pool decks, and plan the town's footing, framing and final inspections into the schedule.",
    ],
    timeline: TIMELINE.decks,
    faqs: [
      { q: "Composite or wood: which is better?", a: "Composite costs more up front but needs no staining or sealing, only washing. Pressure-treated wood costs less but needs regular cleaning and sealing. We help you weigh the trade-offs for your yard and budget." },
      { q: "Do I need a permit for a deck?", a: "Usually, yes. Most towns require a building permit for a deck, especially one attached to the house, and the building department inspects the footings, the framing and the finished deck. The written contract should say who applies for the permit and schedules the inspections." },
      { q: "How long does it take to build a deck?", a: `${TIMELINE.decks} Permit review, inspections and weather can move the start date, and we keep you updated throughout.` },
    ],
    gallery: [P.sal02, P.sal05, P.sal06, P.sal01, P.sal03, P.salb04],
    updated: UPDATED,
  },
  {
    slug: "home-additions-remodeling", name: "Additions & Remodeling", short: "Home Additions & Remodeling",
    image: P.ha12.src, imageAlt: P.ha12.alt,
    blurb: "Room and second-story additions, in-law suites and whole-home remodels, from foundation to final finish.",
    features: ["Room and second-story additions", "In-law suites and sunrooms", "Whole-home renovations", "Basement finishing", "Foundation to final finish", "Designer and structural engineer coordination"],
    long: [
      "An addition or whole-home remodel gives you more room without leaving your neighborhood. The work runs from foundation and framing to the roof tie-in, systems and finishes, and the result has to match the house you already have.",
      "We build room and second-story additions, in-law suites and sunrooms, finish basements and remodel whole homes. We coordinate the designer and a structural engineer when a project needs stamped plans, and manage the work from foundation to final finish.",
    ],
    timeline: TIMELINE.additions,
    faqs: [
      { q: "How long does a home addition or full remodel take?", a: `${TIMELINE.additions} Size and complexity set the exact schedule; we give you a detailed one and keep you informed at every stage.` },
      { q: "Who handles design and permits?", a: "We coordinate the designer or architect and a structural engineer when your project needs stamped plans. The written contract should say who applies for the building permit and schedules the inspections; plumbing, gas and electrical permits are pulled by those trades." },
      { q: "Will the new space match my existing home?", a: "That is the goal: we match rooflines, siding, windows and interior finishes so an addition looks like part of the original house and a remodel feels consistent." },
    ],
    gallery: [P.ha12, P.ha05, P.ha07, P.ha19, P.ha11, P.nee05],
    updated: UPDATED,
  },
  {
    slug: "painting", name: "Painting", short: "Interior & Exterior Painting",
    // No real painting photos yet: this stock image is decorative only (alt="", never in galleries/OG/JSON-LD/sitemap).
    image: "", imageAlt: "", imageIsStock: true, // no real painting photo yet → icon tile
    blurb: "Interior and exterior painting, trim and cabinets, with thorough prep: washing, scraping, patching, caulking and priming.",
    features: ["Interior and exterior painting", "Washing, scraping, sanding and patching", "Caulking and priming bare wood", "Cabinet and trim painting", "Color selection help", "Floors, furniture and landscaping protected"],
    long: [
      "Paint protects wood and drywall as well as changing how a room or a house looks. Most paint failures trace back to prep, so the work before the first coat matters most.",
      "We paint interior rooms, trim, cabinets and full exteriors, with washing, scraping, sanding, patching, caulking and priming before the finish coats.",
    ],
    timeline: TIMELINE.painting,
    faqs: [
      { q: "Do you do both interior and exterior painting?", a: "Yes: interior rooms, trim, cabinets and full exteriors. We choose paints suited to the surface and to New England weather." },
      { q: "How long will the paint last?", a: "With proper prep and quality paint, interior walls stay fresh for many years, and a good exterior job typically lasts 7–10 years or more, depending on sun exposure and moisture." },
      { q: "Can you help me choose colors?", a: "Yes. We help you narrow down colors that suit your home and its light; testing samples on the wall before deciding is the most reliable way to choose." },
    ],
    gallery: [],
    updated: UPDATED,
  },
];

export const services: Service[] = raw.map((s) => ({ ...s, photos: s.gallery.map((g) => g.src) }));

export const getService = (slug: string) => services.find((s) => s.slug === slug);
