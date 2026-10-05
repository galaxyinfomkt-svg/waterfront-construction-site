"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

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
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-7">
        {photos.map((ph, i) => (
          <li key={ph.src}>
            <figure>
              <button
                type="button"
                onClick={(e) => open(i, e.currentTarget)}
                className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl bg-sand cursor-zoom-in focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <Image src={ph.src} alt={ph.alt} fill quality={60} sizes="(min-width: 1200px) 380px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover zoomimg" />
                <span className="sr-only"> (opens a larger view)</span>
              </button>
              {ph.caption && <figcaption className="mt-2.5 text-sm leading-relaxed text-ink/80">{ph.caption}</figcaption>}
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
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/90 p-0 text-white backdrop:bg-black/70"
      >
        {current && (
          <div className="relative h-full w-full flex flex-col items-center justify-center gap-4 p-4 pt-16" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <button type="button" onClick={close} aria-label="Close photo viewer" className="absolute top-3 right-3 grid h-12 w-12 place-items-center rounded-full text-4xl leading-none text-white/90 hover:bg-white/10 hover:text-white">×</button>
            <div className="relative w-full max-w-5xl flex-1 min-h-0">
              <Image src={current.src} alt={current.alt} fill quality={75} sizes="92vw" className="object-contain" />
            </div>
            <p className="max-w-3xl text-center text-sm text-white/85">
              {current.caption ?? current.alt} <span className="text-white/70">({(active ?? 0) + 1} of {n})</span>
            </p>
            {n > 1 && (
              <>
                <button type="button" onClick={() => move(-1)} aria-label="Previous photo" className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full text-4xl text-white/85 hover:bg-white/10 hover:text-white">‹</button>
                <button type="button" onClick={() => move(1)} aria-label="Next photo" className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full text-4xl text-white/85 hover:bg-white/10 hover:text-white">›</button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
