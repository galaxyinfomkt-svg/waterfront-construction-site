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
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMeta, ogFor, SITE_URL } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, imageNode, placeNode, serviceId, pageUrl, OWNER_ID, OWNER_PAGE, BUSINESS_ID, type Crumb } from "@/lib/schema";
import { PostBlock, PostFigure, Rich, formatDate, plain, readTime, sameDay, wordCount } from "../_lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const OWNER_URL = pageUrl(OWNER_PAGE);
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
    // <meta name="author"> and article:author must name the same person as the visible byline (audit B-03)
    authors: [{ name: site.owner, url: OWNER_URL }],
    openGraph: { ...(meta.openGraph as object), authors: [OWNER_URL] } as Metadata["openGraph"],
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
    author: { "@id": OWNER_ID },
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
      <section className="bg-brand-grad text-white">
        <div className="container-x py-12 md:py-16 max-w-4xl">
          <Breadcrumbs items={crumbs} />
          <p className="mt-5">
            <Link href={`/blog#${p.category === "Cost guides" ? "cost-guides" : p.category === "Planning, permits & hiring" ? "planning" : "exteriors"}`} className="inline-block rounded-full bg-[#1f7a3a] px-3 py-1 text-sm font-bold text-white hover:bg-[#19682f]">
              {p.category}
            </Link>
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold leading-tight">{p.title}</h1>
          <p className="mt-5 text-white text-[15px]">
            By{" "}
            <Link rel="author" href={OWNER_PAGE} className="font-semibold underline underline-offset-2 hover:text-cyan">
              {site.owner}
            </Link>
            , owner, {site.name}
          </p>
          <p className="mt-1 text-white text-[15px]">
            Published <time dateTime={p.published}>{formatDate(p.published)}</time>
            {updated && (
              <>
                {" · "}Updated <time dateTime={p.modified}>{formatDate(p.modified)}</time>
              </>
            )}
            {" · "}
            {readTime(p)}
          </p>
        </div>
      </section>

      {/* BODY */}
      <div className="py-12 md:py-14">
        <div className="container-x grid lg:grid-cols-[minmax(0,1fr)_300px] gap-12">
          <div className="min-w-0 max-w-3xl">
            <article className="post">
              <p className="answer">{p.answer}</p>
              <PostFigure f={{ src: p.image, ...p.photo }} eager />

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

              {/* AUTHOR BOX (audit B-03): the byline links here and to the owner's profile page */}
              <section aria-labelledby="author" className="author-box">
                <h2 id="author">About the author</h2>
                <p>
                  <Link href={OWNER_PAGE}>{site.owner}</Link> is the owner of {site.name}, an owner-led home remodeling contractor based in Northborough, Massachusetts. He has {site.experience}+ years of hands-on construction experience and founded the company in {site.founded}.
                </p>
                {(hasHic || hasCsl) && <p>{credentialLine({ insured: false })}</p>}
                <p>
                  <Link href={OWNER_PAGE}>More about Ernando →</Link>
                </p>
              </section>
            </article>

            <div className="mt-10 rounded-2xl bg-brand-grad p-7 text-center text-white">
              <p className="text-2xl font-extrabold text-white">Planning a project?</p>
              <p className="mt-1 text-white/90">Get a free, itemized estimate from an owner-led team based in Northborough, MA.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link href="/contact" className="btn btn-white">Get a Free Estimate</Link>
                <a href={site.phoneHref} className="btn btn-green"><span aria-hidden="true">📞</span> {site.phone}</a>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside aria-label="Contact Waterfront Construction" className="space-y-6">
            <div className="card p-6 lg:sticky lg:top-28">
              <Image src="/logo-solid.png" alt="" width={64} height={64} className="h-16 w-16" />
              <p className="mt-4 text-lg font-extrabold text-navy">Talk to an owner-led builder</p>
              <p className="mt-1 text-sm text-ink/70">{[credentialLine(), "Owner-led", "Based in Northborough, MA"].filter(Boolean).join(" · ")}</p>
              <a href={site.phoneHref} className="btn btn-navy mt-4 w-full"><span aria-hidden="true">📞</span> {site.phone}</a>
              <Link href="/contact" className="btn btn-green mt-2 w-full">Free Estimate</Link>
            </div>
          </aside>
        </div>
      </div>

      {/* RELATED: service hubs, real projects, explicit next reads (audit B-08) */}
      <section className="py-14 bg-sand" aria-labelledby="related-heading">
        <div className="container-x space-y-12">
          <h2 id="related-heading" className="sr-only">Related services, projects and guides</h2>

          {relServices.length > 0 && (
            <div>
              <h3 className="text-2xl font-extrabold text-navy mb-5">{relServices.length > 1 ? "Related services" : "Related service"}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relServices.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="card p-5 pop block">
                    <span className="block font-bold text-navy">{s.short}</span>
                    <span className="mt-1 block text-sm text-ink/70">{s.blurb}</span>
                    <span className="mt-2 inline-block text-sm font-semibold text-blue">See the service →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relProjects.length > 0 && (
            <div>
              <h3 className="text-2xl font-extrabold text-navy mb-5">See it in a real project</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relProjects.map((pr) => (
                  <Link key={pr.slug} href={`/projects/${pr.slug}`} className="card overflow-hidden pop flex">
                    <div className="relative w-28 shrink-0">
                      <Image src={pr.cover} alt="" fill quality={60} sizes="112px" className="object-cover" />
                    </div>
                    <div className="p-4">
                      <span className="block font-bold text-navy leading-snug">{pr.shortTitle}</span>
                      <span className="mt-1 block text-sm text-ink/70">{pr.location}</span>
                      <span className="mt-1 inline-block text-sm font-semibold text-blue">See the project →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relPosts.length > 0 && (
            <div>
              <h3 className="text-2xl font-extrabold text-navy mb-5">Keep reading</h3>
              <div className="grid sm:grid-cols-2 gap-5">
                {relPosts.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="card overflow-hidden pop flex">
                    <div className="relative w-32 shrink-0">
                      <Image src={r.image} alt="" fill quality={60} sizes="128px" className="object-cover" />
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue">{r.category}</span>
                      <span className="mt-1 block font-bold text-navy leading-snug">{r.title}</span>
                      <span className="mt-1 block text-sm text-ink/70">{plain(r.excerpt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
