"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";

export type GalleryItem = { src: string; cat: string; label: string };

export default function FilterGallery({ items, categories }: { items: GalleryItem[]; categories: string[] }) {
  const tabs = ["All", ...categories];
  const [tab, setTab] = useState("All");
  const [active, setActive] = useState<number | null>(null);

  const filtered = useMemo(() => (tab === "All" ? items : items.filter((i) => i.cat === tab)), [tab, items]);
  const close = useCallback(() => setActive(null), []);
  const move = useCallback((d: number) => setActive((a) => (a === null ? a : (a + d + filtered.length) % filtered.length)), [filtered.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") move(1); if (e.key === "ArrowLeft") move(-1); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [active, close, move]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2.5 mb-8">
        {tabs.map((t) => (
          <button key={t} onClick={() => { setTab(t); setActive(null); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab === t ? "bg-grad-green text-white shadow" : "bg-white text-navy border border-sand hover:bg-sand"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((it, i) => (
          <button key={it.src + i} onClick={() => setActive(i)} className="group relative h-56 overflow-hidden rounded-2xl cursor-pointer">
            <Image src={it.src} alt={it.label} fill quality={60} className="object-cover zoomimg" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
            <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
              <span className="w-12 h-12 rounded-full bg-white/90 text-navy grid place-items-center text-xl shadow-lg">🔍</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[11px] uppercase tracking-wide text-cyan font-bold">{it.cat}</span>
              <div className="text-white font-bold text-sm leading-tight">{it.label}</div>
            </div>
          </button>
        ))}
      </div>

      {active !== null && filtered[active] && (
        <div onClick={close} className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm grid place-items-center p-4 reveal">
          <button onClick={close} aria-label="Close" className="absolute top-4 right-5 text-white/90 hover:text-white text-5xl leading-none">×</button>
          <button onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous" className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-5xl">‹</button>
          <button onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next" className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-5xl">›</button>
          <div className="relative w-full max-w-5xl aspect-[4/3]" onClick={(e) => e.stopPropagation()}>
            <Image src={filtered[active].src} alt={filtered[active].label} fill quality={60} className="object-contain rounded-xl" sizes="100vw" />
          </div>
          <div className="absolute bottom-5 text-white/80 text-sm font-medium">{filtered[active].label} — {active + 1}/{filtered.length}</div>
        </div>
      )}
    </>
  );
}
