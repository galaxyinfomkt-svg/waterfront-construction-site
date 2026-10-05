import Image from "next/image";
import Link from "next/link";
import { posts, CATEGORIES, type Post } from "@/lib/posts";
import { site } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { PhoneIcon } from "@/components/chrome-icons";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, pageUrl, BUSINESS_ID, OWNER_PAGE, type Crumb } from "@/lib/schema";
import { formatDate, sameDay } from "./_lib/content";

const H1 = "Remodeling cost guides & advice for Massachusetts homeowners";
const DESCRIPTION =
  "Kitchen, bath, siding, window and deck cost guides using New England Cost vs. Value data, plus addition costs and Massachusetts permit and hiring checklists.";
const BLOG_ID = `${SITE_URL}/blog#blog`;
const crumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
];

export const metadata = pageMeta({
  title: "Remodeling Cost Guides & Advice for MA Homeowners",
  description: DESCRIPTION,
  path: "/blog",
});

// Newest first by true first-publication date (ISO strings with the same offset compare correctly); stable for ties.
const byPublished = (a: Post, b: Post) => (a.published < b.published ? 1 : a.published > b.published ? -1 : 0);
const lastModified = posts.map((p) => p.modified).sort().at(-1)!;

function blogGraph() {
  return pageGraph(
    [
      webPageNode({
        path: "/blog",
        type: "CollectionPage",
        name: H1,
        description: DESCRIPTION,
        mainEntity: { "@id": BLOG_ID },
        dateModified: lastModified,
      }),
      {
        "@type": "Blog",
        "@id": BLOG_ID,
        url: pageUrl("/blog"),
        name: H1,
        description: DESCRIPTION,
        publisher: { "@id": BUSINESS_ID },
        inLanguage: "en-US",
        blogPost: [...posts].sort(byPublished).map((p) => ({
          "@type": "BlogPosting",
          "@id": `${SITE_URL}/blog/${p.slug}#article`,
          url: pageUrl(`/blog/${p.slug}`),
          headline: p.title,
          datePublished: p.published,
          dateModified: p.modified,
          author: { "@id": BUSINESS_ID },
        })),
      },
      breadcrumbNode(crumbs),
    ],
    { owner: true },
  );
}

function PostCard({ p }: { p: Post }) {
  const updated = !sameDay(p.published, p.modified);
  return (
    <Link href={`/blog/${p.slug}`} className="group card overflow-hidden pop flex flex-col">
      <div className="relative h-48 bg-sand">
        {/* Decorative: the card title next to it says what the post is (audit B-18) */}
        <Image src={p.image} alt="" fill quality={60} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition duration-500" />
      </div>
      <div className="p-5 flex flex-col grow">
        <h3 className="font-bold text-lg text-navy leading-snug">{p.title}</h3>
        <p className="text-sm text-ink/70 mt-2">{p.excerpt}</p>
        <p className="mt-3 text-xs font-semibold text-ink/70">
          {updated ? (
            <>
              Updated <time dateTime={p.modified}>{formatDate(p.modified)}</time>
            </>
          ) : (
            <>
              Published <time dateTime={p.published}>{formatDate(p.published)}</time>
            </>
          )}
        </p>
        <span className="mt-auto pt-3 inline-block text-sm font-semibold text-blue">Read the guide →</span>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  return (
    <>
      <JsonLd data={blogGraph()} />
      <section className="bg-brand-grad text-white">
        <div className="container-x py-14 md:py-20">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold max-w-4xl">{H1}</h1>
          {/* Authorship matches the posts, their meta author and the JSON-LD: the company publishes the guides (V3.4). */}
          <p className="mt-5 text-white text-lg max-w-3xl">
            Cost guides, permit rules and hiring checklists published by{" "}
            <Link href="/about" className="font-semibold underline underline-offset-2 hover:text-cyan">
              {site.name}
            </Link>
            , an owner-led remodeling contractor based in Northborough, Massachusetts, founded in {site.founded} by{" "}
            <Link href={OWNER_PAGE} className="font-semibold underline underline-offset-2 hover:text-cyan">
              {site.owner}
            </Link>
            . Prices cite Remodeling magazine&apos;s Cost vs. Value data for New England, and legal and permit guidance links to state sources.
          </p>
          <nav aria-label="Guide topics" className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <a key={c.id} href={`#${c.id}`} className="rounded-full border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white hover:text-navy transition">
                {c.name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {CATEGORIES.map((c, i) => {
        const list = posts.filter((p) => p.category === c.name).sort(byPublished);
        if (!list.length) return null;
        return (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`} className={`py-14 ${i % 2 ? "bg-sand" : ""}`}>
            <div className="container-x">
              <h2 id={`${c.id}-h`} className="text-3xl font-extrabold text-navy">{c.name}</h2>
              <p className="mt-2 text-ink/70 max-w-2xl">{c.intro}</p>
              <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {list.map((p) => <PostCard key={p.slug} p={p} />)}
              </div>
            </div>
          </section>
        );
      })}

      {/* Slim estimate CTA after the last guide grid (V5.4 / audit 10 L5). */}
      <section aria-labelledby="blog-cta-h" className="bg-brand-grad text-white" data-cta-zone>
        <div className="container-x py-8 md:py-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="blog-cta-h" className="text-2xl font-extrabold text-white">Planning a project?</h2>
            <p className="mt-1 text-white/90">Get a free, itemized estimate from an owner-led team based in Northborough, MA.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact#estimate" className="btn btn-white">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-green"><PhoneIcon className="w-4 h-4" /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
