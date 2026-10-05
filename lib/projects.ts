// Documented case studies: real Waterfront Construction jobs, town level only (never a street, a house
// number or a client name — owner decision, Oct 2026). Truth rules (audit 05 PG-H1, IMPLEMENTATION.md §2):
// - Every scope line, alt text, caption and video description says only what the photo or clip SHOWS
//   (brands only where the logo is legible, e.g. ZIP System, Tyvek). Owner-supplied facts (year, duration,
//   permit, materials, client quote) live in the optional fields below and render only when set — never
//   a placeholder.
// - Photos that show a legible house number or a client's licence plate, near-duplicates, letterboxed
//   screenshots and watermarked social clips are left out of the albums (audit 05 PG-C2, PG-M5, PG-L4).
// - `location` is "Town, ST" for a located job (lib/towns.ts parses it) or "Massachusetts" when the town
//   is not known; a project without a town is never tied to one in copy, links or schema.
// Consumers: app/projects/[slug], app/gallery, lib/schema.ts (projectNodes), lib/towns.ts, lib/town-copy.ts,
// lib/service-content.ts, app/sitemap.ts, the home, about and blog pages.

/** Last substantive rewrite of the case-study content (WebPage/Article dateModified, og:modified_time,
 *  sitemap lastModified). Bump ONLY when a project's copy, photos or videos change substantively. */
export const PROJECTS_UPDATED = "2026-10-05T10:32:56-04:00";

export type GalleryCategory = "Kitchens" | "Bathrooms" | "Decks" | "Additions" | "Siding" | "Windows & Doors";

export type ProjectStage = {
  id: string;
  label: string; // visible <h3>
  note?: string; // one sentence on what this group of photos shows
};

export type ProjectPhoto = {
  src: string;
  alt: string; // what THIS photo shows, with the real town only (screen readers, image search, ImageObject)
  caption: string; // short visible <figcaption> (also the ImageObject caption)
  stage: string; // ProjectStage.id
  featured?: GalleryCategory; // shown as a tile on /gallery under this category
};

export type ProjectVideo = {
  src: string;
  poster: string; // a still from the same job (frame of the clip where one exists)
  posterAlt: string; // describes the poster image (cards, gallery tiles)
  title: string; // visible + VideoObject.name
  description: string; // visible text alternative (the clips have no sound; WCAG 1.2.1) + VideoObject.description
  featured?: GalleryCategory; // poster shown as a /gallery tile
};

export type Project = {
  slug: string;
  title: string; // the H1 — unique; also Article.headline and the card title on other pages
  seoTitle: string; // <title> before " | Waterfront Construction" (≤ 60 characters, unique)
  metaDescription: string; // unique; counts must match the albums (checked below)
  shortTitle: string; // breadcrumb + compact card label
  location: string; // "Mansfield, MA" | "Salem, NH" | "Massachusetts" (town not listed)
  category: string; // plain noun phrase, e.g. "Kitchen remodel"
  galleryCategory: GalleryCategory;
  services: string[]; // service slugs this job documents, primary first (hub + service×town links)
  blurb: string; // answer-first summary: visible lead under the H1, Article/WebPage description
  scopeHeading: string; // "What we did" when the photos show our crew's work in progress
  scope: string[]; // each line visible in the photos or videos
  notes: string[]; // "About these photos": what the record covers and what it does not
  stages: ProjectStage[]; // chronological
  photos: ProjectPhoto[];
  videos: ProjectVideo[]; // unique clips only (duplicates and slideshows removed)
  cover: string; // a photo src or a video poster
  ogSource: string; // source image of public/og/project-{slug}.jpg (must match scripts/build-og.mjs)
  updated: string; // ISO 8601 with offset: last substantive edit of this case study
  // ---- owner-supplied facts: render only when set (audit 05 PG-H2, owner checklist O3-O10) ----
  completed?: string; // "2024" or "2024-06"
  durationWeeks?: number;
  permit?: { authority: string; number?: string; finalInspection?: boolean }; // public-record permit
  materials?: string[]; // products and brands confirmed from invoices
  quote?: { text: string; author: string; consentOnFile: true }; // written consent; never marked up as a Review
};

const p2 = (n: number) => String(n).padStart(2, "0");
const IMG = (name: string, n: number) => `/images/projects/${name}-${p2(n)}.webp`;
const VID = (name: string, n: number) => `/videos/${name}-${p2(n)}.mp4`;

const MAN = (n: number) => IMG("kitchen-remodel-mansfield-ma", n);
const BATH = (n: number) => IMG("bathroom-remodels", n);
const SAL = (n: number) => IMG("deck-salem-nh", n);
const SALB = (n: number) => IMG("deck-salem-nh-before", n);
const NEE = (n: number) => IMG("home-addition-needham-ma", n);
const NEEP = (n: number) => IMG("home-addition-needham-ma-progress", n);
const HA = (n: number) => IMG("home-addition-exterior-lynnfield-ma", n);
const CR = (n: number) => IMG("home-addition-lynnfield-ma", n);
const CRV = (n: number) => VID("home-addition-lynnfield-ma", n);
const EXT_STILL = "/images/projects/exterior-remodel-siding-deck-ma-01.webp";

export const projects: Project[] = [
  // ---------------------------------------------------------------- Mansfield kitchen (finished photos only)
  {
    slug: "kitchen-remodel-mansfield-ma",
    title: "Kitchen Remodel in Mansfield, MA",
    seoTitle: "Kitchen Remodel in Mansfield, MA: White Cabinets & Island",
    metaDescription: "A finished kitchen remodel in Mansfield, MA, in 5 photos: white shaker-style cabinets, a dark veined waterfall island, glass pendants and a tile backsplash.",
    shortTitle: "Mansfield Kitchen",
    location: "Mansfield, MA",
    category: "Kitchen remodel",
    galleryCategory: "Kitchens",
    services: ["kitchen-bathroom-remodeling"],
    blurb: "A finished kitchen remodel in Mansfield, MA, with white shaker-style cabinets, a dark veined island with a waterfall edge, three glass pendant lights and a gray tile backsplash.",
    scopeHeading: "What the finished kitchen includes",
    scope: [
      "White shaker-style cabinets that run up to crown molding",
      "An island with a white sink and a gooseneck faucet, its dark veined countertop wrapping down the end (a waterfall edge)",
      "Matching dark countertops on the perimeter cabinets",
      "A gray tile backsplash and a gray tile floor",
      "Three clear glass pendant lights over the island, plus recessed ceiling lights",
      "A stainless French-door refrigerator set between tall cabinets",
    ],
    notes: [
      "These photos were taken after the remodel was finished, so they show the completed room rather than the stages of the job. There are no before photos of this kitchen on the site.",
    ],
    stages: [{ id: "finished", label: "The finished kitchen" }],
    photos: [
      { src: MAN(1), stage: "finished", featured: "Kitchens", alt: "Remodeled kitchen in Mansfield, MA, with white shaker-style cabinets, a stainless French-door refrigerator and a dark veined island under glass pendant lights", caption: "White cabinets run to the ceiling around a stainless French-door refrigerator." },
      { src: MAN(2), stage: "finished", alt: "Kitchen island with a white sink and gooseneck faucet under three glass pendant lights, next to a black-framed sliding door, in Mansfield, MA", caption: "The island sink under three glass pendants, with the black-framed slider to the right." },
      { src: MAN(3), stage: "finished", featured: "Kitchens", alt: "View across the dark veined island to the L-shaped run of white cabinets and gray tile backsplash in a Mansfield, MA kitchen", caption: "The L-shaped cabinet run and gray tile backsplash, seen across the island." },
      { src: MAN(4), stage: "finished", alt: "Stainless French-door refrigerator between tall white cabinets, with the end of the island in the foreground, in a Mansfield, MA kitchen", caption: "Tall cabinets frame the refrigerator; the island is in the foreground." },
      { src: MAN(5), stage: "finished", featured: "Kitchens", alt: "End of the kitchen island where the dark veined countertop wraps down the side to the floor, under a glass pendant, in Mansfield, MA", caption: "The countertop wraps down the end of the island in a waterfall edge." },
    ],
    videos: [],
    cover: MAN(1),
    ogSource: MAN(1),
    updated: PROJECTS_UPDATED,
  },

  // ---------------------------------------------------------------- bathroom photos (several jobs, no town)
  {
    slug: "bathroom-remodels",
    title: "Bathroom Remodels: Tiled Showers and Frameless Glass",
    seoTitle: "Bathroom Remodel Photos: Tiled Showers & Frameless Glass",
    metaDescription: "5 photos from bathroom remodels by Waterfront Construction: tiled walk-in and neo-angle showers, a tub-shower with a glass panel, and frameless glass.",
    shortTitle: "Bathroom Remodels",
    location: "Massachusetts",
    category: "Bathroom remodels",
    galleryCategory: "Bathrooms",
    services: ["kitchen-bathroom-remodeling"],
    blurb: "Photos from several bathroom remodels by Waterfront Construction: tiled walk-in showers, two neo-angle glass showers, a tub-shower with a hinged glass panel, and frameless glass throughout.",
    scopeHeading: "What the photos show",
    scope: [
      "Walk-in showers with large-format marble-look wall tile and frameless glass",
      "Two neo-angle (five-sided) glass showers: one with brass fixtures beside a corner tub, one in beige stone-look tile with a built-in bench",
      "A tub-shower with white subway tile, a dark mosaic band and a hinged glass panel",
      "Recessed shower niches, a pebble-tile shower floor and ceiling or wall-mounted rain shower heads",
    ],
    notes: [
      "These photos come from more than one bathroom remodel. The towns are not listed, so this page does not name one.",
      "Each photo carries our logo and phone number, added when it was first shared online.",
    ],
    stages: [{ id: "finished", label: "Finished bathrooms" }],
    photos: [
      { src: BATH(1), stage: "finished", alt: "Walk-in shower with large-format marble-look wall tile, a recessed niche, a rain shower head and frameless glass", caption: "Walk-in shower in marble-look tile with a recessed niche and frameless glass." },
      { src: BATH(2), stage: "finished", featured: "Bathrooms", alt: "Bathtub with white subway tile walls, a dark mosaic accent band, a recessed niche and a hinged glass panel", caption: "Tub-shower with white subway tile, a dark mosaic band and a hinged glass panel." },
      { src: BATH(3), stage: "finished", featured: "Bathrooms", alt: "Walk-in shower with marble-look walls, a pebble-tile floor, a window and a frameless glass door, beside the toilet", caption: "Walk-in shower with a pebble-tile floor and a frameless glass door." },
      { src: BATH(4), stage: "finished", featured: "Bathrooms", alt: "Neo-angle frameless glass shower with brass fixtures and a ceiling rain head, next to a corner tub and a brass towel rack", caption: "Neo-angle glass shower with brass fixtures, beside a corner tub." },
      { src: BATH(5), stage: "finished", alt: "Neo-angle glass shower in beige stone-look tile with a built-in bench, a recessed niche and a mosaic accent band", caption: "Neo-angle shower in beige stone-look tile with a built-in bench." },
    ],
    videos: [], // the 12-second clip was a slideshow of these same photos (audit 05 PG-C3) — not shown
    cover: BATH(3),
    ogSource: BATH(3),
    updated: PROJECTS_UPDATED,
  },

  // ---------------------------------------------------------------- Salem, NH pool deck
  {
    slug: "pool-deck-salem-nh",
    title: "Above-Ground Pool Deck in Salem, NH",
    seoTitle: "Above-Ground Pool Deck in Salem, NH: Photos & Video",
    metaDescription: "A deck built around an above-ground pool in Salem, NH: pressure-treated framing, gray decking, white railings and stairs, in 9 photos and 5 site videos.",
    shortTitle: "Salem, NH Pool Deck",
    location: "Salem, NH",
    category: "Pool deck",
    galleryCategory: "Decks",
    services: ["decks"],
    blurb: "A deck we built around an above-ground pool in Salem, NH: a pressure-treated frame, gray decking with a picture-frame border, white railings with black balusters, and stairs down from the house and up from the yard.",
    scopeHeading: "What we did",
    scope: [
      "Framed the deck around the pool with pressure-treated posts, beams and joists",
      "Laid gray deck boards with a picture-frame border, cut to follow the pool wall",
      "Built stairs down from the house and steps up from the yard, with white risers",
      "Installed white railings with black balusters along the stairs and the open edges",
    ],
    notes: [
      "The photos and videos follow the job from framing to the finished deck. Some clips were filmed while the work was still going on, with tools, packaging and bare rail posts in view.",
    ],
    stages: [
      { id: "framing", label: "Framing", note: "Pressure-treated framing laid out around the pool, next to the house stairs." },
      { id: "decking", label: "Decking and railings", note: "Gray deck boards going down over the frame, with some edges still bare." },
      { id: "finished", label: "Finished deck", note: "The completed deck, with patio furniture in place." },
    ],
    photos: [
      { src: SALB(3), stage: "framing", alt: "Work van, miter-saw station and pressure-treated lumber in a backyard at the start of a pool deck in Salem, NH, with a framed section on the lawn", caption: "Lumber, the saw station and a framed section in the yard at the start of the job." },
      { src: SALB(4), stage: "framing", featured: "Decks", alt: "Pressure-treated joist framing laid out next to an above-ground pool in Salem, NH", caption: "Joist framing laid out beside the pool." },
      { src: SALB(1), stage: "framing", alt: "Crew member framing the deck between an above-ground pool and the house stairs, which have white railings with black balusters, in Salem, NH", caption: "Framing the section between the pool and the house stairs." },
      { src: SAL(3), stage: "framing", alt: "Pressure-treated posts and beams under the new pool deck, with taller posts in place for the railings, in Salem, NH", caption: "Posts and beams under the deck, with taller posts in place for the railings." },
      { src: SAL(1), stage: "decking", alt: "Gray deck boards with a border installed over pressure-treated joists, with a tape measure on the deck, at a pool deck in Salem, NH", caption: "Gray decking going down over the joists; the inner section is still open." },
      { src: SAL(2), stage: "decking", featured: "Decks", alt: "Gray deck boards installed up to the wall of an above-ground pool, with white stair railings and tools on the deck, in Salem, NH", caption: "Decking run up to the pool wall, with tools still on the deck." },
      { src: SAL(6), stage: "decking", alt: "Corner of the new gray pool deck with its picture-frame border and the pressure-treated rim joist still bare, in Salem, NH", caption: "The picture-frame border at a deck corner; the rim joist is still bare." },
      { src: SAL(4), stage: "finished", featured: "Decks", alt: "Finished gray deck meeting the edge of an above-ground pool, with a white post cap, in Salem, NH", caption: "The finished deck meets the pool wall." },
      { src: SAL(5), stage: "finished", featured: "Decks", alt: "Finished pool deck seen from the house stairs, with white railings, black balusters and patio furniture, in Salem, NH", caption: "The finished deck from the house stairs, with patio furniture in place." },
    ],
    videos: [
      { src: VID("deck-salem-nh-before", 1), poster: SALB(4), posterAlt: "Pressure-treated joist framing laid out next to an above-ground pool in Salem, NH", title: "Framing the pool deck", description: "The crew lays out pressure-treated joists around the pool. The company van and the miter-saw station are in the yard, and the house stairs already have white railings." },
      { src: VID("deck-salem-nh", 3), poster: SAL(6), posterAlt: "Corner of the new gray pool deck with its picture-frame border, in Salem, NH", title: "Steps from the yard and a deck corner", description: "A close view of the steps up from the yard, with gray treads and white risers, then the corner where the decking meets the pool. The rail posts are still bare pressure-treated wood." },
      { src: VID("deck-salem-nh", 2), poster: SAL(2), posterAlt: "Gray deck boards installed up to the wall of an above-ground pool, in Salem, NH", title: "Yard steps, pool edge and house stairs", description: "From the steps at the yard to the corner at the pool, then across the deck, with a drill and a hammer still on it, to the stairs up to the house." },
      { src: VID("deck-salem-nh", 4), poster: SAL(4), posterAlt: "Gray deck meeting the edge of an above-ground pool, with a white post cap, in Salem, NH", title: "Railings and the pool-side decking", description: "From the bottom of the house stairs along the white railing and across the decking at the pool edge. Packaging is still on the deck and some rail posts are still bare." },
      { src: VID("deck-salem-nh", 1), poster: SAL(5), posterAlt: "Pool deck seen from the house stairs, with white railings and black balusters, in Salem, NH", title: "The deck from the house stairs", description: "Looking down from the stairs at the house: the stairs, the gray deck around the pool and the white railing along the far edge. Another section beyond the pool is still being framed." },
    ],
    cover: SAL(5),
    ogSource: SAL(6),
    updated: PROJECTS_UPDATED,
  },

  // ---------------------------------------------------------------- Needham front porch addition
  {
    slug: "home-addition-needham-ma",
    title: "Front Porch Addition in Needham, MA",
    seoTitle: "Front Porch Addition in Needham, MA: Build Photos",
    metaDescription: "4 photos of a front porch addition on a colonial in Needham, MA, from the excavation along the front of the house to the framed porch posts and roof.",
    shortTitle: "Needham Porch Addition",
    location: "Needham, MA",
    category: "Home addition",
    galleryCategory: "Additions",
    services: ["home-additions-remodeling"],
    blurb: "A covered front porch added across the front of a two-story colonial in Needham, MA: excavation along the house, a new concrete foundation, and framing for the porch posts and roof, with Tyvek house wrap on the wall behind it.",
    scopeHeading: "What we did",
    scope: [
      "Dug out along the front of the house, with orange safety fence around the excavation",
      "Built the porch on a new concrete foundation with a pressure-treated sill",
      "Framed the porch posts, beams and roof across the front of the house",
      "Wrapped the wall behind the porch in Tyvek house wrap",
      "Closed in the right end of the porch with wood sheathing",
    ],
    notes: [
      "The photos run from the excavation in winter to the framed porch. The finished porch is not shown yet.",
    ],
    stages: [
      { id: "excavation", label: "Excavation", note: "Digging along the front of the house for the new foundation." },
      { id: "framing", label: "Framing the porch", note: "The porch posts and roof framed on the new foundation." },
    ],
    photos: [
      { src: NEEP(5), stage: "excavation", featured: "Additions", alt: "Mini excavator and the Waterfront Construction job sign at the front of a colonial in Needham, MA, with bricks from the front walk piled beside the dig", caption: "A mini excavator digs along the front of the house; bricks from the walk are piled beside the dig." },
      { src: NEEP(4), stage: "excavation", alt: "Worker setting orange safety fence beside the excavation and a large rock at the front of a house in Needham, MA", caption: "Orange safety fence goes up around the excavation." },
      { src: NEE(5), stage: "framing", featured: "Additions", alt: "Covered front porch framing with wood posts and roof across the front of a colonial in Needham, MA, with the right end sheathed and Tyvek along the base", caption: "Porch posts and roof framed across the front; the right end is sheathed." },
      { src: NEE(6), stage: "framing", alt: "Front porch framing on a new concrete foundation across a two-story colonial in Needham, MA, seen from the street", caption: "The framed porch from the street, on its new concrete foundation." },
    ],
    videos: [],
    cover: NEE(5),
    ogSource: NEE(5),
    updated: PROJECTS_UPDATED,
  },

  // ---------------------------------------------------------------- Lynnfield two-story addition + exterior
  {
    slug: "home-addition-exterior-lynnfield-ma",
    title: "Two-Story Addition and Exterior Remodel in Lynnfield, MA",
    seoTitle: "Two-Story Addition & Exterior Remodel in Lynnfield, MA",
    metaDescription: "12 photos of a Lynnfield, MA job: a two-story addition in ZIP System sheathing, new black windows, a front porch with a metal roof, and white siding.",
    shortTitle: "Lynnfield Addition & Exterior",
    location: "Lynnfield, MA",
    category: "Home addition",
    galleryCategory: "Additions",
    services: ["home-additions-remodeling", "siding", "windows-and-doors"],
    blurb: "A two-story addition and exterior remodel in Lynnfield, MA: the addition framed and sheathed in ZIP System panels, black windows including three arched-top units, the main house's second floor wrapped and fitted with new windows, a front porch, and white siding.",
    scopeHeading: "What we did",
    scope: [
      "Framed a two-story addition and sheathed it in green ZIP System wall panels (the logo is visible in the photos)",
      "Installed black windows on the addition, including three arched-top windows",
      "Wrapped the main house's second floor in Tyvek and fitted it with new black windows",
      "Built a front porch on wood posts, with a metal roof",
      "Added a side entry door on the addition, with a wood step frame in front",
      "Sided the addition and the main house's second floor in white siding",
    ],
    notes: [
      "The photos run from the fall, when the addition was framed and sheathed, to late fall, when the siding went on. Photos of the finished house are not published yet.",
    ],
    stages: [
      { id: "addition", label: "Framing and sheathing the addition", note: "The two-story addition framed, sheathed in ZIP System panels and fitted with windows." },
      { id: "main-house", label: "Main house and front porch", note: "House wrap and new windows on the main house, and the porch across the front." },
      { id: "siding", label: "Siding", note: "White siding going on the addition and the main house." },
    ],
    photos: [
      { src: HA(1), stage: "addition", alt: "Waterfront Construction van beside a framed two-story addition with green ZIP System sheathing, in Lynnfield, MA", caption: "The framed addition in green ZIP System sheathing, next to the company van." },
      { src: HA(2), stage: "addition", alt: "Two-story addition sheathed in green ZIP System panels beside the main house, whose roof is under a blue tarp, in Lynnfield, MA", caption: "The two-story addition in ZIP System sheathing; the main roof is under a tarp." },
      { src: HA(5), stage: "addition", alt: "Two-story addition in green ZIP System sheathing with its first windows installed, in Lynnfield, MA", caption: "Windows going into the sheathed addition." },
      { src: HA(7), stage: "addition", featured: "Additions", alt: "Two-story addition in green ZIP System sheathing with black windows installed and building materials in front, in Lynnfield, MA", caption: "The addition with its black windows in." },
      { src: HA(13), stage: "addition", featured: "Windows & Doors", alt: "Three arched-top black windows set in a green ZIP System wall on a home addition in Lynnfield, MA", caption: "Three arched-top black windows on the addition, set in ZIP System sheathing." },
      { src: HA(14), stage: "addition", alt: "New side entry door with protective film and a wood step frame in front, on a home addition in Lynnfield, MA", caption: "The side entry door, with a wood step frame in front." },
      { src: HA(12), stage: "main-house", featured: "Additions", alt: "Main house with its second floor in Tyvek house wrap and black windows, a front porch on wood posts, and a two-story addition in ZIP System sheathing, in Lynnfield, MA", caption: "The main house in Tyvek with its new windows and porch, beside the sheathed addition." },
      { src: HA(8), stage: "main-house", featured: "Windows & Doors", alt: "Worker installing a black window under a metal porch roof, with white siding and a black window above, in Lynnfield, MA", caption: "A window going in under the porch's metal roof; the wall above is already sided." },
      { src: HA(15), stage: "siding", alt: "Two-story addition in ZIP System sheathing with three arched-top windows, and bundles of white siding on the ground, in Lynnfield, MA", caption: "Siding delivered and ready to go on the addition." },
      { src: HA(17), stage: "siding", featured: "Siding", alt: "White vertical siding installed on a two-story addition, with a ladder and three arched-top black windows, in Lynnfield, MA", caption: "White vertical siding going up on the addition." },
      { src: HA(18), stage: "siding", featured: "Siding", alt: "Gable end of a two-story addition in white vertical siding, with two windows above three arched-top black windows, in Lynnfield, MA", caption: "The addition's gable end in white siding, with the three arched windows below." },
      { src: HA(16), stage: "siding", alt: "Front of the main house with white siding on the second floor, black windows and a front porch on wood posts, with the addition at the right, in Lynnfield, MA", caption: "The main house with its second floor sided, beside the addition." },
    ],
    videos: [],
    cover: HA(12),
    ogSource: HA(12),
    updated: PROJECTS_UPDATED,
  },

  // ---------------------------------------------------------------- Lynnfield addition framing (video only)
  {
    slug: "home-addition-lynnfield-ma",
    title: "Home Addition Framing in Lynnfield, MA: Winter Site Videos",
    seoTitle: "Home Addition Framing in Lynnfield, MA: Site Videos",
    metaDescription: "5 short site videos, filmed in winter, of a home addition in Lynnfield, MA: walls sheathed in ZIP System panels, open roof framing, then roof sheathing.",
    shortTitle: "Lynnfield Addition Framing",
    location: "Lynnfield, MA",
    category: "Home addition",
    galleryCategory: "Additions",
    services: ["home-additions-remodeling"],
    blurb: "A home addition in Lynnfield, MA, filmed in winter while it was being framed: new walls sheathed in green ZIP System panels rise above the gray-sided first floor, with the roof framing and red roof sheathing in progress.",
    scopeHeading: "What we did",
    scope: [
      "Framed the new walls above the gray-sided first floor and sheathed them in green ZIP System panels (the logo is visible in the clips)",
      "Framed the roof and began sheathing it, and parts of the walls, in red ZIP System panels",
    ],
    notes: [
      "This job is documented in video only, filmed while the addition was being framed and sheathed. The finished addition is not shown.",
    ],
    stages: [],
    photos: [],
    videos: [
      { src: CRV(1), poster: CR(1), posterAlt: "Home addition walls in green ZIP System sheathing with open roof rafters above a gray-sided first floor, with a dumpster in front, in Lynnfield, MA (video still)", featured: "Additions", title: "New walls and open roof framing", description: "The new walls, sheathed in green ZIP System panels, stand above the gray-sided first floor, with the roof rafters still open. A dumpster sits in front, and the clip ends at the company's job sign in the snow." },
      { src: CRV(2), poster: CR(2), posterAlt: "Green ZIP System sheathing above the gray-sided first floor of a house in Lynnfield, MA, with lumber in the snowy yard (video still)", title: "The addition from the yard", description: "A walk across the snowy yard past the job sign, looking at the sheathed walls and open rafters from the front and the side." },
      { src: CRV(3), poster: CR(3), posterAlt: "Pickup trucks in the driveway in front of a home addition in green and red ZIP System sheathing, in Lynnfield, MA (video still)", title: "Walking up the driveway", description: "From the street up the driveway, past the trucks, to a close view of the green and red ZIP System panels, with the company van, a portable toilet and lumber beside the addition." },
      { src: CRV(4), poster: CR(4), posterAlt: "Front of a home addition in green and red sheathing behind a dumpster, in Lynnfield, MA (video still)", title: "Front of the addition", description: "The front of the addition with the dumpster, the window and door openings, and the gable end in green and red sheathing, ending at the job sign." },
      { src: CRV(6), poster: CR(6), posterAlt: "Gable-end section of a home addition with a red sheathed roof and green ZIP System walls, with the company van beside it, in Lynnfield, MA (video still)", title: "Roof sheathing on", description: "The gable-end section with its roof sheathed in red panels, the company van and lumber beside it, then the rest of the addition and the job sign from the street." },
    ],
    cover: CR(3),
    ogSource: CR(6),
    updated: PROJECTS_UPDATED,
  },

  // ---------------------------------------------------------------- deck and stairs (video only, town not listed)
  {
    slug: "exterior-remodel-siding-deck",
    title: "Deck and Stairs with Lattice Skirting",
    seoTitle: "Deck and Stairs with Lattice Skirting: Walk-Around Video",
    metaDescription: "A 52-second video of a deck by Waterfront Construction: pressure-treated railings, white lattice skirting, gray deck boards and stairs with white risers.",
    shortTitle: "Deck and Stairs",
    location: "Massachusetts",
    category: "Deck",
    galleryCategory: "Decks",
    services: ["decks"],
    blurb: "A 52-second walk-around video of a deck and stairs: pressure-treated railings and balusters, white lattice skirting, gray deck boards and stair treads with white risers, beside a house with gray siding.",
    scopeHeading: "What the video shows",
    scope: [
      "Pressure-treated railings, balusters and stair rails",
      "White lattice skirting around the base of the deck",
      "Gray deck boards and stair treads with white risers",
      "Decking that runs up to the door of the house",
    ],
    notes: [
      "This job is documented in one short video, which has no sound and is described in writing above. The town is not listed, and the video shows the deck and stairs only; it does not show siding work.",
    ],
    stages: [],
    photos: [],
    videos: [
      { src: "/videos/exterior-remodel-siding-deck-ma-01.mp4", poster: EXT_STILL, posterAlt: "Pressure-treated stairs and railings over white lattice skirting beside a house with gray siding (video still)", featured: "Decks", title: "Deck walk-around", description: "The deck from the yard, showing the white lattice skirting and the pressure-treated railings, then up the stairs, with gray treads and white risers, to the decking at the house door." },
    ],
    cover: EXT_STILL,
    ogSource: EXT_STILL,
    updated: PROJECTS_UPDATED,
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** Unique still images that the case-study page shows as photos (cover first) — schema ImageObjects and sitemap.
 *  For a video-only job this is the cover (a poster still shown on the page). */
export function projectImages(p: Project): string[] {
  return [...new Set([p.cover, ...p.photos.map((x) => x.src)])];
}

/** Alt text for any image the project shows (photo or video poster); "" if unknown. */
export function imageAlt(p: Project, src: string): string {
  return p.photos.find((x) => x.src === src)?.alt ?? p.videos.find((v) => v.poster === src)?.posterAlt ?? "";
}
/** Visible caption for an image (photo caption or the poster's video title). */
export function imageCaption(p: Project, src: string): string {
  return p.photos.find((x) => x.src === src)?.caption ?? p.videos.find((v) => v.poster === src)?.title ?? "";
}

/** "5 photos · 2 videos" — counts unique media only (audit 05 PG-M5). */
export function mediaCount(p: Project): string {
  const n = (k: number, w: string) => `${k} ${w}${k === 1 ? "" : "s"}`;
  return [p.photos.length ? n(p.photos.length, "photo") : "", p.videos.length ? n(p.videos.length, "video") : ""].filter(Boolean).join(" · ");
}

/** /gallery tiles: featured photos and video posters, each linked to its case study. */
export type FeaturedImage = { src: string; alt: string; caption: string; cat: GalleryCategory; project: Project };
export function featuredImages(): FeaturedImage[] {
  return projects.flatMap((p) => [
    ...p.photos.filter((x) => x.featured).map((x) => ({ src: x.src, alt: x.alt, caption: x.caption, cat: x.featured!, project: p })),
    ...p.videos.filter((v) => v.featured).map((v) => ({ src: v.poster, alt: v.posterAlt, caption: `Video still: ${v.title.toLowerCase()}`, cat: v.featured!, project: p })),
  ]);
}

// ---------- data guards: fail the build instead of publishing a false or broken case study ----------
const BANNED = /falcon|crest r(oa)?d|highland ave|kingman|rocky ridge|\b\d{1,5}\s+[A-Z][a-z]+\s+(st|street|rd|road|ave|avenue|lane|ln|dr|drive)\b|licen[cs]ed|dedham|northborough & metrowest|custom wood|energy-efficient|weather-tight|code-compliant/i;
(function validate() {
  const errors: string[] = [];
  const seen = { title: new Set<string>(), seo: new Set<string>(), meta: new Set<string>() };
  for (const p of projects) {
    const where = `lib/projects.ts ${p.slug}`;
    for (const [k, set, v] of [["title", seen.title, p.title], ["seoTitle", seen.seo, p.seoTitle], ["metaDescription", seen.meta, p.metaDescription]] as const) {
      if (set.has(v)) errors.push(`${where}: duplicate ${k}`);
      set.add(v);
    }
    if (p.seoTitle.length > 60) errors.push(`${where}: seoTitle over 60 characters`);
    if (p.metaDescription.length > 160) errors.push(`${where}: metaDescription over 160 characters`);
    const srcs = p.photos.map((x) => x.src);
    if (new Set(srcs).size !== srcs.length) errors.push(`${where}: duplicate photo`);
    if (new Set(p.videos.map((v) => v.src)).size !== p.videos.length) errors.push(`${where}: duplicate video`);
    if (!srcs.includes(p.cover) && !p.videos.some((v) => v.poster === p.cover)) errors.push(`${where}: cover is not shown on the page`);
    for (const x of p.photos) if (!p.stages.some((s) => s.id === x.stage)) errors.push(`${where}: unknown stage ${x.stage}`);
    const photoN = p.metaDescription.match(/\b(\d+) photos\b/);
    if (photoN && Number(photoN[1]) !== p.photos.length) errors.push(`${where}: metaDescription photo count`);
    const videoN = p.metaDescription.match(/\b(\d+) (?:short )?(?:site )?videos\b/);
    if (videoN && Number(videoN[1]) !== p.videos.length) errors.push(`${where}: metaDescription video count`);
    const text = [p.title, p.seoTitle, p.metaDescription, p.shortTitle, p.blurb, ...p.scope, ...p.notes, ...p.stages.flatMap((s) => [s.label, s.note ?? ""]),
      ...p.photos.flatMap((x) => [x.alt, x.caption]), ...p.videos.flatMap((v) => [v.title, v.description, v.posterAlt])].join("\n");
    const bad = text.match(BANNED);
    if (bad) errors.push(`${where}: banned phrase "${bad[0]}"`);
  }
  if (errors.length) throw new Error(`Case-study data check failed:\n${errors.join("\n")}`);
})();
