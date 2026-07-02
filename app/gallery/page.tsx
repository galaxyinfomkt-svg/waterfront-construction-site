import Link from "next/link";
import Image from "next/image";
import FilterGallery, { type GalleryItem } from "@/components/FilterGallery";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";
import { projects } from "@/lib/projects";

export const metadata = pageMeta({
  title: "Project Gallery — Northborough & MetroWest, MA",
  description: "Browse recent kitchen, bathroom, siding, deck, addition and painting projects by Waterfront Construction across Northborough & MetroWest, MA.",
  path: "/gallery",
});

const items: GalleryItem[] = [
  { src: "/images/kitchen.jpg", cat: "Kitchens", label: "Custom kitchen remodel" },
  { src: "/images/remodel.jpg", cat: "Kitchens", label: "Open-concept renovation" },
  { src: "/images/kitchen.jpg", cat: "Kitchens", label: "Cabinets & island" },
  { src: "/images/bathroom.jpg", cat: "Bathrooms", label: "Spa-style bathroom" },
  { src: "/images/bathroom.jpg", cat: "Bathrooms", label: "Custom tile shower" },
  { src: "/images/home-exterior.jpg", cat: "Siding", label: "Full exterior siding" },
  { src: "/images/siding.jpg", cat: "Siding", label: "Fiber-cement install" },
  { src: "/images/windows.jpg", cat: "Windows & Doors", label: "Window replacement" },
  { src: "/images/windows.jpg", cat: "Windows & Doors", label: "Entry door & trim" },
  { src: "/images/deck.jpg", cat: "Decks", label: "Composite deck build" },
  { src: "/images/deck.jpg", cat: "Decks", label: "Outdoor living space" },
  { src: "/images/projects/home-addition-highland-ave-lynnfield-ma-16.webp", cat: "Additions", label: "Second-story addition — Lynnfield, MA" },
  { src: "/images/projects/home-addition-highland-ave-lynnfield-ma-04.webp", cat: "Additions", label: "Home addition — Lynnfield, MA" },
  { src: "/images/painting.jpg", cat: "Painting", label: "Exterior repaint" },
  { src: "/images/painting.jpg", cat: "Painting", label: "Interior & trim" },
  { src: "/images/projects/home-addition-52-crest-road-lynnfield-ma-03.webp", cat: "Additions", label: "Home addition — Crest Rd, Lynnfield" },
];

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={graph([breadcrumb([{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }])])} />
      <section className="mesh text-white">
        <div className="container-x py-16 md:py-20 text-center">
          <span className="eyebrow text-cyan">Our work</span>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold">Project gallery</h1>
          <p className="mt-4 text-white/85 text-lg max-w-2xl mx-auto">Real homes we&apos;ve transformed across Northborough &amp; MetroWest — filter by project type and click any photo to view it larger.</p>
        </div>
      </section>

      {/* REAL PROJECT ALBUMS */}
      <section className="py-16">
        <div className="container-x">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow justify-center">Featured projects</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Real projects, real homes</h2>
              <p className="mt-3 text-ink/65">Open a full photo &amp; video album from a recent Waterfront Construction job.</p>
            </div>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {projects.map((p) => (
              <Reveal key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="group card overflow-hidden pop block h-full">
                  <div className="relative h-64">
                    <Image src={p.cover} alt={p.title} fill className="object-cover zoomimg" sizes="(max-width:640px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/15 to-transparent" />
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 text-navy text-xs font-bold px-3 py-1">📁 {p.photos.length ? `${p.photos.length} photos` : `${p.videos.length} videos`}</span>
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <span className="text-xs font-semibold uppercase tracking-wider text-cyan">📍 {p.location} · {p.category}</span>
                      <h3 className="font-extrabold text-2xl mt-1 leading-tight">{p.shortTitle}</h3>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between gap-3">
                    <span className="text-sm text-ink/65">{p.blurb}</span>
                    <span className="text-blue font-bold shrink-0">View →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <div className="container-x">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="eyebrow justify-center">More of what we do</span>
              <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-navy">Browse by project type</h2>
            </div>
          </Reveal>
          <Reveal><FilterGallery items={items} categories={["Kitchens", "Bathrooms", "Siding", "Windows & Doors", "Decks", "Additions", "Painting"]} /></Reveal>
          <p className="mt-6 text-center text-ink/55 text-sm">Photos are representative of our work. Ask us for references and project examples in your town.</p>
          <div className="mt-6 text-center flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-green">Get a Free Estimate</Link>
            <a href={site.instagram} target="_blank" rel="noopener" className="btn btn-navy">See more on Instagram →</a>
          </div>
        </div>
      </section>
    </>
  );
}
