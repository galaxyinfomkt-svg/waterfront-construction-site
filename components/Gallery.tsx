"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@/components/chrome-icons";
import { spanFor } from "@/lib/grid";

// Case-study photo grid. Alt text and captions come from the data (lib/projects.ts) — one true description
// per photo, never a templated "— photo N" or an invented town (audit 05 PG-M4). Captions are visible
// <figcaption>s in the server HTML. The larger view is a native modal <dialog> (focus moves into it, Esc
// closes it, the page behind is inert; audit 10 M3).
export type GalleryPhoto = { src: string; alt: string; caption?: string };

export default function Gallery({ photos, label = "Photo viewer" }: { photos: GalleryPhoto[]; label?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isOpen = active !== null;
  const n = photos.length;

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
      triggerRef.current?.focus(); // return focus to the photo that opened the viewer
    };
  }, [isOpen]);

  const open = (i: number, el: HTMLElement) => {
    triggerRef.current = el;
    setActive(i);
  };
  const current = active !== null ? photos[active] : null;

  return (
    <>
      {/* 6-column stage grid (design spec §4.27): rows of two large photos, then rows of three; never an empty cell.
          At sm (2 columns) an odd count lets the first photo span the row. */}
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-10">
        {photos.map((ph, i) => (
          <li key={ph.src} className={`${i === 0 && n % 2 ? "sm:col-span-2" : ""} ${spanFor(i, n)}`}>
            <figure>
              <button
                type="button"
                onClick={(e) => open(i, e.currentTarget)}
                className="group relative block w-full aspect-[4/3] overflow-hidden bg-well cursor-zoom-in"
              >
                <Image src={ph.src} alt={ph.alt} fill quality={60} sizes="(min-width: 1200px) 380px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover zoomimg" />
                <span className="sr-only"> (opens a larger view)</span>
              </button>
              {ph.caption && <figcaption className="mt-3 text-sm leading-relaxed text-muted">{ph.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current ? `${label}: ${current.caption ?? current.alt}` : label}
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
            <div className="relative w-full max-w-[min(92vw,1100px)] flex-1 min-h-0">
              <Image src={current.src} alt={current.alt} fill quality={75} sizes="(min-width:1280px) 1100px, 92vw" className="object-contain" />
            </div>
            <p className="max-w-2xl text-center text-sm text-white/85">
              {current.caption ?? current.alt} <span className="block tnum text-white/70">({(active ?? 0) + 1} of {n})</span>
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
