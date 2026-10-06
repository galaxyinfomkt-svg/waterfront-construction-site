"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLabel, ChevronLeftIcon, ChevronRightIcon, XIcon } from "@/components/chrome-icons";

// Filterable photo grid (/gallery; props kept backward compatible for the home page).
// - `label` is the visible caption; `alt` (optional) is the image description, defaulting to `label`.
// - `href` (optional) links the tile to its case study with a real <a>, so crawlers and AI engines can
//   follow it; `hrefLabel` (optional) is that link's text (default `linkLabel`). The photo itself opens a
//   larger view in a native modal <dialog> (audit 05 PG-C1, 10 M3).
// - Only pass REAL job photos with true labels — never stock images (audit 01-C1 / 05 PG-C1).
export type GalleryItem = { src: string; cat: string; label: string; href?: string; hrefLabel?: string; alt?: string };

export default function FilterGallery({ items, categories, linkLabel = "View the project" }: { items: GalleryItem[]; categories: string[]; linkLabel?: string }) {
  const tabs = ["All", ...categories];
  const [tab, setTab] = useState("All");
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Natural aspect ratio of each photo seen in the viewer (keyed by src), and the last one, used while the next loads.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [lastRatio, setLastRatio] = useState<number | null>(null);
  const isOpen = active !== null;

  const filtered = useMemo(() => (tab === "All" ? items : items.filter((i) => i.cat === tab)), [tab, items]);
  const n = filtered.length;
  const close = useCallback(() => setActive(null), []);
  const move = useCallback((d: number) => setActive((a) => (a === null ? a : (a + d + n) % n)), [n]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  const current = active !== null ? filtered[active] : undefined;
  const ratio = current ? (ratios[current.src] ?? lastRatio) : null;

  return (
    <>
      {/* Below md: one scrollable row of chips that fades out at the right edge (pr-12 + mask, as the hub in-page nav),
          so a cut chip always reads as "more"; py-1.5 keeps the focus ring inside the scroller. md+: wrapped; from md
          to lg the chips are slightly narrower (px-3.5) so all seven fit on one line at 768 instead of leaving one chip
          alone on a second line. */}
      <div role="group" aria-label="Filter photos by project type" className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 pl-5 pr-12 scroll-px-5 py-1.5 [mask-image:linear-gradient(90deg,#000_calc(100%-3rem),transparent)] md:py-0 md:flex-wrap md:overflow-visible md:mx-0 md:px-0 md:[mask-image:none] mb-8 md:mb-10">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => { setTab(t); setActive(null); }}
            className="chip md:max-lg:px-3.5"
          >
            {t}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">{`${n} photo${n === 1 ? "" : "s"}${tab === "All" ? "" : ` in ${tab}`}`}</p>

      <ul role="list" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
        {filtered.map((it, i) => (
          <li key={`${it.src}-${it.cat}`}>
            <figure>
              <button
                type="button"
                onClick={(e) => { triggerRef.current = e.currentTarget; setActive(i); }}
                className="group relative block w-full aspect-[4/3] overflow-hidden bg-well cursor-zoom-in"
              >
                <Image src={it.src} alt={it.alt ?? it.label} fill quality={60} sizes="(min-width: 1200px) 285px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover zoomimg" />
                <span className="sr-only"> (opens a larger view)</span>
              </button>
              <figcaption className="mt-3">
                {tab === "All" && <span className="eyebrow">{it.cat}</span>}
                <span className="mt-1 block text-[14px] leading-snug font-medium text-ink">{it.label}</span>
                {it.href && (
                  <Link href={it.href} className="link-arrow mt-0.5 min-h-0 py-1.5 text-[13px] leading-snug">
                    <ArrowLabel text={it.hrefLabel ?? linkLabel} />
                  </Link>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current ? `Photo viewer: ${current.label}` : "Photo viewer"}
        onClose={close}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-scrim p-0 text-white backdrop:bg-black"
      >
        {current && (
          <div className="relative h-full w-full flex flex-col items-center justify-center gap-4 p-4 pt-16 pb-20 md:pb-4" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <button type="button" onClick={close} aria-label="Close photo viewer" className="absolute top-3 right-3 grid h-12 w-12 place-items-center rounded-full border border-white/40 text-white hover:bg-white/10"><XIcon className="w-6 h-6" /></button>
            {/* The photo box takes the photo's own proportions once it has loaded (until then it fills the free height),
                so the caption sits right under the photo. From md the box stays 5rem clear of each side, so the
                prev/next circles always sit on the black scrim, never on the photo. */}
            <div
              className={`relative w-full max-w-[min(92vw,1100px)] md:max-w-[min(calc(100vw_-_10rem),1100px)] min-h-0 ${ratio ? "" : "flex-1"}`}
              style={ratio ? { aspectRatio: ratio } : undefined}
            >
              <Image
                src={current.src}
                alt={current.alt ?? current.label}
                fill
                quality={75}
                sizes="(min-width:1280px) 1100px, 92vw"
                className="object-contain"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    const r = img.naturalWidth / img.naturalHeight;
                    const src = current.src;
                    setRatios((m) => (m[src] === r ? m : { ...m, [src]: r }));
                    setLastRatio(r);
                  }
                }}
              />
            </div>
            <p className="max-w-2xl text-center text-sm text-white/85">
              {current.label} <span className="block tnum text-white/70">({(active ?? 0) + 1} of {n})</span>
              {current.href && (
                <Link href={current.href} className="mt-1 inline-block py-1 font-semibold text-white underline underline-offset-4 decoration-white/50 hover:decoration-white">{current.hrefLabel ?? linkLabel}</Link>
              )}
            </p>
            {n > 1 && (
              <>
                <button type="button" onClick={() => move(-1)} aria-label="Previous photo" className="absolute bottom-4 left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-6 grid h-12 w-12 place-items-center rounded-full border border-white/40 text-white hover:bg-white/10"><ChevronLeftIcon className="w-6 h-6" /></button>
                <button type="button" onClick={() => move(1)} aria-label="Next photo" className="absolute bottom-4 right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-6 grid h-12 w-12 place-items-center rounded-full border border-white/40 text-white hover:bg-white/10"><ChevronRightIcon className="w-6 h-6" /></button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
