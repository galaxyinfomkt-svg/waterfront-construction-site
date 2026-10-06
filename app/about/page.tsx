import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, ArrowLabel } from "@/components/chrome-icons";
import StatsRow from "@/components/StatsRow";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
import { EstimateLink } from "@/components/chrome-client";
import Typeset from "@/components/Typeset";
import { site, services, stats, serviceArea, testimonials } from "@/lib/site";
import { projects } from "@/lib/projects";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import { displayAddress } from "@/lib/address";
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

// Facts dl (§4.28): each dt/dd pair on its own hairline row.
const FACT = "grid sm:grid-cols-[10rem_1fr] lg:grid-cols-[13rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line";
const FACT_DD = "text-[15.5px] text-ink";
// Two-column hairline index (§4.14): at lg each column starts on its own top rule (no rule across the gap).
const TWO_COL_RULES = "lg:border-t-0 lg:[&>li:nth-child(-n+2)]:border-t lg:[&>li:nth-child(-n+2)]:border-line";
// Decorative index, drawn from data-n with CSS generated content: seen, but no text node (visible words unchanged).
const Index = ({ n, className = "" }: { n: number; className?: string }) => (
  <span aria-hidden="true" data-n={String(n).padStart(2, "0")} className={`before:content-[attr(data-n)] ${className}`} />
);
// Projects grid: rows of four, then rows of three (7 case studies = 4 + 3, design spec §6 About).
const projectSpan = (i: number, n: number) => (i < (n % 3 === 1 ? 4 : n % 3 === 2 ? 8 : 0) ? "lg:col-span-3" : "lg:col-span-4");

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

      {/* HEADER — text-only page head (no stock photo). Text on the left (7/12); the bare estimate form (the page's
          ONE EstimateForm) in the right 5/12 from lg, after the hero text on phones. */}
      <section className="page-head" data-cta-zone>
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 text-balance text-navy">{H1}</h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[36em]">{LEAD}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <EstimateLink className="btn btn-primary w-full sm:w-auto lg:hidden">Get a free estimate</EstimateLink>
              <a href={site.phoneHref} className="btn btn-secondary tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
            </div>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      {/* OWNER + COMPANY FACTS */}
      <section className="section" aria-labelledby="owner-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-x-12 gap-y-14">
          <div className="lg:sticky lg:top-28 self-start">
            <p className="eyebrow">The owner</p>
            <h2 id="owner-h" className="mt-4 text-h2 text-navy">Meet {site.owner}</h2>
            {site.ownerPhoto && (
              <figure className="mt-8 relative aspect-[4/5] overflow-hidden bg-well">
                <Image src={site.ownerPhoto} alt={`${site.owner}, owner of ${site.name}`} fill quality={60} sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
              </figure>
            )}
            <p className="mt-6 text-lead text-ink/80">
              {`${site.owner} founded ${site.name} in Northborough in ${site.founded} and leads it today. He has ${site.experience}+ years of hands-on construction experience.`}
            </p>
            <p className="mt-4 text-muted">
              {`The company has completed ${site.projectsCompleted}+ projects in ${site.townsWithProjects}+ towns, across six services: ${services.map((s) => s.short.toLowerCase()).join(", ")}. Every project starts with a free, itemized estimate.`}
            </p>
            {credentials && <p className="mt-4 font-medium text-ink">{credentials}</p>}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-x-6">
              <Link href={OWNER_PAGE} className="btn btn-secondary w-full sm:w-auto">{`${site.owner}'s profile`}</Link>
              <Link href="/services" className="link-arrow"><ArrowLabel text="Our services" /></Link>
            </div>
          </div>

          {/* Facts block: plain HTML, one fact per row, mirrored in the business JSON-LD (06 ST-H1, 09 AEO-H2) */}
          <div>
            <h2 className="text-h3 text-navy">Company facts</h2>
            <dl className="mt-6 border-t border-line">
              <div className={FACT}><dt className="eyebrow pt-0.5">Company</dt><dd className={FACT_DD}>{site.name}</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Founded</dt><dd className={FACT_DD}>{site.founded}, in Northborough, MA</dd></div>
              <div className={FACT}>
                <dt className="eyebrow pt-0.5">Owner</dt>
                <dd className={FACT_DD}><Link href={OWNER_PAGE} className="link">{site.owner}</Link>, {site.experience}+ years of hands-on construction experience</dd>
              </div>
              {credentials && (<div className={FACT}><dt className="eyebrow pt-0.5">Registration</dt><dd className={FACT_DD}>{credentials}</dd></div>)}
              <div className={FACT}><dt className="eyebrow pt-0.5">Insurance</dt><dd className={FACT_DD}>Insured; certificate of insurance on request</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Projects completed</dt><dd className={FACT_DD}>{site.projectsCompleted}+</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Towns with completed projects</dt><dd className={FACT_DD}>{site.townsWithProjects}+</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Case studies on this site</dt><dd className={FACT_DD}><Link href="/gallery" className="link -my-1 inline-block py-1 pr-1"><ArrowLabel text={String(projects.length)} /></Link></dd></div>
              <div className={FACT}>
                <dt className="eyebrow pt-0.5">Service area</dt>
                <dd className={FACT_DD}>{AREA_SENTENCE} (<Link href="/service-areas" className="link">every town</Link>)</dd>
              </div>
              <div className={FACT}>
                <dt className="eyebrow pt-0.5">Services</dt>
                <dd className={FACT_DD}>
                  {/* Stacked links. The list commas stay in the text (screen readers, copy, visible-text parity) but are not
                      drawn; inline (not sr-only, which is absolutely positioned) so they do not break the line. */}
                  {services.map((s, i) => (
                    <span key={s.slug} className="block">
                      <Link href={`/services/${s.slug}`} className="link-nav inline-block py-1">{s.short}</Link>
                      {i < services.length - 1 && <span className="opacity-0">, </span>}
                    </span>
                  ))}
                </dd>
              </div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Address</dt><dd className={FACT_DD}>{displayAddress}</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Phone</dt><dd className={FACT_DD}><a href={site.phoneHref} className="link tel">{site.phone}</a></dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Email</dt><dd className={`${FACT_DD} [overflow-wrap:anywhere]`}><a href={site.emailHref} className="link">{site.email}</a></dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Hours</dt><dd className={FACT_DD}>{site.hours}</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Estimates</dt><dd className={FACT_DD}>Free and itemized</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Financing</dt><dd className={FACT_DD}>Not offered</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* NUMBERS — exact labels (15+ is the owner's experience; the company dates from 2017) */}
      <StatsRow label="Company numbers" className="pb-0" items={stats.map((s) => ({ value: s.value, label: s.value === `${site.experience}+` ? `${s.label} (owner ${site.owner})` : s.label }))} />

      {/* VALUES */}
      <section className="section" aria-labelledby="values-h">
        <div className="container-x">
          <div className="section-head">
            <p className="eyebrow">What we stand for</p>
            <h2 id="values-h" className="text-h2 text-navy">How we work</h2>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {values.map(([t, d], i) => (
              <li key={t} className="border-t border-ink pt-5">
                <Index n={i + 1} className="eyebrow tnum" />
                <h3 className="mt-4 text-h3s text-navy">{t}</h3>
                <p className="mt-2 text-[15.5px] text-muted">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-muted max-w-[60ch]">
            Questions about registration, permits, contracts or cost? <Link href="/faq" className="link">Read our pre-hire FAQ</Link>.
          </p>
        </div>
      </section>

      {/* MID-PAGE ESTIMATE FORM — stone between the paper values and the paper case studies */}
      <FormBand tone="stone" />

      {/* OUR WORK — the documented case studies, real photos only (the stone form band above separates it from the
          values, so it no longer opens on its own hairline) */}
      <section className="section" aria-labelledby="work-h">
        <div className="container-x">
          <div className="section-head">
            <p className="eyebrow">Our work</p>
            <h2 id="work-h" className="text-h2 text-navy">Projects documented on this site</h2>
            <p>{`${projects.length} case studies documented with our own photos and site videos.`}</p>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
            {projects.map((p, i) => {
              const img = projectCardImage(p);
              return (
                <li key={p.slug} className={`card-ed group ${projectSpan(i, projects.length)}`}>
                  <div className="media">
                    <Image src={img.src} alt={img.alt} fill quality={60} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <p className="meta"><span>{p.location}</span></p>
                  <h3 className="text-h3s"><Link href={`/projects/${p.slug}`}>{p.title}</Link></h3>
                </li>
              );
            })}
          </ul>
          <CtaRow className="mt-14" />
        </div>
      </section>

      {/* TESTIMONIALS — verbatim, with permission, no stars (stone; the page's one navy band is the closing CTA) */}
      <section className="section bg-stone" aria-labelledby="clients-h">
        <div className="container-x">
          <div className="section-head">
            <p className="eyebrow">Client testimonials</p>
            <h2 id="clients-h" className="text-h2 text-navy">What clients say</h2>
            <p>Shared with permission by our clients.</p>
          </div>
          <ul className="grid lg:grid-cols-3 gap-y-12 lg:-mx-8">
            {shownTestimonials.map((t) => (
              <li key={t.name} className="max-w-[34rem] lg:max-w-none lg:px-8 lg:border-l lg:first:border-l-0 border-line">
                <figure className="h-full flex flex-col">
                  <blockquote className="flex-1 font-display text-[1.375rem] md:text-2xl leading-[1.4] text-navy [text-indent:-0.42em]"><p>&ldquo;{t.text}&rdquo;</p></blockquote>
                  <figcaption className="mt-6 pt-4 border-t border-line"><span className="block text-sm font-semibold text-ink">{t.name}</span><span className="block text-[13px] text-muted">{t.town}</span></figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2">
            <Link href="/reviews" className="link-arrow"><ArrowLabel text="All testimonials" /></Link>
            <a href={site.gbp} target="_blank" rel="noopener" className="link-arrow"><ArrowLabel text="Our Google reviews" external /></a>
          </div>
        </div>
      </section>

      {/* WHERE WE WORK */}
      <section className="section pb-0" aria-labelledby="where-h">
        <div className="container-x">
          <div className="section-head">
            <p className="eyebrow">Where we work</p>
            <h2 id="where-h" className="text-h2 text-navy max-w-[14em]">Based in <Typeset text={serviceArea.base} /></h2>
            <p>{`We take projects in ${AREA_SENTENCE}.`}</p>
          </div>
          <ul className={`rule-list grid lg:grid-cols-2 gap-x-12 ${TWO_COL_RULES}`}>
            {counties.map((g) => (
              <li key={g.id}>
                <Link href={`/service-areas#${g.id}`} className="grid grid-cols-[1fr_auto] gap-x-6 items-baseline min-h-11 py-3.5 group">
                  <span className="font-medium text-navy group-hover:underline underline-offset-4">{g.county}, {g.state} </span>
                  <span className="text-sm text-muted tnum text-right">({g.towns.length})</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8"><Link href="/service-areas" className="link-arrow"><ArrowLabel text="See every town we serve and its distance from Northborough" /></Link></p>
          <CtaRow className="mt-10" />
        </div>
      </section>

      {/* FIND US ONLINE — the visible counterpart of the business sameAs */}
      <section className="pt-14 md:pt-20 pb-[var(--section-y)]" aria-labelledby="online-h">
        <div className="container-x">
          <div className="border-t border-line pt-14 md:pt-20">
            <h2 id="online-h" className="text-h2 text-navy">Find us online</h2>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-1">
              {profiles.map((p) => (
                <li key={p.href}><a href={p.href} target="_blank" rel="noopener" className="link-arrow"><ArrowLabel text={p.label} external /></a></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA — the page's one navy band */}
      <section className="section bg-navy text-white on-dark" data-cta-zone>
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em]">Let&apos;s talk about your project</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]">Free, no-obligation estimates from an owner-led contractor based in Northborough.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-on-dark tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
