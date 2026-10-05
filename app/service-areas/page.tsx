import Link from "next/link";
import { Fragment } from "react";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { site, services, citySlug, cityLabel, type City } from "@/lib/site";
import { townFacts, VILLAGE_OF } from "@/lib/towns";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, type Crumb } from "@/lib/schema";
import { allFaqs, type FaqEntry } from "@/lib/faq";
import FaqList from "../faq/FaqList";
import ServiceAreaMap from "./ServiceAreaMap";
import OpenOnHash from "./OpenOnHash";
import {
  countyGroups, documentedTowns, unplacedProjects, distanceBands, isDevensCity, testimonialAnchor,
  AREA_SENTENCE, NEAREST, FARTHEST, PLACES, type CountyGroup,
} from "./areas";

// /service-areas — the geographic hub (Home › Service Areas › county › town). Server-rendered: every one of
// the town × service pages is a plain crawlable link here, grouped by county (audit 06 ST-H3, 09 AEO-H6-d,
// 07 T01). Replaces the old 39-town teaser and the client-only LocationsExplorer tabs.

const H1 = "Towns we serve from Northborough, MA";
const DESCRIPTION = `From our Northborough base we take remodeling projects in ${AREA_SENTENCE}.`;

export const metadata = pageMeta({ title: "Towns We Serve in MA & Southern NH", description: DESCRIPTION, path: "/service-areas" });

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Service Areas", path: "/service-areas" }];

// Short labels for the dense directory; the row header (town) gives each link its context.
const SHORT: Record<string, string> = {
  siding: "Siding", "windows-and-doors": "Windows & doors", "kitchen-bathroom-remodeling": "Kitchen & bath",
  decks: "Decks", "home-additions-remodeling": "Additions", painting: "Painting",
};
const SVC = services.map((s) => ({ slug: s.slug, label: SHORT[s.slug] ?? s.name }));

const groups = countyGroups();
const proof = documentedTowns();
const proofBySlug = new Map(proof.map((p) => [citySlug(p.city), p]));
const ma = groups.filter((g) => g.state === "MA");
const nh = groups.filter((g) => g.state === "NH");
const nearest = townFacts(NEAREST);
const farthest = townFacts(FARTHEST);

const span = (g: CountyGroup) => (g.min === 0 ? `up to about ${g.max}` : g.min === g.max ? `about ${g.min}` : `about ${g.min}–${g.max}`);
const placesWord = (n: number) => (n === 1 ? "1 community" : `${n} communities`);

// Visible FAQ unique to this page (no FAQPage markup: the pre-hire set is marked up on /faq).
const areaFaqs: FaqEntry[] = [
  {
    id: "my-town",
    q: "Do you work in my town?",
    a: "If your town is listed on this page, yes: we take remodeling projects there. Each town has its own page for each of our six services, with its distance from Northborough and who issues building permits there.",
  },
  {
    id: "not-listed",
    q: "What if my town isn't listed?",
    a: `Call ${site.phone} or send the estimate form with your town and the type of project, and we'll tell you whether we can take it on.`,
    links: [{ href: "/contact#estimate", label: "Request a free estimate" }],
  },
  ...allFaqs.filter((f) => f.id === "new-hampshire"),
  {
    id: "distances",
    q: "How are the distances on this page measured?",
    a: "In a straight line, from our base in Northborough to each town's center, using GeoNames postal-code coordinates. Driving distances are longer.",
  },
];

/** Town as a schema place (names only, exactly as listed visibly). */
function townPlace(c: City) {
  const parent = VILLAGE_OF[citySlug(c)];
  if (parent) return { "@type": "Place", name: c.n, containedInPlace: { "@type": "City", name: parent } };
  if (isDevensCity(c)) return { "@type": "Place", name: c.n };
  return { "@type": "City", name: c.n };
}

const ld = pageGraph(
  [
    webPageNode({
      path: "/service-areas", type: "CollectionPage", name: H1, description: DESCRIPTION,
      mainEntity: {
        "@type": "ItemList", name: "Cities and towns we serve, by county", numberOfItems: groups.length,
        itemListElement: groups.map((g, i) => ({
          "@type": "ListItem", position: i + 1,
          item: {
            "@type": "AdministrativeArea", "@id": `${SITE_URL}/service-areas#${g.id}`, name: g.county,
            containedInPlace: { "@id": `${SITE_URL}/#state-${g.state.toLowerCase()}` },
            containsPlace: g.towns.map(townPlace),
          },
        })),
      },
    }),
    breadcrumbNode(crumbs),
  ],
  { business: "full" },
);

function TownNote({ c }: { c: City }) {
  const parent = VILLAGE_OF[citySlug(c)];
  const doc = proofBySlug.get(citySlug(c));
  return (
    <>
      {parent && <span className="note">(village of {parent})</span>}
      {isDevensCity(c) && <span className="note">(regional enterprise zone)</span>}
      {doc && doc.projects.length > 0 && (
        <span className="note">
          Case {doc.projects.length > 1 ? "studies" : "study"}:{" "}
          {doc.projects.map((p, i) => (
            <Fragment key={p.slug}>{i > 0 ? ", " : ""}<Link prefetch={false} href={`/projects/${p.slug}`} className="text-blue underline underline-offset-2">{p.shortTitle}</Link></Fragment>
          ))}
        </span>
      )}
    </>
  );
}

function County({ g, open }: { g: CountyGroup; open: boolean }) {
  return (
    <section id={g.id} aria-labelledby={`${g.id}-h`} className="rounded-2xl bg-white shadow-soft ring-1 ring-black/5 overflow-hidden">
      <div className="p-5 md:p-6">
        <h3 id={`${g.id}-h`} className="text-xl md:text-2xl font-extrabold text-navy">{g.county}, {g.state}</h3>
        <p className="mt-2 text-ink/80">
          {`${placesWord(g.towns.length)}, ${span(g)} miles from Northborough.`}
          {g.projects.length > 0 && <> Documented on this site: {g.projects.map((p) => p.title).join("; ")}.</>}
        </p>
      </div>
      <details open={open} className="svc-dir group border-t border-sand">
        <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-5 md:px-6 py-3 min-h-12 font-semibold text-blue">
          <span>{`Towns and service pages (${g.towns.length})`}</span>
          <span aria-hidden="true" className="text-2xl leading-none transition group-open:rotate-45">+</span>
        </summary>
        <table>
          <caption className="sr-only">{`Towns we serve in ${g.county}, ${g.stateName}, with their distance from Northborough and links to each service page`}</caption>
          <thead><tr><th scope="col">Town</th><th scope="col">From Northborough</th><th scope="col">Service pages</th></tr></thead>
          <tbody>
            {g.towns.map((c) => {
              const f = townFacts(c);
              const slug = citySlug(c);
              return (
                <tr key={slug}>
                  <th scope="row">{cityLabel(c)}<TownNote c={c} /></th>
                  <td className="dist">{f.isBase ? "Our base" : `about ${f.miles} mi ${f.dir}`}</td>
                  <td className="links">
                    {SVC.map((s) => (
                      <Link key={s.slug} prefetch={false} href={`/services/${s.slug}/${slug}`}>{s.label}</Link>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </section>
  );
}

export default function ServiceAreasPage() {
  const bands = distanceBands();
  const unplaced = unplacedProjects();
  return (
    <>
      <JsonLd data={ld} />
      <OpenOnHash />

      {/* HERO */}
      <section className="mesh text-white" data-cta-zone>
        <div className="container-x py-14 md:py-20">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold max-w-4xl">{H1}</h1>
          <p className="mt-5 text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed">{DESCRIPTION}</p>
          <p className="mt-3 text-white/85 max-w-3xl leading-relaxed">
            {`The ${PLACES} places on this page range from about ${nearest.miles} miles away (${cityLabel(NEAREST)}) to about ${farthest.miles} miles (${cityLabel(FARTHEST)}), in a straight line. We have completed projects in ${site.townsWithProjects}+ of these towns, and each town has its own page for each of our six services.`}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contact#estimate" className="btn btn-green text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-outline text-base">Call {site.phone}</a>
          </div>
        </div>
      </section>

      {/* MAP + COUNTIES AT A GLANCE */}
      <section className="py-14 md:py-16" aria-labelledby="glance-h">
        <div className="container-x grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-start">
          <figure className="rounded-2xl bg-white p-3 shadow-soft ring-1 ring-black/5">
            <ServiceAreaMap documented={new Set(proof.map((p) => citySlug(p.city)))} />
            <figcaption className="px-2 pt-2 pb-1 text-sm text-ink/75">
              Every place we serve, by its coordinates. Rings are 10 miles apart (straight line) around our Northborough base; green dots mark towns where our work is documented on this site.
            </figcaption>
          </figure>
          <div>
            <h2 id="glance-h" className="text-2xl md:text-3xl font-extrabold text-navy">Counties at a glance</h2>
            <div className="mt-5 rounded-2xl bg-white shadow-soft ring-1 ring-black/5 overflow-hidden">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Counties we serve, with the number of communities and their distance from Northborough</caption>
                <thead className="bg-sand text-navy"><tr><th scope="col" className="px-4 py-2.5">County</th><th scope="col" className="px-4 py-2.5">Communities</th><th scope="col" className="px-4 py-2.5">Miles</th></tr></thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g.id} className="border-t border-sand">
                      <th scope="row" className="px-4 py-2 font-semibold"><a href={`#${g.id}`} className="text-blue underline underline-offset-2 hover:text-navy">{g.county}, {g.state}</a></th>
                      <td className="px-4 py-2 text-ink/80">{g.towns.length}</td>
                      <td className="px-4 py-2 text-ink/80 whitespace-nowrap">{g.min === g.max ? g.min : `${g.min}–${g.max}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="mt-8 text-lg font-bold text-navy">Distance from Northborough</h3>
            <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {bands.map((b) => (
                <li key={b.label} className="rounded-xl bg-white px-3 py-2 ring-1 ring-black/5"><span className="font-bold text-navy">{b.count}</span> <span className="text-ink/75">places, {b.label}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DOCUMENTED WORK */}
      <section className="py-14 md:py-16 bg-white" aria-labelledby="proof-h">
        <div className="container-x">
          <h2 id="proof-h" className="text-2xl md:text-3xl font-extrabold text-navy">Where our work is documented</h2>
          <p className="mt-3 text-ink/80 max-w-3xl">Towns where this site shows a project case study or a client testimonial. We have completed projects in {site.townsWithProjects}+ towns; these are the ones documented here so far.</p>
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proof.map(({ city, projects, clients }) => {
              const f = townFacts(city);
              return (
                <li key={citySlug(city)} className="rounded-2xl bg-sand/60 p-5 ring-1 ring-black/5">
                  <p className="font-bold text-navy">{cityLabel(city)}</p>
                  <p className="text-sm text-ink/75">{f.county} · {f.isBase ? "our base" : `about ${f.miles} miles ${f.dir} of Northborough`}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {projects.map((p) => (
                      <li key={p.slug}><Link href={`/projects/${p.slug}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">Case study: {p.title}</Link></li>
                    ))}
                    {clients.map((n) => (
                      <li key={n}><Link href={`/reviews#${testimonialAnchor(n)}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">Client testimonial: {n}</Link></li>
                    ))}
                  </ul>
                </li>
              );
            })}
            {unplaced.map((p) => (
              <li key={p.slug} className="rounded-2xl bg-sand/60 p-5 ring-1 ring-black/5">
                <p className="font-bold text-navy">Massachusetts</p>
                <p className="text-sm text-ink/75">Town not recorded</p>
                <p className="mt-2 text-sm"><Link href={`/projects/${p.slug}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">Case study: {p.title}</Link></p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DIRECTORY */}
      <section className="py-14 md:py-16" aria-labelledby="massachusetts">
        <div className="container-x">
          <h2 id="massachusetts" className="text-2xl md:text-4xl font-extrabold text-navy">Massachusetts towns we serve</h2>
          <p className="mt-3 text-ink/80 max-w-3xl">
            Pick your town for its page on any of our six services: {services.map((s) => s.short).join(", ")}. Each page lists the town&apos;s distance from Northborough and who issues building permits there.
          </p>
          <div className="mt-8 grid gap-5">
            {ma.map((g, i) => <County key={g.id} g={g} open={i === 0} />)}
          </div>

          <h2 id="new-hampshire" className="mt-14 text-2xl md:text-4xl font-extrabold text-navy">New Hampshire towns we serve</h2>
          <p className="mt-3 text-ink/80 max-w-3xl">
            New Hampshire has no statewide contractor license; building permits come from each town&apos;s building department.
          </p>
          <div className="mt-8 grid gap-5">
            {nh.map((g) => <County key={g.id} g={g} open={false} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-16 bg-tint-green" aria-labelledby="area-faq-h">
        <div className="container-x grid lg:grid-cols-[.8fr_1.2fr] gap-10 items-start">
          <div>
            <h2 id="area-faq-h" className="text-2xl md:text-4xl font-extrabold text-navy">Questions about our service area</h2>
            <p className="mt-3 text-ink/80">More pre-hire answers are on our <Link href="/faq" className="font-semibold text-blue underline underline-offset-2">FAQ page</Link>.</p>
          </div>
          <FaqList items={areaFaqs} idPrefix="faq-" />
        </div>
      </section>

      {/* CTA */}
      <section className="mesh text-white" data-cta-zone>
        <div className="container-x py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold">Planning a project in one of these towns?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Estimates are free and there is no obligation.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact#estimate" className="btn btn-green text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-white text-base">Call {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
