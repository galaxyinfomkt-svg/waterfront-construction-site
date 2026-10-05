import Image from "next/image";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import { PhoneIcon, CheckIcon } from "@/components/chrome-icons";
import { services, testimonials, site, stats, serviceArea } from "@/lib/site";
import { PHOTO_CAPTIONS } from "@/lib/services";
import { homeFaqs } from "@/lib/faq";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import { projects } from "@/lib/projects";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, faqNode, BUSINESS_ID, OWNER_PAGE } from "@/lib/schema";
import FaqList from "./faq/FaqList";
import { countyGroups, AREA_SENTENCE } from "./service-areas/areas";

// Home (/). Owns "remodeling contractor Northborough MA" + the brand entity (audit 01 H3/H6, 09 AEO-H2).
// Truth rules: real job photos only (stock never), numbers only from lib/site.ts, credentials only via
// lib/credentials.ts, testimonials verbatim without stars, no HowTo markup (01 C1–C3, H1, L2).

const TITLE = "Remodeling Contractor in Northborough, MA | Waterfront Construction";
const DESCRIPTION = `Owner-led remodeling contractor in Northborough, MA, since ${site.founded}: kitchens, baths, additions, decks, siding, windows and painting. Free estimates: ${site.phone}.`;
const H1 = "Remodeling contractor in Northborough, MA";
// Answer-first entity paragraph: who, what, where (09 AEO-H1 canonical sentences).
const ENTITY = `${site.name} is an owner-led home remodeling contractor based in Northborough, Massachusetts. ${site.owner} founded the company in ${site.founded} and has ${site.experience}+ years of hands-on construction experience. We remodel kitchens and bathrooms, build home additions and decks, replace siding, windows and doors, and paint interiors and exteriors for homeowners across ${serviceArea.short}.`;

export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/", absoluteTitle: true });

const HERO = "/images/projects/kitchen-remodel-mansfield-ma-01.webp";
const OWNER_PHOTO = "/images/projects/home-addition-exterior-lynnfield-ma-01.webp";

const project = (slug: string) => projects.find((p) => p.slug === slug);
// True descriptions of what each photo shows; shared captions come from lib/services.ts.
const caption = (src: string) => PHOTO_CAPTIONS[src]?.alt ?? "Photo from a Waterfront Construction job";

// Recent work: real photos, each linked to its case study, with the true location (never a town for the
// bathroom album, whose town was not recorded).
const RECENT: { src: string; slug: string; kind: string }[] = [
  { src: "/images/projects/kitchen-remodel-mansfield-ma-02.webp", slug: "kitchen-remodel-mansfield-ma", kind: "Kitchen" },
  { src: "/images/projects/bathroom-remodels-01.webp", slug: "bathroom-remodels", kind: "Bathroom" },
  { src: "/images/projects/deck-salem-nh-02.webp", slug: "pool-deck-salem-nh", kind: "Deck" },
  { src: "/images/projects/home-addition-exterior-lynnfield-ma-19.webp", slug: "home-addition-exterior-lynnfield-ma", kind: "Siding" },
  { src: "/images/projects/home-addition-needham-ma-05.webp", slug: "home-addition-needham-ma", kind: "Addition" },
  { src: "/images/projects/home-addition-exterior-lynnfield-ma-13.webp", slug: "home-addition-exterior-lynnfield-ma", kind: "Windows" },
  { src: "/images/projects/bathroom-remodels-04.webp", slug: "bathroom-remodels", kind: "Bathroom" },
  { src: "/images/projects/deck-salem-nh-05.webp", slug: "pool-deck-salem-nh", kind: "Deck" },
];

const statLabel = (s: { value: string; label: string }) =>
  s.value === `${site.experience}+` ? `${s.label} (owner ${site.owner})` : s.label;

const credentials = hasHic || hasCsl ? credentialLine({ insured: false }) : "";

const ld = pageGraph(
  [
    webPageNode({ path: "/", name: H1, description: DESCRIPTION, mainEntity: { "@id": BUSINESS_ID }, primaryImage: HERO, crumbs: false }),
    faqNode("/", homeFaqs),
  ],
  { business: "full" },
);

export default function Home() {
  const counties = countyGroups();
  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — keyword + entity H1, answer-first paragraph, and the estimate form framed in a white card */}
      <section className="relative overflow-hidden bg-navy" data-cta-zone>
        <Image src={HERO} alt="Kitchen remodeled by Waterfront Construction in Mansfield, MA, with white shaker-style cabinets, a dark stone-look island and glass pendant lights"
          fill loading="eager" fetchPriority="high" quality={60} sizes="100vw" className="object-cover kenburns" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative container-x py-14 md:py-20 grid lg:grid-cols-[1.1fr_.9fr] gap-10 lg:gap-12 items-center">
          <div className="text-white reveal">
            <ul className="flex flex-wrap items-center gap-2 text-sm">
              <li className="rounded-full bg-white/10 border border-white/25 px-3.5 py-1.5">Free estimates</li>
              <li className="rounded-full bg-white/10 border border-white/25 px-3.5 py-1.5">Owner-led since {site.founded}</li>
              {credentials && <li className="rounded-full bg-[#1f7a3a]/40 border border-white/25 px-3.5 py-1.5">{credentials}</li>}
            </ul>
            <h1 className="mt-5 text-4xl md:text-6xl lg:text-[62px] font-extrabold leading-[1.04]">
              Remodeling contractor in <span className="text-cyan">Northborough, MA</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">{ENTITY}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#estimate" className="btn btn-green text-base">Get a free estimate</a>
              <a href={site.phoneHref} className="btn btn-outline text-base"><PhoneIcon /> {site.phone}</a>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90 font-medium">
              <li className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-cyan" />Itemized estimates</li>
              <li className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-cyan" />{site.projectsCompleted}+ projects completed</li>
              <li className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-cyan" />Insured</li>
            </ul>
          </div>
          <div className="reveal-2 self-start lg:self-center">
            <section id="estimate" aria-labelledby="estimate-h" className="rounded-2xl bg-white text-ink p-4 sm:p-6 shadow-card">
              <h2 id="estimate-h" className="text-xl font-extrabold text-navy">Request a free estimate</h2>
              <p className="mt-1 text-sm text-ink/75">
                Free and no-obligation. Prefer to talk? Call <a href={site.phoneHref} className="font-bold text-navy underline underline-offset-2">{site.phone}</a> ({site.hours}).
              </p>
              <div className="mt-3"><LeadForm /></div>
            </section>
          </div>
        </div>
      </section>

      {/* KEY FACTS — the confirmed numbers, static (no count-up) */}
      <section className="mesh text-white" aria-label="Company facts">
        <dl className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="py-8 px-2 text-center flex flex-col-reverse">
              <dt className="text-xs md:text-sm text-white/85 mt-1">{statLabel(s)}</dt>
              <dd className="text-4xl md:text-5xl font-extrabold text-cyan">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ABOUT — real job photo honestly captioned (no stock "owner" photo), entity facts block */}
      <section className="py-16 md:py-20 bg-tint-blue gridlines" aria-labelledby="about-h">
        <div className="container-x grid lg:grid-cols-[.85fr_1.15fr] gap-10 lg:gap-12 items-start">
          <figure>
            <div className="relative h-[420px] md:h-[520px] rounded-3xl overflow-hidden shadow-card">
              <Image src={OWNER_PHOTO} alt="Waterfront Construction Inc work van parked at a home-addition job in Lynnfield, MA, with the new addition framed and sheathed behind it"
                fill quality={60} sizes="(min-width:1024px) 40vw, 100vw" className="object-cover object-[50%_60%]" />
            </div>
            <figcaption className="mt-3 text-sm text-ink/75">
              Our van at a home-addition job in Lynnfield, MA.{" "}
              <Link href="/projects/home-addition-exterior-lynnfield-ma" className="font-semibold text-blue underline underline-offset-2">See the project</Link>
            </figcaption>
          </figure>
          <div>
            <span className="eyebrow">About us</span>
            <h2 id="about-h" className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Owner-led remodeling, based in Northborough since {site.founded}</h2>
            <p className="mt-4 text-ink/85 text-lg leading-relaxed">
              {`${site.owner} founded ${site.name} in Northborough, Massachusetts, in ${site.founded}, and has ${site.experience}+ years of hands-on construction experience. The company has completed ${site.projectsCompleted}+ projects, in ${site.townsWithProjects}+ towns, from kitchens and bathrooms to additions, decks and exteriors.`}
            </p>
            <dl className="mt-6 grid sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-2.5 rounded-2xl bg-white p-5 shadow-soft text-[15px]">
              <dt className="font-bold text-navy">Business</dt><dd className="text-ink/85">{site.name}</dd>
              <dt className="font-bold text-navy">Owner</dt>
              <dd className="text-ink/85"><Link href={OWNER_PAGE} className="font-semibold text-blue underline underline-offset-2">{site.owner}</Link>, {site.experience}+ years of hands-on construction experience</dd>
              <dt className="font-bold text-navy">Founded</dt><dd className="text-ink/85">{site.founded}, Northborough, MA</dd>
              {credentials && (<><dt className="font-bold text-navy">Registration</dt><dd className="text-ink/85">{credentials}</dd></>)}
              <dt className="font-bold text-navy">Insurance</dt><dd className="text-ink/85">Insured; certificate of insurance on request</dd>
              <dt className="font-bold text-navy">Track record</dt><dd className="text-ink/85">{site.projectsCompleted}+ projects completed, in {site.townsWithProjects}+ towns</dd>
              <dt className="font-bold text-navy">Service area</dt>
              <dd className="text-ink/85">{AREA_SENTENCE} (<Link href="/service-areas" className="font-semibold text-blue underline underline-offset-2">full list</Link>)</dd>
              <dt className="font-bold text-navy">Address</dt><dd className="text-ink/85">{site.address}</dd>
              <dt className="font-bold text-navy">Phone · Hours</dt><dd className="text-ink/85"><a href={site.phoneHref} className="font-semibold text-blue underline underline-offset-2">{site.phone}</a> · {site.hours}</dd>
              <dt className="font-bold text-navy">Estimates</dt><dd className="text-ink/85">Free and itemized</dd>
              <dt className="font-bold text-navy">Financing</dt><dd className="text-ink/85">Not offered</dd>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={OWNER_PAGE} className="btn btn-navy">Meet {site.owner}</Link>
              <Link href="/about" className="btn btn-white">About the company</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES — card titles are the links (01 L6); real photos only, icon tile where none exists */}
      <section className="py-16 md:py-20 dots" aria-labelledby="services-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">What we do</span>
            <h2 id="services-h" className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Our remodeling services</h2>
            <p className="mt-3 text-ink/80 text-lg">Six services from one owner-led company, inside and outside the house.</p>
          </div>
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <li key={s.slug} className="group card gborder overflow-hidden pop flex flex-col">
                <div className="relative h-48 overflow-hidden bg-brand-grad">
                  {s.imageIsStock ? (
                    <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-6xl">{s.icon}</span>
                  ) : (
                    <Image src={s.image} alt={s.imageAlt} fill quality={60} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover zoomimg" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-xl text-navy">
                    <Link href={`/services/${s.slug}`} className="hover:text-blue after:absolute after:inset-0 after:content-['']">{s.short}</Link>
                  </h3>
                  <p className="mt-2 text-sm text-ink/80">{s.blurb}</p>
                  <p className="mt-3 text-sm text-ink/75"><span className="font-semibold text-navy">Typical timeline:</span> {s.timeline}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center"><Link href="/services" className="btn btn-navy text-base">Compare all services</Link></div>
        </div>
      </section>

      {/* WHY HIRE US — only verifiable statements */}
      <section className="py-20 md:py-24 mesh dots-light text-white relative overflow-hidden slant-both" aria-labelledby="why-h">
        <div className="container-x relative">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-cyan">Why homeowners hire us</span>
            <h2 id="why-h" className="mt-3 text-3xl md:text-5xl font-extrabold">What you can check before you call</h2>
          </div>
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { t: "Owner-led", d: `${site.owner} founded the company in ${site.founded} and brings ${site.experience}+ years of hands-on construction experience.`, href: OWNER_PAGE, cta: `About ${site.owner}` },
              { t: "Documented work", d: `${projects.length} case studies on this site show real jobs stage by stage, with photos from each one.`, href: "/gallery", cta: "See the projects" },
              { t: "Client testimonials", d: "Read what clients wrote about their projects, shared with their permission, and see our public Google reviews.", href: "/reviews", cta: "Read reviews" },
              { t: "Free, itemized estimates", d: "Every estimate is free and itemized, so you can see what each part of the job costs.", href: "#estimate", cta: "Request one" },
              { t: hasHic ? "Registered in Massachusetts" : "Insured", d: hasHic ? `${credentialLine({ insured: true })}. Certificate of insurance on request.` : "We carry insurance and provide a certificate of insurance on request.", href: "/faq#registered-insured", cta: "Registration and insurance" },
              { t: "Clear answers first", d: "Costs, permits, timelines and lead-safe rules for older homes, answered before you hire anyone.", href: "/faq", cta: "Read the FAQ" },
            ].map((c) => (
              <li key={c.t} className="glass rounded-2xl p-6 h-full">
                <h3 className="font-bold text-lg">{c.t}</h3>
                <p className="text-sm text-white/90 mt-1.5">{c.d}</p>
                {c.href.startsWith("#") ? (
                  <a href={c.href} className="mt-3 inline-block text-sm font-semibold text-cyan underline underline-offset-2 hover:text-white">{c.cta}</a>
                ) : (
                  <Link href={c.href} className="mt-3 inline-block text-sm font-semibold text-cyan underline underline-offset-2 hover:text-white">{c.cta}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RECENT PROJECTS — real photos, each linked to its case study */}
      <section className="py-20 md:py-24 mesh dots-light text-white slant-top" aria-labelledby="recent-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-cyan">Our work</span>
            <h2 id="recent-h" className="mt-3 text-3xl md:text-5xl font-extrabold">Recent projects</h2>
            <p className="mt-3 text-white/85 text-lg">Photos from our own jobs. Each one opens its project case study.</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {RECENT.map((r) => {
              const p = project(r.slug);
              if (!p) return null;
              const where = /,\s(MA|NH)$/.test(p.location) ? p.location : "Massachusetts";
              return (
                <li key={r.src}>
                  <Link href={`/projects/${p.slug}`} className="group relative block h-48 md:h-56 overflow-hidden rounded-2xl">
                    <Image src={r.src} alt={`${caption(r.src)} (${where})`} fill quality={60} sizes="(min-width:768px) 25vw, 50vw" className="object-cover zoomimg" />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
                    <span className="absolute bottom-3 left-3 right-3 text-left">
                      <span className="inline-block rounded bg-navy/85 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">{r.kind}</span>
                      <span className="mt-1 block text-white font-bold text-sm leading-tight">{p.shortTitle}</span>
                      <span className="block text-white/85 text-xs">{where}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 text-center"><Link href="/gallery" className="btn btn-white">See all projects</Link></div>
        </div>
      </section>

      {/* HOW IT WORKS (no HowTo markup: deprecated, 01 L2 / 08 S-10) */}
      <section className="py-16 md:py-20 bg-tint-blue gridlines" aria-labelledby="process-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">How it works</span>
            <h2 id="process-h" className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">How a project works</h2>
          </div>
          <ol className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[
              ["Free estimate", "We look at the job, listen to what you want, and give you a free, itemized estimate."],
              ["Plan", "We confirm the scope, materials, schedule and permits before work starts."],
              ["Build", "We do the work, with one point of contact from start to finish."],
              ["Walkthrough", "We walk through the finished work with you."],
            ].map(([t, d], i) => (
              <li key={t} className="card p-4 sm:p-6 h-full">
                <span aria-hidden="true" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-grad-sunset text-white grid place-items-center font-extrabold">{`0${i + 1}`}</span>
                <h3 className="font-bold text-navy text-lg mt-3">{t}</h3>
                <p className="text-sm text-ink/80 mt-1.5">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TIMELINES TABLE — one source (lib/services.ts timeline), caption + scoped headers; stacks on phones */}
      <section id="timelines" className="py-16 md:py-20 bg-sand" aria-labelledby="timelines-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">At a glance</span>
            <h2 id="timelines-h" className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Services, timelines and what&apos;s included</h2>
          </div>
          <div className="mt-10 rounded-2xl bg-white shadow-soft ring-1 ring-black/5 overflow-hidden">
            <table className="w-full text-left">
              <caption className="sr-only">Typical timelines and scope for Waterfront Construction services</caption>
              <thead className="hidden md:table-header-group bg-navy text-white text-sm">
                <tr><th scope="col" className="p-4 font-bold">Service</th><th scope="col" className="p-4 font-bold">Typical timeline</th><th scope="col" className="p-4 font-bold">What&apos;s included</th></tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={s.slug} className={`block md:table-row border-t border-sand first:border-t-0 ${i % 2 ? "md:bg-sand/40" : ""}`}>
                    <th scope="row" className="block md:table-cell px-4 pt-4 md:p-4 font-bold text-navy align-top">
                      <Link href={`/services/${s.slug}`} className="hover:text-blue underline-offset-2 hover:underline">{s.short}</Link>
                    </th>
                    <td className="block md:table-cell px-4 pt-1 md:p-4 text-ink/85 text-sm align-top"><span className="md:hidden font-semibold text-navy">Typical timeline: </span>{s.timeline}</td>
                    <td className="block md:table-cell px-4 pt-1 pb-4 md:p-4 text-ink/80 text-sm align-top">
                      <span className="md:hidden font-semibold text-navy">Included:</span>
                      <ul className="list-disc pl-4 space-y-0.5">{s.features.map((f) => <li key={f}>{f}</li>)}</ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — verbatim, shared with permission, no stars, link to public Google reviews (01 C3) */}
      <section className="py-20 md:py-24 mesh dots-light text-white slant-top" aria-labelledby="testimonials-h">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-cyan">Client testimonials</span>
            <h2 id="testimonials-h" className="mt-3 text-3xl md:text-5xl font-extrabold">What clients say</h2>
            <p className="mt-3 text-white/85">Shared with permission by our clients.</p>
          </div>
          <ul className="mt-12 grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <li key={t.name}>
                <figure className="glass rounded-2xl p-6 h-full flex flex-col">
                  <blockquote className="flex-1 text-white/90 text-[15px] leading-relaxed">
                    <p>&ldquo;{t.text}&rdquo;</p>
                  </blockquote>
                  <figcaption className="mt-4 pt-4 border-t border-white/15">
                    <span className="block font-bold">{t.name}</span>
                    <span className="block text-sm text-white/80">{t.town}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/reviews" className="btn btn-white text-base">Read all testimonials</Link>
            <a href={site.gbp} target="_blank" rel="noopener" className="btn btn-outline text-base">Our Google reviews</a>
          </div>
        </div>
      </section>

      {/* FAQ — answer-first, same text as the FAQPage markup and /faq */}
      <section className="py-16 md:py-20 bg-tint-green" aria-labelledby="faq-h">
        <div className="container-x grid lg:grid-cols-[.8fr_1.2fr] gap-10 lg:gap-12 items-start">
          <div className="lg:sticky lg:top-32">
            <span className="eyebrow">Good to know</span>
            <h2 id="faq-h" className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Frequently asked questions</h2>
            <p className="mt-3 text-ink/80">Costs, permits, registration and more on our <Link href="/faq" className="font-semibold text-blue underline underline-offset-2">full FAQ page</Link>.</p>
            <div className="mt-5 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a href={site.phoneHref} className="btn btn-green"><PhoneIcon /> Call {site.phone}</a>
              <Link href="/faq" className="btn btn-navy">All questions</Link>
            </div>
          </div>
          <FaqList items={homeFaqs} />
        </div>
      </section>

      {/* WHERE WE WORK — county cards linking the /service-areas county sections (replaces 39 town chips, 01 H4) */}
      <section className="py-16 md:py-20 dots" aria-labelledby="area-h">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto">
            <span className="eyebrow">Where we work</span>
            <h2 id="area-h" className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">{serviceArea.short}</h2>
            <p className="mt-3 text-ink/80 text-lg">{`From our base in Northborough we take projects in ${AREA_SENTENCE}.`}</p>
          </div>
          <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {counties.map((g) => (
              <li key={g.id}>
                <Link href={`/service-areas#${g.id}`} className="block h-full rounded-2xl bg-white p-5 ring-1 ring-black/5 shadow-soft hover:ring-blue/40 transition">
                  <span className="block font-bold text-navy">{g.county}, {g.state}</span>
                  <span className="block mt-1 text-sm text-ink/80">
                    {g.towns.length === 1 ? "1 community" : `${g.towns.length} communities`} · {g.min === 0 ? `up to ${g.max}` : g.min === g.max ? `${g.min}` : `${g.min}–${g.max}`} mi from Northborough
                  </span>
                  {g.projects.length > 0 && (
                    <span className="block mt-2 text-xs font-semibold text-blue">
                      Case {g.projects.length > 1 ? "studies" : "study"}: {[...new Set(g.projects.map((p) => p.location))].join(", ")}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center"><Link href="/service-areas" className="btn btn-navy">Every town we serve</Link></div>
        </div>
      </section>

      {/* FINAL CTA (no stock background) */}
      <section className="mesh" data-cta-zone>
        <div className="container-x py-16 md:py-20 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-extrabold">Planning a remodel?</h2>
          <p className="mt-4 text-white/85 text-lg max-w-xl mx-auto">Get a free, no-obligation estimate from an owner-led contractor based in Northborough.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#estimate" className="btn btn-green text-base">Get a free estimate</a>
            <a href={site.phoneHref} className="btn btn-white text-base"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
