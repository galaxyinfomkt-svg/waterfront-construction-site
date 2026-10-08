import { SITE_URL } from "@/lib/seo";
import { site, services, allCities, citySlug, type Service } from "@/lib/site";
import { posts } from "@/lib/posts";
import { projects, projectImages, type Project } from "@/lib/projects";
import { PROJECT_PUBLISHED, VIDEO_FACTS } from "@/lib/media-facts";
import { projectTown, cityHubPath, CITY_HUBS_UPDATED } from "@/lib/towns";
import { townCopy } from "@/lib/town-copy";
import { areaCopy } from "@/lib/area-copy";
import { getContent, serviceProjects, projectCardImage } from "@/lib/service-content";
import { townPageIndexed } from "@/lib/index-policy";

// Sitemaps (audit 07 T02, 09 AEO-H5, 03 M3, 02 L3, 04 §4.4, 05 PG-L1; study 01 §4).
//
// Layout:
//   /sitemap.xml               sitemap INDEX (app/sitemap.xml/route.ts): the one URL to submit to Google and Bing
//   /sitemap/pages.xml         every indexable page except the city hubs and the service×town pages (app/sitemap/[id]/route.ts)
//   /sitemap/areas.xml         one city hub per place we serve (/service-areas/<town>)
//   /sitemap/towns-{slug}.xml  the service×town pages of one service (one per place), so Search Console reports
//                              indexing per service
// Every count follows the data (lib/services.ts, lib/site.ts allCities): nothing here hard-codes a number.
// robots.txt lists the index and every child (app/robots.ts).
//
// Why route handlers and not app/sitemap.ts: Next.js never writes a sitemap index, and Turbopack refuses an
// app/sitemap.ts (even with generateSitemaps) next to an app/sitemap.xml route ("Conflicting route and metadata
// at /sitemap.xml"). Writing the XML here also fixes two gaps of Next's serializer: it escapes nothing, and it
// puts <image:image>/<video:video> before <lastmod>, against the sitemap schema's element order.
//
// Rules:
// - URLs are absolute, canonical and indexable only (no /thank-you, no redirected or renamed slugs).
// - lastmod is the real date of the last SUBSTANTIVE change (main content, structured data or links), read from
//   the same field that drives the page's visible "Updated" date and its JSON-LD dateModified. Never new Date():
//   identical, always-new dates are not "consistently and verifiably accurate" and get ignored.
// - No <changefreq> or <priority>: Google ignores both.
// - Images: only photos actually shown on that page, and only the company's own job photos (never the stock
//   files in /images/*.jpg). A town page or city hub lists a photo only when it was taken in that same town.

export type Video = { title: string; description: string; thumbnail: string; content: string; seconds: number; published: string };
export type Entry = { url: string; lastmod: string; images?: string[]; videos?: Video[] };

// ---------- dates ----------
/** Last substantive change of the site pages rewritten together in the 2026-10-05 SEO/content overhaul
 *  (home, /about, /about/ernando-nunes, /faq, /reviews, /contact, /privacy, /terms). /service-areas was rebuilt
 *  with the city hubs and uses CITY_HUBS_UPDATED (lib/towns.ts).
 *  Equals the dateModified / visible "Last updated" constant in app/faq, app/about/ernando-nunes,
 *  app/privacy and app/terms (git: those pages were rewritten in the working tree on 2026-10-05).
 *  Bump ONLY for a substantive change to one of these pages — and then give that page its own value. */
const SITE_PAGES_UPDATED = "2026-10-05T10:00:09-04:00";

const BUILD_TIME = Date.now();
const instant = (iso: string) => {
  const t = Date.parse(iso);
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/.test(iso) || Number.isNaN(t)) {
    throw new Error(`app/sitemap: "${iso}" is not a W3C/ISO 8601 date`);
  }
  return t;
};
/** The most recent of several ISO 8601 dates, compared as instants (offsets differ), kept in its original form.
 *  A date in the future (a typo, or a value set ahead of the deploy) is clamped to the build time. */
function lastmod(...dates: (string | undefined)[]): string {
  const list = dates.filter((d): d is string => Boolean(d));
  if (!list.length) throw new Error("app/sitemap: a page has no last-modified date");
  const newest = list.reduce((a, b) => (instant(b) > instant(a) ? b : a));
  if (instant(newest) <= BUILD_TIME) return newest;
  console.warn(`app/sitemap: last-modified date ${newest} is in the future; using the build time instead`);
  return new Date(BUILD_TIME).toISOString().replace(/\.\d{3}Z$/, "Z");
}
/** Newest lastmod of a list of entries (the index uses it for each child sitemap). */
export const newest = (entries: Entry[]) => lastmod(...entries.map((e) => e.lastmod));

// ---------- URLs ----------
const SAFE_URL = /^https:\/\/[a-z0-9.-]+(\/[A-Za-z0-9._~\/-]*)?$/;
/** Absolute URL for a site path; fails the build on characters that have no place in a clean URL. */
function url(path: string): string {
  const u = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  if (!SAFE_URL.test(u)) throw new Error(`app/sitemap: unsafe URL for a sitemap: ${u}`);
  return u;
}
/** The company's own job photos (public/images/projects). Stock images live in /images/*.jpg and never qualify. */
const isOwnPhoto = (src: string) => src.startsWith("/images/projects/");
const ownImages = (srcs: (string | undefined)[]) => [...new Set(srcs.filter((s): s is string => Boolean(s) && isOwnPhoto(s!)))].map(url);
const withImages = (list: string[]) => (list.length ? { images: list } : {});
const clip = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

// ---------- what each template shows (mirrors the page code; keep in sync) ----------

/** Service hub (app/services/[slug]/page.tsx): hero photo → one photo per case-study card → the gallery. */
function hubImages(s: Service): string[] {
  const shown = new Set<string>();
  const hero = getContent(s.slug)?.hero;
  if (hero) shown.add(hero.src);
  for (const p of serviceProjects(s.slug)) shown.add(projectCardImage(p, shown).src);
  for (const g of s.gallery) shown.add(g.src);
  return ownImages([...shown]);
}

/** Blog post (app/blog/[slug]/page.tsx): the lead photo plus every in-article figure. */
const postImages = (p: (typeof posts)[number]) =>
  ownImages([p.image, ...p.sections.flatMap((sec) => sec.blocks.flatMap((b) => ("figure" in b ? [b.figure.src] : [])))]);

/** Case-study clips with their visible title and description (= the VideoObject in the page's JSON-LD). */
function projectVideos(p: Project): Video[] {
  return p.videos.flatMap((v) => {
    const f = VIDEO_FACTS[v.src];
    if (!f || f.duplicateOf) return [];
    return [{ title: clip(v.title, 100), description: clip(v.description, 2048), thumbnail: url(v.poster), content: url(v.src), seconds: Math.max(1, Math.round(f.seconds)), published: f.published }];
  });
}

const projectByPath = new Map(projects.map((p) => [`/projects/${p.slug}`, p]));
/** Service×town page: only the photos it shows that were taken in that same town (hero + case-study cards).
 *  Cards with a project from another town (the "nearest documented project" proof) are left out on purpose. */
function townImages(townSlug: string, k: ReturnType<typeof townCopy>): string[] {
  const takenHere = (href: string) => {
    const p = projectByPath.get(href);
    const t = p && projectTown(p);
    return Boolean(t && citySlug(t) === townSlug);
  };
  const srcs: string[] = [];
  if (k.heroImage && takenHere(k.heroImage.href)) srcs.push(k.heroImage.src);
  for (const card of k.proof.cards) if (card.img && takenHere(card.href)) srcs.push(card.img);
  return ownImages(srcs);
}

/** City hub (app/service-areas/[town]/page.tsx): only the photo cards, which show photos taken in that same place. */
const areaImages = (k: ReturnType<typeof areaCopy>) => ownImages(k.photoCards.map((card) => card.img));

// ---------- the sitemaps ----------
const TOWNS = "towns-";
const AREAS = "areas";
/** Child sitemap ids, in index order: /sitemap/{id}.xml */
export const sitemapIds = () => ["pages", AREAS, ...services.map((s) => `${TOWNS}${s.slug}`)];

function pageEntries(): Entry[] {
  const hubs: Entry[] = services.map((s) => ({ url: url(`/services/${s.slug}`), lastmod: lastmod(s.updated), ...withImages(hubImages(s)) }));
  const cases: Entry[] = projects.map((p) => {
    const videos = projectVideos(p);
    return { url: url(`/projects/${p.slug}`), lastmod: lastmod(PROJECT_PUBLISHED[p.slug], p.updated), ...withImages(ownImages(projectImages(p))), ...(videos.length ? { videos } : {}) };
  });
  const guides: Entry[] = posts.map((p) => ({ url: url(`/blog/${p.slug}`), lastmod: lastmod(p.published, p.modified), ...withImages(postImages(p)) }));
  // The owner's real headshot, once supplied (site.ownerPhoto), is shown on his profile page.
  const ownerPhoto = site.ownerPhoto ? [url(site.ownerPhoto)] : [];

  return [
    { url: url("/"), lastmod: lastmod(SITE_PAGES_UPDATED) },
    { url: url("/services"), lastmod: lastmod(...services.map((s) => s.updated)) },
    ...hubs,
    { url: url("/service-areas"), lastmod: lastmod(CITY_HUBS_UPDATED) },
    { url: url("/gallery"), lastmod: lastmod(...projects.map((p) => p.updated)) },
    ...cases,
    { url: url("/blog"), lastmod: lastmod(...posts.map((p) => p.modified)) },
    ...guides,
    { url: url("/faq"), lastmod: lastmod(SITE_PAGES_UPDATED) },
    { url: url("/about"), lastmod: lastmod(SITE_PAGES_UPDATED) },
    { url: url("/about/ernando-nunes"), lastmod: lastmod(SITE_PAGES_UPDATED), ...withImages(ownerPhoto) },
    { url: url("/reviews"), lastmod: lastmod(SITE_PAGES_UPDATED) },
    { url: url("/contact"), lastmod: lastmod(SITE_PAGES_UPDATED) },
    { url: url("/privacy"), lastmod: lastmod(SITE_PAGES_UPDATED) },
    { url: url("/terms"), lastmod: lastmod(SITE_PAGES_UPDATED) },
  ];
}

// Only the service×town pages offered to search engines (lib/index-policy.ts); the noindex ones stay out.
function townEntries(s: Service): Entry[] {
  return allCities.filter((c) => townPageIndexed(s.slug, c)).map((c) => {
    const slug = citySlug(c);
    const k = townCopy(s, c); // the page's own data: its visible "Updated" date and the photos it shows
    return { url: url(`/services/${s.slug}/${slug}`), lastmod: lastmod(k.updated.iso), ...withImages(townImages(slug, k)) };
  });
}

/** The city hubs: one per place, dated by the hub template's own "Updated" constant. */
function areaEntries(): Entry[] {
  return allCities.map((c) => {
    const k = areaCopy(c); // the page's own data: its visible "Updated" date and the photos it shows
    return { url: url(cityHubPath(c)), lastmod: lastmod(k.updated.iso), ...withImages(areaImages(k)) };
  });
}

/** The entries of one child sitemap, or undefined for an unknown id. */
export function sitemapEntries(id: string): Entry[] | undefined {
  if (id === "pages") return pageEntries();
  if (id === AREAS) return areaEntries();
  const s = services.find((x) => `${TOWNS}${x.slug}` === id);
  return s ? townEntries(s) : undefined;
}

// ---------- XML ----------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>';
const NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

/** <urlset>: <loc> and <lastmod> first (sitemap schema order), then image and video extensions. */
export function urlsetXml(entries: Entry[]): string {
  const img = entries.some((e) => e.images?.length) ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : "";
  const vid = entries.some((e) => e.videos?.length) ? ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"' : "";
  const out = [XML_HEAD, `<urlset ${NS}${img}${vid}>`];
  for (const e of entries) {
    out.push("<url>", `<loc>${esc(e.url)}</loc>`, `<lastmod>${esc(e.lastmod)}</lastmod>`);
    for (const i of e.images ?? []) out.push(`<image:image><image:loc>${esc(i)}</image:loc></image:image>`);
    for (const v of e.videos ?? []) {
      out.push(
        "<video:video>",
        `<video:thumbnail_loc>${esc(v.thumbnail)}</video:thumbnail_loc>`,
        `<video:title>${esc(v.title)}</video:title>`,
        `<video:description>${esc(v.description)}</video:description>`,
        `<video:content_loc>${esc(v.content)}</video:content_loc>`,
        `<video:duration>${v.seconds}</video:duration>`,
        `<video:publication_date>${esc(v.published)}</video:publication_date>`,
        "</video:video>",
      );
    }
    out.push("</url>");
  }
  out.push("</urlset>", "");
  return out.join("\n");
}

/** <sitemapindex> of the child sitemaps, each with the newest lastmod inside it. */
export function indexXml(children: { loc: string; lastmod: string }[]): string {
  return [XML_HEAD, `<sitemapindex ${NS}>`, ...children.map((c) => `<sitemap><loc>${esc(c.loc)}</loc><lastmod>${esc(c.lastmod)}</lastmod></sitemap>`), "</sitemapindex>", ""].join("\n");
}

export const childUrl = (id: string) => `${SITE_URL}/sitemap/${id}.xml`;

export function xmlResponse(body: string) {
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, must-revalidate" } });
}
