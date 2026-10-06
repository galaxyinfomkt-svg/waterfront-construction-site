import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
import { EstimateLink } from "@/components/chrome-client";
import { ArrowLabel, PhoneIcon, PinIcon } from "@/components/chrome-icons";
import Typeset from "@/components/Typeset";
import { projects, getProject, imageAlt, imageCaption, mediaCount, type Project, type ProjectVideo } from "@/lib/projects";
import { site, services, citySlug, cityLabel } from "@/lib/site";
import { posts } from "@/lib/posts";
import { townFacts, projectTown, placeLabel, milesBetween, isNH } from "@/lib/towns";
import { VIDEO_FACTS, PROJECT_PUBLISHED } from "@/lib/media-facts";
import { pageMeta, ogFor } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, projectNodes, pageUrl, type Crumb } from "@/lib/schema";

// /projects/[slug] — a truthful case study (audit 05 PG-H1…PG-M6, 08 §5.7, 10 H1/L3/L4/M3):
// answer-first summary, facts computed from data (town, county, distance, media counts), what we did,
// photos grouped by stage in chronological order with true captions, videos with written descriptions,
// links to the service hub(s) and the matching service-by-town pages, and more projects.
// Everything renders server-side and outside scroll animations so it is readable at first paint.

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

const path = (p: Project) => `/projects/${p.slug}`;
const published = (p: Project) => PROJECT_PUBLISHED[p.slug];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return pageMeta({
    title: p.seoTitle,
    description: p.metaDescription,
    path: path(p),
    image: ogFor(`project-${p.slug}`, imageAlt(p, p.ogSource) || p.title),
    article: { published: published(p), modified: p.updated, section: "Project case studies" },
  });
}

// ---------- helpers ----------
const dateLabel = (iso: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(iso));
const secondsLabel = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`);
const uniqueVideos = (p: Project) => p.videos.filter((v) => !VIDEO_FACTS[v.src]?.duplicateOf);
const totalSeconds = (p: Project) => uniqueVideos(p).reduce((a, v) => a + (VIDEO_FACTS[v.src]?.seconds ?? 0), 0);
const svcOf = (slug: string) => services.find((s) => s.slug === slug);

// Guides that exist in lib/posts.ts, per service (audit 05 PG-H3 table).
const GUIDES: Record<string, string[]> = {
  "home-additions-remodeling": ["home-addition-cost-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts"],
  "kitchen-bathroom-remodeling": ["kitchen-remodel-cost-massachusetts", "bathroom-remodel-cost-massachusetts"],
  decks: ["deck-cost-massachusetts", "do-you-need-a-permit-to-remodel-massachusetts"],
  siding: ["siding-replacement-cost-massachusetts", "vinyl-vs-fiber-cement-siding"],
  "windows-and-doors": ["window-replacement-cost-massachusetts", "signs-you-need-new-windows"],
};
function guidesFor(p: Project) {
  const slugs = [...new Set(p.services.flatMap((s) => GUIDES[s] ?? []))];
  return slugs.map((g) => posts.find((x) => x.slug === g)).filter((x): x is (typeof posts)[number] => Boolean(x)).slice(0, 4);
}

/** Other projects: same service first, then nearest town; projects without a town last. */
function moreProjects(p: Project, limit = 4): Project[] {
  const town = projectTown(p);
  const dist = (o: Project) => {
    const t = projectTown(o);
    return town && t ? milesBetween(town, t) : Number.POSITIVE_INFINITY;
  };
  return projects
    .filter((o) => o.slug !== p.slug)
    .map((o) => ({ o, shared: o.services.some((s) => p.services.includes(s)) ? 1 : 0, d: dist(o) }))
    .sort((a, b) => b.shared - a.shared || a.d - b.d)
    .slice(0, limit)
    .map((x) => x.o);
}

function posterSrc(v: ProjectVideo) {
  // Optimized poster (posters load eagerly even with preload="none"; audit 05 PG-M3).
  const f = VIDEO_FACTS[v.src];
  const w = 320; // displayed ≤ 320–380 CSS px gives a 640w source at 2x
  const h = f ? Math.round((w * f.h) / f.w) : Math.round((w * 16) / 9);
  return getImageProps({ src: v.poster, alt: "", width: w, height: h, quality: 60 }).props.src;
}

function VideoFigure({ v, id, large = false }: { v: ProjectVideo; id: string; large?: boolean }) {
  const f = VIDEO_FACTS[v.src];
  return (
    <figure className={large ? "w-full max-w-[300px] mx-0" : ""}>
      <video
        controls
        muted
        playsInline
        preload="none"
        poster={posterSrc(v)}
        width={f?.w}
        height={f?.h}
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        className="w-full h-auto aspect-[9/16] bg-scrim object-cover"
      >
        <source src={v.src} type="video/mp4" />
      </video>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted">
        <strong id={`${id}-t`} className="mb-1 block font-display text-[1.125rem] font-normal leading-snug text-navy">{v.title}</strong>
        {f && <span>{secondsLabel(f.seconds)}, no sound. </span>}
        <span id={`${id}-d`}>{v.description}</span>
      </figcaption>
    </figure>
  );
}

/** Site-video grid columns (sm and lg) chosen from the clip count, so the last row never holds a lone clip:
 *  lg: 5 clips in one row of 5, multiples of 3 in rows of 3, otherwise rows of 4 (5 or 3 when 4 would leave one over).
 *  sm: rows of 2 for even counts; odd counts use rows of 3 unless that also leaves one over. */
function videoCols(n: number) {
  const lone = (c: number) => n > c && n % c === 1;
  const lg = n === 5 ? 5 : n % 3 === 0 ? 3 : !lone(4) ? 4 : !lone(5) ? 5 : 3;
  const sm = n % 2 === 0 || lone(3) ? 2 : 3;
  return `${sm === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"} ${lg === 5 ? "lg:grid-cols-5" : lg === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`;
}

/** Same-surface join: a hairline on the shared left edge between two neighbouring bands of the same colour. */
function Join() {
  return (
    <div className="container-x">
      <div className="border-t border-line" />
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const town = projectTown(p);
  const facts = town ? townFacts(town) : undefined;
  const svcs = p.services.map(svcOf).filter((s): s is NonNullable<ReturnType<typeof svcOf>> => Boolean(s));
  const primary = svcs[0];
  const videos = uniqueVideos(p);
  const videoFirst = p.photos.length === 0 && videos.length > 0;
  const heroVideo = videoFirst ? videos[0] : undefined;
  const restVideos = videoFirst ? videos.slice(1) : videos;
  const guides = guidesFor(p);
  const others = moreProjects(p);
  const nearby = facts ? facts.nearest.slice(0, 6) : [];
  const secs = totalSeconds(p);

  // ---------- structured data (one graph; every value visible on this page) ----------
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Projects", path: "/gallery" }, { name: p.shortTitle, path: path(p) }];
  const u = pageUrl(path(p));
  // Visible caption per image: a photo's own caption wins; a poster-only still takes its video's visible title.
  const captionOf = new Map<string, string>([
    ...p.videos.map((v) => [v.poster, v.title] as [string, string]),
    ...p.photos.map((x) => [x.src, x.caption] as [string, string]),
  ]);
  const caseNodes = projectNodes(p, { videoText: (v) => ({ name: v.title, description: v.description }) }).map((node) => {
    if (node["@type"] === "Article") return { ...node, dateModified: p.updated }; // substantive rewrite date
    if (node["@type"] === "ImageObject") {
      const src = String(node.contentUrl ?? "").replace(/^https?:\/\/[^/]+/, "");
      const cap = captionOf.get(src);
      return cap ? { ...node, caption: cap } : node;
    }
    return node;
  });
  const ld = pageGraph([
    webPageNode({
      path: path(p), name: p.title, description: p.blurb,
      about: { "@id": `${u}#article` }, mainEntity: { "@id": `${u}#article` },
      primaryImage: p.cover, datePublished: published(p), dateModified: p.updated,
    }),
    breadcrumbNode(crumbs),
    ...caseNodes,
  ]);

  const heroImg = !videoFirst ? { src: p.cover, alt: imageAlt(p, p.cover), caption: imageCaption(p, p.cover) } : undefined;
  const placeText = town ? `${placeLabel(town)}${facts ? ` (${facts.county})` : ""}` : `${p.location} (not listed by town)`;

  // Section surfaces (design spec §6 Project): glance paper, stages stone, videos paper, quote paper, related stone,
  // more projects stone. Two rendered neighbours on the same surface are separated by a hairline join, never a tint.
  // The mid-page form band ("form") follows the photo stages (the middle of the page), or the overview on a job
  // without photos. It takes the surface opposite the band before it, and the band after it flips if it would
  // otherwise match, so the form band never shares a surface with a neighbour.
  const bands: [string, "paper" | "stone"][] = [["glance", "paper"]];
  if (p.photos.length > 0) bands.push(["stages", "stone"]);
  bands.push(["form", "stone"]);
  if (restVideos.length > 0) bands.push(["videos", "paper"]);
  if (p.quote) bands.push(["quote", "paper"]);
  bands.push(["related", "stone"]);
  if (others.length > 0) bands.push(["more", "stone"]);
  const fi = bands.findIndex(([k]) => k === "form");
  bands[fi][1] = bands[fi - 1][1] === "paper" ? "stone" : "paper";
  if (bands[fi + 1][1] === bands[fi][1]) bands[fi + 1][1] = bands[fi][1] === "paper" ? "stone" : "paper";
  const tone = (key: string) => bands.find(([k]) => k === key)?.[1] ?? "paper";
  const bg = (key: string) => (tone(key) === "stone" ? "bg-stone" : "bg-paper");
  const joined = (key: string) => {
    const i = bands.findIndex(([k]) => k === key);
    return i > 0 && bands[i - 1][1] === bands[i][1];
  };
  // CTA rows (never right before the form band or the closing navy band): after the story (overview) when the
  // stages sit between it and the form band, after the videos, and after the related links when the page would
  // otherwise have only one.
  const ctaGlance = p.photos.length > 0;
  const ctaVideos = restVideos.length > 0;
  const ctaRelated = Number(ctaGlance) + Number(ctaVideos) < 2 && others.length > 0;
  const relatedCols = 1 + (town ? 1 : 0) + (guides.length > 0 ? 1 : 0);
  const linkNav = "link-nav font-medium";

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — text first, with the cover photo (or, on a video-only job, the first clip) under it on the left (7/12);
          the bare estimate form (the page's ONE EstimateForm) in the right 5/12 from lg. On phones the form follows
          the hero text, then the photo. */}
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 lg:row-start-1 min-w-0">
            <Breadcrumbs items={crumbs} />
            <div className="mt-6 eyebrow flex items-center gap-2">
              <PinIcon className="w-3.5 h-3.5" />
              <ul className="dot-list">
                <li>{town ? cityLabel(town) : p.location}</li>
                <li>{p.category}</li>
              </ul>
            </div>
            <h1 className="mt-5 text-h1 text-navy text-balance"><Typeset text={p.title} /></h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[36em]">{p.blurb}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <EstimateLink className="btn btn-primary w-full sm:w-auto lg:hidden">Get a free estimate</EstimateLink>
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
            </div>
            <p className="mt-5 text-[13px] text-muted">Updated <time dateTime={p.updated}>{dateLabel(p.updated)}</time></p>
          </div>
          <EstimateForm className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 self-start min-w-0" />
          {heroImg && (
            <figure className="lg:col-span-7 lg:row-start-2 min-w-0">
              <div className="relative overflow-hidden bg-well aspect-[3/2]">
                <Image src={heroImg.src} alt={heroImg.alt} fill loading="eager" quality={60} sizes="(min-width: 1200px) 640px, (min-width: 1024px) 54vw, 100vw" className="object-cover" />
              </div>
              {heroImg.caption && <figcaption className="mt-3 text-[13px] leading-relaxed text-muted">{heroImg.caption}</figcaption>}
            </figure>
          )}
          {heroVideo && (
            <div className="lg:col-span-7 lg:row-start-2 min-w-0">
              <h2 className="sr-only">Site video</h2>
              <VideoFigure v={heroVideo} id="video-1" large />
            </div>
          )}
        </div>
      </section>

      {/* AT A GLANCE + WHAT WE DID — answer-first, server-rendered, never faded */}
      <section className="section-doc bg-paper" aria-labelledby="overview-h">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-5">
            <h2 id="overview-h" className="text-h2-doc text-navy">Project at a glance</h2>
            <dl className="mt-8 border-t border-line">
              <div className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line">
                <dt className="eyebrow pt-0.5">Location</dt>
                <dd className="text-[15.5px] text-ink">{placeText}</dd>
              </div>
              {facts && !facts.isBase && (
                <div className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line">
                  <dt className="eyebrow pt-0.5">Distance</dt>
                  <dd className="text-[15.5px] text-ink">About {facts.miles} miles {facts.dir} of our Northborough, MA base (straight line)</dd>
                </div>
              )}
              <div className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line">
                <dt className="eyebrow pt-0.5">{svcs.length > 1 ? "Services" : "Service"}</dt>
                <dd className="text-[15.5px] text-ink">
                  {svcs.map((s, i) => (
                    <span key={s.slug}>{i > 0 && ", "}<Link href={`/services/${s.slug}`} className="link">{s.short}</Link></span>
                  ))}
                </dd>
              </div>
              {p.completed && (
                <div className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line">
                  <dt className="eyebrow pt-0.5">Completed</dt>
                  <dd className="text-[15.5px] text-ink">{p.completed}</dd>
                </div>
              )}
              {p.durationWeeks && (
                <div className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line">
                  <dt className="eyebrow pt-0.5">Duration</dt>
                  <dd className="text-[15.5px] text-ink">About {p.durationWeeks} weeks</dd>
                </div>
              )}
              {p.permit && (
                <div className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line">
                  <dt className="eyebrow pt-0.5">Permit</dt>
                  <dd className="text-[15.5px] text-ink">{p.permit.authority}{p.permit.number ? `, permit ${p.permit.number}` : ""}{p.permit.finalInspection ? "; final inspection passed" : ""}</dd>
                </div>
              )}
              <div className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line">
                <dt className="eyebrow pt-0.5">Documented</dt>
                <dd className="text-[15.5px] text-ink">{mediaCount(p)}{secs > 0 ? ` (${secondsLabel(secs)} of video, no sound)` : ""}</dd>
              </div>
              <div className="grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line">
                <dt className="eyebrow pt-0.5">Published</dt>
                <dd className="text-[15.5px] text-ink"><time dateTime={published(p)}>{dateLabel(published(p))}</time></dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-h2-doc text-navy">{p.scopeHeading}</h2>
            <ul role="list" className="mt-8 dash-list space-y-3 text-ink max-w-[68ch]">
              {p.scope.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {p.materials && p.materials.length > 0 && (
              <>
                <h3 className="mt-12 text-h3s text-navy">Materials</h3>
                <ul role="list" className="mt-4 dash-list space-y-1.5 text-ink max-w-[68ch]">{p.materials.map((m) => <li key={m}>{m}</li>)}</ul>
              </>
            )}
            <h3 className="mt-12 text-h3s text-navy">About {p.photos.length ? "these photos" : videos.length > 1 ? "these videos" : "this video"}</h3>
            {p.notes.map((t) => <p key={t} className="mt-3 text-ink max-w-[68ch]">{t}</p>)}
          </div>
        </div>
        {ctaGlance && (
          <div className="container-x">
            <CtaRow className="mt-14" />
          </div>
        )}
      </section>

      {/* PHOTOS BY STAGE — chronological, with a true caption under every photo */}
      {p.photos.length > 0 && (
        <section className={`section-doc ${bg("stages")}`} aria-labelledby="photos-h">
          <div className="container-x">
            <h2 id="photos-h" className="text-h2-doc text-navy">
              {p.stages.length > 1 ? "The job, stage by stage" : "Photos"}
            </h2>
            <p className="mt-5 text-muted max-w-[38rem]">{`${p.photos.length} photo${p.photos.length === 1 ? "" : "s"}${p.stages.length > 1 ? ", in the order the work happened" : ""}. Select a photo to see it larger.`}</p>
            {p.stages.map((st, i) => {
              const ph = p.photos.filter((x) => x.stage === st.id);
              if (!ph.length) return null;
              return (
                <div key={st.id} className={p.stages.length > 1 ? "mt-16 border-t border-line pt-8" : "mt-10"}>
                  {p.stages.length > 1 && (
                    <h3 className="text-h3 text-navy">
                      <span aria-hidden="true" className="block eyebrow tnum mb-2">{String(i + 1).padStart(2, "0")}</span> {st.label}
                    </h3>
                  )}
                  {st.note && <p className="mt-3 text-muted max-w-[68ch]">{st.note}</p>}
                  <div className={p.stages.length > 1 || st.note ? "mt-8" : ""}>
                    <Gallery photos={ph} label={`${p.shortTitle} photos`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* MID-PAGE ESTIMATE FORM — after the photo stages (or the overview), on the surface opposite its neighbours */}
      <FormBand tone={tone("form")} />

      {/* VIDEOS — each with a written description (the clips have no sound) */}
      {restVideos.length > 0 && (
        <section className={`section-doc ${bg("videos")} ${joined("videos") ? "pt-0" : ""}`} aria-labelledby="videos-h">
          {joined("videos") && <Join />}
          <div className={`container-x ${joined("videos") ? "pt-[var(--section-doc-y)]" : ""}`}>
            <h2 id="videos-h" className="text-h2-doc text-navy">{videoFirst ? "More site videos" : "Site videos"}</h2>
            <p className="mt-5 text-muted max-w-[38rem]">
              {`${restVideos.length} short clip${restVideos.length === 1 ? "" : "s"} filmed on the job. They have no sound, so each one has a written description.`}
            </p>
            {/* Phones: a swipeable row (keeps the page short); tablet and up: a grid. */}
            {/* Focusable + named so keyboard users can scroll the phone row (axe scrollable-region-focusable; video controls do not count). */}
            <ul role="list" tabIndex={0} aria-labelledby="videos-h" className={`mt-10 -mx-5 px-5 scroll-px-5 pb-2 flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar sm:mx-0 sm:px-0 sm:pb-0 sm:grid ${videoCols(restVideos.length)} sm:gap-x-6 sm:gap-y-10 sm:overflow-visible`}>
              {restVideos.map((v, i) => (
                <li key={v.src} className="w-[72%] shrink-0 snap-start sm:w-auto">
                  <VideoFigure v={v} id={`video-${i + (videoFirst ? 2 : 1)}`} />
                </li>
              ))}
            </ul>
            {restVideos.length > 1 && <p className="mt-3 text-sm text-muted sm:hidden">Swipe to see all {restVideos.length} clips.</p>}
            {ctaVideos && <CtaRow className="mt-14" />}
          </div>
        </section>
      )}

      {/* CLIENT QUOTE — only with written consent; plain text, never Review markup */}
      {p.quote && (
        <section className={`section-doc ${bg("quote")} ${joined("quote") ? "pt-0" : ""}`}>
          {joined("quote") && <Join />}
          <div className={`container-x ${joined("quote") ? "pt-[var(--section-doc-y)]" : ""}`}>
            <figure>
              <blockquote className="font-display text-quote text-navy max-w-[40ch] [text-indent:-0.42em]">“{p.quote.text}”</blockquote>
              <figcaption className="mt-6 text-[15px] text-muted">— {p.quote.author}, shared with permission</figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* RELATED — service hubs, the service-by-town pages for this town, nearby towns, guides */}
      <section className={`section-doc ${bg("related")} ${joined("related") ? "pt-0" : ""}`} aria-labelledby="related-h">
        {joined("related") && <Join />}
        <div className={`container-x ${joined("related") ? "pt-[var(--section-doc-y)]" : ""}`}>
          <h2 id="related-h" className="text-h2-doc text-navy max-w-[24em]">Related services{town ? ` and towns near ${town.n}` : ""}</h2>
          <div className={`mt-10 grid gap-x-12 gap-y-12 md:grid-cols-2 ${relatedCols === 3 ? "lg:grid-cols-3" : ""}`}>
            <div className="border-t border-line pt-5">
              <h3 className="eyebrow">The {svcs.length > 1 ? "services" : "service"} in this project</h3>
              <ul role="list" className="mt-4 space-y-3">
                {svcs.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className={linkNav}>{s.short}</Link>
                    <span className="mt-1 block text-sm text-muted">{s.blurb}</span>
                  </li>
                ))}
              </ul>
            </div>
            {town && (
              <div className="border-t border-line pt-5">
                <h3 className="eyebrow">In {cityLabel(town)}</h3>
                <ul role="list" className="mt-4 space-y-2.5">
                  {svcs.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}/${citySlug(town)}`} className={linkNav}>{s.name} in {cityLabel(town)}</Link>
                    </li>
                  ))}
                </ul>
                {nearby.length > 0 && primary && (
                  <>
                    <h3 className="mt-10 eyebrow">{primary.name} in towns near {town.n}</h3>
                    <ul role="list" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[15px]">
                      {nearby.map(({ city, miles }) => (
                        <li key={citySlug(city)}>
                          <Link href={`/services/${primary.slug}/${citySlug(city)}`} className={linkNav}>{placeLabel(city)}</Link>{" "}
                          <span className="whitespace-nowrap text-muted tnum">({miles} mi)</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            {guides.length > 0 && (
              <div className="border-t border-line pt-5">
                <h3 className="eyebrow">Guides for this kind of project</h3>
                {town && isNH(town) && (
                  <p className="mt-3 text-sm text-muted">These guides are written for Massachusetts. New Hampshire has no statewide contractor license, and permits come from each town&apos;s building department.</p>
                )}
                <ul role="list" className="mt-4 space-y-3">
                  {guides.map((g) => (
                    <li key={g.slug}><Link href={`/blog/${g.slug}`} className={linkNav}>{g.title}</Link></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {!town && (
            <p className="mt-10 text-ink">
              This case study does not name a town. See <Link href="/service-areas" className="link">all the towns we serve</Link>.
            </p>
          )}
          {ctaRelated && <CtaRow className="mt-14" />}
        </div>
      </section>

      {/* MORE PROJECTS — same service first, then the nearest towns */}
      {others.length > 0 && (
        <section className={`section-doc ${bg("more")} ${joined("more") ? "pt-0" : ""}`} aria-labelledby="more-h">
          {joined("more") && <Join />}
          <div className={`container-x ${joined("more") ? "pt-[var(--section-doc-y)]" : ""}`}>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <h2 id="more-h" className="text-h2-doc text-navy">More projects</h2>
              <Link href="/gallery" className="link-arrow"><ArrowLabel text={`See all ${projects.length} projects`} /></Link>
            </div>
            <ul role="list" className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {others.map((o) => (
                <li key={o.slug} className="card-ed group">
                  <div className="media">
                    <Image src={o.cover} alt={imageAlt(o, o.cover)} fill quality={60} sizes="(min-width: 1200px) 285px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  {/* Place, then the media count, on two fixed lines: in four columns they would otherwise run together or wrap unevenly. */}
                  <p className="meta flex-col justify-start gap-y-1">
                    <span>{o.location}</span>
                    <span>{mediaCount(o)}</span>
                  </p>
                  <h3 className="text-h3s"><Link href={path(o)}>{o.title}</Link></h3>
                  <span className="link-arrow text-sm mt-auto pt-3 self-start"><ArrowLabel text="View the case study" /></span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA — the page's one navy band, last (after More projects) */}
      <section className="section bg-navy text-white on-dark">
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em]">Planning a similar project?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]">Tell us about your house and what you want to change. Estimates are free and there is no obligation.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-on-dark w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
