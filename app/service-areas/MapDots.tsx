"use client";

/** One marker: [x, y, tooltip]. Coordinates and text are computed on the server (ServiceAreaMap.tsx). */
export type Dot = [x: string, y: string, title: string];

// The ~200 town markers of the /service-areas map. A client component only so the page's RSC payload carries these
// compact tuples instead of ~200 serialized <circle><title> trees (the server HTML is the same; /service-areas must
// stay under 300 KB, spec §11). The shared fill, opacity and phone radius sit on the group; documented (green)
// markers are drawn after the others, so they stay on top.
export default function MapDots({ plain, documented }: { plain: Dot[]; documented: Dot[] }) {
  return (
    <>
      <g fill="#24215A" fillOpacity={0.45} className="max-sm:*:[r:3.2px]">
        {plain.map(([x, y, t]) => <circle key={t} cx={x} cy={y} r={2.2}><title>{t}</title></circle>)}
      </g>
      <g fill="#1F7A3A">
        {documented.map(([x, y, t]) => <circle key={t} cx={x} cy={y} r={4.5}><title>{t}</title></circle>)}
      </g>
    </>
  );
}
