import Image from "next/image";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import { PhoneIcon, CheckIcon, ArrowUpRightIcon, ArrowLabel } from "@/components/chrome-icons";
import StatsRow from "@/components/StatsRow";
import Typeset from "@/components/Typeset";
import { services, testimonials, site, stats, serviceArea } from "@/lib/site";
import { PHOTO_CAPTIONS } from "@/lib/services";
import { homeFaqs } from "@/lib/faq";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import { projects, type Project } from "@/lib/projects";
import { displayAddress } from "@/lib/address";
import { posts } from "@/lib/posts";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, BUSINESS_ID, OWNER_PAGE } from "@/lib/schema";
import FaqList from "./faq/FaqList";
import { countyGroups, AREA_SENTENCE } from "./service-areas/areas";

// Home (/). Owns "remodeling contractor Northborough MA" + the brand entity (audit 01 H3/H6, 09 AEO-H2).
// Truth rules: real job photos only (stock never), numbers only from lib/site.ts, credentials only via
// lib/credentials.ts, testimonials verbatim without stars, no HowTo markup (01 C1–C3, H1, L2).

const TITLE = "Remodeling Contractor in Northborough, MA | Waterfront Construction";
const DESCRIPTION = `Owner-led remodeling contractor in Northborough, MA, since ${site.founded}: kitchens, baths, additions, decks, siding, windows, painting. Free estimates: ${site.phone}.`;
const H1 = "Remodeling contractor in Northborough, MA";
// Answer-first entity paragraph: who, what, where (09 AEO-H1 canonical sentences).
const ENTITY = `${site.name} is an owner-led home remodeling contractor based in Northborough, Massachusetts. ${site.owner} founded the company in ${site.founded} and has ${site.experience}+ years of hands-on construction experience. We remodel kitchens and bathrooms, build home additions and decks, replace siding, windows and doors, and paint interiors and exteriors for homeowners across ${serviceArea.short}.`;

export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/", absoluteTitle: true });

const HERO = "/images/projects/kitchen-remodel-mansfield-ma-01.webp";
const OWNER_PHOTO = "/images/projects/home-addition-exterior-lynnfield-ma-01.webp";

const project = (slug: string) => projects.find((p) => p.slug === slug);
// True descriptions of what each photo shows; shared captions come from lib/services.ts.
const caption = (src: string) => PHOTO_CAPTIONS[src]?.alt ?? "Photo from a Waterfront Construction job";

// Recent work: ONE tile per case study (V5.8: no project repeated), a real photo each, linked to its case
// study, with the true location (never a town for the bathroom album, whose town was not recorded). The
// Lynnfield framing job is documented in video only, so its tile is a video still, described as one. The
// deck-and-stairs clip (a blurry still) is reached through "See all projects".
const RECENT: { src: string; slug: string; kind: string }[] = [
  { src: "/images/projects/kitchen-remodel-mansfield-ma-02.webp", slug: "kitchen-remodel-mansfield-ma", kind: "Kitchen" },
  { src: "/images/projects/bathroom-remodels-01.webp", slug: "bathroom-remodels", kind: "Bathrooms" },
  { src: "/images/projects/deck-salem-nh-02.webp", slug: "pool-deck-salem-nh", kind: "Deck" },
  { src: "/images/projects/home-addition-exterior-lynnfield-ma-19.webp", slug: "home-addition-exterior-lynnfield-ma", kind: "Siding & windows" },
  { src: "/images/projects/home-addition-needham-ma-05.webp", slug: "home-addition-needham-ma", kind: "Porch addition" },
  { src: "/images/projects/home-addition-lynnfield-ma-01.webp", slug: "home-addition-framing-lynnfield-ma", kind: "Addition framing" },
];
// A video still keeps its own description (it already names the town and says it is a still).
const tileAlt = (p: Project, src: string, where: string) =>
  p.videos.find((v) => v.poster === src)?.posterAlt ?? `${caption(src)} (${where})`;

const statLabel = (s: { value: string; label: string }) =>
  s.value === `${site.experience}+` ? `${s.label} (owner ${site.owner})` : s.label;

const credentials = hasHic || hasCsl ? credentialLine({ insured: false }) : "";

const ld = pageGraph(
  [
    webPageNode({ path: "/", name: H1, description: DESCRIPTION, mainEntity: { "@id": BUSINESS_ID }, primaryImage: HERO, crumbs: false }),
    // No FAQPage here: the same Q&A is marked up once, on /faq (V4.1). The home FAQ below is visible text only.
  ],
  { business: "full" },
);

// Facts dl (§4.28): each dt/dd pair on its own hairline row.
const FACT = "grid sm:grid-cols-[10rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line";
const FACT_DD = "text-[15.5px] text-ink";
// Two-column hairline index (§4.14): at lg each column starts on its own top rule (no rule across the gap).
const TWO_COL_RULES = "lg:border-t-0 lg:[&>li:nth-child(-n+2)]:border-t lg:[&>li:nth-child(-n+2)]:border-line";
// Split section heads (§4.10): below lg the intro is not an h2 sibling, so it carries its own rhythm and colour.
const SPLIT_P = "mt-5 max-w-[38rem] text-lead text-muted lg:mt-0 lg:max-w-none";
// Decorative card/step index. Drawn with CSS generated content from data-n, so it is seen but adds no text
// node: the page's visible text stays word-for-word what it was (aria-hidden as well).
// Painting title plate (no photo): same 4:3 box as the photo cards; name bottom-left in Newsreader 400 navy.
const PLATE = "absolute inset-3 border border-line flex items-end p-5 sm:p-6 font-display text-[2.125rem] leading-[1.06] tracking-[-0.01em] text-navy text-balance before:content-[attr(data-name)]";
const Index = ({ n, className = "" }: { n: number; className?: string }) => (
  <span aria-hidden="true" data-n={String(n).padStart(2, "0")} className={`before:content-[attr(data-n)] ${className}`} />
);

export default function Home() {
  const counties = countyGroups();
  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — keyword + entity H1, answer-first paragraph, and the estimate form framed in a white card.
          Neutral black scrim only (§2): below lg the photo band fades to solid scrim, so the form sits on black. */}
      <section data-cta-zone className="relative overflow-hidden bg-scrim">
        <div className="absolute inset-x-0 top-0 h-[min(100svh,720px)] lg:inset-0 lg:h-auto">
          <Image src={HERO} alt="Kitchen remodeled by Waterfront Construction in Mansfield, MA, with white shaker-style cabinets, a dark stone-look island and glass pendant lights"
            fill loading="eager" fetchPriority="high" quality={60} sizes="100vw" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 scrim-hero" />
        </div>
        <div className="relative container-x pt-8 pb-14 md:py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div className="text-white on-photo">
            {/* .dot-list-wrap (globals.css): a wrapped line never starts with a separator dot. */}
            <ul className="dot-list-wrap eyebrow">
              <li>Free estimates</li>
              <li>Owner-led since {site.founded}</li>
              {credentials && <li>{credentials}</li>}
            </ul>
            {/* Phones narrower than 375px step the display size down so the nowrap "Northborough, MA" fits its line
                (40px would overflow the 280px content box at 320); 375px and up use the --text-display clamp. */}
            <h1 className="mt-4 md:mt-5 text-display max-[359px]:text-[2.125rem] min-[360px]:max-[374px]:text-[2.375rem] text-balance text-white max-w-[12em]">
              Remodeling contractor in <span className="whitespace-nowrap">Northborough, MA</span>
            </h1>
            <p className="mt-5 md:mt-6 text-base md:text-lg leading-[1.62] text-white/90 max-w-[36em]">{ENTITY}</p>
            {/* Below md the hero rhythm is tightened (pt-8, mt-4/5/7/6) so at 390x844 the trust row clears the mobile bottom bar. */}
            <div className="mt-7 md:mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</a>
              <a href={site.phoneHref} className="btn btn-on-dark tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
            </div>
            <ul className="mt-6 md:mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
              <li className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-white/80" />Itemized estimates</li>
              <li className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-white/80" />{site.projectsCompleted}+ projects completed</li>
              <li className="inline-flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-white/80" />Insured</li>
            </ul>
          </div>
          <div className="self-start lg:self-center">
            <section id="estimate" data-estimate-form aria-labelledby="estimate-h" className="bg-white text-ink border border-line rounded-panel p-6 sm:p-7 shadow-panel">
              <h2 id="estimate-h" className="font-display text-[1.625rem] leading-[1.15] text-navy">Request a free estimate</h2>
              <p className="mt-2 text-sm text-muted">
                Free and no-obligation. Prefer to talk? Call <a href={site.phoneHref} className="font-medium text-navy underline underline-offset-4 tel">{site.phone}</a> ({site.hours}).
              </p>
              <div className="mt-4"><LeadForm /></div>
            </section>
          </div>
        </div>
      </section>

      {/* KEY FACTS — the confirmed numbers, static (no count-up) */}
      <StatsRow label="Company facts" className="pb-14 md:pb-20" items={stats.map((s) => ({ value: s.value, label: statLabel(s) }))} />

      {/* ABOUT — real job photo honestly captioned (no stock "owner" photo), entity facts block */}
      <section className="section bg-stone" aria-labelledby="about-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12 items-start">
          <figure className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <div className="relative aspect-[4/5] md:max-lg:aspect-[3/2] overflow-hidden bg-well">
              <Image src={OWNER_PHOTO} alt="Waterfront Construction Inc work van parked at a home-addition job in Lynnfield, MA, with the new addition framed and sheathed behind it"
                fill quality={60} sizes="(min-width:1024px) 40vw, 100vw" className="object-cover object-[50%_60%]" />
            </div>
            <figcaption className="mt-3 text-[13px] leading-relaxed text-muted">
              <Typeset text="Our van at a home-addition job in Lynnfield, MA." />{" "}
              <Link href="/projects/home-addition-exterior-lynnfield-ma" className="link whitespace-nowrap">See the project</Link>
            </figcaption>
          </figure>
          <div className="lg:col-span-7">
            <p className="eyebrow">About us</p>
            <h2 id="about-h" className="mt-4 text-h2 text-navy">Owner-led remodeling, based in Northborough since {site.founded}</h2>
            <p className="mt-5 text-lead text-ink/80 max-w-[38rem]">
              {`${site.owner} founded ${site.name} in Northborough, Massachusetts, in ${site.founded}, and has ${site.experience}+ years of hands-on construction experience. The company has completed ${site.projectsCompleted}+ projects, in ${site.townsWithProjects}+ towns, from kitchens and bathrooms to additions, decks and exteriors.`}
            </p>
            <dl className="mt-8 border-t border-line">
              <div className={FACT}><dt className="eyebrow pt-0.5">Business</dt><dd className={FACT_DD}>{site.name}</dd></div>
              <div className={FACT}>
                <dt className="eyebrow pt-0.5">Owner</dt>
                <dd className={FACT_DD}><Link href={OWNER_PAGE} className="link">{site.owner}</Link>, {site.experience}+ years of hands-on construction experience</dd>
              </div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Founded</dt><dd className={FACT_DD}>{site.founded}, Northborough, MA</dd></div>
              {credentials && (<div className={FACT}><dt className="eyebrow pt-0.5">Registration</dt><dd className={FACT_DD}>{credentials}</dd></div>)}
              <div className={FACT}><dt className="eyebrow pt-0.5">Insurance</dt><dd className={FACT_DD}>Insured; certificate of insurance on request</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Track record</dt><dd className={FACT_DD}>{site.projectsCompleted}+ projects completed, in {site.townsWithProjects}+ towns</dd></div>
              <div className={FACT}>
                <dt className="eyebrow pt-0.5">Service area</dt>
                <dd className={FACT_DD}>{AREA_SENTENCE} (<Link href="/service-areas" className="link">full list</Link>)</dd>
              </div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Address</dt><dd className={FACT_DD}>{displayAddress}</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Phone · Hours</dt><dd className={FACT_DD}><a href={site.phoneHref} className="link tel">{site.phone}</a> · {site.hours}</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Estimates</dt><dd className={FACT_DD}>Free and itemized</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Financing</dt><dd className={FACT_DD}>Not offered</dd></div>
            </dl>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-x-6">
              <Link href={OWNER_PAGE} className="btn btn-secondary w-full sm:w-auto">Meet {site.owner}</Link>
              <Link href="/about" className="link-arrow"><ArrowLabel text="About the company" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES — card titles are the links (01 L6); real photos only, the painting monogram where none exists */}
      <section className="section" aria-labelledby="services-h">
        <div className="container-x">
          <div className="section-head section-head--split">
            <div>
              <p className="eyebrow">What we do</p>
              <h2 id="services-h" className="text-h2 text-navy">Our remodeling services</h2>
            </div>
            <p className={SPLIT_P}>Six services from one owner-led company, inside and outside the house.</p>
          </div>
          {/* From sm each card is a row subgrid (media, index, title, body, timeline), so titles, bodies and timelines
              line up across a row without a fixed title reserve.
              The row gap is a margin on each card (sm:mt-12, cancelled by the list's sm:-mt-12), not the list's row-gap:
              a parent row-gap that differs from the subgrid's 0 gap is spread into the subgrid tracks and opens a hole
              under one-line titles. */}
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-y-0 sm:-mt-12">
            {services.map((s, i) => (
              <li key={s.slug} className="card-ed group sm:grid sm:grid-rows-subgrid sm:row-span-5 sm:gap-y-0 sm:mt-12">
                {s.imageIsStock ? (
                  // No real photo for this service yet: a typographic title plate (stone well, inset hairline frame, the
                  // card's own name drawn with CSS generated content from data-name, so it adds no text node), never stock.
                  <div className="media bg-stone" aria-hidden="true">
                    <span data-name={s.short} className={PLATE} />
                  </div>
                ) : (
                  <div className="media">
                    <Image src={s.image} alt={s.imageAlt} fill quality={60} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
                  </div>
                )}
                <p className="meta"><Index n={i + 1} /></p>
                <h3>
                  <Link href={`/services/${s.slug}`}>{s.short}</Link>
                </h3>
                <p className="body">{s.blurb}</p>
                <p className="mt-3 text-sm text-muted"><span className="font-semibold text-ink">Typical timeline:</span> {s.timeline}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12"><Link href="/services" className="link-arrow"><ArrowLabel text="Compare all services" /></Link></div>
        </div>
      </section>

      {/* WHY HIRE US — only verifiable statements */}
      <section className="section bg-stone" aria-labelledby="why-h">
        <div className="container-x">
          <div className="section-head">
            <p className="eyebrow">Why homeowners hire us</p>
            <h2 id="why-h" className="text-h2 text-navy">What you can check before you call</h2>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              { t: "Owner-led", d: `${site.owner} founded the company in ${site.founded} and brings ${site.experience}+ years of hands-on construction experience.`, href: OWNER_PAGE, cta: `About ${site.owner}` },
              { t: "Documented work", d: `${projects.length} case studies on this site are documented with our own photos and site videos.`, href: "/gallery", cta: "See the projects" },
              { t: "Client testimonials", d: "Read what clients wrote about their projects, shared with their permission, and see our public Google reviews.", href: "/reviews", cta: "Read reviews" },
              { t: "Free, itemized estimates", d: "Every estimate is free and itemized, so you can see what each part of the job costs.", href: "#estimate", cta: "Request one" },
              { t: hasHic ? "Registered in Massachusetts" : "Insured", d: hasHic ? `${credentialLine({ insured: true })}. Certificate of insurance on request.` : "We carry insurance and provide a certificate of insurance on request.", href: "/faq#registered-insured", cta: "Registration and insurance" },
              { t: "Clear answers first", d: "Costs, permits, timelines and lead-safe rules for older homes, answered before you hire anyone.", href: "/faq", cta: "Read the FAQ" },
            ].map((c) => (
              <li key={c.t} className="flex flex-col border-t border-line pt-6">
                <h3 className="text-h3s text-navy">{c.t}</h3>
                <p className="mt-2 mb-4 text-[15.5px] text-muted">{c.d}</p>
                {c.href.startsWith("#") ? (
                  <a href={c.href} className="link-arrow text-sm mt-auto self-start"><ArrowLabel text={c.cta} /></a>
                ) : (
                  <Link href={c.href} className="link-arrow text-sm mt-auto self-start"><ArrowLabel text={c.cta} /></Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RECENT PROJECTS — real photos, each linked to its case study; caption below the photo (§4.13) */}
      <section className="section" aria-labelledby="recent-h">
        <div className="container-x">
          <div className="section-head section-head--split">
            <div>
              <p className="eyebrow">Our work</p>
              <h2 id="recent-h" className="text-h2 text-navy">Recent projects</h2>
            </div>
            <p className={SPLIT_P}>Photos from our own jobs. Each one opens its project case study.</p>
          </div>
          <ul className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 scroll-px-5 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-12 md:overflow-visible">
            {RECENT.map((r) => {
              const p = project(r.slug);
              if (!p) return null;
              const where = /,\s(MA|NH)$/.test(p.location) ? p.location : "Massachusetts";
              return (
                <li key={r.src} className="w-[78%] shrink-0 snap-start md:w-auto">
                  <Link href={`/projects/${p.slug}`} className="group block">
                    <span className="relative block aspect-[4/3] overflow-hidden bg-well">
                      <Image src={r.src} alt={tileAlt(p, r.src, where)} fill quality={60} sizes="(min-width:1200px) 390px, (min-width:768px) 33vw, 50vw" className="object-cover zoomimg" />
                    </span>
                    <span className="block mt-4 eyebrow">{r.kind}</span>
                    <span className="block mt-2 font-display text-h3s text-navy group-hover:underline underline-offset-4 decoration-1">{p.shortTitle}</span>
                    <span className="block mt-1 text-sm text-muted">{where}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-12"><Link href="/gallery" className="link-arrow"><ArrowLabel text="See all projects" /></Link></div>
        </div>
      </section>

      {/* HOW IT WORKS (no HowTo markup: deprecated, 01 L2 / 08 S-10) */}
      <section className="section bg-stone" aria-labelledby="process-h">
        <div className="container-x">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2 id="process-h" className="text-h2 text-navy">How a project works</h2>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[
              ["Free estimate", "We look at the job, listen to what you want, and give you a free, itemized estimate."],
              ["Plan", "We confirm the scope, materials, schedule and which permits the job needs before work starts."],
              ["Build", "We do the work, with one point of contact from start to finish."],
              ["Walkthrough", "We walk through the finished work with you."],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-line pt-5">
                <span aria-hidden="true" className="eyebrow tnum">{`0${i + 1}`}</span>
                <h3 className="mt-4 text-h3s text-navy">{t}</h3>
                <p className="mt-2 text-[15px] text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* COST GUIDES — sourced Massachusetts cost guides (blog B-08: give the guides contextual inlinks) */}
      <section className="section" aria-labelledby="guides-h">
        <div className="container-x">
          <div className="section-head">
            <p className="eyebrow">Plan your budget</p>
            <h2 id="guides-h" className="text-h2 text-navy">Massachusetts cost guides</h2>
            <p>New England cost benchmarks, what moves the price, permits and timing, with sources.</p>
          </div>
          <ul role="list" className={`rule-list grid lg:grid-cols-2 gap-x-12 ${TWO_COL_RULES}`}>
            {posts.filter((p) => p.category === "Cost guides").map((p) => (
              <li key={p.slug} className="py-6">
                <h3 className="font-display text-h3s text-navy"><Link href={`/blog/${p.slug}`} className="hover:underline underline-offset-4"><ArrowLabel text={p.title} /></Link></h3>
                <p className="mt-2 text-[15px] text-muted max-w-[60ch]">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TESTIMONIALS — THE navy band. Verbatim, shared with permission, no stars, link to public Google reviews (01 C3) */}
      <section className="section bg-navy text-white on-dark" aria-labelledby="testimonials-h">
        <div className="container-x">
          <div className="section-head">
            <p className="eyebrow">Client testimonials</p>
            <h2 id="testimonials-h" className="text-h2 text-white">What clients say</h2>
            <p className="text-white/80">Shared with permission by our clients.</p>
          </div>
          <ul className="grid lg:grid-cols-3 gap-y-12 lg:-mx-8">
            {testimonials.slice(0, 3).map((t) => (
              <li key={t.name} className="max-w-[34rem] lg:max-w-none lg:px-8 lg:border-l lg:first:border-l-0 border-white/14">
                <figure className="h-full flex flex-col">
                  <blockquote className="flex-1 font-display text-[1.375rem] md:text-2xl leading-[1.4] text-white [text-indent:-0.42em]">
                    <p>&ldquo;{t.text}&rdquo;</p>
                  </blockquote>
                  <figcaption className="mt-6 pt-4 border-t border-white/14">
                    <span className="block text-sm font-semibold text-white">{t.name}</span>
                    <span className="block text-[13px] text-white/72">{t.town}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <Link href="/reviews" className="btn btn-white w-full sm:w-auto">Read all testimonials</Link>
            <a href={site.gbp} target="_blank" rel="noopener" className="btn btn-on-dark w-full sm:w-auto">Our Google reviews<ArrowUpRightIcon /></a>
          </div>
        </div>
      </section>

      {/* FAQ — answer-first, the same text as /faq (the FAQPage markup lives on /faq only, V4.1) */}
      <section className="section" aria-labelledby="faq-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-10">
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <p className="eyebrow">Good to know</p>
            <h2 id="faq-h" className="mt-4 text-h2 text-navy">Frequently asked questions</h2>
            <p className="mt-5 text-muted">Costs, permits, registration and more on our <Link href="/faq" className="link">full FAQ page</Link>.</p>
            <div className="mt-8 flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start gap-3 sm:gap-x-6">
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span></a>
              <Link href="/faq" className="link-arrow"><ArrowLabel text="All questions" /></Link>
            </div>
          </div>
          <div className="lg:col-span-8"><FaqList items={homeFaqs} /></div>
        </div>
      </section>

      {/* WHERE WE WORK — county index linking the /service-areas county sections (replaces 39 town chips, 01 H4).
          County names never wrap (nowrap). In the one-column index (sm to lg) the meta sits right-aligned beside the name;
          in the narrower two-column index (lg+) and below sm it stacks under the name, so it stays on one line. */}
      <section className="section bg-stone" aria-labelledby="area-h">
        <div className="container-x">
          <div className="section-head section-head--split">
            <div>
              <p className="eyebrow">Where we work</p>
              <h2 id="area-h" className="text-h2 text-navy">{serviceArea.short}</h2>
            </div>
            <p className={SPLIT_P}>{`From our base in Northborough we take projects in ${AREA_SENTENCE}.`}</p>
          </div>
          <ul className={`rule-list grid lg:grid-cols-2 gap-x-12 ${TWO_COL_RULES}`}>
            {counties.map((g) => (
              <li key={g.id}>
                <Link href={`/service-areas#${g.id}`} className="grid sm:grid-cols-[auto_1fr] lg:grid-cols-1 gap-x-6 gap-y-1 items-baseline py-5 group">
                  <span className="font-display text-[1.25rem] leading-snug text-navy whitespace-nowrap group-hover:underline underline-offset-4 decoration-1"><Typeset text={`${g.county}, ${g.state}`} /></span>
                  <span className="text-sm text-muted tnum sm:text-right lg:text-left">
                    {g.towns.length === 1 ? "1 community" : `${g.towns.length} communities`} · {g.min === 0 ? `up to ${g.max}` : g.min === g.max ? `${g.min}` : `${g.min}–${g.max}`} mi from Northborough
                  </span>
                  {g.projects.length > 0 && (
                    <span className="sm:col-span-2 lg:col-span-1 mt-1 text-[13px] text-muted">
                      Case {g.projects.length > 1 ? "studies" : "study"}: {[...new Set(g.projects.map((p) => p.location))].join(", ")}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-12"><Link href="/service-areas" className="link-arrow"><ArrowLabel text="Every town we serve" /></Link></div>
        </div>
      </section>

      {/* FINAL CTA — paper, centred (no stock background) */}
      <section className="section text-center" data-cta-zone>
        <div className="container-x">
          <h2 className="text-h1 text-navy max-w-[18em] mx-auto">Planning a remodel?</h2>
          <p className="mt-5 text-lead text-muted max-w-[36em] mx-auto">Get a free, no-obligation estimate from an owner-led contractor based in Northborough.</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
            <a href="#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</a>
            <a href={site.phoneHref} className="btn btn-secondary tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
