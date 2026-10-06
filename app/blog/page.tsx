import Image from "next/image";
import Link from "next/link";
import { posts, CATEGORIES, type Post } from "@/lib/posts";
import { site } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { ArrowLabel, PhoneIcon } from "@/components/chrome-icons";
import Breadcrumbs from "@/components/Breadcrumbs";
import Typeset from "@/components/Typeset";
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

// Split section heads (§4.10): below lg the intro is not an h2 sibling, so it carries its own rhythm and colour.
const SPLIT_P = "mt-5 max-w-[38rem] text-lead text-muted lg:mt-0 lg:max-w-none";

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

// Editorial card (design spec §4.12, §6 Blog index): 3:2 photo, the date line above the title, then the excerpt.
// The title link stretches over the whole card; "Read the guide" is its visual cue (plain text under that link,
// so the card stays one link, as before).
// `sizes` follows the rendered box (§8 Performance): the featured photo is 7/12 of the row at lg (about 650px),
// a two-column grid card about 552px, a three-column card a third of the row.
const SIZES_FEATURED = "(min-width: 1200px) 650px, (min-width: 1024px) 54vw, 100vw";
const SIZES_TWO = "(min-width: 1200px) 552px, (min-width: 1024px) 46vw, (min-width: 640px) 50vw, 100vw";
const SIZES_THREE = "(max-width: 768px) 100vw, 33vw";

function PostCard({ p, featured = false, cols = 3, className = "" }: { p: Post; featured?: boolean; cols?: number; className?: string }) {
  const updated = !sameDay(p.published, p.modified);
  return (
    <li className={`card-ed group ${featured ? "lg:grid lg:grid-cols-12 lg:gap-x-8 lg:items-center" : ""} ${className}`}>
      <div className={`media [aspect-ratio:3/2] ${featured ? "lg:col-span-7" : ""}`}>
        {/* Decorative: the card title next to it says what the post is (audit B-18) */}
        <Image src={p.image} alt="" fill quality={60} sizes={featured ? SIZES_FEATURED : cols === 2 ? SIZES_TWO : SIZES_THREE} className="object-cover" />
      </div>
      <div className={`flex flex-col grow ${featured ? "lg:col-span-5" : ""}`}>
        <p className="meta">
          <span>
            {updated ? (
              <>
                Updated <time dateTime={p.modified}>{formatDate(p.modified)}</time>
              </>
            ) : (
              <>
                Published <time dateTime={p.published}>{formatDate(p.published)}</time>
              </>
            )}
          </span>
        </p>
        <h3 className={featured ? "text-h3s lg:text-[2rem] lg:leading-[1.15]" : "text-h3s"}>
          <Link href={`/blog/${p.slug}`}>{p.title}</Link>
        </h3>
        <p className={`body ${featured ? "max-w-[60ch]" : ""}`}>{p.excerpt}</p>
        <span className="link-arrow text-sm mt-auto pt-4 self-start">
          <ArrowLabel text="Read the guide" />
        </span>
      </div>
    </li>
  );
}

const COLS = ["", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3"];

export default function BlogPage() {
  return (
    <>
      <JsonLd data={blogGraph()} />
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="max-w-[46rem]">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 text-navy text-balance"><Typeset text={H1} /></h1>
            {/* Authorship matches the posts, their meta author and the JSON-LD: the company publishes the guides (V3.4). */}
            <p className="mt-5 text-lead text-ink/80 max-w-[60ch]">
              Cost guides, permit rules and hiring checklists published by{" "}
              <Link href="/about" className="link">
                {site.name}
              </Link>
              , an owner-led remodeling contractor based in Northborough, Massachusetts, founded in {site.founded} by{" "}
              <Link href={OWNER_PAGE} className="link">
                {site.owner}
              </Link>
              . Prices cite Remodeling magazine&apos;s Cost vs. Value data for New England, and legal and permit guidance links to state sources.
            </p>
          </div>
          <nav aria-label="Guide topics" className="mt-8 -mx-5 px-5 py-1.5 flex gap-2.5 overflow-x-auto no-scrollbar sm:flex-wrap sm:mx-0 sm:px-0 sm:overflow-visible">
            {CATEGORIES.map((c) => (
              <a key={c.id} href={`#${c.id}`} className="chip">
                {c.name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {CATEGORIES.filter((c) => posts.some((p) => p.category === c.name)).map((c, i) => {
        const list = posts.filter((p) => p.category === c.name).sort(byPublished);
        // The first category features its newest guide across the full row; the rest fill rows of min(count, 3).
        const feature = i === 0 && list.length > 1;
        const cols = Math.min(feature ? 3 : list.length, 3);
        return (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`} className={`section bg-paper ${i ? "pt-0" : ""}`}>
            {/* Same-surface join: categories share the paper background, so a hairline separates them. */}
            {i > 0 && (
              <div className="container-x">
                <div className="border-t border-line" />
              </div>
            )}
            <div className={`container-x ${i ? "pt-[var(--section-y)]" : ""}`}>
              <div className="section-head section-head--split">
                <div>
                  <h2 id={`${c.id}-h`} className="text-h2 text-navy">{c.name}</h2>
                </div>
                <p className={SPLIT_P}>{c.intro}</p>
              </div>
              <ul role="list" className={`grid sm:grid-cols-2 ${COLS[cols]} gap-x-8 gap-y-12`}>
                {list.map((p, j) => (
                  <PostCard key={p.slug} p={p} cols={cols} featured={feature && j === 0} className={feature && j === 0 ? "sm:col-span-2 lg:col-span-3" : ""} />
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {/* Estimate CTA after the last guide grid (V5.4 / audit 10 L5): the page's one navy band. */}
      <section aria-labelledby="blog-cta-h" className="section bg-navy text-white on-dark" data-cta-zone>
        <div className="container-x">
          <h2 id="blog-cta-h" className="text-h2 text-white max-w-[18em]">Planning a project?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]">Get a free, itemized estimate from an owner-led team based in Northborough, MA.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/contact#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-on-dark w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
