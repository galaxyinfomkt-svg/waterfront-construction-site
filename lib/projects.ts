export type ProjectVideo = { src: string; poster: string };
export type ProjectStage = { label: string; photos: string[] };
export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  location: string;
  category: string;
  blurb: string;
  body: string[];
  cover: string;
  photos: string[];
  stages?: ProjectStage[];
  videos: ProjectVideo[];
};

const p2 = (n: number) => String(n).padStart(2, "0");
const IMG = (name: string, n: number) => `/images/projects/${name}-${p2(n)}.webp`;
const VID = (name: string, n: number) => `/videos/${name}-${p2(n)}.mp4`;
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const HA = (n: number) => IMG("home-addition-highland-ave-lynnfield-ma", n);
const CR = (n: number) => IMG("home-addition-52-crest-road-lynnfield-ma", n);
const CRV = (n: number) => VID("home-addition-52-crest-road-lynnfield-ma", n);
const SAL = (n: number) => IMG("deck-salem-nh", n);
const SALB = (n: number) => IMG("deck-salem-nh-before", n);
const DED = (n: number) => IMG("bathroom-remodel-dedham-ma", n);
const MAN = (n: number) => IMG("kitchen-remodel-mansfield-ma", n);
const NEE = (n: number) => IMG("home-addition-needham-ma", n);
const NEEB = (n: number) => IMG("home-addition-needham-ma-before", n);
const NEEP = (n: number) => IMG("home-addition-needham-ma-progress", n);

export const projects: Project[] = [
  {
    slug: "kitchen-remodel-mansfield-ma",
    title: "Kitchen Remodeling — Mansfield, MA",
    shortTitle: "Mansfield Kitchen",
    location: "Mansfield, MA",
    category: "Kitchen Remodeling",
    blurb: "A bright, modern kitchen remodel in Mansfield with custom cabinetry and natural-stone counters.",
    body: [
      "This Mansfield kitchen was transformed with crisp white cabinetry, natural-stone countertops, a large island, and modern pendant lighting — a warm, functional space the whole family can gather in.",
      "From layout and cabinets to counters, lighting, and finish work, the entire remodel was managed start to finish by Waterfront Construction.",
    ],
    cover: MAN(1),
    photos: range(1, 6).map(MAN),
    videos: [],
  },
  {
    slug: "bathroom-remodel-dedham-ma",
    title: "Bathroom Remodeling — Dedham, MA",
    shortTitle: "Dedham Bathroom",
    location: "Dedham, MA",
    category: "Bathroom Remodeling",
    blurb: "A full bathroom remodel in Dedham with a custom tiled walk-in shower and frameless glass.",
    body: [
      "This Dedham bathroom was rebuilt with a custom tiled walk-in shower, frameless glass, and clean modern finishes. Behind the tile, proper waterproofing protects the home for the long run.",
      "The result is a bright, spa-like bathroom built to last — designed and managed start to finish by Waterfront Construction.",
    ],
    cover: DED(5),
    photos: range(1, 5).map(DED),
    videos: [{ src: VID("bathroom-remodel-dedham-ma", 1), poster: DED(2) }],
  },
  {
    slug: "pool-deck-salem-nh",
    title: "Pool Deck — Salem, NH",
    shortTitle: "Salem, NH Pool Deck",
    location: "Salem, NH",
    category: "Deck",
    blurb: "A custom wood deck built around an above-ground pool in Salem, NH — before, during, and finished.",
    body: [
      "This Salem, New Hampshire project wrapped an above-ground pool with a spacious custom wood deck — turning a plain backyard pool into a real outdoor living space, shown from early framing through the finished deck and railings.",
      "Solid framing, level decking, and safe, code-compliant railings — built to handle New England seasons and years of summer use.",
    ],
    cover: SAL(4),
    photos: [],
    stages: [
      { label: "Finished deck", photos: range(1, 6).map(SAL) },
      { label: "Before & in progress", photos: range(1, 4).map(SALB) },
    ],
    videos: [
      { src: VID("deck-salem-nh", 1), poster: SAL(2) },
      { src: VID("deck-salem-nh", 2), poster: SAL(4) },
      { src: VID("deck-salem-nh", 3), poster: SAL(5) },
      { src: VID("deck-salem-nh", 4), poster: SAL(6) },
      { src: VID("deck-salem-nh-before", 1), poster: SALB(1) },
      { src: VID("deck-salem-nh-before", 2), poster: SALB(2) },
    ],
  },
  {
    slug: "home-addition-129-falcon-st-needham-ma",
    title: "Home Addition — 129 Falcon St, Needham, MA",
    shortTitle: "Needham Home Addition",
    location: "Needham, MA",
    category: "Home Addition",
    blurb: "A major home addition in Needham — the full transformation from before, through site work, to the new build.",
    body: [
      "This Needham project on Falcon St is a full home addition, documented from start to finish — the original home, the site work and excavation, and the new addition taking shape.",
      "New foundation, framing, and a weather-tight exterior — a significant expansion that reworks how the whole home lives, managed start to finish by Waterfront Construction.",
    ],
    cover: NEE(7),
    photos: [],
    stages: [
      { label: "The build", photos: range(1, 10).map(NEE) },
      { label: "Site work & foundation", photos: range(1, 7).map(NEEP) },
      { label: "Before", photos: range(1, 7).map(NEEB) },
    ],
    videos: [],
  },
  {
    slug: "home-addition-highland-ave-lynnfield-ma",
    title: "Home Addition — Highland Ave, Lynnfield, MA",
    shortTitle: "Highland Ave Addition",
    location: "Lynnfield, MA",
    category: "Home Addition",
    blurb: "A full home addition and exterior transformation on a classic New England home in Lynnfield.",
    body: [
      "This Lynnfield project added real living space and completely transformed the exterior of a classic New England home. The work included new framing, a second-story and rear addition, and a rebuilt front porch — reworking the footprint so the house finally fit the family's needs.",
      "Every stage was managed start to finish: framing, weather-tight sheathing and house wrap, energy-efficient windows, and exterior finishes built to stand up to New England winters. The result is a home that lives bigger, looks better, and is protected for decades.",
    ],
    cover: HA(12),
    photos: range(1, 20).map(HA),
    videos: [],
  },
  {
    slug: "home-addition-52-crest-road-lynnfield-ma",
    title: "Home Addition — 52 Crest Road, Lynnfield, MA",
    shortTitle: "52 Crest Road Addition",
    location: "Lynnfield, MA",
    category: "Home Addition",
    blurb: "A video walkthrough of a home addition at 52 Crest Road, Lynnfield — from framing through weather-tight exterior.",
    body: [
      "This home addition at 52 Crest Road in Lynnfield is captured on video as the project came together. The clips walk through the addition from structural framing to a fully weather-tight exterior with new sheathing and house wrap.",
      "Like every Waterfront Construction project, this one was owner-supervised from the first estimate to the final walkthrough — clean job site, clear communication, and craftsmanship built to last.",
    ],
    cover: CR(3),
    photos: [],
    videos: [1, 2, 3, 4, 6].map((n) => ({ src: CRV(n), poster: CR(n) })),
  },
  {
    slug: "exterior-remodel-siding-deck",
    title: "Exterior Remodel — New Siding & Deck",
    shortTitle: "Siding & Deck Remodel",
    location: "Massachusetts",
    category: "Exterior Remodel",
    blurb: "A completed exterior transformation — fresh siding and a rebuilt deck — by Waterfront Construction.",
    body: [
      "A finished exterior remodel featuring new siding and a rebuilt deck. Fresh siding protects the home and instantly lifts its curb appeal, while a solid new deck adds usable outdoor living space for the New England seasons.",
      "Like every Waterfront Construction job, this one was owner-supervised from start to finish — quality materials, clean work, and a finish built to last.",
    ],
    cover: "/images/projects/exterior-remodel-siding-deck-ma-01.webp",
    photos: [],
    videos: [{ src: "/videos/exterior-remodel-siding-deck-ma-01.mp4", poster: "/images/projects/exterior-remodel-siding-deck-ma-01.webp" }],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

// All still-image paths for a project (flat photos + any staged photos) — used for schema/sitemap.
export function projectImages(p: Project): string[] {
  return [p.cover, ...p.photos, ...(p.stages?.flatMap((s) => s.photos) ?? [])];
}
