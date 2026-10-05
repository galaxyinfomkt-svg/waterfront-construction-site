import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, PinIcon } from "@/components/chrome-icons";
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
// links to the service hub(s) and the matching service×town pages, and more projects.
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
  const w = 320; // displayed ≤ 320–380 CSS px → 640w source at 2x
  const h = f ? Math.round((w * f.h) / f.w) : Math.round((w * 16) / 9);
  return getImageProps({ src: v.poster, alt: "", width: w, height: h, quality: 60 }).props.src;
}

function VideoFigure({ v, id, large = false }: { v: ProjectVideo; id: string; large?: boolean }) {
  const f = VIDEO_FACTS[v.src];
  return (
    <figure className={large ? "w-full max-w-[320px] mx-auto lg:mx-0" : ""}>
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
        className="w-full h-auto aspect-[9/16] rounded-xl bg-navy object-cover shadow-card"
      >
        <source src={v.src} type="video/mp4" />
      </video>
      <figcaption className={`mt-3 text-sm leading-relaxed ${large ? "text-white/85" : "text-ink/80"}`}>
        <strong id={`${id}-t`} className={`block text-base ${large ? "text-white" : "text-navy"}`}>{v.title}</strong>
        {f && <span className={large ? "text-white/75" : "text-ink/70"}>{secondsLabel(f.seconds)}, no sound. </span>}
        <span id={`${id}-d`}>{v.description}</span>
      </figcaption>
    </figure>
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

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — text first; the cover photo (or, on a video-only job, the first clip) beside it */}
      <section className="relative overflow-hidden mesh text-white">
        <div className="container-x py-10 md:py-14 grid gap-8 lg:gap-12 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
          <div>
            <Breadcrumbs items={crumbs} />
            <p className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-1.5 text-sm">
              <PinIcon className="w-4 h-4" /> {town ? cityLabel(town) : p.location} · {p.category}
            </p>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl">{p.title}</h1>
            <p className="mt-5 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">{p.blurb}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact#estimate" className="btn btn-green text-base">Get a free estimate</Link>
              <a href={site.phoneHref} className="btn btn-outline text-base"><PhoneIcon className="w-4 h-4" /> {site.phone}</a>
            </div>
            <p className="mt-5 text-sm text-white/75">Updated <time dateTime={p.updated}>{dateLabel(p.updated)}</time></p>
          </div>
          {heroImg && (
            <figure className="w-full lg:max-w-md lg:justify-self-end">
              <div className="relative overflow-hidden rounded-2xl shadow-card ring-1 ring-white/20 bg-navy aspect-[4/3] lg:aspect-[4/5]">
                <Image src={heroImg.src} alt={heroImg.alt} fill preload quality={60} sizes="(min-width: 1024px) 448px, 100vw" className="object-cover" />
              </div>
              {heroImg.caption && <figcaption className="mt-3 text-sm text-white/80 leading-relaxed">{heroImg.caption}</figcaption>}
            </figure>
          )}
          {heroVideo && (
            <div className="lg:justify-self-end w-full">
              <h2 className="sr-only">Site video</h2>
              <VideoFigure v={heroVideo} id="video-1" large />
            </div>
          )}
        </div>
      </section>

      {/* AT A GLANCE + WHAT WE DID — answer-first, server-rendered, never faded */}
      <section className="py-12 md:py-16 bg-white" aria-labelledby="overview-h">
        <div className="container-x grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <h2 id="overview-h" className="text-2xl md:text-3xl font-extrabold text-navy">Project at a glance</h2>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-[15px]">
              <dt className="font-bold text-navy">Location</dt>
              <dd className="text-ink/85">{placeText}</dd>
              {facts && !facts.isBase && (
                <>
                  <dt className="font-bold text-navy">Distance</dt>
                  <dd className="text-ink/85">About {facts.miles} miles {facts.dir} of our Northborough, MA base (straight line)</dd>
                </>
              )}
              <dt className="font-bold text-navy">{svcs.length > 1 ? "Services" : "Service"}</dt>
              <dd className="text-ink/85">
                {svcs.map((s, i) => (
                  <span key={s.slug}>{i > 0 && ", "}<Link href={`/services/${s.slug}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{s.short}</Link></span>
                ))}
              </dd>
              {p.completed && (<><dt className="font-bold text-navy">Completed</dt><dd className="text-ink/85">{p.completed}</dd></>)}
              {p.durationWeeks && (<><dt className="font-bold text-navy">Duration</dt><dd className="text-ink/85">About {p.durationWeeks} weeks</dd></>)}
              {p.permit && (
                <>
                  <dt className="font-bold text-navy">Permit</dt>
                  <dd className="text-ink/85">{p.permit.authority}{p.permit.number ? `, permit ${p.permit.number}` : ""}{p.permit.finalInspection ? "; final inspection passed" : ""}</dd>
                </>
              )}
              <dt className="font-bold text-navy">Documented</dt>
              <dd className="text-ink/85">{mediaCount(p)}{secs > 0 ? ` (${secondsLabel(secs)} of video, no sound)` : ""}</dd>
              <dt className="font-bold text-navy">Published</dt>
              <dd className="text-ink/85"><time dateTime={published(p)}>{dateLabel(published(p))}</time></dd>
            </dl>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy">{p.scopeHeading}</h2>
            <ul role="list" className="mt-5 space-y-3">
              {p.scope.map((line) => (
                <li key={line} className="flex gap-3 text-ink/85 leading-relaxed">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {p.materials && p.materials.length > 0 && (
              <>
                <h3 className="mt-8 text-lg font-bold text-navy">Materials</h3>
                <ul role="list" className="mt-2 list-disc pl-5 text-ink/85 space-y-1">{p.materials.map((m) => <li key={m}>{m}</li>)}</ul>
              </>
            )}
            <h3 className="mt-8 text-lg font-bold text-navy">About {p.photos.length ? "these photos" : videos.length > 1 ? "these videos" : "this video"}</h3>
            {p.notes.map((t) => <p key={t} className="mt-2 text-ink/80 leading-relaxed">{t}</p>)}
          </div>
        </div>
      </section>

      {/* PHOTOS BY STAGE — chronological, with a true caption under every photo */}
      {p.photos.length > 0 && (
        <section className="py-12 md:py-16 bg-tint-blue" aria-labelledby="photos-h">
          <div className="container-x">
            <h2 id="photos-h" className="text-2xl md:text-4xl font-extrabold text-navy">
              {p.stages.length > 1 ? "The job, stage by stage" : "Photos"}
            </h2>
            <p className="mt-2 text-ink/80">{`${p.photos.length} photo${p.photos.length === 1 ? "" : "s"}${p.stages.length > 1 ? ", in the order the work happened" : ""}. Select a photo to see it larger.`}</p>
            {p.stages.map((st, i) => {
              const ph = p.photos.filter((x) => x.stage === st.id);
              if (!ph.length) return null;
              return (
                <div key={st.id} className="mt-10">
                  {p.stages.length > 1 && (
                    <h3 className="text-xl font-extrabold text-navy">
                      <span className="text-blue">{i + 1}.</span> {st.label}
                    </h3>
                  )}
                  {st.note && <p className="mt-1 mb-5 text-ink/80">{st.note}</p>}
                  <div className={st.note ? "" : "mt-5"}>
                    <Gallery photos={ph} label={`${p.shortTitle} photos`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIDEOS — each with a written description (the clips have no sound) */}
      {restVideos.length > 0 && (
        <section className="py-12 md:py-16 bg-white" aria-labelledby="videos-h">
          <div className="container-x">
            <h2 id="videos-h" className="text-2xl md:text-4xl font-extrabold text-navy">{videoFirst ? "More site videos" : "Site videos"}</h2>
            <p className="mt-2 text-ink/80 max-w-2xl">
              {`${restVideos.length} short clip${restVideos.length === 1 ? "" : "s"} filmed on the job. They have no sound, so each one has a written description.`}
            </p>
            {/* Phones: a swipeable row (keeps the page short); tablet and up: a grid. */}
            <ul role="list" className="mt-8 -mx-5 px-5 pb-2 flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-7 sm:overflow-visible">
              {restVideos.map((v, i) => (
                <li key={v.src} className="w-[72%] shrink-0 snap-start sm:w-auto">
                  <VideoFigure v={v} id={`video-${i + (videoFirst ? 2 : 1)}`} />
                </li>
              ))}
            </ul>
            {restVideos.length > 1 && <p className="mt-3 text-sm text-ink/70 sm:hidden">Swipe to see all {restVideos.length} clips.</p>}
          </div>
        </section>
      )}

      {/* CLIENT QUOTE — only with written consent; plain text, never Review markup */}
      {p.quote && (
        <section className="py-12 bg-sand">
          <figure className="container-x max-w-3xl">
            <blockquote className="text-xl text-navy font-medium leading-relaxed">“{p.quote.text}”</blockquote>
            <figcaption className="mt-3 text-ink/80">— {p.quote.author}, shared with permission</figcaption>
          </figure>
        </section>
      )}

      {/* RELATED — service hubs, the service×town pages for this town, nearby towns, guides */}
      <section className="py-12 md:py-16 bg-sand" aria-labelledby="related-h">
        <div className="container-x">
          <h2 id="related-h" className="text-2xl md:text-3xl font-extrabold text-navy">Related services{town ? ` and towns near ${town.n}` : ""}</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold text-navy">The {svcs.length > 1 ? "services" : "service"} in this project</h3>
              <ul role="list" className="mt-3 space-y-2.5">
                {svcs.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{s.short}</Link>
                    <span className="block text-sm text-ink/75">{s.blurb}</span>
                  </li>
                ))}
              </ul>
            </div>
            {town && (
              <div>
                <h3 className="text-lg font-bold text-navy">In {cityLabel(town)}</h3>
                <ul role="list" className="mt-3 space-y-2.5">
                  {svcs.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}/${citySlug(town)}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{s.name} in {cityLabel(town)}</Link>
                    </li>
                  ))}
                </ul>
                {nearby.length > 0 && primary && (
                  <>
                    <h3 className="mt-6 text-lg font-bold text-navy">{primary.name} in towns near {town.n}</h3>
                    <ul role="list" className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[15px]">
                      {nearby.map(({ city, miles }) => (
                        <li key={citySlug(city)}>
                          <Link href={`/services/${primary.slug}/${citySlug(city)}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{placeLabel(city)}</Link>{" "}
                          <span className="text-ink/70">({miles} mi)</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            {guides.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-navy">Guides for this kind of project</h3>
                {town && isNH(town) && (
                  <p className="mt-2 text-sm text-ink/75">These guides are written for Massachusetts. New Hampshire has no statewide contractor license, and permits come from each town&apos;s building department.</p>
                )}
                <ul role="list" className="mt-3 space-y-2.5">
                  {guides.map((g) => (
                    <li key={g.slug}><Link href={`/blog/${g.slug}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{g.title}</Link></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {!town && (
            <p className="mt-8 text-ink/80">
              This case study does not name a town. See <Link href="/service-areas" className="font-semibold text-blue underline underline-offset-2 hover:text-navy">all the towns we serve</Link>.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mesh">
        <div className="container-x py-14 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">Planning a similar project?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Tell us about your house and what you want to change. Estimates are free and there is no obligation.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact#estimate" className="btn btn-green text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-white text-base"><PhoneIcon className="w-4 h-4" /> {site.phone}</a>
          </div>
        </div>
      </section>

      {/* MORE PROJECTS — same service first, then the nearest towns */}
      {others.length > 0 && (
        <section className="py-12 md:py-16 bg-tint-blue" aria-labelledby="more-h">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="more-h" className="text-2xl md:text-3xl font-extrabold text-navy">More projects</h2>
              <Link href="/gallery" className="font-semibold text-blue underline underline-offset-2 hover:text-navy">See all {projects.length} projects</Link>
            </div>
            <ul role="list" className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={path(o)} className="group card overflow-hidden pop flex h-full flex-col">
                    <div className="relative aspect-[4/3] bg-sand">
                      <Image src={o.cover} alt={imageAlt(o, o.cover)} fill quality={60} sizes="(min-width: 1200px) 285px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover zoomimg" />
                    </div>
                    <div className="p-5 flex flex-1 flex-col">
                      <span className="text-xs text-blue font-semibold uppercase tracking-wider">{o.location}</span>
                      <h3 className="font-bold text-navy text-lg mt-1 leading-snug">{o.title}</h3>
                      <span className="mt-1 text-sm text-ink/70">{mediaCount(o)}</span>
                      <span className="mt-auto pt-3 text-sm text-blue font-semibold">View the case study <span aria-hidden="true">→</span></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
