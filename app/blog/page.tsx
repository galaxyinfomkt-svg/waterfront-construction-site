import { Fragment } from "react";
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
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
import { EstimateLink } from "@/components/chrome-client";
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

// Display order only (the data, dates and JSON-LD order are untouched): guides whose covers come from the same project
// (e.g. two Mansfield kitchen shots) should not sit next to each other in the grid. Every arrangement of the cards after
// the featured one is scored by how many same-project covers touch (side by side or one above the other) in each layout
// the grid takes: 1 column, sm 2 columns, lg `cols` columns, with the featured card as a full row on top. The order with
// the fewest touching pairs wins; ties keep the newest-first order as closely as possible (so a category whose covers
// all come from one project, or that has no clash, keeps its order unchanged).
const coverProject = (p: Post) => p.image.replace(/^.*\//, "").replace(/(-progress|-before)?-\d+\.\w+$/, "");

function clashes(order: Post[], featured: Post | undefined, cols: number) {
  let n = 0;
  for (const c of new Set([1, 2, cols])) {
    order.forEach((p, i) => {
      const k = coverProject(p);
      if (featured && i < c && coverProject(featured) === k) n++;
      if (i % c < c - 1 && order[i + 1] && coverProject(order[i + 1]) === k) n++;
      if (order[i + c] && coverProject(order[i + c]) === k) n++;
    });
  }
  return n;
}

function spreadCovers(list: Post[], feature: boolean, cols: number) {
  const featured = feature ? list[0] : undefined;
  const rest = feature ? list.slice(1) : list;
  if (rest.length < 2 || rest.length > 7) return list;
  let best = rest, bestScore = [clashes(rest, featured, cols), 0];
  const permute = (done: Post[], left: Post[]) => {
    if (!left.length) {
      const score = [clashes(done, featured, cols), done.reduce((d, p, i) => d + Math.abs(i - rest.indexOf(p)), 0)];
      if (score[0] < bestScore[0] || (score[0] === bestScore[0] && score[1] < bestScore[1])) [best, bestScore] = [done, score];
      return;
    }
    left.forEach((p, i) => permute([...done, p], [...left.slice(0, i), ...left.slice(i + 1)]));
  };
  permute([], rest);
  return featured ? [featured, ...best] : best;
}

const shown = CATEGORIES.filter((c) => posts.some((p) => p.category === c.name));
// The mid-page form band follows the first category (the featured cost guides: about half the page).
const FORM_AFTER = 0;

export default function BlogPage() {
  return (
    <>
      <JsonLd data={blogGraph()} />
      {/* HERO — text on the left (7/12); the bare estimate form (the page's ONE EstimateForm) in the right 5/12 from lg,
          after the hero text on phones. */}
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
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
            <nav aria-label="Guide topics" className="mt-8 -mx-5 px-5 py-1.5 flex gap-2.5 overflow-x-auto no-scrollbar sm:flex-wrap sm:mx-0 sm:px-0 sm:overflow-visible">
              {CATEGORIES.map((c) => (
                <a key={c.id} href={`#${c.id}`} className="chip">
                  {c.name}
                </a>
              ))}
            </nav>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      {shown.map((c, i) => {
        const sorted = posts.filter((p) => p.category === c.name).sort(byPublished);
        // The first category features its newest guide across the full row; the rest fill rows of min(count, 3).
        const feature = i === 0 && sorted.length > 1;
        const cols = Math.min(feature ? 3 : sorted.length, 3);
        const list = spreadCovers(sorted, feature, cols);
        // Same-surface join only between two neighbouring paper categories; the category after the stone form band
        // starts with its full top padding and no hairline.
        const joined = i > 0 && i !== FORM_AFTER + 1;
        // One CTA row at the end of a category that is followed by neither the form band nor the closing navy band.
        const cta = i !== FORM_AFTER && i < shown.length - 1;
        return (
          <Fragment key={c.id}>
            <section id={c.id} aria-labelledby={`${c.id}-h`} className={`section bg-paper ${joined ? "pt-0" : ""}`}>
              {/* Same-surface join: categories share the paper background, so a hairline separates them. */}
              {joined && (
                <div className="container-x">
                  <div className="border-t border-line" />
                </div>
              )}
              <div className={`container-x ${joined ? "pt-[var(--section-y)]" : ""}`}>
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
                {cta && <CtaRow className="mt-14" />}
              </div>
            </section>
            {/* Mid-page estimate band (stone between the paper categories), after the first and longest category. */}
            {i === FORM_AFTER && <FormBand tone="stone" />}
          </Fragment>
        );
      })}

      {/* Estimate CTA after the last guide grid (V5.4 / audit 10 L5): the page's one navy band. */}
      <section aria-labelledby="blog-cta-h" className="section bg-navy text-white on-dark" data-cta-zone>
        <div className="container-x">
          <h2 id="blog-cta-h" className="text-h2 text-white max-w-[18em]">Planning a project?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]">Get a free, itemized estimate from an owner-led team based in Northborough, MA.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-on-dark w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
