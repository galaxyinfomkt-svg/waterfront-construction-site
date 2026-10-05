import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon } from "@/components/chrome-icons";
import { site, services, stats, serviceArea, testimonials } from "@/lib/site";
import { projects } from "@/lib/projects";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, BUSINESS_ID, OWNER_PAGE, type Crumb } from "@/lib/schema";
import { projectCardImage } from "@/lib/service-content";
import { countyGroups, AREA_SENTENCE } from "../service-areas/areas";

// /about — the company entity page (audit 06 ST-H1/ST-C2, 09 AEO-H1/H2, 08 §5.9).
// Only facts from lib/site.ts, lib/credentials.ts and the documented projects. No stock photo anywhere
// (the old "owner" photo was a stock image of a commercial crew). Owner-input gaps — trade history,
// languages, crew, warranty, deposit and payment policies — are omitted until supplied, never placeholders.

const H1 = "About Waterfront Construction Inc";
const LEAD = `${site.name} is an owner-led home remodeling contractor based in Northborough, Massachusetts. ${site.owner} founded the company in ${site.founded} and has ${site.experience}+ years of hands-on construction experience. We have completed ${site.projectsCompleted}+ projects in ${site.townsWithProjects}+ towns: kitchens and bathrooms, additions, decks, siding, windows and doors, and painting, across ${serviceArea.short}.`;

export const metadata = pageMeta({
  title: "About Us: Owner-Led Remodeling Since 2017",
  description: `Founded in Northborough, MA, in ${site.founded} by ${site.owner}, who has ${site.experience}+ years of hands-on construction experience. ${site.projectsCompleted}+ projects completed in ${site.townsWithProjects}+ towns.`,
  path: "/about",
});

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "About", path: "/about" }];

const credentials = hasHic || hasCsl ? credentialLine({ insured: false }) : "";

const values: [string, string][] = [
  ["Honesty first", "Clear scope, itemized pricing and straight answers, before, during and after the job."],
  ["Craftsmanship", "We care about the details that make a finished space look and work right."],
  ["Respect for your time", "We show up, communicate, and work to the schedule we agree on with you."],
  ["Accountability", "Owner-led: you always know who is responsible for your project."],
];

const ld = pageGraph(
  [
    webPageNode({ path: "/about", type: "AboutPage", name: H1, description: LEAD, mainEntity: { "@id": BUSINESS_ID } }),
    breadcrumbNode(crumbs),
  ],
  { business: "full" },
);

export default function AboutPage() {
  const counties = countyGroups();
  const shownTestimonials = testimonials.slice(0, 3);
  const profiles = [
    { label: "Google Business Profile", href: site.gbp },
    { label: "Facebook", href: site.facebook },
    { label: "Instagram", href: site.instagram },
    ...site.profiles.map((href) => ({ label: new URL(href).hostname.replace(/^www\./, ""), href })),
  ];
  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — plain brand gradient (no stock photo) */}
      <section className="bg-brand-grad text-white" data-cta-zone>
        <div className="container-x py-14 md:py-20">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold max-w-4xl">{H1}</h1>
          <p className="mt-5 text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed">{LEAD}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contact#estimate" className="btn btn-green text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-outline text-base"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>

      {/* OWNER + COMPANY FACTS */}
      <section className="py-16 md:py-20" aria-labelledby="owner-h">
        <div className="container-x grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div>
            <span className="eyebrow">The owner</span>
            <h2 id="owner-h" className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Meet {site.owner}</h2>
            {site.ownerPhoto && (
              <figure className="mt-6 relative h-[420px] rounded-3xl overflow-hidden shadow-card">
                <Image src={site.ownerPhoto} alt={`${site.owner}, owner of ${site.name}`} fill quality={60} sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
              </figure>
            )}
            <p className="mt-5 text-lg text-ink/85 leading-relaxed">
              {`${site.owner} founded ${site.name} in Northborough in ${site.founded} and leads it today. He has ${site.experience}+ years of hands-on construction experience.`}
            </p>
            <p className="mt-4 text-ink/80 leading-relaxed">
              {`The company has completed ${site.projectsCompleted}+ projects in ${site.townsWithProjects}+ towns, across six services: ${services.map((s) => s.short.toLowerCase()).join(", ")}. Every project starts with a free, itemized estimate.`}
            </p>
            {credentials && <p className="mt-4 font-semibold text-navy">{credentials}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={OWNER_PAGE} className="btn btn-navy">{`${site.owner}'s profile`}</Link>
              <Link href="/services" className="btn btn-white ring-1 ring-black/10">Our services</Link>
            </div>
          </div>

          {/* Facts block: plain HTML, one fact per row, mirrored in the business JSON-LD (06 ST-H1, 09 AEO-H2) */}
          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h2 className="text-xl font-extrabold text-navy">Company facts</h2>
            <dl className="mt-4 grid sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-2.5 text-[15px]">
              <dt className="font-bold text-navy">Company</dt><dd className="text-ink/85">{site.name}</dd>
              <dt className="font-bold text-navy">Founded</dt><dd className="text-ink/85">{site.founded}, in Northborough, MA</dd>
              <dt className="font-bold text-navy">Owner</dt>
              <dd className="text-ink/85"><Link href={OWNER_PAGE} className="font-semibold text-blue underline underline-offset-2">{site.owner}</Link>, {site.experience}+ years of hands-on construction experience</dd>
              {credentials && (<><dt className="font-bold text-navy">Registration</dt><dd className="text-ink/85">{credentials}</dd></>)}
              <dt className="font-bold text-navy">Insurance</dt><dd className="text-ink/85">Insured; certificate of insurance on request</dd>
              <dt className="font-bold text-navy">Projects completed</dt><dd className="text-ink/85">{site.projectsCompleted}+</dd>
              <dt className="font-bold text-navy">Towns with completed projects</dt><dd className="text-ink/85">{site.townsWithProjects}+</dd>
              <dt className="font-bold text-navy">Case studies on this site</dt><dd className="text-ink/85"><Link href="/gallery" className="font-semibold text-blue underline underline-offset-2">{projects.length}</Link></dd>
              <dt className="font-bold text-navy">Service area</dt>
              <dd className="text-ink/85">{AREA_SENTENCE} (<Link href="/service-areas" className="font-semibold text-blue underline underline-offset-2">every town</Link>)</dd>
              <dt className="font-bold text-navy">Services</dt>
              <dd className="text-ink/85">
                {services.map((s, i) => (
                  <span key={s.slug}>{i > 0 ? ", " : ""}<Link href={`/services/${s.slug}`} className="text-blue underline underline-offset-2">{s.short}</Link></span>
                ))}
              </dd>
              <dt className="font-bold text-navy">Address</dt><dd className="text-ink/85">{site.address}</dd>
              <dt className="font-bold text-navy">Phone</dt><dd className="text-ink/85"><a href={site.phoneHref} className="font-semibold text-blue underline underline-offset-2">{site.phone}</a></dd>
              <dt className="font-bold text-navy">Email</dt><dd className="text-ink/85 [overflow-wrap:anywhere]"><a href={site.emailHref} className="text-blue underline underline-offset-2">{site.email}</a></dd>
              <dt className="font-bold text-navy">Hours</dt><dd className="text-ink/85">{site.hours}</dd>
              <dt className="font-bold text-navy">Estimates</dt><dd className="text-ink/85">Free and itemized</dd>
              <dt className="font-bold text-navy">Financing</dt><dd className="text-ink/85">Not offered</dd>
            </dl>
          </div>
        </div>
      </section>

      {/* NUMBERS — exact labels (15+ is the owner's experience; the company dates from 2017) */}
      <section className="bg-navy text-white" aria-label="Company numbers">
        <dl className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="py-8 px-2 text-center flex flex-col-reverse">
              <dt className="text-xs md:text-sm text-white/85 mt-1">{s.value === `${site.experience}+` ? `${s.label} (owner ${site.owner})` : s.label}</dt>
              <dd className="text-4xl md:text-5xl font-extrabold text-cyan">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* VALUES */}
      <section className="py-16 md:py-20 bg-tint-blue" aria-labelledby="values-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">What we stand for</span>
            <h2 id="values-h" className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">How we work</h2>
          </div>
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(([t, d]) => (
              <li key={t} className="card p-6 h-full">
                <h3 className="font-bold text-navy text-lg">{t}</h3>
                <p className="text-sm text-ink/80 mt-1.5">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-ink/80">
            Questions about registration, permits, contracts or cost? <Link href="/faq" className="font-semibold text-blue underline underline-offset-2">Read our pre-hire FAQ</Link>.
          </p>
        </div>
      </section>

      {/* OUR WORK — the documented case studies, real photos only */}
      <section className="py-16 md:py-20" aria-labelledby="work-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Our work</span>
            <h2 id="work-h" className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Projects documented on this site</h2>
            <p className="mt-3 text-ink/80">Case studies with photos from each job site.</p>
          </div>
          <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => {
              const img = projectCardImage(p);
              return (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className="group card overflow-hidden pop block h-full">
                    <span className="relative block h-52 overflow-hidden">
                      <Image src={img.src} alt={img.alt} fill quality={60} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover zoomimg" />
                    </span>
                    <span className="block p-5">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-blue">{p.location}</span>
                      <span className="block mt-1 font-bold text-navy text-lg leading-tight">{p.title}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* TESTIMONIALS — verbatim, with permission, no stars */}
      <section className="py-16 md:py-20 mesh text-white" aria-labelledby="clients-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-cyan">Client testimonials</span>
            <h2 id="clients-h" className="mt-3 text-3xl md:text-5xl font-extrabold">What clients say</h2>
            <p className="mt-3 text-white/85">Shared with permission by our clients.</p>
          </div>
          <ul className="mt-10 grid md:grid-cols-3 gap-6">
            {shownTestimonials.map((t) => (
              <li key={t.name}>
                <figure className="glass rounded-2xl p-6 h-full flex flex-col">
                  <blockquote className="flex-1 text-white/90 leading-relaxed"><p>&ldquo;{t.text}&rdquo;</p></blockquote>
                  <figcaption className="mt-4 pt-4 border-t border-white/15"><span className="block font-bold">{t.name}</span><span className="block text-sm text-white/80">{t.town}</span></figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/reviews" className="btn btn-white">All testimonials</Link>
            <a href={site.gbp} target="_blank" rel="noopener" className="btn btn-outline">Our Google reviews</a>
          </div>
        </div>
      </section>

      {/* WHERE WE WORK */}
      <section className="py-16 md:py-20" aria-labelledby="where-h">
        <div className="container-x">
          <div className="max-w-3xl">
            <span className="eyebrow">Where we work</span>
            <h2 id="where-h" className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Based in {serviceArea.base}</h2>
            <p className="mt-3 text-ink/85 text-lg">{`We take projects in ${AREA_SENTENCE}.`}</p>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {counties.map((g) => (
              <li key={g.id}>
                <Link href={`/service-areas#${g.id}`} className="inline-flex items-center min-h-11 px-4 rounded-full bg-white ring-1 ring-black/10 text-sm font-semibold text-navy hover:ring-blue/50">
                  {g.county}, {g.state} ({g.towns.length})
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6"><Link href="/service-areas" className="font-semibold text-blue underline underline-offset-2">See every town we serve and its distance from Northborough</Link></p>
        </div>
      </section>

      {/* FIND US ONLINE — the visible counterpart of the business sameAs */}
      <section className="pb-16" aria-labelledby="online-h">
        <div className="container-x">
          <h2 id="online-h" className="text-2xl font-extrabold text-navy">Find us online</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {profiles.map((p) => (
              <li key={p.href}><a href={p.href} target="_blank" rel="noopener" className="btn btn-white ring-1 ring-black/10 text-sm">{p.label}</a></li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-grad text-white" data-cta-zone>
        <div className="container-x py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold">Let&apos;s talk about your project</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Free, no-obligation estimates from an owner-led contractor based in Northborough.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact#estimate" className="btn btn-white text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-green text-base"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
