import Link from "next/link";
import FilterGallery, { type GalleryItem } from "@/components/FilterGallery";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Project Gallery — Remodeling & Construction in MetroWest, MA",
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
  { src: "/images/addition.jpg", cat: "Additions", label: "Second-story addition" },
  { src: "/images/home-exterior.jpg", cat: "Additions", label: "Home expansion" },
  { src: "/images/painting.jpg", cat: "Painting", label: "Exterior repaint" },
  { src: "/images/painting.jpg", cat: "Painting", label: "Interior & trim" },
  { src: "/images/remodel.jpg", cat: "Additions", label: "Whole-home remodel" },
];

export default function GalleryPage() {
  return (
    <>
      <section className="mesh text-white">
        <div className="container-x py-16 md:py-20 text-center">
          <span className="eyebrow text-cyan">Our work</span>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold">Project gallery</h1>
          <p className="mt-4 text-white/85 text-lg max-w-2xl mx-auto">Real homes we&apos;ve transformed across Northborough &amp; MetroWest — filter by project type and click any photo to view it larger.</p>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <div className="container-x">
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
