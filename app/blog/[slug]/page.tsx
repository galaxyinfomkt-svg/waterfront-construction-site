import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../blog.css";
import { posts, getPost, type Post } from "@/lib/posts";
import { site, services } from "@/lib/site";
import { projects } from "@/lib/projects";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import JsonLd from "@/components/JsonLd";
import { ArrowLabel, PhoneIcon } from "@/components/chrome-icons";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMeta, ogFor, SITE_URL } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, imageNode, placeNode, serviceId, pageUrl, OWNER_PAGE, BUSINESS_ID, type Crumb } from "@/lib/schema";
import { HeadlineSet, PostBlock, PostFigure, Rich, formatDate, plain, readTime, sameDay, wordCount } from "../_lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

// .dot-list that may wrap: every item carries the dot (the first one too) and the list is pulled left by one dot
// inside an overflow-clipped wrapper, so a wrapped line never starts with a stray dot.
const DOTS_WRAP = "min-w-0 overflow-hidden";
const DOTS_CLIP =
  "dot-list -ml-[calc(1.5em+3px)] [&>li:first-child]:before:content-[''] [&>li:first-child]:before:inline-block [&>li:first-child]:before:w-[3px] [&>li:first-child]:before:h-[3px] [&>li:first-child]:before:rounded-full [&>li:first-child]:before:bg-current [&>li:first-child]:before:opacity-60 [&>li:first-child]:before:mx-[.75em] [&>li:first-child]:before:align-[.25em]";

const BLOG_ID = `${SITE_URL}/blog#blog`;
const ogImage = (p: Post) => ogFor(`blog-${p.slug}`, p.photo.alt); // public/og/blog-<slug>.jpg (scripts/build-og.mjs)
const crumbsFor = (p: Post): Crumb[] => [
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
  { name: p.title, path: `/blog/${p.slug}` },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  const meta = pageMeta({
    title: p.seoTitle,
    description: p.description,
    path: `/blog/${p.slug}`,
    image: ogImage(p),
    article: { published: p.published, modified: p.modified, section: p.category, tags: p.tags },
  });
  return {
    ...meta,
    // <meta name="author"> and article:author name the same author as the visible byline: the company.
    // (The guides are company publications; switch to the owner only once he has reviewed/approved them.)
    authors: [{ name: site.name, url: SITE_URL }],
    openGraph: { ...(meta.openGraph as object), authors: [SITE_URL] } as Metadata["openGraph"],
  };
}

// BlogPosting + WebPage graph (audit 08-schema.md §5.6). Every value is visible on the page.
function postGraph(p: Post) {
  const path = `/blog/${p.slug}`;
  const url = pageUrl(path);
  const og = ogImage(p);
  const photo = imageNode(p.image, { caption: p.photo.caption, own: true, ...(p.photo.place ? { place: placeNode(p.photo.place) } : {}) });
  const ogNode = { "@type": "ImageObject", "@id": og.url, url: og.url, contentUrl: og.url, width: og.width, height: og.height };
  const about = p.related.services
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is (typeof services)[number] => Boolean(s))
    .map((s) => ({ "@type": "Service", "@id": serviceId(s.slug), name: s.short, url: pageUrl(`/services/${s.slug}`) }));
  const article = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    isPartOf: { "@id": BLOG_ID },
    headline: p.title,
    description: p.description,
    abstract: p.answer,
    image: [{ "@id": photo["@id"] as string }, { "@id": og.url }],
    datePublished: p.published,
    dateModified: p.modified,
    author: { "@id": BUSINESS_ID },
    publisher: { "@id": BUSINESS_ID },
    ...(about.length ? { about } : {}),
    articleSection: p.category,
    wordCount: wordCount(p),
    inLanguage: "en-US",
    citation: p.sources.map((s) => s.url),
  };
  return pageGraph(
    [
      webPageNode({
        path,
        name: p.title,
        description: p.description,
        about: about.length ? about.map((s) => ({ "@id": s["@id"] })) : undefined,
        mainEntity: { "@id": `${url}#article` },
        primaryImage: p.image,
        datePublished: p.published,
        dateModified: p.modified,
      }),
      article,
      photo,
      ogNode,
      { "@type": "Blog", "@id": BLOG_ID, url: pageUrl("/blog"), name: "Remodeling cost guides & advice for Massachusetts homeowners" },
      breadcrumbNode(crumbsFor(p)),
    ],
    { owner: true },
  );
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();

  const crumbs = crumbsFor(p);
  const relServices = p.related.services.map((s) => services.find((x) => x.slug === s)).filter((s): s is (typeof services)[number] => Boolean(s));
  const relProjects = p.related.projects.map((s) => projects.find((x) => x.slug === s)).filter((x): x is (typeof projects)[number] => Boolean(x));
  const relPosts = p.related.posts.map((s) => getPost(s)).filter((x): x is Post => Boolean(x));
  const updated = !sameDay(p.published, p.modified);
  const toc = [...p.sections.map((s) => ({ id: s.id, h: s.h })), ...(p.faqs.length ? [{ id: "faq", h: "Frequently asked questions" }] : []), { id: "sources", h: "Sources" }];

  return (
    <>
      <JsonLd data={postGraph(p)} />

      {/* HERO — text only (audit B-14: the H1 is the LCP element; no decorative stock photo) */}
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="max-w-[46rem]">
            <Breadcrumbs items={crumbs} />
            <p className="mt-6">
              <Link href={`/blog#${p.category === "Cost guides" ? "cost-guides" : p.category === "Planning, permits & hiring" ? "planning" : "exteriors"}`} className="eyebrow inline-block py-1 text-navy hover:underline underline-offset-4">
                {p.category}
              </Link>
            </p>
            <h1 className="mt-4 text-h1 text-navy text-balance"><HeadlineSet text={p.title} /></h1>
            <p className="mt-6 text-sm text-muted">
              Published by{" "}
              <Link rel="author" href="/about" className="link">
                {site.name}
              </Link>
            </p>
            <div className={`mt-1.5 ${DOTS_WRAP}`}>
              <ul className={`${DOTS_CLIP} text-[13px] text-muted`}>
                <li className="whitespace-nowrap">
                  Published <time dateTime={p.published}>{formatDate(p.published)}</time>
                </li>
                {updated && (
                  <li className="whitespace-nowrap">
                    Updated <time dateTime={p.modified}>{formatDate(p.modified)}</time>
                  </li>
                )}
                <li className="whitespace-nowrap">{readTime(p)}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="section-doc bg-paper">
        <div className="container-x grid lg:grid-cols-[minmax(0,41rem)_18rem] lg:justify-between gap-16">
          <div className="min-w-0 max-w-[41rem]">
            <article className="post">
              <p className="answer">{p.answer}</p>
              {/* Lazy like every other figure: the answer paragraph, not this photo, is the LCP (V4.4) — no eager load, no preload. */}
              <PostFigure f={{ src: p.image, ...p.photo }} />

              <nav aria-label="In this guide" className="toc">
                <p className="toc-title">In this guide</p>
                <ul>
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`}>{t.h}</a>
                    </li>
                  ))}
                </ul>
              </nav>

              {p.sections.map((s) => (
                <section key={s.id} aria-labelledby={s.id}>
                  <h2 id={s.id}>{s.h}</h2>
                  {s.blocks.map((b, i) => <PostBlock key={i} b={b} />)}
                </section>
              ))}

              {p.faqs.length > 0 && (
                <section aria-labelledby="faq" className="faq">
                  <h2 id="faq">Frequently asked questions</h2>
                  {p.faqs.map((f) => (
                    <div key={f.q}>
                      <h3>{f.q}</h3>
                      <p><Rich text={f.a} /></p>
                    </div>
                  ))}
                </section>
              )}

              <section aria-labelledby="sources">
                <h2 id="sources">Sources</h2>
                <ol className="sources">
                  {p.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} rel="noopener">{s.label}</a>
                    </li>
                  ))}
                </ol>
                <p className="small-note">
                  Laws, codes and program rules change. This guide is general information, not legal advice; confirm the rules for your project with your town&apos;s building department or the state agency linked above.
                </p>
              </section>

              {/* PUBLISHER BOX (audit B-03): who publishes these guides; links to the company and owner pages */}
              <section aria-labelledby="author" className="author-box">
                <h2 id="author">About the publisher</h2>
                <p>
                  <Link href="/about">{site.name}</Link> is an owner-led home remodeling contractor based in Northborough, Massachusetts, founded in {site.founded} by <Link href={OWNER_PAGE}>{site.owner}</Link>, who has {site.experience}+ years of hands-on construction experience. Figures in this guide come from the sources listed above.
                </p>
                {(hasHic || hasCsl) && <p>{credentialLine({ insured: false })}</p>}
                <p>
                  <Link href={OWNER_PAGE}><ArrowLabel text="About the owner, Ernando Nunes" /></Link>
                </p>
              </section>
            </article>

            {/* The one CTA readers see on phones; the sidebar card below is desktop-only (V5.4). The post's one navy surface. */}
            <div className="mt-12 on-dark bg-navy text-white rounded-panel p-7 md:p-8" data-cta-zone>
              <p className="font-display text-h3 text-white">Planning a project?</p>
              <p className="mt-2 text-white/80">Get a free, itemized estimate from an owner-led team based in Northborough, MA.</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/contact#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</Link>
                <a href={site.phoneHref} className="btn btn-on-dark w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
              </div>
            </div>
          </div>

          {/* SIDEBAR — desktop only: on phones it would stack right under the in-article CTA with the same two actions (V5.4). */}
          <aside aria-label="Contact Waterfront Construction" className="hidden lg:block">
            <div className="panel p-7 lg:sticky lg:top-28" data-cta-zone>
              <p className="font-display text-[1.375rem] leading-[1.25] text-navy text-balance">Talk to an <span className="whitespace-nowrap">owner-led</span> builder</p>
              <p className="mt-2 text-sm text-muted">{[credentialLine(), "Owner-led", "Based in Northborough, MA"].filter(Boolean).join(" · ")}</p>
              <Link href="/contact#estimate" className="btn btn-primary mt-6 w-full">Get a free estimate</Link>
              <a href={site.phoneHref} className="btn btn-secondary mt-3 w-full"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
            </div>
          </aside>
        </div>
      </div>

      {/* RELATED: service hubs, real projects, explicit next reads (audit B-08) */}
      <section className="section-doc bg-stone" aria-labelledby="related-heading">
        <div className="container-x space-y-16 md:space-y-20">
          <h2 id="related-heading" className="sr-only">Related services, projects and guides</h2>

          {relServices.length > 0 && (
            <div>
              <h3 className="text-h2-doc text-navy">{relServices.length > 1 ? "Related services" : "Related service"}</h3>
              <ul role="list" className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                {/* A lone related service takes two of the three columns, so the row does not read two-thirds empty. */}
                {relServices.map((s) => (
                  <li key={s.slug} className={relServices.length === 1 ? "sm:col-span-2" : undefined}>
                    <Link href={`/services/${s.slug}`} className="card-ed group h-full border-t border-line pt-5">
                      <span className="block font-display text-h3s text-navy group-hover:underline underline-offset-[.18em] decoration-1">{s.short}</span>
                      <span className="mt-2 block max-w-[60ch] text-[15px] leading-relaxed text-muted">{s.blurb}</span>
                      <span className="link-arrow text-sm mt-auto pt-2 self-start"><ArrowLabel text="See the service" /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relProjects.length > 0 && (
            <div>
              <h3 className="text-h2-doc text-navy">See it in a real project</h3>
              <ul role="list" className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                {relProjects.map((pr) => (
                  <li key={pr.slug}>
                    <Link href={`/projects/${pr.slug}`} className="group flex gap-5">
                      <div className="relative w-28 h-28 shrink-0 self-start overflow-hidden bg-well">
                        <Image src={pr.cover} alt="" fill quality={60} sizes="112px" className="object-cover zoomimg" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="block font-display text-h3s text-navy group-hover:underline underline-offset-[.18em] decoration-1">{pr.shortTitle}</span>
                        <span className="mt-1 block text-sm text-muted">{pr.location}</span>
                        <span className="link-arrow text-sm self-start"><ArrowLabel text="See the project" /></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relPosts.length > 0 && (
            <div>
              <h3 className="text-h2-doc text-navy">Keep reading</h3>
              {/* Two columns only from lg: a 176px photo beside the text needs a wide card, or the text column turns into a sliver. */}
              <ul role="list" className="mt-8 grid lg:grid-cols-2 gap-x-8 gap-y-10">
                {relPosts.map((r) => (
                  <li key={r.slug} className="h-full">
                    <Link href={`/blog/${r.slug}`} className="group flex h-full flex-col sm:flex-row gap-5">
                      <div className="relative aspect-[3/2] sm:aspect-auto sm:w-44 sm:self-stretch shrink-0 overflow-hidden bg-well">
                        <Image src={r.image} alt="" fill quality={60} sizes="(min-width:640px) 176px, 100vw" className="object-cover zoomimg" />
                      </div>
                      <div className="min-w-0 sm:py-1">
                        <span className="eyebrow">{r.category}</span>
                        <span className="mt-2 block font-display text-h3s text-navy group-hover:underline underline-offset-[.18em] decoration-1">{r.title}</span>
                        <span className="mt-2 block text-[15px] leading-relaxed text-muted">{plain(r.excerpt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
