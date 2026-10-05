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
const xs = P.map((p) => p.f.lng * KX), ys = P.map((p) => p.f.lat);
const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
const S = Math.min((W - 2 * PAD) / (maxX - minX), (H - 2 * PAD) / (maxY - minY));
const X = (lng: number) => PAD + (lng * KX - minX) * S;
const Y = (lat: number) => PAD + (maxY - lat) * S;
const R = (mi: number) => (mi / 69.0) * S; // 1° of latitude ≈ 69 miles
const BASE = P.find((p) => p.f.isBase)!.f;

/** A few labels for orientation; every label is a real served place at its real position. */
const LABELS: Record<string, "l" | "r"> = { worcester: "l", boston: "r", nashua: "r", "salem-nh": "r", mansfield: "r", rockport: "l" };

export default function ServiceAreaMap({ documented, className = "" }: { documented: Set<string>; className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="sam-t sam-d" className={`w-full h-auto text-navy ${className}`}>
      <title id="sam-t">Map of the places Waterfront Construction serves</title>
      <desc id="sam-d">
        {`Each dot is one of the ${allCities.length} cities, towns and villages we serve, placed by its coordinates. Rings mark every 10 miles, straight line, from our Northborough base. Larger green dots mark towns where our work is documented on this site.`}
      </desc>
      <rect x="0" y="0" width={W} height={H} rx="18" className="fill-white" />
      {[10, 20, 30, 40, 50].map((m) => (
        <g key={m}>
          <circle cx={X(BASE.lng)} cy={Y(BASE.lat)} r={R(m)} fill="none" stroke="currentColor" strokeOpacity=".16" strokeDasharray="3 4" />
          <text x={X(BASE.lng) + 4} y={Y(BASE.lat) - R(m) - 3} className="fill-current" fontSize="10" opacity=".7">{m} mi</text>
        </g>
      ))}
      {P.map(({ c, f }) => {
        const doc = documented.has(citySlug(c));
        return (
          <circle key={citySlug(c)} cx={X(f.lng).toFixed(1)} cy={Y(f.lat).toFixed(1)} r={doc ? 5 : 2.6}
            fill={doc ? "#1f7a3a" : "#2f7cb8"} fillOpacity={doc ? 1 : 0.7}>
            <title>{`${cityLabel(c)} · ${f.isBase ? "our base" : `about ${f.miles} miles ${f.dir}`}`}</title>
          </circle>
        );
      })}
      {P.filter(({ c }) => LABELS[citySlug(c)]).map(({ c, f }) => {
        const right = LABELS[citySlug(c)] === "r";
        return (
          <text key={`l-${citySlug(c)}`} x={X(f.lng) + (right ? 7 : -7)} y={Y(f.lat) + 4} textAnchor={right ? "start" : "end"} fontSize="11" className="fill-current" opacity=".85">
            {cityLabel(c)}
          </text>
        );
      })}
      <circle cx={X(BASE.lng)} cy={Y(BASE.lat)} r="7" fill="#24215a" stroke="#fff" strokeWidth="2" />
      <text x={X(BASE.lng) + 10} y={Y(BASE.lat) + 4} fontSize="12" fontWeight="700" className="fill-current">Northborough (base)</text>
    </svg>
  );
}
