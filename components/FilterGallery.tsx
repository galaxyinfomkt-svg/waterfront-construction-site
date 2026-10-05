"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <>
      <div role="group" aria-label="Filter photos by project type" className="flex flex-wrap justify-center gap-2.5 mb-8">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => { setTab(t); setActive(null); }}
            className={`min-h-11 px-4 py-2 rounded-full text-sm font-bold transition ${tab === t ? "bg-navy text-white shadow" : "bg-white text-navy border border-navy/15 hover:bg-sand"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">{`${n} photo${n === 1 ? "" : "s"}${tab === "All" ? "" : ` in ${tab}`}`}</p>

      <ul role="list" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
        {filtered.map((it, i) => (
          <li key={`${it.src}-${it.cat}`}>
            <figure>
              <button
                type="button"
                onClick={(e) => { triggerRef.current = e.currentTarget; setActive(i); }}
                className="group relative block w-full h-44 sm:h-56 overflow-hidden rounded-2xl bg-sand cursor-zoom-in focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <Image src={it.src} alt={it.alt ?? it.label} fill quality={60} sizes="(min-width: 1200px) 285px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover zoomimg" />
                <span className="absolute top-2.5 left-2.5 rounded px-1.5 py-0.5 bg-navy/85 text-white text-[11px] font-bold uppercase tracking-wide">{it.cat}</span>
                <span aria-hidden="true" className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                  <span className="w-11 h-11 rounded-full bg-white/90 text-navy grid place-items-center shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></svg>
                  </span>
                </span>
                <span className="sr-only"> (opens a larger view)</span>
              </button>
              <figcaption className="mt-2 text-sm leading-snug">
                <span className="block font-semibold text-navy">{it.label}</span>
                {it.href && (
                  <Link href={it.href} className="mt-1 inline-block font-semibold text-blue underline-offset-2 hover:underline">
                    {it.hrefLabel ?? linkLabel} <span aria-hidden="true">→</span>
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
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/90 p-0 text-white backdrop:bg-black/70"
      >
        {current && (
          <div className="relative h-full w-full flex flex-col items-center justify-center gap-4 p-4 pt-16" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <button type="button" onClick={close} aria-label="Close photo viewer" className="absolute top-3 right-3 grid h-12 w-12 place-items-center rounded-full text-4xl leading-none text-white/90 hover:bg-white/10 hover:text-white">×</button>
            <div className="relative w-full max-w-5xl flex-1 min-h-0">
              <Image src={current.src} alt={current.alt ?? current.label} fill quality={75} sizes="92vw" className="object-contain" />
            </div>
            <p className="max-w-3xl text-center text-sm text-white/85">
              {current.label} <span className="text-white/70">({(active ?? 0) + 1} of {n})</span>
              {current.href && (
                <>
                  {" · "}
                  <Link href={current.href} className="font-semibold text-white underline underline-offset-2 hover:text-cyan">{current.hrefLabel ?? linkLabel}</Link>
                </>
              )}
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
