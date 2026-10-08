// Hero photos for every page header (owner request, Oct 2026: "every page needs a photo in the hero").
// Truth rules (same as lib/services.ts): real Waterfront Construction job photos only, never stock; the caption says
// what the photo shows and `place` is where it was really taken (omitted when unknown). A page about a town or a
// service that has no photo of its own borrows a photo from another job, and the visible caption names that job's
// real place, so no page implies work it does not show.
import { PHOTO_CAPTIONS, type ServiceSlug } from "./services";
import { projects } from "./projects";
import { citySlug, type City } from "./site";
import { projectTown } from "./towns";

export type HeroImg = { src: string; alt: string; caption: string; place?: string; pos?: string };

const PR = "/images/projects";
const HA = (n: number) => `${PR}/home-addition-exterior-lynnfield-ma-${String(n).padStart(2, "0")}.webp`;
const MAN = (n: number) => `${PR}/kitchen-remodel-mansfield-ma-${String(n).padStart(2, "0")}.webp`;
const BATH = (n: number) => `${PR}/bathroom-remodels-${String(n).padStart(2, "0")}.webp`;
const SAL = (n: number) => `${PR}/deck-salem-nh-${String(n).padStart(2, "0")}.webp`;

const trim = (s: string) => s.replace(/\.\s*$/, "");
/** Project photos by src, with the project's real town (none for "Massachusetts", i.e. town not recorded). */
const FROM_PROJECTS = new Map(
  projects.flatMap((p) => p.photos.map((ph) => [ph.src, { alt: ph.alt, caption: trim(ph.caption), place: p.location === "Massachusetts" ? undefined : p.location }] as const)),
);

/** The hero record of a real job photo, with its true caption and place. Fails the build for an unknown photo. */
export function heroImg(src: string, pos?: string): HeroImg {
  const a = PHOTO_CAPTIONS[src];
  const b = FROM_PROJECTS.get(src);
  if (!a && !b) throw new Error(`hero-photos: ${src} has no caption in lib/services.ts or lib/projects.ts`);
  return { src, alt: (a ?? b)!.alt, caption: trim((a ?? b)!.caption), place: a?.place ?? b?.place, pos };
}

/** Service hubs and service×town pages. Never the photo that leads the hub's "Our work" section (getContent().hero),
 *  so a hub never shows the same photo twice. Painting and whole-home have no job photos yet (owner items O3–O5,
 *  O14): they borrow a finished photo from another job, captioned with that job. */
export const SERVICE_HERO: Record<ServiceSlug, HeroImg> = {
  siding: heroImg(HA(17), "50% 35%"),
  "window-replacement": heroImg(HA(5), "50% 40%"),
  "door-installation": heroImg(HA(19), "50% 55%"),
  decks: heroImg(SAL(5), "50% 60%"),
  "exterior-painting": heroImg(HA(11), "50% 40%"),
  "kitchen-remodeling": heroImg(MAN(2), "50% 50%"),
  "bathroom-remodeling": heroImg(BATH(1), "50% 50%"),
  "home-additions": heroImg(HA(7), "50% 40%"),
  "home-remodeling": heroImg(MAN(3), "50% 45%"),
  "interior-painting": heroImg(BATH(4), "50% 50%"),
};

/** City hubs: the town's own job photo when there is one, otherwise a finished photo from the pool, chosen by the
 *  town's slug so neighbouring towns do not all show the same picture. */
const TOWN_POOL = [MAN(1), SAL(2), BATH(1), HA(17), MAN(4), BATH(3), SAL(5), HA(11), MAN(2), BATH(4)].map((s) => heroImg(s));
export function townHero(c: City): HeroImg {
  const own = projects.find((p) => { const t = projectTown(p); return t && citySlug(t) === citySlug(c); });
  if (own) {
    const ph = own.photos.find((x) => x.src === own.cover) ?? own.photos[0];
    if (ph) return heroImg(ph.src);
  }
  const slug = citySlug(c);
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TOWN_POOL[h % TOWN_POOL.length];
}

/** Case studies: the project's own cover photo (or its first photo when the cover is a video still). */
export function projectHero(slug: string): HeroImg | undefined {
  const p = projects.find((x) => x.slug === slug);
  if (!p) return undefined;
  const ph = p.photos.find((x) => x.src === p.cover) ?? p.photos[0];
  return ph ? heroImg(ph.src) : undefined;
}

/** Fixed pages. */
export const PAGE_HERO = {
  services: heroImg(HA(18), "50% 35%"),
  serviceAreas: heroImg(HA(12), "50% 40%"),
  gallery: heroImg(SAL(2)),
  blog: heroImg(BATH(1)),
  about: heroImg(HA(16), "50% 40%"),
  owner: heroImg(HA(12), "50% 40%"),
  faq: heroImg(MAN(2)),
  reviews: heroImg(SAL(5), "50% 60%"),
  contact: heroImg(MAN(1)),
} satisfies Record<string, HeroImg>;
