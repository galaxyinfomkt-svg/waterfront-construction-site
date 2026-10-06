import Link from "next/link";
import { allCities, citySlug, cityLabel, type City } from "@/lib/site";
import { townFacts } from "@/lib/towns";
import { PlusIcon, ArrowLabel } from "./chrome-icons";

// Every town page for one service, grouped by county (internal-linking contract, IMPLEMENTATION.md §4).
// Server-rendered plain "Town, ST" links — replaces the old 198-chip block and its false "200+ towns" copy.
// Each county panel links to the matching county section on /service-areas (ids match lib/schema.ts county @ids).
// prefetch={false} on every link (V4.3): opening one county would otherwise prefetch ~60 town routes (~670 KB of RSC
// on mobile data). /service-areas does the same.

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
      <div className="faq-list lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start lg:border-t-0 lg:[&>details:nth-child(-n+2)]:border-t lg:[&>details:nth-child(-n+2)]:border-line">
        {list.map((g) => {
          const state = g.state === "MA" ? "Massachusetts" : "New Hampshire";
          return (
            <details key={g.id} className="faq-row group">
              <summary className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4">
                <span className="text-base font-medium text-ink">{g.county}, {state}</span>{" "}
                <span className="text-[13px] text-muted tnum whitespace-nowrap">{g.towns.length} {g.towns.length === 1 ? "town" : "towns"}</span>{" "}
                <PlusIcon className="w-4 h-4 self-center text-navy transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <ul role="list" className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 pb-5">
                {g.towns.map((c) => (
                  <li key={citySlug(c)}>
                    <Link href={`/services/${slug}/${citySlug(c)}`} prefetch={false} className="link-nav block py-2 text-[15px]">
                      {cityLabel(c)}
                    </Link>{" "}
                  </li>
                ))}
              </ul>
              <p className="pb-4">
                <Link href={`/service-areas#${g.id}`} prefetch={false} className="link-arrow text-[13px]"><ArrowLabel text={`Every service in ${g.county}, ${g.state}`} /></Link>
              </p>
            </details>
          );
        })}
      </div>
    </nav>
  );
}
