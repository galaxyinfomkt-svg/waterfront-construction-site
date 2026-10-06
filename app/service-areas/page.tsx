import Link from "next/link";
import { Fragment } from "react";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, PlusIcon, ArrowLabel } from "@/components/chrome-icons";
import { site, services, citySlug, cityLabel, type City } from "@/lib/site";
import { servicesCountWord } from "@/lib/services";
import { townFacts, VILLAGE_OF, cityHubPath } from "@/lib/towns";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, type Crumb } from "@/lib/schema";
import { allFaqs, type FaqEntry } from "@/lib/faq";
import FaqList from "../faq/FaqList";
import Typeset from "@/components/Typeset";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
import { EstimateLink } from "@/components/chrome-client";
import ServiceAreaMap from "./ServiceAreaMap";
import OpenOnHash from "./OpenOnHash";
import CountyTowns, { type TownRow, type TownRowNote } from "./CountyTowns";
import {
  countyGroups, documentedTowns, unplacedProjects, distanceBands, isDevensCity, testimonialAnchor,
  MUNICIPALITIES, COUNTIES, NEAREST, FARTHEST, PLACES, type CountyGroup,
} from "./areas";

// /service-areas — the geographic hub (Home > Service Areas > county > town). Server-rendered: every served place
// links once, to its own city hub (/service-areas/{town}, which links that place's ten service pages), grouped by
// county (spec §5.6, D5; audit 06 ST-H3, 09 AEO-H6-d, 07 T01).

const H1 = "Towns we serve from Northborough, MA";
const DESCRIPTION = `We take remodeling projects in ${MUNICIPALITIES} cities and towns across ${COUNTIES} counties of Massachusetts and southern New Hampshire, with completed projects in ${site.townsWithProjects}+ of them.`;

export const metadata = pageMeta({ title: "Towns We Serve in MA & Southern NH", description: DESCRIPTION, path: "/service-areas" });

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Service Areas", path: "/service-areas" }];

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
    a: `If your town is listed on this page, yes: we take remodeling projects there. Each town has its own page with all ${servicesCountWord} of our services, its distance from Northborough and who issues building permits there; each service also has a page for every town.`,
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
    a: "In a straight line, from our base in Northborough to each town's center, using GeoNames coordinates for each town's center. Driving distances are longer.",
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

/** One directory row (rendered by CountyTowns): the town, its distance and its note (village, Devens, case studies). */
function townRow(c: City): TownRow {
  const f = townFacts(c);
  const parent = VILLAGE_OF[citySlug(c)];
  const doc = proofBySlug.get(citySlug(c));
  const note: TownRowNote = {
    ...(parent ? { v: parent } : {}),
    ...(isDevensCity(c) ? { d: 1 as const } : {}),
    ...(doc?.projects.length ? { p: doc.projects.map((p): [string, string] => [p.slug, p.shortTitle]) } : {}),
  };
  const dist = f.isBase ? "Our base" : `about ${f.miles} mi ${f.dir}`;
  return Object.keys(note).length ? [cityHubPath(c), cityLabel(c), dist, note] : [cityHubPath(c), cityLabel(c), dist];
}

function County({ g, open, last = false }: { g: CountyGroup; open: boolean; last?: boolean }) {
  return (
    <section id={g.id} aria-labelledby={`${g.id}-h`} className="border-t border-line pt-10">
      <h3 id={`${g.id}-h`} className="text-h3 text-navy">{g.county}, {g.state}</h3>
      <p className="mt-3 text-muted max-w-[38em] mx-auto">
        {`${placesWord(g.towns.length)}, ${span(g)} miles from Northborough.`}
        {g.projects.length > 0 && <> Documented on this site: {g.projects.map((p) => p.title).join("; ")}.</>}
      </p>
      <details open={open} className={`faq-row svc-dir group mt-6 border-t border-line ${last ? "" : "border-b-0"}`}>
        <summary>
          <span className="faq-q">{`Towns (${g.towns.length})`}</span>
          <PlusIcon className="faq-icon" />
        </summary>
        <div className="pb-6">
          <table>
            <caption className="sr-only">{`Towns we serve in ${g.county}, ${g.stateName}, with their distance from Northborough and a link to each town's page`}</caption>
            <thead><tr><th scope="col">Town</th><th scope="col">From Northborough</th></tr></thead>
            <CountyTowns rows={g.towns.map(townRow)} />
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

      {/* HEADER — centered text on the left (7/12); the bare estimate form (the page's ONE EstimateForm) in the right
          5/12 from lg, after the hero text on phones. */}
      <section className="page-head" data-cta-zone>
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 max-[359px]:text-h1-long text-navy"><Typeset text={H1} /></h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[34em] mx-auto">{DESCRIPTION}</p>
            <p className="mt-4 text-[15px] text-muted max-w-[38em] mx-auto">
              {`The ${PLACES} places on this page range from about ${nearest.miles} miles away (${cityLabel(NEAREST)}) to about ${farthest.miles} miles (${cityLabel(FARTHEST)}), in a straight line. We have completed projects in ${site.townsWithProjects}+ of these towns, and each town has its own page with all ${servicesCountWord} of our services.`}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
              <EstimateLink className="btn btn-primary w-full sm:w-auto lg:hidden">Get a free estimate</EstimateLink>
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span></a>
            </div>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      {/* MAP + COUNTIES AT A GLANCE — grid-cols-1 (minmax(0,1fr)) + min-w-0 so nothing widens the track past
          the viewport at 320px (V5.9) */}
      <section className="section" aria-labelledby="glance-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.1fr_.9fr] gap-x-12 gap-y-14 items-start">
          <figure className="min-w-0 self-start border-y border-line py-4 lg:sticky lg:top-28">
            <ServiceAreaMap documented={new Set(proof.map((p) => citySlug(p.city)))} />
            <figcaption className="mt-3 text-sm text-muted max-w-[38em] mx-auto">
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
                {/* Cell styles on the tbody (child variants), not on each of the ~33 cells: every class string is written
                    twice, in the HTML and the RSC payload (page weight budget, spec §11). */}
                <tbody className="*:border-t *:border-line [&_th]:pl-3 [&_th]:pr-2 [&_th]:py-2.5 [&_th]:font-medium [&_th]:text-ink [&_td]:px-1.5 [&_td]:pt-3.5 [&_td]:pb-2.5 [&_td]:text-ink/80 [&_td]:text-right [&_td]:tnum [&_td]:whitespace-nowrap [&_th,&_td]:align-top sm:[&_th,&_td]:px-5 lg:[&_th,&_td]:px-4 xl:[&_th,&_td]:px-5">
                  {groups.map((g) => (
                    <tr key={g.id}>
                      <th scope="row"><a href={`#${g.id}`} className="link-nav inline-block py-1"><Typeset text={`${g.county}, ${g.state}`} /></a></th>
                      <td>{g.towns.length}</td>
                      <td>{g.min === g.max ? g.min : `${g.min}–${g.max}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="mt-12 text-h3s text-navy">Distance from Northborough</h3>
            <ul className="rule-list mt-4 text-[15px]">
              {bands.map((b) => (
                <li key={b.label} className="flex justify-center items-baseline gap-x-2 py-3"><span className="font-medium text-navy tnum">{b.count}</span> <span className="text-muted whitespace-nowrap">places, {b.label}</span></li>
              ))}
            </ul>
            <CtaRow className="mt-10" />
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
                  {/* .dot-list-wrap--stack (globals.css): county over distance, centered. The pair (~365px at text-sm) does
                      not fit one line in the 2- and 3-column grid, so it stacks at every width (no separator dots). */}
                  <ul className="dot-list-wrap dot-list-wrap--stack mt-1 text-sm text-muted">
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

      {/* MID-PAGE ESTIMATE FORM — paper between the stone documented-work band and the stone directory */}
      <FormBand tone="paper" />

      {/* DIRECTORY — stone, so the paper form band above and the paper FAQ below stay distinct */}
      <section className="section bg-stone" aria-labelledby="massachusetts">
        <div className="container-x">
          <div className="section-head">
            <h2 id="massachusetts" className="text-h2 text-navy">Massachusetts towns we serve</h2>
            <p>
              {`Pick your town for its page, with links to each of our ${servicesCountWord} services: ${services.map((s) => s.short).join(", ")}. Each page lists the town's distance from Northborough and who issues building permits there.`}
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
          <CtaRow className="mt-14" />
        </div>
      </section>

      {/* FAQ — paper (the directory above is stone) */}
      <section className="section bg-paper" aria-labelledby="area-faq-h">
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
          <h2 className="text-h2 text-white max-w-[18em] mx-auto text-balance">Planning a project in one of these towns?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[34em] mx-auto">Estimates are free and there is no obligation.</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-on-dark w-full sm:w-auto"><PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span></a>
          </div>
        </div>
      </section>
    </>
  );
}
