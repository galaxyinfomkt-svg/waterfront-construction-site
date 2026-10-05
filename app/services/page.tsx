import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { services, site, serviceArea } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, serviceId, pageUrl, AREA_FACTS, type Crumb } from "@/lib/schema";
import { credentialLine } from "@/lib/credentials";
import { getContent, serviceProjects, serviceGuides, SOURCES } from "@/lib/service-content";

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

      <section className="bg-brand-grad text-white">
        <div className="container-x py-12 md:py-16">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold max-w-4xl">{H1}</h1>
          <p className="mt-5 text-white/90 max-w-3xl text-lg leading-relaxed">{LEAD}</p>
          <p className="mt-4 text-sm text-white/80">Owner-led · Founded in {site.founded} in Northborough, MA{credentials ? ` · ${credentials}` : ""}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-green text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-outline text-base"><span aria-hidden="true">📞</span> {site.phone}</a>
          </div>
        </div>
      </section>

      <section className="py-14" aria-labelledby="services-h">
        <div className="container-x">
          <h2 id="services-h" className="sr-only">Our six services</h2>
          <ul role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(({ s, c, costGuide, project }) => (
              <li key={s.slug} className="card overflow-hidden flex flex-col">
                <div className="relative h-48 bg-brand-grad">
                  {s.imageIsStock ? (
                    // No real photo for this service yet: an icon tile, never a stock photo (audit 02 C1).
                    <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-6xl">{s.icon}</span>
                  ) : (
                    <>
                      <Image src={s.image} alt={s.imageAlt} fill quality={60} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover" />
                      <span aria-hidden="true" className="absolute top-3 left-3 text-2xl bg-white/90 rounded-lg w-10 h-10 grid place-items-center">{s.icon}</span>
                    </>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="font-bold text-xl text-navy">
                    <Link href={`/services/${s.slug}`} className="hover:text-blue">{s.short}</Link>
                  </h2>
                  <p className="text-[15px] text-ink/80 mt-2">{c.cardSummary}</p>
                  <p className="text-sm text-ink/70 mt-2"><span className="font-semibold text-navy">Typical timeline:</span> {s.timeline}</p>
                  <ul role="list" className="mt-4 space-y-1.5 text-sm font-semibold">
                    <li><Link href={`/services/${s.slug}`} className="text-blue underline underline-offset-2">{s.name}: costs, permits and FAQ</Link></li>
                    {costGuide && <li><Link href={`/blog/${costGuide.slug}`} className="text-blue underline underline-offset-2">{costGuide.title}</Link></li>}
                    {project && <li><Link href={`/projects/${project.slug}`} className="text-blue underline underline-offset-2">Case study: {project.title}</Link></li>}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 bg-white" aria-labelledby="how-h">
        <div className="container-x grid lg:grid-cols-2 gap-10">
          <div>
            <h2 id="how-h" className="text-2xl md:text-3xl font-extrabold text-navy">How we work</h2>
            <ul className="mt-5 space-y-3 text-ink/85 leading-relaxed">
              <li><span className="font-semibold text-navy">Owner-led.</span> The company is run by its founder, {site.owner}, who started it in {site.founded}.</li>
              <li><span className="font-semibold text-navy">Itemized estimates.</span> Every estimate is free, written and itemized for your house.</li>
              <li><span className="font-semibold text-navy">Permits and inspections.</span> We apply for the building permit and schedule inspections; plumbing, gas and electrical permits are pulled by those trades.</li>
              <li><span className="font-semibold text-navy">Real projects.</span> Our <Link href="/gallery" className="text-blue underline underline-offset-2">project case studies</Link> show real jobs with photos taken during the work, at town level only.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-tint-blue p-6">
            <h2 className="text-xl font-extrabold text-navy">Before you hire any contractor in Massachusetts</h2>
            <ul className="mt-4 space-y-2.5 text-[15px] text-ink/85 leading-relaxed">
              <li>Home improvement work over $1,000 on an owner-occupied home needs a written contract with the price, payment schedule, start and completion dates, and the contractor&apos;s registration number.</li>
              <li>The deposit can be no more than one-third of the total price, or the cost of special-order materials if that is greater.</li>
              <li>The contractor must be registered with the state Home Improvement Contractor program; you can check a registration with the Office of Consumer Affairs and Business Regulation.</li>
              <li>Let the contractor pull the building permit: homeowners who pull their own permit for a contractor&apos;s work generally lose access to the state Guaranty Fund.</li>
            </ul>
            <p className="mt-4 text-xs text-ink/65">
              Sources: <a href={SOURCES.contract.url} className="underline underline-offset-2">{SOURCES.contract.label}</a> · <a href={SOURCES.c142a.url} className="underline underline-offset-2">{SOURCES.c142a.label}</a> · <a href={SOURCES.hic.url} className="underline underline-offset-2">{SOURCES.hic.label}</a>
            </p>
          </div>
        </div>
      </section>

      <section className="py-14" aria-labelledby="area-h">
        <div className="container-x max-w-4xl">
          <h2 id="area-h" className="text-2xl md:text-3xl font-extrabold text-navy">Where we work</h2>
          <p className="mt-4 text-lg text-ink/85 leading-relaxed">
            Based in Northborough (Worcester County), we work across {serviceArea.regions}: {AREA_FACTS.municipalities} cities and towns in {AREA_FACTS.counties} counties. Each service page lists every town we serve, by county.
          </p>
          <p className="mt-4"><Link href="/service-areas" className="font-semibold text-blue underline underline-offset-2">See every town we serve, by county</Link></p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-green text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-navy text-base"><span aria-hidden="true">📞</span> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
