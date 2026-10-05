import Link from "next/link";
import Image from "next/image";
import FilterGallery, { type GalleryItem } from "@/components/FilterGallery";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { site } from "@/lib/site";
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

function ProjectCard({ p }: { p: Project }) {
  return (
    <Link href={`/projects/${p.slug}`} className="group card overflow-hidden pop flex h-full flex-col">
      <div className="relative aspect-[4/3] bg-sand">
        <Image src={p.cover} alt={imageAlt(p, p.cover)} fill quality={60} sizes="(min-width: 1200px) 380px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover zoomimg" />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 text-navy text-xs font-bold px-3 py-1">{mediaCount(p)}</span>
      </div>
      <div className="p-5 flex flex-1 flex-col">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue">{p.location} · {p.category}</span>
        <h3 className="mt-1 font-extrabold text-xl text-navy leading-snug">{p.title}</h3>
        <p className="mt-2 text-sm text-ink/80 leading-relaxed">{p.blurb}</p>
        <span className="mt-auto pt-4 text-sm font-bold text-blue">View the case study <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={ld} />
      <section className="mesh text-white">
        <div className="container-x py-12 md:py-16">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold max-w-3xl leading-tight">{H1}</h1>
          <p className="mt-5 text-white/90 text-lg max-w-3xl leading-relaxed">{INTRO}</p>
          <p className="mt-3 text-white/85 max-w-3xl">Open any project for what we did, the photos in the order the work happened, and the services involved.</p>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="py-12 md:py-16" aria-labelledby="cases-h">
        <div className="container-x">
          <h2 id="cases-h" className="text-3xl md:text-4xl font-extrabold text-navy">Case studies</h2>
          <p className="mt-2 text-ink/80 max-w-2xl">Each one is a real job, described only by what its photos and videos show.</p>
          <ul role="list" className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {projects.map((p) => <li key={p.slug}><ProjectCard p={p} /></li>)}
          </ul>
        </div>
      </section>

      {/* PHOTOS BY PROJECT TYPE */}
      <section className="py-12 md:py-16 bg-sand" aria-labelledby="browse-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 id="browse-h" className="text-2xl md:text-3xl font-extrabold text-navy">Browse photos by project type</h2>
            <p className="mt-2 text-ink/80">Every photo is from one of the jobs above and links to its case study.</p>
          </div>
          <FilterGallery items={items} categories={categories} />
          <div className="mt-10 text-center flex flex-wrap justify-center gap-3">
            <Link href="/contact#estimate" className="btn btn-green">Get a free estimate</Link>
            <a href={site.instagram} target="_blank" rel="noopener" className="btn btn-navy">Follow us on Instagram</a>
          </div>
        </div>
      </section>
    </>
  );
}
