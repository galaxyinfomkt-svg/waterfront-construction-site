import Link from "next/link";
import { Fragment } from "react";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, PlusIcon, ArrowLabel } from "@/components/chrome-icons";
import { site, services, citySlug, cityLabel, type City } from "@/lib/site";
import { townFacts, VILLAGE_OF } from "@/lib/towns";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, type Crumb } from "@/lib/schema";
import { allFaqs, type FaqEntry } from "@/lib/faq";
import FaqList from "../faq/FaqList";
import Typeset from "@/components/Typeset";
import ServiceAreaMap from "./ServiceAreaMap";
import OpenOnHash from "./OpenOnHash";
import {
  countyGroups, documentedTowns, unplacedProjects, distanceBands, isDevensCity, testimonialAnchor,
  MUNICIPALITIES, COUNTIES, NEAREST, FARTHEST, PLACES, type CountyGroup,
} from "./areas";

// /service-areas — the geographic hub (Home > Service Areas > county > town). Server-rendered: every one of
// the town x service pages is a plain crawlable link here, grouped by county (audit 06 ST-H3, 09 AEO-H6-d,
// 07 T01). Replaces the old 39-town teaser and the client-only LocationsExplorer tabs.

const H1 = "Towns we serve from Northborough, MA";
const DESCRIPTION = `We take remodeling projects in ${MUNICIPALITIES} cities and towns across ${COUNTIES} counties of Massachusetts and southern New Hampshire, with completed projects in ${site.townsWithProjects}+ of them.`;

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
            <Fragment key={p.slug}>{i > 0 ? ", " : ""}<Link prefetch={false} href={`/projects/${p.slug}`} className="link">{p.shortTitle}</Link></Fragment>
          ))}
        </span>
      )}
    </>
  );
}

function County({ g, open, last = false }: { g: CountyGroup; open: boolean; last?: boolean }) {
  return (
    <section id={g.id} aria-labelledby={`${g.id}-h`} className="border-t border-line pt-10">
      <h3 id={`${g.id}-h`} className="text-h3 text-navy">{g.county}, {g.state}</h3>
      <p className="mt-3 text-muted max-w-[68ch]">
        {`${placesWord(g.towns.length)}, ${span(g)} miles from Northborough.`}
        {g.projects.length > 0 && <> Documented on this site: {g.projects.map((p) => p.title).join("; ")}.</>}
      </p>
      <details open={open} className={`faq-row svc-dir group mt-6 border-t border-line ${last ? "" : "border-b-0"}`}>
        <summary>
          <span className="faq-q">Towns and service <span className="whitespace-nowrap">{`pages (${g.towns.length})`}</span></span>
          <PlusIcon className="faq-icon" />
        </summary>
        <div className="pb-6">
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
        </div>
      </details>
    </section>
  );
}

/** Documented-town entry: town, meta and stacked case-study / testimonial links. */
const proofTitle = "font-display text-h3s text-navy";
const proofLink = "link-arrow text-sm items-start min-h-0 py-3"; // py-3: 44px target per line (§8 targets)

export default function ServiceAreasPage() {
  const bands = distanceBands();
  const unplaced = unplacedProjects();
  // Columns left free in the last row of the documented-towns grid (md: 2 columns, lg: 3).
  const unplacedSpan = `${proof.length % 2 === 0 ? "md:col-span-2" : ""} ${["lg:col-span-3", "lg:col-span-2", ""][proof.length % 3]}`;
  return (
    <>
      <JsonLd data={ld} />
      <OpenOnHash />

      {/* HEADER */}
      <section className="page-head" data-cta-zone>
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="max-w-[46rem]">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 max-[359px]:text-h1-long text-navy"><Typeset text={H1} /></h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[36em]">{DESCRIPTION}</p>
            <p className="mt-4 text-[15px] text-muted max-w-[40em]">
              {`The ${PLACES} places on this page range from about ${nearest.miles} miles away (${cityLabel(NEAREST)}) to about ${farthest.miles} miles (${cityLabel(FARTHEST)}), in a straight line. We have completed projects in ${site.townsWithProjects}+ of these towns, and each town has its own page for each of our six services.`}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/contact#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</Link>
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span></a>
            </div>
          </div>
        </div>
      </section>

      {/* MAP + COUNTIES AT A GLANCE — grid-cols-1 (minmax(0,1fr)) + min-w-0 so nothing widens the track past
          the viewport at 320px (V5.9) */}
      <section className="section" aria-labelledby="glance-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.1fr_.9fr] gap-x-12 gap-y-14 items-start">
          <figure className="min-w-0 self-start border-y border-line py-4 lg:sticky lg:top-28">
            <ServiceAreaMap documented={new Set(proof.map((p) => citySlug(p.city)))} />
            <figcaption className="mt-3 text-sm text-muted max-w-[68ch]">
              Every place we serve, by its coordinates. Rings are 10 miles apart (straight line) around our Northborough base; green dots mark towns where our work is documented on this site.
            </figcaption>
          </figure>
          <div className="min-w-0">
            <h2 id="glance-h" className="text-h2 text-navy">Counties at a glance</h2>
            <div className="mt-8 bg-white border border-line rounded-panel overflow-x-auto">
              <table className="w-full text-left text-sm sm:text-[15px]">
                <caption className="sr-only">Counties we serve, with the number of communities and their distance from Northborough</caption>
                <thead className="bg-stone">
                  <tr>
                    <th scope="col" className="table-cell pl-3 pr-2 sm:px-5 lg:px-4 xl:px-5 py-3 eyebrow max-sm:tracking-[.06em] text-left align-bottom">County</th>
                    <th scope="col" className="table-cell px-1.5 sm:px-5 lg:px-4 xl:px-5 py-3 eyebrow max-sm:tracking-[.06em] text-right align-bottom">Communities</th>
                    <th scope="col" className="table-cell px-1.5 sm:px-5 lg:px-4 xl:px-5 py-3 eyebrow max-sm:tracking-[.06em] text-right align-bottom">Miles</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g.id} className="border-t border-line">
                      <th scope="row" className="pl-3 pr-2 sm:px-5 lg:px-4 xl:px-5 py-2.5 font-medium text-ink align-top"><a href={`#${g.id}`} className="link-nav inline-block py-1"><Typeset text={`${g.county}, ${g.state}`} /></a></th>
                      <td className="px-1.5 sm:px-5 lg:px-4 xl:px-5 pt-3.5 pb-2.5 text-ink/80 align-top text-right tnum">{g.towns.length}</td>
                      <td className="px-1.5 sm:px-5 lg:px-4 xl:px-5 pt-3.5 pb-2.5 text-ink/80 align-top text-right tnum whitespace-nowrap">{g.min === g.max ? g.min : `${g.min}–${g.max}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="mt-12 text-h3s text-navy">Distance from Northborough</h3>
            <ul className="rule-list mt-4 text-[15px]">
              {bands.map((b) => (
                <li key={b.label} className="grid grid-cols-[3ch_1fr] gap-x-4 py-3"><span className="font-medium text-navy tnum text-right">{b.count}</span> <span className="text-muted whitespace-nowrap">places, {b.label}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DOCUMENTED WORK */}
      <section className="section bg-stone" aria-labelledby="proof-h">
        <div className="container-x">
          <div className="section-head">
            <h2 id="proof-h" className="text-h2 text-navy">Where our work is documented</h2>
            <p>Towns where this site shows a project case study or a client testimonial. We have completed projects in {site.townsWithProjects}+ towns; these are the ones documented here so far.</p>
          </div>
          <ul className="rule-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
            {proof.map(({ city, projects, clients }) => {
              const f = townFacts(city);
              return (
                <li key={citySlug(city)} className="py-5">
                  <p className={proofTitle}>{cityLabel(city)}</p>
                  {/* .dot-list-wrap (globals.css): a wrapped line never starts with a separator dot and no glyph is clipped. */}
                  <ul className="dot-list-wrap mt-1 text-sm text-muted">
                    <li>{f.county}</li>
                    <li>{f.isBase ? "our base" : `about ${f.miles} miles ${f.dir} of Northborough`}</li>
                  </ul>
                  <ul className="mt-2">
                    {projects.map((p) => (
                      <li key={p.slug}><Link href={`/projects/${p.slug}`} className={proofLink}><ArrowLabel text={`Case study: ${p.title}`} /></Link></li>
                    ))}
                    {clients.map((n) => (
                      <li key={n}><Link href={`/reviews#${testimonialAnchor(n)}`} className={proofLink}><ArrowLabel text={`Client testimonial: ${n}`} /></Link></li>
                    ))}
                  </ul>
                </li>
              );
            })}
            {/* Case studies whose town is not recorded share ONE cell (one "Massachusetts" label, all their links),
                placed in the same grid and spanning whatever the last row has left, so every row is full. */}
            {unplaced.length > 0 && (
              <li className={`py-5 ${unplacedSpan}`}>
                <p className={proofTitle}>Massachusetts</p>
                <p className="mt-1 text-sm text-muted">Town not recorded</p>
                <ul className="mt-2">
                  {unplaced.map((p) => (
                    <li key={p.slug}><Link href={`/projects/${p.slug}`} className={proofLink}><ArrowLabel text={`Case study: ${p.title}`} /></Link></li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* DIRECTORY */}
      <section className="section" aria-labelledby="massachusetts">
        <div className="container-x">
          <div className="section-head">
            <h2 id="massachusetts" className="text-h2 text-navy">Massachusetts towns we serve</h2>
            <p>
              Pick your town for its page on any of our six services: {services.map((s) => s.short).join(", ")}. Each page lists the town&apos;s distance from Northborough and who issues building permits there.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-y-8">
            {ma.map((g, i) => <County key={g.id} g={g} open={i === 0} last={i === ma.length - 1} />)}
          </div>

          <div className="section-head mt-20 md:mt-28">
            <h2 id="new-hampshire" className="text-h2 text-navy">New Hampshire towns we serve</h2>
            <p>
              New Hampshire has no statewide contractor license; building permits come from each town&apos;s building department.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-y-8">
            {nh.map((g, i) => <County key={g.id} g={g} open={false} last={i === nh.length - 1} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-stone" aria-labelledby="area-faq-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-10">
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <h2 id="area-faq-h" className="text-h2 text-navy">Questions about our service area</h2>
            <p className="mt-5 text-muted">More pre-hire answers are on our <Link href="/faq" className="link">FAQ page</Link>.</p>
          </div>
          <div className="lg:col-span-8"><FaqList items={areaFaqs} idPrefix="faq-" /></div>
        </div>
      </section>

      {/* CTA — the page's one navy band */}
      <section className="section bg-navy text-white on-dark" data-cta-zone>
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em]">Planning a project in one of these towns?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]">Estimates are free and there is no obligation.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/contact#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-on-dark w-full sm:w-auto"><PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span></a>
          </div>
        </div>
      </section>
    </>
  );
}
