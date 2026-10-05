import Link from "next/link";
import { allCities, citySlug, cityLabel, type City } from "@/lib/site";
import { townFacts } from "@/lib/towns";

// Every town page for one service, grouped by county (internal-linking contract, IMPLEMENTATION.md §4).
// Server-rendered plain "Town, ST" links — replaces the old 198-chip block and its false "200+ towns" copy.
// Each county panel links to the matching county section on /service-areas (ids match lib/schema.ts county @ids).

type Group = { id: string; county: string; state: "MA" | "NH"; towns: City[] };

const countyAnchor = (county: string, state: "MA" | "NH") => `${county.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;

let cache: Group[] | null = null;
function groups(): Group[] {
  if (cache) return cache;
  const map = new Map<string, Group>();
  for (const c of allCities) {
    const state = c.s ?? "MA";
    const { county } = townFacts(c);
    const id = countyAnchor(county, state);
    if (!map.has(id)) map.set(id, { id, county, state, towns: [] });
    map.get(id)!.towns.push(c);
  }
  const byName = (a: City, b: City) => a.n.localeCompare(b.n, "en-US");
  cache = [...map.values()]
    .map((g) => ({ ...g, towns: [...g.towns].sort(byName) }))
    // Massachusetts first, then New Hampshire; larger counties first; ties alphabetical.
    .sort((a, b) => (a.state === b.state ? b.towns.length - a.towns.length || a.county.localeCompare(b.county) : a.state === "MA" ? -1 : 1));
  return cache;
}

export default function ServiceTownDirectory({ slug, label, className = "" }: { slug: string; label: string; className?: string }) {
  const list = groups();
  // Native <details> per county (UX M7): every link stays in the server HTML for crawlers and AI engines,
  // while the page stays short on phones.
  return (
    <nav aria-label={`${label} pages by town`} className={className}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 items-start">
        {list.map((g) => {
          const state = g.state === "MA" ? "Massachusetts" : "New Hampshire";
          return (
            <details key={g.id} className="group rounded-xl bg-white ring-1 ring-black/5 shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold text-navy [&::-webkit-details-marker]:hidden">
                <span>{g.county}, {state}</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-ink/70">
                  {g.towns.length}<span aria-hidden="true" className="text-blue text-lg transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <ul role="list" className="grid grid-cols-2 gap-x-4 px-4 pb-2 text-sm">
                {g.towns.map((c) => (
                  <li key={citySlug(c)}>
                    <Link href={`/services/${slug}/${citySlug(c)}`} className="block py-2 text-blue hover:text-navy hover:underline underline-offset-2">
                      {cityLabel(c)}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="px-4 pb-4 text-xs">
                <Link href={`/service-areas#${g.id}`} className="font-semibold text-ink/70 hover:text-blue underline underline-offset-2">Every service in {g.county}, {g.state}</Link>
              </p>
            </details>
          );
        })}
      </div>
    </nav>
  );
}
