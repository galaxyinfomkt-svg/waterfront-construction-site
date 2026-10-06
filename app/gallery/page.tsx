import Link from "next/link";
import Image from "next/image";
import FilterGallery, { type GalleryItem } from "@/components/FilterGallery";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import { EstimateLink } from "@/components/chrome-client";
import { site } from "@/lib/site";
import { ArrowLabel, PhoneIcon } from "@/components/chrome-icons";
import { pageMeta, ogFor } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, pageUrl, type Crumb } from "@/lib/schema";
import { projects, featuredImages, imageAlt, mediaCount, type GalleryCategory, type Project } from "@/lib/projects";
import { projectTown, townFacts } from "@/lib/towns";

// /gallery ("Projects" in the nav) — the index of the documented case studies. Real job photos only: every
// tile comes from lib/projects.ts and links to its case study; no stock images (audit 05 PG-C1). Title,
// description and intro are generated from the projects, so they can never claim a place the jobs are not in.

const PATH = "/gallery";
const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Projects", path: PATH }];

// Towns of the located case studies, grouped by state: "Mansfield, Needham and Lynnfield, MA, and Salem, NH".
const located = projects.map((p) => projectTown(p)).filter((t): t is NonNullable<ReturnType<typeof projectTown>> => Boolean(t));
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const byState = (["MA", "NH"] as const)
  .map((st) => ({ st, towns: [...new Set(located.filter((t) => (t.s ?? "MA") === st).map((t) => t.n))] }))
  .filter((g) => g.towns.length);
const TOWNS = byState.map((g) => `${list(g.towns)}, ${g.st}`).join(", and ");
const miles = located.map((t) => townFacts(t).miles);
const MIN = Math.min(...miles);
const MAX = Math.max(...miles);
const UNLOCATED = projects.length - located.length;
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const word = (n: number) => WORDS[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const H1 = "Our Remodeling Projects: Real Photos and Site Videos";
const INTRO = `${site.name}, an owner-led remodeling contractor founded in ${site.founded} and based in Northborough, MA, has completed ${site.projectsCompleted}+ projects. ${cap(word(projects.length))} of them are documented here as case studies with our own photos and site videos. ${cap(word(located.length))} are from jobs in ${TOWNS}, between ${MIN} and ${MAX} miles from our base${UNLOCATED ? `; for the other ${word(UNLOCATED)}, the town is not listed` : ""}.`;

// .dot-list that may wrap: every item carries the dot (the first one too) and the list is pulled left by one dot
// inside an overflow-clipped wrapper, so a wrapped line never starts with a stray dot.
const DOTS_WRAP = "min-w-0 overflow-hidden";
const DOTS_CLIP =
  "dot-list -ml-[calc(1.5em+3px)] [&>li:first-child]:before:content-[''] [&>li:first-child]:before:inline-block [&>li:first-child]:before:w-[3px] [&>li:first-child]:before:h-[3px] [&>li:first-child]:before:rounded-full [&>li:first-child]:before:bg-current [&>li:first-child]:before:opacity-60 [&>li:first-child]:before:mx-[.75em] [&>li:first-child]:before:align-[.25em]";
// Split section heads (§4.10): below lg the intro is not an h2 sibling, so it carries its own rhythm and colour.
const SPLIT_P = "mt-5 max-w-[38rem] text-lead text-muted lg:mt-0 lg:max-w-none";

export const metadata = pageMeta({
  title: "Remodeling Project Photos & Videos: Real Jobs in MA & NH",
  description: `Real job photos and site videos from ${projects.length} case studies, including jobs in ${TOWNS}: remodels, additions and decks.`,
  path: PATH,
  image: ogFor("project-kitchen-remodel-mansfield-ma", imageAlt(projects[0], projects[0].ogSource) || projects[0].title),
});

// Filter tiles: featured photos (and video stills) from every case study, each linked to it.
const ORDER: GalleryCategory[] = ["Kitchens", "Bathrooms", "Additions", "Decks", "Siding", "Windows & Doors"];
const items: GalleryItem[] = featuredImages()
  .sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat))
  .map((f) => ({
    src: f.src,
    alt: f.alt,
    cat: f.cat,
    label: f.caption,
    href: `/projects/${f.project.slug}`,
    hrefLabel: `${f.project.shortTitle} case study`,
  }));
const categories = ORDER.filter((c) => items.some((i) => i.cat === c)); // empty categories never show

const ld = pageGraph([
  webPageNode({
    path: PATH,
    type: "CollectionPage",
    name: H1,
    description: INTRO,
    mainEntity: {
      "@type": "ItemList",
      name: "Project case studies",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: pageUrl(`/projects/${p.slug}`), name: p.title })),
    },
  }),
  breadcrumbNode(crumbs),
]);

// Editorial case card (design spec §4.12): the photo carries nothing; place, kind and media count sit in the
// meta row under it. The title link stretches over the card. The first card is featured across the row.
// From sm the other cards share their row's tracks (subgrid: photo, meta, title, body, cue), so titles, bodies and
// cues start level across a row even when a meta or title line wraps.
const ROW_SUBGRID = "sm:grid sm:grid-rows-subgrid sm:row-span-5 sm:gap-y-0";
function ProjectCard({ p, featured = false }: { p: Project; featured?: boolean }) {
  return (
    <li className={`card-ed group ${featured ? "sm:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:items-center" : ROW_SUBGRID}`}>
      <div className={`media ${featured ? "[aspect-ratio:3/2] lg:col-span-7" : ""}`}>
        {/* sizes follows the box (§8 Performance): the featured photo is 7/12 of the row at lg (about 650px) and full width below. */}
        <Image src={p.cover} alt={imageAlt(p, p.cover)} fill quality={60} sizes={featured ? "(min-width: 1200px) 650px, (min-width: 1024px) 54vw, 100vw" : "(min-width: 1200px) 380px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"} className="object-cover" />
      </div>
      <div className={`flex flex-col grow ${featured ? "lg:col-span-5" : "sm:contents"}`}>
        {/* Two fixed label lines on every card (place and kind, then the media count), so the halves never run
            together and every title in a row starts level. */}
        <div className="meta flex-col justify-start gap-y-1">
          <div className={DOTS_WRAP}>
            <ul className={DOTS_CLIP}>
              <li className="whitespace-nowrap">{p.location}</li>
              <li className="whitespace-nowrap">{p.category}</li>
            </ul>
          </div>
          <span>{mediaCount(p)}</span>
        </div>
        <h3 className={featured ? "lg:text-[2rem] lg:leading-[1.15]" : undefined}>
          <Link href={`/projects/${p.slug}`}>{p.title}</Link>
        </h3>
        <p className={`body ${featured ? "max-w-[60ch]" : ""}`}>{p.blurb}</p>
        <span className="link-arrow text-sm mt-auto pt-3 self-start">
          <ArrowLabel text="View the case study" />
        </span>
      </div>
    </li>
  );
}

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={ld} />
      {/* HERO — text on the left (7/12); the bare estimate form (the page's ONE EstimateForm) in the right 5/12 from lg,
          after the hero text on phones. */}
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 text-navy text-balance">{H1}</h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[60ch]">{INTRO}</p>
            <p className="mt-4 text-muted max-w-[60ch]">Open any project for what we did, the photos in the order the work happened, and the services involved.</p>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="section bg-paper" aria-labelledby="cases-h">
        <div className="container-x">
          <div className="section-head section-head--split">
            <div>
              <h2 id="cases-h" className="text-h2 text-navy">Case studies</h2>
            </div>
            <p className={SPLIT_P}>Each one is a real job, described only by what its photos and videos show.</p>
          </div>
          <ul role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {projects.map((p, i) => <ProjectCard key={p.slug} p={p} featured={i === 0} />)}
          </ul>
        </div>
      </section>

      {/* MID-PAGE ESTIMATE FORM — stone between the paper case studies and the paper photo browser */}
      <FormBand tone="stone" />

      {/* PHOTOS BY PROJECT TYPE — paper, so the stone form band before it and the stone footer after it stay distinct */}
      <section className="section bg-paper" aria-labelledby="browse-h">
        <div className="container-x">
          <div className="section-head section-head--split">
            <div>
              <h2 id="browse-h" className="text-h2 text-navy">Browse photos by project type</h2>
            </div>
            <p className={SPLIT_P}>Every photo is from one of the jobs above and links to its case study.</p>
          </div>
          <FilterGallery items={items} categories={categories} />
          {/* CTA row: estimate (jumps to the hero form) and call, then Instagram. */}
          <div className="mt-14 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto">
              <PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span>
            </a>
            <a href={site.instagram} target="_blank" rel="noopener" className="link-arrow self-start sm:self-auto sm:ml-5">
              <ArrowLabel text="Follow us on Instagram" external />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
