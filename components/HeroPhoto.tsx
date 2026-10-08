import Image from "next/image";
import type { HeroImg } from "@/lib/hero-photos";

// Full-bleed job photo behind a page header (lib/hero-photos.ts picks it). Place it as the FIRST child of a
// <section className="page-head page-head--photo">: the photo and its scrim sit behind the content (-z-10 inside
// the section's isolation context), and globals.css turns the header's text white (.page-head--photo). The caption
// names what the photo shows and where it was taken, so a borrowed photo never implies work in the page's town.
// The photo is the page's LCP element: eager, high priority, quality 60 like the home hero.
export default function HeroPhoto({ img }: { img: HeroImg }) {
  return (
    <>
      <Image src={img.src} alt={img.alt} fill loading="eager" fetchPriority="high" quality={60} sizes="100vw"
        className="object-cover -z-10" style={img.pos ? { objectPosition: img.pos } : undefined} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 scrim-page-head" />
      <p className="hero-photo-caption" data-photo-credit>Photo: {img.caption}{img.place ? `, ${img.place}` : ""}</p>
    </>
  );
}
