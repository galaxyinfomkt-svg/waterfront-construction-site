export type ProjectVideo = { src: string; poster: string };
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
  videos: ProjectVideo[];
};

const HA = (n: number) => `/images/projects/home-addition-highland-ave-lynnfield-ma-${String(n).padStart(2, "0")}.webp`;
const CR = (n: number) => `/images/projects/home-addition-52-crest-road-lynnfield-ma-${String(n).padStart(2, "0")}.webp`;
const CRV = (n: number) => `/videos/home-addition-52-crest-road-lynnfield-ma-${String(n).padStart(2, "0")}.mp4`;

export const projects: Project[] = [
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
    photos: Array.from({ length: 20 }, (_, i) => HA(i + 1)),
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
