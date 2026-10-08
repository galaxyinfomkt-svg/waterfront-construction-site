import { Fragment } from "react";
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
import { ArrowLabel } from "@/components/chrome-icons";
import Breadcrumbs from "@/components/Breadcrumbs";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
import { pageMeta, ogFor, SITE_URL } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, imageNode, placeNode, serviceId, pageUrl, OWNER_PAGE, BUSINESS_ID, type Crumb } from "@/lib/schema";
import { HeadlineSet, PostBlock, PostFigure, Rich, formatDate, plain, readTime, sameDay, wordCount } from "../_lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

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

function PostSection({ s }: { s: Post["sections"][number] }) {
  return (
    <section aria-labelledby={s.id}>
      <h2 id={s.id}>{s.h}</h2>
      {s.blocks.map((b, i) => <PostBlock key={i} b={b} />)}
    </section>
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
  // The mid-page form band goes between the H2 sections, at their midpoint (rounded up: the first half is the longer).
  const mid = Math.ceil(p.sections.length / 2);
  const toc = [...p.sections.map((s) => ({ id: s.id, h: s.h })), ...(p.faqs.length ? [{ id: "faq", h: "Frequently asked questions" }] : []), { id: "sources", h: "Sources" }];

  return (
    <>
      <JsonLd data={postGraph(p)} />

      {/* HERO — centered text in the left 7/12 (audit B-14: the H1 is the LCP element, no decorative stock photo); the
          bare estimate form (the page's ONE EstimateForm) in the right 5/12 from lg, after the hero text on phones. */}
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
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
            {/* Centered meta (.dot-list-wrap): stacked below sm, one dotted line from sm. */}
            <ul className="mt-1.5 dot-list-wrap text-[13px] text-muted">
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
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      {/* BODY — one article in two paper parts with the mid-page estimate band (stone, full width) between them, at
          the midpoint of the H2 sections. It replaces the old end-of-article navy panel and the desktop sidebar card.
          The running text (.post: answer, paragraphs, lists, steps, tables, callouts, the "In this guide" list) stays
          LEFT-aligned for readability, the one exception to the centered site; the hero, the CTA rows, the form band,
          the publisher box and the related links are centered. Below lg the 41rem article column (and the guide list)
          is centered on the page; from lg both parts keep the same left 7/12 reading column (the first beside the sticky
          "In this guide" rail), so the text never jumps sideways after the form band. */}
      <article>
        {/* First part: from lg the "In this guide" list moves into a sticky right rail (cols 9-12) beside the article
            column; below lg it stays inline after the photo. DOM order is unchanged (answer, photo, list, sections). */}
        <div className="section-doc bg-paper">
          <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-x-12">
            <div className="post w-full max-w-[41rem] min-w-0 mx-auto lg:mx-0 lg:col-span-7">
              <p className="answer">{p.answer}</p>
              {/* Lazy like every other figure: the answer paragraph, not this photo, is the LCP (V4.4) — no eager load, no preload. */}
              <PostFigure f={{ src: p.image, ...p.photo }} />
            </div>

            <div className="post toc-rail w-full max-w-[41rem] min-w-0 mx-auto lg:max-w-none lg:mx-0 lg:col-start-9 lg:col-span-4 lg:row-start-1 lg:row-span-2 lg:self-start lg:sticky lg:top-28">
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
            </div>

            <div className="post w-full max-w-[41rem] min-w-0 mx-auto lg:mx-0 mt-4 lg:mt-6 lg:col-start-1 lg:col-span-7">
              {p.sections.slice(0, mid).map((s, i) => (
                <Fragment key={s.id}>
                  <PostSection s={s} />
                  {/* CTA row after the first section, unless the form band follows it directly. */}
                  {i === 0 && mid > 1 && <CtaRow className="post-cta" />}
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <FormBand tone="stone" doc />

        <div className="section-doc bg-paper">
          {/* Same 7/12 reading column as the first part from lg, so the text never jumps sideways after the band. */}
          <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-x-12">
            <div className="post w-full max-w-[41rem] min-w-0 mx-auto lg:mx-0 lg:col-span-7">
              {p.sections.slice(mid).map((s) => <PostSection key={s.id} s={s} />)}

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

              {/* CTA row before the sources. */}
              <CtaRow className="post-cta" />

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
                  <Link href="/about">{site.name}</Link> is an owner-led general contractor based in Northborough, Massachusetts, founded in {site.founded} by <Link href={OWNER_PAGE}>{site.owner}</Link>, who has {site.experience}+ years of hands-on construction experience. Figures in this guide come from the sources listed above.
                </p>
                {(hasHic || hasCsl) && <p>{credentialLine({ insured: false })}</p>}
                <p>
                  <Link href={OWNER_PAGE}><ArrowLabel text="About the owner, Ernando Nunes" /></Link>
                </p>
              </section>
            </div>
          </div>
        </div>
      </article>

      {/* RELATED: service hubs, real projects, explicit next reads (audit B-08). Centered rows: each list wraps with
          justify-center and fixed column widths (2rem gaps), so a short last row sits in the middle, never at the left. */}
      <section className="section-doc bg-stone" aria-labelledby="related-heading">
        <div className="container-x space-y-16 md:space-y-20">
          <h2 id="related-heading" className="sr-only">Related services, projects and guides</h2>

          {relServices.length > 0 && (
            <div>
              <h3 className="text-h2-doc text-navy">{relServices.length > 1 ? "Related services" : "Related service"}</h3>
              <ul role="list" className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
                {/* A lone related service is two columns wide (centered), so the row does not read two-thirds empty. */}
                {relServices.map((s) => (
                  <li key={s.slug} className={relServices.length === 1 ? "w-full lg:w-[calc((100%-4rem)*2/3+2rem)]" : "w-full sm:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]"}>
                    <Link href={`/services/${s.slug}`} className="card-ed group h-full border-t border-line pt-5">
                      <span className="block font-display text-h3s text-navy group-hover:underline underline-offset-[.18em] decoration-1">{s.short}</span>
                      <span className="mt-2 mx-auto block max-w-[36em] text-[15px] leading-relaxed text-muted">{s.blurb}</span>
                      <span className="link-arrow text-sm mt-auto pt-2 self-center"><ArrowLabel text="See the service" /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relProjects.length > 0 && (
            <div>
              <h3 className="text-h2-doc text-navy">See it in a real project</h3>
              <ul role="list" className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
                {/* Centered stack: the square thumbnail over the centered title, place and cue. */}
                {relProjects.map((pr) => (
                  <li key={pr.slug} className="w-full sm:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]">
                    <Link href={`/projects/${pr.slug}`} className="group flex flex-col items-center">
                      <div className="relative w-28 h-28 shrink-0 overflow-hidden bg-well">
                        <Image src={pr.cover} alt="" fill quality={60} sizes="112px" className="object-cover zoomimg" />
                      </div>
                      <span className="mt-4 block font-display text-h3s text-navy group-hover:underline underline-offset-[.18em] decoration-1">{pr.shortTitle}</span>
                      <span className="mt-1 block text-sm text-muted">{pr.location}</span>
                      <span className="link-arrow text-sm"><ArrowLabel text="See the project" /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relPosts.length > 0 && (
            <div>
              <h3 className="text-h2-doc text-navy">Keep reading</h3>
              {/* Two columns only from lg: a 176px photo beside the text needs a wide card, or the text column turns into a sliver.
                  The text is centered in its own column (beside the photo from sm, under it on phones). */}
              <ul role="list" className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
                {relPosts.map((r) => (
                  <li key={r.slug} className="w-full lg:w-[calc((100%-2rem)/2)]">
                    <Link href={`/blog/${r.slug}`} className="group flex h-full flex-col sm:flex-row gap-5">
                      <div className="relative aspect-[3/2] sm:aspect-auto sm:w-44 sm:self-stretch shrink-0 overflow-hidden bg-well">
                        <Image src={r.image} alt="" fill quality={60} sizes="(min-width:640px) 176px, 100vw" className="object-cover zoomimg" />
                      </div>
                      <div className="min-w-0 flex-1 sm:self-center sm:py-1">
                        <span className="eyebrow">{r.category}</span>
                        <span className="mt-2 block font-display text-h3s text-navy group-hover:underline underline-offset-[.18em] decoration-1">{r.title}</span>
                        <span className="mt-2 mx-auto block max-w-[36em] text-[15px] leading-relaxed text-muted">{plain(r.excerpt)}</span>
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
