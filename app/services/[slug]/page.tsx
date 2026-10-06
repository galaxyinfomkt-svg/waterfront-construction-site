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
import { PhoneIcon, PlusIcon, ArrowLabel } from "@/components/chrome-icons";
import Typeset from "@/components/Typeset";
import ServiceIcon from "../_components/ServiceIcon";
import {
  getContent, serviceProjects, serviceGuides, serviceTestimonials, proofPlaces, projectCardImage, cityFromLabel,
  LEAD_SAFE_RULES, LEAD_SAFE_OUTRO, LEAD_SAFE_HREF, CVV_CREDIT, CVV_LABEL, SOURCES, usd, benchmarkGlance, type Table,
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
const NUMERIC = /^[$\d][\d,.%$–\s-]*$/;
function DataTable({ t, steps = false }: { t: Table; steps?: boolean }) {
  // Figures get tabular numerals; a column is right-aligned (header included) from md up only when EVERY cell in it
  // is a figure, so a mixed column ("$ (lowest)" above "$$") never goes ragged.
  const numCol = t.head.map((_, j) => j > 0 && t.rows.every((r) => NUMERIC.test(r[j] ?? "")));
  return (
    <div className="mt-10 md:mt-14 bg-white border border-line rounded-panel overflow-x-auto">
      {/* Tabular figures only on numeric cells (tnum below): the base :where(table) rule would also widen hyphens in prose. */}
      <table className="w-full text-left text-[15px] leading-[1.5] [font-variant-numeric:normal]">
        <caption className="caption-top text-left px-5 pt-5 pb-3 text-[15px] font-semibold text-ink">{t.caption}</caption>
        <thead className="hidden md:table-header-group bg-stone">
          <tr>
            {t.head.map((h, i) => (
              <th key={i} scope="col" className={`table-cell px-5 py-3 eyebrow text-left align-bottom ${h.trim().split(/\s+/).length <= 2 ? "whitespace-nowrap" : ""} ${numCol[i] ? "md:text-right" : ""}`}>{h || <span className="sr-only">Aspect</span>}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => (
            <tr key={i} className="block md:table-row border-t border-line px-5 py-4 md:p-0">
              {r.map((cell, j) =>
                j === 0
                  ? <th key={j} scope="row" className={`block md:table-cell md:px-5 md:py-3.5 font-medium align-top ${steps ? "text-navy" : "text-ink"}`}>{cell}</th>
                  : (
                    <td key={j} data-label={t.head.length > 2 && t.head[j] ? t.head[j] : undefined} className={`block md:table-cell mt-2.5 md:mt-0 md:px-5 md:py-3.5 text-[15px] text-ink/80 align-top before:block before:text-[11px] before:font-semibold before:tracking-[.14em] before:uppercase before:text-muted before:content-[attr(data-label)] md:before:content-none ${NUMERIC.test(cell) ? "tnum" : ""} ${numCol[j] ? "md:text-right" : ""}`}>
                      {cell}
                    </td>
                  ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {t.note && <p className="border-t border-line px-5 py-4 text-sm text-muted">{t.note}</p>}
    </div>
  );
}

// "At a glance" facts, at the top of the overview on every hub (the hero's right column holds the estimate form).
function Glance({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
      {items.map(([k, v]) => (
        <div key={k} className="border-t border-line pt-4 pb-6">
          <dt className="eyebrow">{k}</dt>
          <dd className="mt-2 text-base text-ink">{v}</dd>
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
  // Never show the same photo twice on a page: lead photo ("Our work") then case-study cards then the rest of the gallery.
  // (app/sitemap/entries.ts mirrors this order for the image sitemap.)
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

  const toc = [
    { id: "overview", label: "Overview" },
    ...(hero || cards.length || gallery.length ? [{ id: "our-work", label: "Our work" }] : []),
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

  const glance: [string, string][] = [
    ["Typical timeline", s.timeline],
    ["Permit in Massachusetts", c.permitShort],
    // Each benchmark is named: never a synthesized min–max range across different projects (V3.5).
    ["Cost benchmark", c.cost.benchmark?.length
      ? benchmarkGlance(c.cost.benchmark)
      : "Priced per project after a free site visit; see what drives the cost below."],
    ["Where we work", `${serviceArea.short}, from our base in Northborough, MA.`],
  ];
  // Chapter surfaces alternate paper / stone by running index over the chapters actually rendered (spec §6 hubs).
  const chapters = [
    "overview",
    ...(hero || cards.length || gallery.length ? ["our-work"] : []),
    ...c.sections.map((x) => x.id),
    "cost", "permits",
    ...(c.leadSafe ? ["lead-safe"] : []),
    "process",
    ...(quotes.length ? ["clients"] : []),
    "faq", "guides", "towns", "sources",
  ];
  const surface = (id: string) => (chapters.indexOf(id) % 2 ? "bg-stone" : "bg-paper");
  const h2 = "text-h2-doc text-navy";
  const head = `mt-4 ${h2} max-w-[48rem]`; // H2 after an eyebrow (16px)
  const prose = "text-prose text-ink max-w-[68ch]";
  const caseLabel = (place?: string) => `See the ${place ? `${place.split(",")[0]} ` : ""}project`;

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — answer-first text on the left; the estimate card (the page's ONE LeadForm) in the right column, so
          the form is above the fold on desktop (V5.3, audit 10 UX-H2) and follows the hero text on phones. The real
          job photo that used to sit here leads the "Our work" section below. */}
      <section className="page-head">
        <div className="container-x py-8 md:py-10 grid gap-8 lg:gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div>
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1-long text-navy"><Typeset text={c.h1} /></h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[36em]">{c.summary}</p>
            <ul className="dot-list mt-4 text-sm text-muted">
              <li>Owner-led</li>{" "}
              <li>Founded in {site.founded} in Northborough, MA</li>{" "}
              {credentials && <li>{credentials}</li>}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {/* On desktop the form is right beside this text, so the jump link is for phones only. */}
              <a href="#estimate" className="btn btn-primary w-full sm:w-auto lg:hidden">Get a free estimate</a>
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
            </div>
            <p className="mt-5 text-[13px] text-muted">Updated <time dateTime={s.updated}>{updated}</time></p>
          </div>
          {/* Estimate contract: id="estimate" + data-estimate-form on the section that wraps <LeadForm />; no scroll-mt-*
              (html scroll-padding-top already clears the sticky header, V5.2); not sticky, it sits in the hero. The card
              header is compact (one-line note); on viewports too short for the whole card, the "Free estimate" jump
              (jumpToEstimate in chrome-client.tsx) lines the form's bottom up above the phone's bottom bar instead. */}
          <section id="estimate" data-estimate-form aria-labelledby="estimate-h" className="bg-white text-ink border border-line rounded-panel p-4 sm:p-5">
            <h2 id="estimate-h" className="font-display text-2xl leading-[1.15] text-navy">Request a free estimate</h2>
            <p className="mt-2 text-sm text-muted">
              Free, no obligation. Or call <a href={site.phoneHref} className="font-medium text-navy underline underline-offset-4 tel">{site.phone}</a>.
            </p>
            <div className="mt-4"><LeadForm /></div>
          </section>
        </div>
      </section>

      {/* ON THIS PAGE */}
      <nav aria-label="On this page" className="flow-root bg-paper border-b border-line">
        <div className="container-x">
          {/* py-1.5/-my-1.5 (and md:pl-1.5/-ml-1.5) give the 5px focus ring room inside the scroll box, which clips on both axes.
              From lg the row wraps instead of scrolling, so every tab is reachable with a mouse. */}
          <ul role="list" className="flex gap-7 overflow-x-auto no-scrollbar -mx-5 pl-5 pr-12 scroll-px-5 py-1.5 -my-1.5 md:mx-0 md:-ml-1.5 md:pl-1.5 [mask-image:linear-gradient(90deg,#000_calc(100%-3rem),transparent)] lg:flex-wrap lg:gap-x-5 lg:gap-y-0 lg:pr-0 lg:overflow-visible lg:[mask-image:none]">
            {toc.map((t) => (
              <li key={t.id} className="shrink-0">
                <a href={`#${t.id}`} className="inline-flex items-center min-h-12 whitespace-nowrap text-sm font-medium text-muted hover:text-navy hover:shadow-[inset_0_-2px_0_var(--color-navy)] focus-visible:text-navy">{t.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* OVERVIEW — at a glance, intro, what's included */}
      <section id="overview" aria-labelledby="overview-h" className={`section-doc ${surface("overview")}`}>
        <div className="container-x">
          <span className="eyebrow">At a glance</span>
          <h2 id="overview-h" className={head}>{s.short}: the essentials</h2>
          <Glance items={glance} />
          {c.intro.map((p, i) => <p key={i} className={`mt-5 ${prose}`}>{p}</p>)}
          <h3 className="mt-12 text-h3 text-navy">What&apos;s included</h3>
          <ul role="list" className="mt-5 check-list grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
            {s.features.map((f) => (
              <li key={f} className="py-3 border-t border-line text-ink before:top-[calc(.75rem+.3em)]">{f}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* OUR WORK — the lead job photo, case studies and real photos with true captions */}
      {(hero || cards.length > 0 || gallery.length > 0) && (
        <section id="our-work" aria-labelledby="our-work-h" className={`section-doc ${surface("our-work")}`}>
          <div className="container-x">
            <span className="eyebrow">Real projects</span>
            <h2 id="our-work-h" className={head}>Our {lower} work: case studies and job photos</h2>
            <p className="mt-5 text-muted max-w-[38rem]">Every photo here is from a Waterfront Construction job, captioned with what it shows and, where the job&apos;s town is recorded, where it was taken.</p>
            {hero && (
              <figure className="mt-10 md:mt-14 md:grid md:grid-cols-12 md:gap-x-8">
                <div className={`relative overflow-hidden bg-well ${heroPortrait ? "md:col-span-5 aspect-[4/5]" : "md:col-span-8 aspect-[3/2]"}`}>
                  <Image src={hero.src} alt={hero.alt} fill quality={60} sizes={heroPortrait ? "(max-width: 768px) 100vw, 320px" : "(max-width: 768px) 100vw, 640px"} className="object-cover" />
                </div>
                <figcaption className="md:col-span-4 md:self-end mt-4 md:mt-0">
                  <span className="block text-base text-ink">{hero.caption}</span>
                  {hero.place && <span className="block mt-1 text-sm text-muted">{hero.place}</span>}
                  {hero.project && (
                    <Link href={`/projects/${hero.project}`} className="mt-2 link-arrow">
                      <ArrowLabel text={caseLabel(hero.place)} />
                    </Link>
                  )}{" "}
                </figcaption>
              </figure>
            )}
            {cards.length === 1 && cards.map(({ p, im }) => (
              <div key={p.slug} className="mt-14 card-ed group md:grid md:grid-cols-12 md:gap-x-8">
                <div className="media md:col-span-7 [aspect-ratio:3/2]">
                  <Image src={im.src} alt={im.alt} fill quality={60} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover" />
                </div>
                <div className="md:col-span-5 self-center">
                  <h3 className="mt-5 md:mt-0"><Link href={`/projects/${p.slug}`}>{p.title}</Link></h3>{" "}
                  <p className="body">{p.blurb}</p>{" "}
                  <span className="mt-3 link-arrow text-sm"><ArrowLabel text="Read the case study" /></span>{" "}
                </div>
              </div>
            ))}
            {cards.length > 1 && (
              <ul role="list" className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {cards.map(({ p, im }) => (
                  <li key={p.slug} className="card-ed group">
                    <div className="media">
                      <Image src={im.src} alt={im.alt} fill quality={60} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" className="object-cover" />
                    </div>
                    <h3 className="mt-5"><Link href={`/projects/${p.slug}`}>{p.title}</Link></h3>{" "}
                    <p className="body">{p.blurb}</p>{" "}
                    <span className="mt-auto pt-3 link-arrow text-sm"><ArrowLabel text="Read the case study" /></span>{" "}
                  </li>
                ))}
              </ul>
            )}
            {gallery.length > 0 && <PhotoGrid photos={gallery} className="mt-14" />}
          </div>
        </section>
      )}

      {/* HUB-SPECIFIC MODULES (materials tables, code basics, …) */}
      {c.sections.map((x) => (
        <section key={x.id} id={x.id} aria-labelledby={`${x.id}-h`} className={`section-doc ${surface(x.id)}`}>
          <div className="container-x">
            <h2 id={`${x.id}-h`} className={`${h2} max-w-[48rem]`}>{x.h2}</h2>
            {x.intro?.map((p, k) => <p key={k} className={`mt-5 ${prose}`}>{p}</p>)}
            {x.table && <DataTable t={x.table} />}
            {x.bullets && (
              <ul className="mt-6 dash-list space-y-3 text-ink max-w-[68ch]">
                {x.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            {x.outro?.map((p, k) => <p key={k} className={`mt-5 ${prose}`}>{p}</p>)}
          </div>
        </section>
      ))}

      {/* COST — cited regional benchmark + drivers; no company price claims (AEO-H3) */}
      <section id="cost" aria-labelledby="cost-h" className={`section-doc ${surface("cost")}`}>
        <div className="container-x">
          <span className="eyebrow">Cost</span>
          <h2 id="cost-h" className={head}>{c.cost.h2}</h2>
          <p className={`mt-5 ${prose}`}>{c.cost.answer}</p>
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
              <p className="mt-3 text-[13px] text-muted max-w-[68ch]">
                Source: <a href={SOURCES.cvv.url} className="link">{SOURCES.cvv.label}</a>. {CVV_CREDIT}
              </p>
            </>
          )}
          <h3 className="mt-12 text-h3 text-navy">What moves the price</h3>
          <ul className="mt-5 dash-list grid sm:grid-cols-2 gap-x-8 gap-y-3 text-ink">
            {c.cost.drivers.map((d) => <li key={d}>{d}</li>)}
          </ul>
          {costGuides.length > 0 && (
            <p className="mt-8 text-ink max-w-[68ch]">
              More detail:{" "}
              {costGuides.map((g, i) => (
                <span key={g.slug}>{i > 0 && " · "}<Link href={`/blog/${g.slug}`} className="link">{g.title}</Link></span>
              ))}
            </p>
          )}
        </div>
      </section>

      {/* PERMITS & RULES — MA table, NH note */}
      <section id="permits" aria-labelledby="permits-h" className={`section-doc ${surface("permits")}`}>
        <div className="container-x">
          <span className="eyebrow">Permits &amp; rules</span>
          <h2 id="permits-h" className={head}>Permits, inspections and rules in Massachusetts</h2>
          <p className={`mt-5 ${prose}`}>{c.permits.intro}</p>
          <DataTable t={c.permits.table} />
          <div className="mt-8 border-l border-navy pl-6 max-w-[68ch]">
            <h3 className="text-h3s text-navy">In New Hampshire</h3>
            <p className="mt-2 text-ink">{c.permits.nh}</p>
          </div>
        </div>
      </section>

      {/* LEAD-SAFE — stated as rules; never a company certification claim. The full rule list lives in ONE canonical
          section (painting hub, LEAD_SAFE_HREF); other hubs give their service-specific rule and link there (V3.10). */}
      {c.leadSafe && (
        <section id="lead-safe" aria-labelledby="lead-safe-h" className={`section-doc ${surface("lead-safe")}`}>
          <div className="container-x">
            <h2 id="lead-safe-h" className={`${h2} max-w-[48rem]`}>Homes built before 1978: lead-safe rules</h2>
            <p className={`mt-5 ${prose}`}>{c.leadSafe.intro}</p>
            {c.leadSafe.full ? (
              <>
                <ul className="mt-6 dash-list space-y-3 text-ink max-w-[68ch]">
                  {LEAD_SAFE_RULES.map((r) => <li key={r}>{r}</li>)}
                </ul>
                <p className={`mt-5 ${prose}`}>{LEAD_SAFE_OUTRO}</p>
              </>
            ) : (
              <p className="mt-4">
                <Link href={LEAD_SAFE_HREF} className="link-arrow"><ArrowLabel text="All the lead-safe rules for pre-1978 homes: containment, cleanup and licensing" /></Link>
              </p>
            )}
            <p className="mt-3 text-[13px] text-muted">Source: <a href={SOURCES.lead.url} className="link">{SOURCES.lead.label}</a></p>
          </div>
        </section>
      )}

      {/* PROCESS & TIMELINE — the one timeline statement from lib/services.ts (L6) */}
      <section id="process" aria-labelledby="process-h" className={`section-doc ${surface("process")}`}>
        <div className="container-x">
          <span className="eyebrow">Process &amp; timeline</span>
          <h2 id="process-h" className={head}>How a {c.noun} works, step by step</h2>
          <p className={`mt-5 ${prose}`}>{s.timeline}</p>
          <DataTable
            steps
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
        <section id="clients" aria-labelledby="clients-h" className={`section-doc ${surface("clients")}`}>
          <div className="container-x">
            <h2 id="clients-h" className={`${h2} max-w-[48rem]`}>What clients said about this kind of work</h2>
            {quotes.length === 1 ? (
              quotes.map((t) => (
                <figure key={t.name} className="mt-10 md:mt-14">
                  <blockquote className="font-display text-quote text-navy max-w-[40ch] [text-indent:-0.42em]">&ldquo;{t.text}&rdquo;</blockquote>
                  <figcaption className="mt-6 text-sm text-muted">
                    <ul className="dot-list"><li><span className="font-semibold text-ink">{t.name}</span>, {t.town}</li>{" "}<li>{t.date}</li></ul>{" "}
                  </figcaption>
                </figure>
              ))
            ) : (
              <div className="mt-10 md:mt-14 grid md:grid-cols-3 gap-y-12">
                {quotes.map((t) => (
                  <figure key={t.name} className="flex flex-col md:px-8 md:first:pl-0 md:last:pr-0 md:border-l md:first:border-l-0 border-line">
                    <blockquote className="font-display text-[1.375rem] md:text-2xl leading-[1.4] text-navy [text-indent:-0.42em]">&ldquo;{t.text}&rdquo;</blockquote>
                    <figcaption className="mt-auto pt-6">
                      <ul className="dot-list pt-4 border-t border-line text-[13px] text-muted"><li><span className="text-sm font-semibold text-ink">{t.name}</span>, {t.town}</li>{" "}<li>{t.date}</li></ul>{" "}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
            <p className="mt-10 text-sm text-muted max-w-[68ch]">
              Shared with permission by our clients. <a href={site.gbp} className="link">Read our Google reviews</a> or <Link href="/reviews" className="link">see all client feedback</Link>.
            </p>
          </div>
        </section>
      )}

      {/* FAQ — service-specific, answer-first; FAQPage markup mirrors this text verbatim */}
      <section id="faq" aria-labelledby="faq-h" className={`section-doc ${surface("faq")}`}>
        <div className="container-x grid lg:grid-cols-12 gap-x-8 gap-y-8">
          <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <span className="eyebrow">FAQ</span>
            <h2 id="faq-h" className={`mt-4 ${h2}`}>{s.name} questions, answered</h2>
            <p className="mt-5 text-muted">Have a different question? Call <a href={site.phoneHref} className="link tel">{site.phone}</a> or <a href="#estimate" className="link">send us your project details</a>.</p>
          </div>
          <div className="faq-list lg:col-span-8">
            {c.faqs.map((f) => (
              <details key={f.q} className="faq-row group">
                <summary><span className="faq-q">{f.q}</span>{" "}<PlusIcon className="faq-icon" /></summary>
                <div className="faq-a">
                  <p>{f.a}</p>
                  {f.more && (
                    <p className="mt-2 text-sm"><Link href={f.more.href} className="link">{f.more.label}</Link></p>
                  )}{" "}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES + RELATED SERVICES — two hairline indexes whose headings share one row */}
      <section id="guides" aria-labelledby="guides-h" className={`section-doc ${surface("guides")}`}>
        <div className="container-x grid lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-x-16 gap-y-14 lg:gap-y-0">
          <div className="grid lg:grid-rows-subgrid lg:row-span-2">
            <h2 id="guides-h" className="font-display text-[1.875rem] leading-[1.15] text-navy">Guides for planning your {c.noun}</h2>
            <ul role="list" className="mt-6 rule-list">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/blog/${g.slug}`} className="group block py-6">
                    <span className="block font-display text-h3s text-navy group-hover:underline underline-offset-4 decoration-1"><ArrowLabel text={g.title} /></span>
                    <span className="block mt-2 text-[15px] text-muted max-w-[60ch]">{g.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid lg:grid-rows-subgrid lg:row-span-2">
            <h2 className="font-display text-[1.875rem] leading-[1.15] text-navy">Related services</h2>
            <ul role="list" className="mt-6 rule-list self-start">
              {related.map((o) => (
                <li key={o.slug}>
                  <Link href={`/services/${o.slug}`} className="group flex items-start gap-4 py-5">
                    <ServiceIcon slug={o.slug} className="w-5 h-5 text-navy mt-1" />
                    <span>
                      <span className="block font-medium text-ink group-hover:underline underline-offset-4">{o.short}</span>
                      <span className="block mt-1 text-sm text-muted">{o.blurb}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WHERE WE'VE DONE THIS + EVERY TOWN, BY COUNTY (replaces the 198 chips and "200+ towns") */}
      <section id="towns" aria-labelledby="towns-h" className={`section-doc ${surface("towns")}`}>
        <div className="container-x">
          <span className="eyebrow">Service area</span>
          <h2 id="towns-h" className={head}>Where we&apos;ve done {lower}, and every town we serve</h2>
          {proof.length > 0 ? (
            <ul role="list" className="mt-10 md:mt-14 rule-list grid md:grid-cols-2 gap-x-12 md:border-t-0 md:[&>li:nth-child(-n+2)]:border-t md:[&>li:nth-child(-n+2)]:border-line">
              {proof.map((pl) => (
                <li key={pl.label} className="py-5 text-[15px] text-ink">
                  <span className="block font-display text-[1.25rem] leading-[1.25] text-navy">{pl.label}</span>
                  {pl.projects.map((p) => (
                    <span key={p.slug} className="block mt-1.5">Case study: <Link href={`/projects/${p.slug}`} className="link">{p.shortTitle}</Link></span>
                  ))}
                  {pl.clients.length > 0 && <span className="block mt-1.5 text-muted">Client feedback from {pl.clients.join(" and ")}, shared with permission</span>}
                  <span className="block mt-1.5"><Link href={`/services/${s.slug}/${citySlug(pl.city)}`} className="link">Our {lower} page for {pl.label}</Link></span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-ink">We have not published a {lower} project on this site yet.</p>
          )}
          <p className={`mt-8 ${prose}`}>
            Based in Northborough (Worcester County), we work across {serviceArea.regions}: {AREA_FACTS.municipalities} cities and towns in {AREA_FACTS.counties} counties.{" "}
            <Link href="/service-areas" className="link">See every town we serve, by county</Link>.
          </p>
          <h3 className="mt-12 text-h3 text-navy">{s.name} by town</h3>
          <ServiceTownDirectory slug={s.slug} label={s.name} className="mt-6" />
        </div>
      </section>

      {/* SOURCES + PAGE DETAILS (AEO-H5: cited sources, real Updated date) */}
      <section id="sources" aria-labelledby="sources-h" className={`section-doc ${surface("sources")}`}>
        <div className="container-x">
          <h2 id="sources-h" className={h2}>Sources and page details</h2>
          <ol className="mt-6 list-decimal pl-5 text-sm text-muted space-y-1.5 max-w-[68ch]">
            {c.sources.map((src) => (
              <li key={src.url}><a href={src.url} className="link">{src.label}</a></li>
            ))}
          </ol>
          <p className="mt-4 text-[13px] text-muted max-w-[68ch]">Code and permit details are general: your town&apos;s building department has the final word on what applies to your project.</p>
          <p className="mt-6 text-sm text-muted max-w-[68ch]">
            Published by Waterfront Construction Inc, an owner-led home remodeling contractor based in Northborough, Massachusetts.{" "}
            <Link href={OWNER_PAGE} className="link">{site.owner}</Link> has {site.experience}+ years of hands-on construction experience and founded the company in {site.founded}.
            {c.reviewedOn && <> Reviewed by {site.owner} on <time dateTime={c.reviewedOn}>{fmtDate(c.reviewedOn)}</time>.</>}
            {" "}Updated <time dateTime={s.updated}>{updated}</time>.
          </p>
        </div>
      </section>

      {/* CTA — the page's one navy band */}
      <section className="section bg-navy text-white on-dark">
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em]">Planning a {c.noun}?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]">Get a free, itemized estimate from Waterfront Construction Inc. Call <span className="tel">{site.phone}</span> or use the estimate form on this page.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</a>
            <a href={site.phoneHref} className="btn btn-on-dark w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
