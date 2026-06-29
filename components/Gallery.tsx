"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function Gallery({ images }: { images: string[] }) {
  const [active, setActive] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);
  const move = useCallback((d: number) => setActive((a) => (a === null ? a : (a + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [active, close, move]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((g, i) => (
          <button
            key={g}
            onClick={() => setActive(i)}
            aria-label="View project photo"
            className={`group relative overflow-hidden rounded-2xl cursor-pointer ${i === 0 ? "md:row-span-2 h-64 md:h-full" : "h-56"}`}
          >
            <Image src={g} alt={`Project photo ${i + 1}`} fill quality={68} className="object-cover zoomimg" />
            <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/45 transition grid place-items-center">
              <span className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition w-12 h-12 rounded-full bg-white/90 text-navy grid place-items-center text-xl shadow-lg">🔍</span>
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
        <div onClick={close} className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm grid place-items-center p-4 reveal">
          <button onClick={close} aria-label="Close" className="absolute top-4 right-5 text-white/90 hover:text-white text-5xl leading-none">×</button>
          <button onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous" className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-5xl">‹</button>
          <button onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next" className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-5xl">›</button>
          <div className="relative w-full max-w-5xl aspect-[4/3]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt={`Project photo ${active + 1}`} fill quality={68} className="object-contain rounded-xl" sizes="100vw" />
          </div>
          <div className="absolute bottom-5 text-white/70 text-sm">{active + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}
