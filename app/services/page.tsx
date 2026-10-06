import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { services, site, serviceArea } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, serviceId, pageUrl, AREA_FACTS, type Crumb } from "@/lib/schema";
import { credentialLine } from "@/lib/credentials";
import { getContent, serviceProjects, serviceGuides, SOURCES, PERMITS_HOW } from "@/lib/service-content";
import { PhoneIcon, ArrowLabel } from "@/components/chrome-icons";
import { EstimateLink } from "@/components/chrome-client";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";

const TITLE = "Home Remodeling Services in Central & Eastern MA";
const DESCRIPTION = "Kitchens and baths, additions, decks, siding, windows and doors, and painting from one owner-led contractor based in Northborough, MA. Free itemized estimates.";
const H1 = "Home Remodeling Services in Central & Eastern Massachusetts";
const LEAD = `Waterfront Construction Inc is an owner-led home remodeling contractor based in Northborough, Massachusetts, founded in ${site.founded} by ${site.owner}, who has ${site.experience}+ years of hands-on construction experience. We offer the six services below to homeowners across ${serviceArea.short}. Every project starts with a free, itemized estimate.`;

export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/services" });

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }];

const cards = services.map((s) => {
  const c = getContent(s.slug)!;
  const costGuide = serviceGuides(c.cost.guides)[0];
  const project = serviceProjects(s.slug)[0];
  return { s, c, costGuide, project };
});

const ld = pageGraph([
  webPageNode({
    path: "/services", type: "CollectionPage", name: H1, description: DESCRIPTION,
    mainEntity: {
      "@type": "ItemList", name: "Home remodeling services", numberOfItems: services.length,
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem", position: i + 1,
        item: { "@type": "Service", "@id": serviceId(s.slug), name: s.short, url: pageUrl(`/services/${s.slug}`) },
      })),
    },
  }),
  breadcrumbNode(crumbs),
]);

export default function ServicesPage() {
  const credentials = credentialLine();
  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — centered text on the left; the bare estimate form (the page's ONE EstimateForm) in the right column from lg,
          after the hero text on phones. The /contact#estimate links are EstimateLinks: they jump to this form. */}
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 text-navy">{H1}</h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[34em] mx-auto">{LEAD}</p>
            {/* .dot-list-wrap (globals.css): centered; stacked below sm, one dotted line from sm. A registration line
                (once lib/site.ts holds the numbers) makes the row too long to share one line (it needs <= ~64 characters
                at 640px), so the list then stacks at every width. */}
            <ul className={`dot-list-wrap mt-4 text-sm text-muted${`Owner-led · Founded in ${site.founded} in Northborough, MA · ${credentials}`.length > 64 ? " dot-list-wrap--stack" : ""}`}>
              <li>Owner-led</li>{" "}
              <li>Founded in {site.founded} in Northborough, MA</li>{" "}
              {credentials && <li>{credentials}</li>}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
              <EstimateLink className="btn btn-primary w-full sm:w-auto lg:hidden">Get a free estimate</EstimateLink>
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
            </div>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      <section className="section bg-paper" aria-labelledby="services-h">
        <div className="container-x">
          <h2 id="services-h" className="sr-only">Our six services</h2>
          {/* The 01–06 index is drawn by a CSS counter on an aria-hidden span: decorative, never page text.
              From sm each card is a row subgrid (media, index, title, body, timeline, then one row per link), so titles,
              bodies, timelines and link hairlines line up across a row.
              The row gap is a margin on each card (sm:mt-12, cancelled by the list's sm:-mt-12), not the list's row-gap:
              a parent row-gap that differs from the subgrid's 0 gap is spread into the subgrid tracks and opens a hole
              under one-line titles. */}
          <ul role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-y-0 sm:-mt-12 [counter-reset:svc]">
            {cards.map(({ s, c, costGuide, project }) => (
              <li key={s.slug} className="card-ed group sm:grid sm:grid-rows-subgrid sm:row-span-8 sm:gap-y-0 sm:mt-12">
                {s.imageIsStock ? (
                  // No real photo for this service yet: a typographic title plate, never a stock photo (audit 02 C1).
                  // Stone well, inset hairline frame, the card's own name drawn with CSS generated content from data-name
                  // (no text node), bottom-centre in Newsreader 400 navy (centered like the card text); same 4:3 box as the photo cards.
                  <div className="media bg-stone" aria-hidden="true">
                    <span data-name={s.short} className="absolute inset-3 border border-line flex items-end justify-center text-center p-5 sm:p-6 font-display text-[2.125rem] leading-[1.06] tracking-[-0.01em] text-navy text-balance before:content-[attr(data-name)]" />
                  </div>
                ) : (
                  <div className="media">
                    <Image src={s.image} alt={s.imageAlt} fill quality={60} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover" />
                  </div>
                )}
                <p className="meta" aria-hidden="true"><span className="[counter-increment:svc] before:content-[counter(svc,decimal-leading-zero)]" /></p>
                <h2 className="mt-2.5 font-display text-h3 text-navy">
                  <Link href={`/services/${s.slug}`} className="after:absolute after:inset-0 after:content-[''] underline-offset-[.18em] decoration-1 group-hover:underline focus-visible:underline">{s.short}</Link>
                </h2>
                <p className="body">{c.cardSummary}</p>{" "}
                <p className="mt-3 text-sm text-muted"><span className="font-semibold text-ink">Typical timeline:</span> {s.timeline}</p>{" "}
                <ul role="list" className="pt-4 text-sm sm:grid sm:grid-rows-subgrid sm:row-span-3 sm:gap-y-0">
                  <li><Link href={`/services/${s.slug}`} className="link-arrow lift text-sm"><ArrowLabel text={`${s.name}: costs, permits and FAQ`} /></Link>{" "}</li>
                  {costGuide && <li><Link href={`/blog/${costGuide.slug}`} className="block py-2 border-t border-line text-sm text-ink/80 hover:underline underline-offset-4 lift">{costGuide.title}</Link>{" "}</li>}
                  {project && <li><Link href={`/projects/${project.slug}`} className="block py-2 border-t border-line text-sm text-ink/80 hover:underline underline-offset-4 lift">Case study: {project.title}</Link>{" "}</li>}
                </ul>
              </li>
            ))}
          </ul>
          <CtaRow className="mt-14" />
        </div>
      </section>

      <section className="section bg-stone" aria-labelledby="how-h">
        <div className="container-x grid lg:grid-cols-12 gap-x-8 gap-y-14">
          <div className="lg:col-span-7">
            <h2 id="how-h" className="text-h2 text-navy">How we work</h2>
            <ul className="mt-8 rule-list text-ink max-w-[38em] mx-auto">
              <li className="py-4"><span className="font-semibold">Owner-led.</span> The company is run by its founder, {site.owner}, who started it in {site.founded}.</li>
              <li className="py-4"><span className="font-semibold">Itemized estimates.</span> Every estimate is free, written and itemized for your house.</li>
              <li className="py-4"><span className="font-semibold">Permits and inspections.</span> {PERMITS_HOW}</li>
              <li className="py-4"><span className="font-semibold">Real projects.</span> Our <Link href="/gallery" className="link">project case studies</Link> are documented with our own photos and site videos, at town level only.</li>
            </ul>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:border-l lg:border-line lg:pl-8">
            <h2 className="text-h3 text-navy">Before you hire any contractor in Massachusetts</h2>
            <ul className="mt-5 dash-list space-y-3 text-[15px] text-ink">
              <li>Home improvement work over $1,000 on an owner-occupied home needs a written contract with the price, payment schedule, start and completion dates, and the contractor&apos;s registration number.</li>
              <li>The deposit can be no more than one-third of the total price, or the cost of special-order materials if that is greater.</li>
              <li>The contractor must be registered with the state Home Improvement Contractor program; you can check a registration with the Office of Consumer Affairs and Business Regulation.</li>
              <li>Let the contractor pull the building permit: homeowners who pull their own permit for a contractor&apos;s work generally lose access to the state Guaranty Fund.</li>
            </ul>
            {/* Long source titles in a narrow column: stacked (one per line, centered) at every width. */}
            <ul className="dot-list-wrap dot-list-wrap--stack mt-5 text-[13px] text-muted">
              <li>Sources: <a href={SOURCES.contract.url} className="link py-1.5">{SOURCES.contract.label}</a></li>{" "}
              <li><a href={SOURCES.c142a.url} className="link py-1.5">{SOURCES.c142a.label}</a></li>{" "}
              <li><a href={SOURCES.hic.url} className="link py-1.5">{SOURCES.hic.label}</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* MID-PAGE ESTIMATE — paper between the stone "How we work" band and the stone "Where we work" band */}
      <FormBand tone="paper" />

      <section className="section bg-stone" aria-labelledby="area-h">
        <div className="container-x">
          <h2 id="area-h" className="text-h2 text-navy">Where we work</h2>
          <p className="mt-5 text-lead text-ink/80 max-w-[34em] mx-auto">
            Based in Northborough (Worcester County), we work across {serviceArea.regions}: {AREA_FACTS.municipalities} cities and towns in {AREA_FACTS.counties} counties. Each service page lists every town we serve, by county.
          </p>
          <p className="mt-4"><Link href="/service-areas" className="link-arrow"><ArrowLabel text="See every town we serve, by county" /></Link></p>
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
