import { allCities, citySlug, cityLabel } from "@/lib/site";
import { townFacts } from "@/lib/towns";

// Server-rendered SVG map of every served place, plotted from its coordinates (GeoNames postal-code
// centroids, lib/town-geo.ts) with rings every 10 miles, straight line, from Northborough. No map API,
// no third-party request, nothing invented. The county directory on /service-areas is its text
// alternative (audit 06 ST-H3, ST-M1). No state or county boundaries are drawn: no boundary data is
// available offline, and a hand-drawn line would be inaccurate.

const W = 640, H = 520, PAD = 26;
const KX = Math.cos((42.5 * Math.PI) / 180); // equirectangular, scaled at about 42.5°N
const P = allCities.map((c) => ({ c, f: townFacts(c) }));
const BASE = P.find((p) => p.f.isBase)!.f;
const RINGS = [10, 20, 30, 40, 50];
// The extent covers every place AND the outermost ring (centred on the base), so no ring is clipped.
const ringDeg = RINGS[RINGS.length - 1] / 69.0; // in the same units as lat and lng*KX
const xs = [...P.map((p) => p.f.lng * KX), BASE.lng * KX - ringDeg, BASE.lng * KX + ringDeg];
const ys = [...P.map((p) => p.f.lat), BASE.lat - ringDeg, BASE.lat + ringDeg];
const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
const S = Math.min((W - 2 * PAD) / (maxX - minX), (H - 2 * PAD) / (maxY - minY));
// Centre the drawing in the viewBox: the slack left by min() is split evenly on both sides of the scaled axis.
const OX = (W - 2 * PAD - (maxX - minX) * S) / 2;
const OY = (H - 2 * PAD - (maxY - minY) * S) / 2;
const X = (lng: number) => PAD + OX + (lng * KX - minX) * S;
const Y = (lat: number) => PAD + OY + (maxY - lat) * S;
const R = (mi: number) => (mi / 69.0) * S; // 1° of latitude ≈ 69 miles

/** A few labels for orientation; every label is a real served place at its real position. */
const LABELS: Record<string, "l" | "r"> = { worcester: "l", boston: "r", nashua: "r", "salem-nh": "r", mansfield: "r", rockport: "l" };

// Label sizes are in viewBox units, so they shrink with the map. On phones the 640-unit map is drawn about
// 260–330px wide (scale ~0.45), which made 10–12-unit labels 4–5px tall (V5.9). Below sm the ring and base
// labels are scaled up (CSS font-size beats the SVG attribute), only the 10/30/50 mi rings are labelled and the
// town labels are hidden; the county directory and each marker's <title> tooltip carry the same information.
// The per-breakpoint sizes keep labels at about 11-13px rendered (the map is narrowest at lg, in the two-column
// layout). A white halo keeps text readable over markers and rings.
const HALO = { stroke: "#fff", strokeLinejoin: "round", paintOrder: "stroke" } as const;

export default function ServiceAreaMap({ documented, className = "" }: { documented: Set<string>; className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="sam-t sam-d" className={`w-full h-auto text-navy ${className}`}>
      <title id="sam-t">Map of the places Waterfront Construction serves</title>
      <desc id="sam-d">
        {`Each dot is one of the ${allCities.length} cities, towns and villages we serve, placed by its coordinates. Rings mark every 10 miles, straight line, from our Northborough base. Larger green dots mark towns where our work is documented on this site.`}
      </desc>
      {RINGS.map((m) => (
        <circle key={m} cx={X(BASE.lng)} cy={Y(BASE.lat)} r={R(m)} fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
      {P.map(({ c, f }) => {
        const doc = documented.has(citySlug(c));
        return (
          <circle key={citySlug(c)} cx={X(f.lng).toFixed(1)} cy={Y(f.lat).toFixed(1)} r={doc ? 4.5 : 2.2}
            fill={doc ? "#1F7A3A" : "#24215A"} fillOpacity={doc ? 1 : 0.45}>
            <title>{`${cityLabel(c)} · ${f.isBase ? "our base" : `about ${f.miles} miles ${f.dir}`}`}</title>
          </circle>
        );
      })}
      {/* Ring labels are drawn after the town markers so none of them covers a label. */}
      <g fill="#5C5B63">
        {RINGS.map((m) => (
          <text key={m} x={X(BASE.lng) + 4} y={Y(BASE.lat) - R(m) - 3} className={`text-[22px] min-[480px]:text-[16px] sm:text-[12px] lg:text-[16px] xl:text-[12px] ${m % 20 ? "" : "max-sm:hidden"}`} fontSize="10" strokeWidth={5} {...HALO}>{m} mi</text>
        ))}
      </g>
      {P.filter(({ c }) => LABELS[citySlug(c)]).map(({ c, f }) => {
        const right = LABELS[citySlug(c)] === "r";
        return (
          <text key={`l-${citySlug(c)}`} x={X(f.lng) + (right ? 7 : -7)} y={Y(f.lat) + 4} textAnchor={right ? "start" : "end"} fontSize="11" fill="#5C5B63" className="hidden sm:inline sm:text-[13px] lg:text-[17px] xl:text-[13px]" strokeWidth={4} {...HALO}>
            {cityLabel(c)}
          </text>
        );
      })}
      <circle cx={X(BASE.lng)} cy={Y(BASE.lat)} r="7" fill="#24215A" stroke="#fff" strokeWidth="2" />
      <text x={X(BASE.lng) + 10} y={Y(BASE.lat) + 5} fontSize="12" fontWeight="600" className="fill-current text-[22px] min-[480px]:text-[16px] sm:text-[14px] lg:text-[17px] xl:text-[14px]" strokeWidth={4} {...HALO}>Northborough (base)</text>
    </svg>
  );
}
