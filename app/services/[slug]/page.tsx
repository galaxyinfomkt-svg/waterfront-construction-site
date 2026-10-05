import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import PhotoGrid from "@/components/PhotoGrid";
import ServiceTownDirectory from "@/components/ServiceTownDirectory";
import { services, site, serviceArea, citySlug } from "@/lib/site";
import { pageMeta, ogFor, OG_IMAGE } from "@/lib/seo";
import { pageGraph, webPageNode, hubServiceNode, imageNode, faqNode, breadcrumbNode, placeNode, serviceId, AREA_FACTS, OWNER_ID, OWNER_PAGE, type Crumb } from "@/lib/schema";
import { credentialLine } from "@/lib/credentials";
import {
  getContent, serviceProjects, serviceGuides, serviceTestimonials, proofPlaces, projectCardImage, cityFromLabel,
  LEAD_SAFE_RULES, LEAD_SAFE_OUTRO, CVV_CREDIT, CVV_LABEL, SOURCES, usd, type Table,
} from "@/lib/service-content";
import MEDIA from "@/lib/media-manifest.json";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getContent(slug);
  if (!c) return {};
  return pageMeta({
    title: c.metaTitle, // region-level: never duplicates the /services/{slug}/northborough titles
    description: c.metaDescription,
    path: `/services/${slug}`,
    image: c.og ? ogFor(c.og.slug, c.og.alt) : OG_IMAGE,
  });
}

const fmtDate = (iso: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(iso));
const DIMS = MEDIA as Record<string, { w: number; h: number }>;

// A real <table> (server HTML, <caption>, scoped headers). Below md each row stacks into a card and every
// cell shows its column name, so phones never need sideways scrolling.
function DataTable({ t }: { t: Table }) {
  return (
    <div className="mt-6 rounded-2xl bg-white ring-1 ring-black/5 shadow-soft">
      <table className="w-full text-left text-sm md:text-[15px]">
        <caption className="caption-top text-left px-4 pt-4 pb-2 font-semibold text-navy">{t.caption}</caption>
        <thead className="hidden md:table-header-group bg-sand text-navy">
          <tr>
            {t.head.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3 font-bold">{h || <span className="sr-only">Aspect</span>}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => (
            <tr key={i} className="block md:table-row border-t border-black/5 align-top px-4 py-3 md:p-0">
              {r.map((cell, j) =>
                j === 0
                  ? <th key={j} scope="row" className="block md:table-cell md:px-4 md:py-3 font-semibold text-navy">{cell}</th>
                  : (
                    <td key={j} data-label={t.head.length > 2 && t.head[j] ? t.head[j] : undefined} className="block md:table-cell mt-1.5 md:mt-0 md:px-4 md:py-3 text-ink/80 before:block before:text-[11px] before:font-bold before:uppercase before:tracking-wider before:text-blue before:content-[attr(data-label)] md:before:content-none">
                      {cell}
                    </td>
                  ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {t.note && <p className="px-4 pb-4 pt-1 text-sm text-ink/70">{t.note}</p>}
    </div>
  );
}

// "At a glance" facts. With a real hero photo they sit in the overview; without one (painting) they fill the
// hero's right column on the dark background.
function Glance({ items, dark }: { items: [string, string][]; dark?: boolean }) {
  return (
    <dl className={`grid gap-3 ${dark ? "" : "sm:grid-cols-2 mt-6"}`}>
      {items.map(([k, v]) => (
        <div key={k} className={dark ? "rounded-2xl bg-white/10 ring-1 ring-white/20 p-4" : "card p-4"}>
          <dt className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-white" : "text-blue"}`}>{k}</dt>
          <dd className={`mt-1 text-[15px] ${dark ? "text-white/90" : "text-ink/85"}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ServiceHub({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  const c = getContent(slug);
  if (!s || !c) notFound();

  const path = `/services/${s.slug}`;
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.name, path }];
  const hero = c.hero;
  const heroDims = hero ? DIMS[hero.src] : undefined;
  const heroPortrait = heroDims ? heroDims.h > heroDims.w : false;
  const heroCity = hero?.place ? cityFromLabel(hero.place) : undefined;
  const caseStudies = serviceProjects(s.slug);
  // Never show the same photo twice on a page: hero → case-study cards → the rest of the gallery.
  const shown = new Set<string>(hero ? [hero.src] : []);
  const cards = caseStudies.map((p) => {
    const im = projectCardImage(p, shown);
    shown.add(im.src);
    return { p, im };
  });
  const gallery = s.gallery.filter((g) => !shown.has(g.src));
  const guides = serviceGuides(c.guides);
  const costGuides = serviceGuides(c.cost.guides);
  const quotes = serviceTestimonials(c);
  const proof = proofPlaces(c);
  const related = c.related.map((r) => services.find((x) => x.slug === r)).filter((x): x is (typeof services)[number] => Boolean(x));
  const updated = fmtDate(s.updated);
  const credentials = credentialLine();
  const lower = s.name.toLowerCase();
  const costs = c.cost.benchmark?.map((b) => b.jobCost) ?? [];

  const toc = [
    { id: "overview", label: "Overview" },
    ...(cards.length || gallery.length ? [{ id: "our-work", label: "Our work" }] : []),
    ...c.sections.map((x) => ({ id: x.id, label: x.nav })),
    { id: "cost", label: "Cost" },
    { id: "permits", label: "Permits & rules" },
    ...(c.leadSafe ? [{ id: "lead-safe", label: "Pre-1978 homes" }] : []),
    { id: "process", label: "Process & timeline" },
    ...(quotes.length ? [{ id: "clients", label: "Client feedback" }] : []),
    { id: "faq", label: "FAQ" },
    { id: "towns", label: "Towns" },
    { id: "sources", label: "Sources" },
  ];

  const webPage = webPageNode({
    path, name: c.h1, description: c.metaDescription,
    about: { "@id": serviceId(s.slug) }, mainEntity: { "@id": serviceId(s.slug) },
    primaryImage: hero?.src, dateModified: s.updated,
  });
  const ld = pageGraph([
    c.reviewedOn ? { ...webPage, reviewedBy: { "@id": OWNER_ID }, lastReviewed: c.reviewedOn } : webPage,
    hubServiceNode(s, { description: c.summary, image: hero?.src }),
    hero && imageNode(hero.src, { caption: hero.caption, own: true, place: heroCity ? placeNode(heroCity) : undefined }),
    faqNode(path, c.faqs.map(({ q, a }) => ({ q, a }))),
    breadcrumbNode(crumbs),
  ], { owner: Boolean(c.reviewedOn) });

  const sectionHead = "text-2xl md:text-3xl font-extrabold text-navy";
  const glance: [string, string][] = [
    ["Typical timeline", s.timeline],
    ["Permit in Massachusetts", c.permitShort],
    ["Cost benchmark", costs.length
      ? `${usd(Math.min(...costs))}–${usd(Math.max(...costs))} for the standard projects in the cost table below (${CVV_LABEL}, Remodeling Cost vs. Value).`
      : "Priced per project after a free site visit; see what drives the cost below."],
    ["Where we work", `${serviceArea.short}, from our base in Northborough, MA.`],
  ];
  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — text first; a real job photo with a true caption (no full-bleed upscaled crops, UX-H4) */}
      <section className="relative overflow-hidden bg-brand-grad text-white">
        <div className="relative container-x py-10 md:py-14 grid gap-8 lg:gap-12 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
          <div>
            <Breadcrumbs items={crumbs} />
            <div className="mt-5 flex items-start gap-4">
              <span aria-hidden="true" className="hidden sm:grid shrink-0 text-3xl bg-white/95 rounded-2xl w-14 h-14 place-items-center shadow">{s.icon}</span>
              <h1 className={`text-3xl font-extrabold max-w-3xl ${c.h1.length > 64 ? "md:text-[2.6rem]" : "md:text-5xl"}`}>{c.h1}</h1>
            </div>
            <p className="mt-5 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">{c.summary}</p>
            <p className="mt-4 text-sm text-white/80">
              Owner-led · Founded in {site.founded} in Northborough, MA{credentials ? ` · ${credentials}` : ""}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#estimate" className="btn btn-green text-base">Get a free estimate</a>
              <a href={site.phoneHref} className="btn btn-outline text-base"><span aria-hidden="true">📞</span> {site.phone}</a>
            </div>
            <p className="mt-5 text-sm text-white/75">Updated <time dateTime={s.updated}>{updated}</time></p>
          </div>
          {hero && (
            <figure className={`w-full ${heroPortrait ? "lg:max-w-sm" : "lg:max-w-xl"} lg:mx-0`}>
              <div className={`relative overflow-hidden rounded-2xl shadow-card ring-1 ring-white/20 bg-navy aspect-[16/10] ${heroPortrait ? "lg:aspect-[4/5]" : "lg:aspect-[4/3]"}`}>
                <Image src={hero.src} alt={hero.alt} fill preload quality={60} sizes="(max-width: 1024px) 100vw, 440px" className="object-cover" />
              </div>
              <figcaption className="mt-3 text-sm text-white/80 leading-relaxed">
                {hero.caption}{hero.place ? ` · ${hero.place}` : ""}
                {hero.project && (
                  <> · <Link href={`/projects/${hero.project}`} className="underline underline-offset-2 hover:text-cyan">See the {hero.place ? `${hero.place.split(",")[0]} ` : ""}project</Link></>
                )}
              </figcaption>
            </figure>
          )}
          {!hero && (
            <div>
              <h2 className="sr-only">At a glance</h2>
              <Glance items={glance} dark />
            </div>
          )}
        </div>
      </section>

      {/* ON THIS PAGE */}
      <nav aria-label="On this page" className="bg-white border-b border-black/5">
        <div className="container-x py-3">
          <ul role="list" className="flex gap-2 overflow-x-auto no-scrollbar text-sm font-semibold">
            {toc.map((t) => (
              <li key={t.id} className="shrink-0">
                <a href={`#${t.id}`} className="inline-block rounded-full bg-sand px-3.5 py-2 text-navy hover:bg-tint-blue">{t.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* OVERVIEW + ESTIMATE FORM — one form instance. It comes first in the DOM so phones reach it right after
          the hero (and focus order matches what is seen); on desktop it sits in the right column (UX-H2). */}
      <section id="overview" className="py-14 scroll-mt-32">
        <div className="container-x grid gap-10 lg:grid-cols-[1.5fr_.9fr] lg:grid-rows-[auto_1fr]">
          <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <div className="lg:sticky lg:top-32">
              <section id="estimate" aria-labelledby="estimate-h" className="scroll-mt-32 rounded-2xl bg-white p-4 sm:p-6 shadow-card ring-1 ring-black/5">
                <h2 id="estimate-h" className="text-xl font-extrabold text-navy">Request a free estimate</h2>
                <p className="mt-1 text-sm text-ink/75">
                  Free and no-obligation. Prefer to talk? Call <a href={site.phoneHref} className="font-bold text-navy underline underline-offset-2">{site.phone}</a> ({site.hours}).
                </p>
                <div className="mt-3"><LeadForm /></div>
              </section>
            </div>
          </aside>

          <div className="lg:col-start-1 lg:row-start-1">
            <span className="eyebrow">{hero ? "At a glance" : "Overview"}</span>
            <h2 className={`mt-3 ${sectionHead}`}>{s.short}: the essentials</h2>
            {hero && <Glance items={glance} />}
            {c.intro.map((p, i) => <p key={i} className="mt-5 text-ink/80 text-lg leading-relaxed">{p}</p>)}
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <h3 className="text-2xl font-extrabold text-navy">What&apos;s included</h3>
            <ul role="list" className="mt-4 grid sm:grid-cols-2 gap-3">
              {s.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 card p-4">
                  <span aria-hidden="true" className="text-green text-lg leading-none mt-0.5">✓</span>
                  <span className="font-medium text-navy text-[15px]">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* OUR WORK — case studies + real photos with true captions */}
      {(cards.length > 0 || gallery.length > 0) && (
        <section id="our-work" aria-labelledby="our-work-h" className="py-14 bg-tint-blue scroll-mt-32">
          <div className="container-x">
            <span className="eyebrow">Real projects</span>
            <h2 id="our-work-h" className={`mt-3 ${sectionHead}`}>Our {lower} work: case studies and job photos</h2>
            <p className="mt-3 text-ink/75 max-w-3xl">Every photo here is from a Waterfront Construction job, captioned with what it shows and where it was taken.</p>
            {cards.length > 0 && (
              <ul role="list" className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cards.map(({ p, im }) => {
                  return (
                    <li key={p.slug}>
                      <Link href={`/projects/${p.slug}`} className="group card overflow-hidden h-full flex flex-col pop">
                        <div className="relative aspect-[4/3] bg-sand">
                          <Image src={im.src} alt={im.alt} fill quality={60} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover" />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-lg text-navy">{p.title}</h3>
                          <p className="mt-1.5 text-sm text-ink/75">{p.blurb}</p>
                          <span className="mt-auto pt-3 text-sm font-semibold text-blue">Read the case study <span aria-hidden="true">→</span></span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {gallery.length > 0 && <PhotoGrid photos={gallery} className="mt-8" />}
          </div>
        </section>
      )}

      {/* HUB-SPECIFIC MODULES (materials tables, code basics, …) */}
      {c.sections.map((x, i) => (
        <section key={x.id} id={x.id} aria-labelledby={`${x.id}-h`} className={`py-14 scroll-mt-32 ${i % 2 ? "bg-white" : ""}`}>
          <div className="container-x max-w-5xl">
            <h2 id={`${x.id}-h`} className={sectionHead}>{x.h2}</h2>
            {x.intro?.map((p, k) => <p key={k} className="mt-4 text-ink/80 text-lg leading-relaxed">{p}</p>)}
            {x.table && <DataTable t={x.table} />}
            {x.bullets && (
              <ul className="mt-5 space-y-3">
                {x.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-ink/85 leading-relaxed">
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {x.outro?.map((p, k) => <p key={k} className="mt-5 text-ink/80 leading-relaxed">{p}</p>)}
          </div>
        </section>
      ))}

      {/* COST — cited regional benchmark + drivers; no company price claims (AEO-H3) */}
      <section id="cost" aria-labelledby="cost-h" className="py-14 bg-tint-green scroll-mt-32">
        <div className="container-x max-w-5xl">
          <span className="eyebrow">Cost</span>
          <h2 id="cost-h" className={`mt-3 ${sectionHead}`}>{c.cost.h2}</h2>
          <p className="mt-4 text-lg text-ink/85 leading-relaxed">{c.cost.answer}</p>
          {c.cost.benchmark && (
            <>
              <DataTable
                t={{
                  caption: `Remodeling 2025 Cost vs. Value report: ${CVV_LABEL}`,
                  head: ["Benchmark project", "Scope of the benchmark", "Average job cost", "Cost recouped at resale"],
                  rows: c.cost.benchmark.map((b) => [b.project, b.scope, usd(b.jobCost), `${b.recouped}%`]),
                  note: "These are published regional averages for a standard scope, not our prices. We give every homeowner an itemized estimate for their own house.",
                }}
              />
              <p className="mt-3 text-xs text-ink/65">
                Source: <a href={SOURCES.cvv.url} className="underline underline-offset-2">{SOURCES.cvv.label}</a>. {CVV_CREDIT}
              </p>
            </>
          )}
          <h3 className="mt-8 text-xl font-extrabold text-navy">What moves the price</h3>
          <ul className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {c.cost.drivers.map((d) => (
              <li key={d} className="flex gap-3 text-ink/85">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
          {costGuides.length > 0 && (
            <p className="mt-6 text-ink/80">
              More detail:{" "}
              {costGuides.map((g, i) => (
                <span key={g.slug}>{i > 0 && " · "}<Link href={`/blog/${g.slug}`} className="font-semibold text-blue underline underline-offset-2">{g.title}</Link></span>
              ))}
            </p>
          )}
        </div>
      </section>

      {/* PERMITS & RULES — MA table, NH note */}
      <section id="permits" aria-labelledby="permits-h" className="py-14 scroll-mt-32">
        <div className="container-x max-w-5xl">
          <span className="eyebrow">Permits &amp; rules</span>
          <h2 id="permits-h" className={`mt-3 ${sectionHead}`}>Permits, inspections and rules in Massachusetts</h2>
          <p className="mt-4 text-lg text-ink/80">{c.permits.intro}</p>
          <DataTable t={c.permits.table} />
          <div className="mt-6 rounded-2xl bg-tint-cyan p-5">
            <h3 className="font-bold text-navy">In New Hampshire</h3>
            <p className="mt-1.5 text-ink/80">{c.permits.nh}</p>
          </div>
        </div>
      </section>

      {/* LEAD-SAFE — stated as rules; never a company certification claim */}
      {c.leadSafe && (
        <section id="lead-safe" aria-labelledby="lead-safe-h" className="py-14 bg-white scroll-mt-32">
          <div className="container-x max-w-5xl">
            <h2 id="lead-safe-h" className={sectionHead}>Homes built before 1978: lead-safe rules</h2>
            <p className="mt-4 text-lg text-ink/80 leading-relaxed">{c.leadSafe.intro}</p>
            <ul className="mt-5 space-y-3">
              {LEAD_SAFE_RULES.map((r) => (
                <li key={r} className="flex gap-3 text-ink/85 leading-relaxed">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-ink/80">{LEAD_SAFE_OUTRO}</p>
            <p className="mt-3 text-xs text-ink/65">Source: <a href={SOURCES.lead.url} className="underline underline-offset-2">{SOURCES.lead.label}</a></p>
          </div>
        </section>
      )}

      {/* PROCESS & TIMELINE — the one timeline statement from lib/services.ts (L6) */}
      <section id="process" aria-labelledby="process-h" className="py-14 bg-tint-blue scroll-mt-32">
        <div className="container-x max-w-5xl">
          <span className="eyebrow">Process &amp; timeline</span>
          <h2 id="process-h" className={`mt-3 ${sectionHead}`}>How a {c.noun} works, step by step</h2>
          <p className="mt-4 text-lg text-ink/85">{s.timeline}</p>
          <DataTable
            t={{
              caption: `Steps in a typical ${c.noun}`,
              head: ["Step", "What happens"],
              rows: c.process.steps.map((p, i) => [`${i + 1}. ${p.step}`, p.detail]),
            }}
          />
        </div>
      </section>

      {/* CLIENT FEEDBACK — real testimonials, verbatim, shared with permission; no stars, no Review markup */}
      {quotes.length > 0 && (
        <section id="clients" aria-labelledby="clients-h" className="py-14 scroll-mt-32">
          <div className="container-x">
            <h2 id="clients-h" className={sectionHead}>What clients said about this kind of work</h2>
            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quotes.map((t) => (
                <figure key={t.name} className="card p-6 h-full flex flex-col">
                  <blockquote className="text-ink/85 leading-relaxed">&ldquo;{t.text}&rdquo;</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-navy">{t.name}, {t.town} · {t.date}</figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-5 text-sm text-ink/70">
              Shared with permission by our clients. <a href={site.gbp} className="font-semibold text-blue underline underline-offset-2">Read our Google reviews</a> or <Link href="/reviews" className="font-semibold text-blue underline underline-offset-2">see all client feedback</Link>.
            </p>
          </div>
        </section>
      )}

      {/* FAQ — service-specific, answer-first; FAQPage markup mirrors this text verbatim */}
      <section id="faq" aria-labelledby="faq-h" className="py-14 bg-white scroll-mt-32">
        <div className="container-x grid lg:grid-cols-[.8fr_1.2fr] gap-10 items-start">
          <div className="lg:sticky lg:top-32">
            <span className="eyebrow">FAQ</span>
            <h2 id="faq-h" className={`mt-3 ${sectionHead}`}>{s.name} questions, answered</h2>
            <p className="mt-3 text-ink/75">Have a different question? Call <a href={site.phoneHref} className="font-semibold text-navy underline underline-offset-2">{site.phone}</a> or <a href="#estimate" className="font-semibold text-navy underline underline-offset-2">send us your project details</a>.</p>
          </div>
          <div>
            {c.faqs.map((f) => (
              <details key={f.q} className="group bg-sand/60 rounded-xl mb-3 p-5 open:bg-white open:shadow-card ring-1 ring-black/5">
                <summary className="flex justify-between items-center gap-4 cursor-pointer font-bold text-navy text-lg list-none [&::-webkit-details-marker]:hidden">
                  {f.q}<span aria-hidden="true" className="text-blue text-2xl group-open:rotate-45 transition shrink-0">+</span>
                </summary>
                <p className="mt-3 text-ink/80 leading-relaxed">{f.a}</p>
                {f.more && (
                  <p className="mt-2 text-sm"><Link href={f.more.href} className="font-semibold text-blue underline underline-offset-2">{f.more.label}</Link></p>
                )}
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES + RELATED SERVICES */}
      <section id="guides" aria-labelledby="guides-h" className="py-14 scroll-mt-32">
        <div className="container-x grid lg:grid-cols-2 gap-10">
          <div>
            <h2 id="guides-h" className={sectionHead}>Guides for planning your {c.noun}</h2>
            <ul role="list" className="mt-6 space-y-3">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/blog/${g.slug}`} className="block card p-4 pop">
                    <span className="font-bold text-navy">{g.title}</span>
                    <span className="block mt-1 text-sm text-ink/70">{g.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={sectionHead}>Related services</h2>
            <ul role="list" className="mt-6 space-y-3">
              {related.map((o) => (
                <li key={o.slug}>
                  <Link href={`/services/${o.slug}`} className="flex items-start gap-4 card p-4 pop">
                    <span aria-hidden="true" className="text-2xl bg-sand rounded-xl w-12 h-12 grid place-items-center shrink-0">{o.icon}</span>
                    <span>
                      <span className="font-bold text-navy">{o.short}</span>
                      <span className="block mt-1 text-sm text-ink/70">{o.blurb}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WHERE WE'VE DONE THIS + EVERY TOWN, BY COUNTY (replaces the 198 chips and "200+ towns") */}
      <section id="towns" aria-labelledby="towns-h" className="py-14 bg-white scroll-mt-32">
        <div className="container-x">
          <span className="eyebrow">Service area</span>
          <h2 id="towns-h" className={`mt-3 ${sectionHead}`}>Where we&apos;ve done {lower}, and every town we serve</h2>
          {proof.length > 0 ? (
            <ul role="list" className="mt-6 grid md:grid-cols-2 gap-3">
              {proof.map((pl) => (
                <li key={pl.label} className="card p-4 text-[15px] text-ink/85">
                  <span className="font-bold text-navy">{pl.label}</span>
                  {pl.projects.map((p) => (
                    <span key={p.slug} className="block mt-1">Case study: <Link href={`/projects/${p.slug}`} className="font-semibold text-blue underline underline-offset-2">{p.shortTitle}</Link></span>
                  ))}
                  {pl.clients.length > 0 && <span className="block mt-1">Client feedback from {pl.clients.join(" and ")}, shared with permission</span>}
                  <span className="block mt-1"><Link href={`/services/${s.slug}/${citySlug(pl.city)}`} className="text-blue underline underline-offset-2">Our {lower} page for {pl.label}</Link></span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-ink/80">We have not published a {lower} project on this site yet.</p>
          )}
          <p className="mt-8 text-ink/80 max-w-4xl leading-relaxed">
            Based in Northborough (Worcester County), we work across {serviceArea.regions}: {AREA_FACTS.municipalities} cities and towns in {AREA_FACTS.counties} counties.{" "}
            <Link href="/service-areas" className="font-semibold text-blue underline underline-offset-2">See every town we serve, by county</Link>.
          </p>
          <h3 className="mt-10 text-xl font-extrabold text-navy">{s.name} by town</h3>
          <ServiceTownDirectory slug={s.slug} label={s.name} className="mt-5" />
        </div>
      </section>

      {/* SOURCES + PAGE DETAILS (AEO-H5: cited sources, real Updated date) */}
      <section id="sources" aria-labelledby="sources-h" className="py-12 bg-sand scroll-mt-32">
        <div className="container-x max-w-5xl">
          <h2 id="sources-h" className="text-xl font-extrabold text-navy">Sources and page details</h2>
          <ol className="mt-4 list-decimal pl-5 space-y-1.5 text-sm text-ink/80">
            {c.sources.map((src) => (
              <li key={src.url}><a href={src.url} className="text-blue underline underline-offset-2">{src.label}</a></li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink/60">Code and permit details are general: your town&apos;s building department has the final word on what applies to your project.</p>
          <p className="mt-5 text-sm text-ink/80 leading-relaxed">
            Published by Waterfront Construction Inc, an owner-led home remodeling contractor based in Northborough, Massachusetts.{" "}
            <Link href={OWNER_PAGE} className="font-semibold text-blue underline underline-offset-2">{site.owner}</Link> has {site.experience}+ years of hands-on construction experience and founded the company in {site.founded}.
            {c.reviewedOn && <> Reviewed by {site.owner} on <time dateTime={c.reviewedOn}>{fmtDate(c.reviewedOn)}</time>.</>}
            {" "}Updated <time dateTime={s.updated}>{updated}</time>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-grad text-white">
        <div className="container-x py-14 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Planning a {c.noun}?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Get a free, itemized estimate from Waterfront Construction Inc. Call {site.phone} or use the estimate form on this page.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="#estimate" className="btn btn-green text-base">Get a free estimate</a>
            <a href={site.phoneHref} className="btn btn-white text-base"><span aria-hidden="true">📞</span> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
