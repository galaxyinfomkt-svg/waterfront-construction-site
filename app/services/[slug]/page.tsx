import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
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
import HeroPhoto from "@/components/HeroPhoto";
import { SERVICE_HERO } from "@/lib/hero-photos";

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
// cell shows its column name, so phones never need sideways scrolling. Tables are an exception to the centered site:
// cells keep their own alignment (left, figures right from md); only the caption is centered.
const NUMERIC = /^[$\d][\d,.%$–\s-]*$/;
function DataTable({ t, steps = false }: { t: Table; steps?: boolean }) {
  // Figures get tabular numerals; a column is right-aligned (header included) from md up only when EVERY cell in it
  // is a figure, so a mixed column ("$ (lowest)" above "$$") never goes ragged.
  const numCol = t.head.map((_, j) => j > 0 && t.rows.every((r) => NUMERIC.test(r[j] ?? "")));
  return (
    <div className="mt-10 md:mt-14 bg-white border border-line rounded-panel overflow-x-auto">
      {/* Tabular figures only on numeric cells (tnum below): the base :where(table) rule would also widen hyphens in prose. */}
      <table className="w-full text-left text-[15px] leading-[1.5] [font-variant-numeric:normal]">
        <caption className="caption-top text-center px-5 pt-5 pb-3 text-[15px] font-semibold text-ink">{t.caption}</caption>
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
// Label over value, centered (inherited from <main>), in 1 / 2 / 4 columns.
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
  // The header photo (SERVICE_HERO) counts as shown too, so the gallery never repeats it.
  const shown = new Set<string>([SERVICE_HERO[s.slug].src, ...(hero ? [hero.src] : [])]);
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
  const related = c.related.map((r) => services.find((x) => x.slug === r)).filter((x): x is (typeof services)[number] => Boolean(x)); // ServiceSlug[] (§3)
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
  // Chapter surfaces alternate paper / stone by running index over the chapters actually rendered (spec §6 hubs). The same
  // template serves all ten hubs; hubs without a photo (exterior/interior painting, whole-home) skip "our-work".
  const chapters = [
    "overview",
    ...(hero || cards.length || gallery.length ? ["our-work"] : []),
    ...c.sections.map((x) => x.id),
    "cost", "permits",
    "form", // the mid-page FormBand: it takes its turn in the paper / stone alternation
    ...(c.leadSafe ? ["lead-safe"] : []),
    "process",
    ...(quotes.length ? ["clients"] : []),
    "faq", "guides", "towns", "sources",
  ];
  const surface = (id: string) => (chapters.indexOf(id) % 2 ? "bg-stone" : "bg-paper");
  const h2 = "text-h2-doc text-navy";
  const head = `mt-4 ${h2} max-w-[48rem] mx-auto`; // H2 after an eyebrow (16px)
  const h2w = `${h2} max-w-[48rem] mx-auto`; // H2 without an eyebrow
  // Centered running text: a readable centered measure (38em), not the 68ch of left-aligned prose.
  const prose = "text-prose text-ink max-w-[38em] mx-auto";
  const note = "max-w-[40em] mx-auto"; // small print (13-14px) under a block
  const caseLabel = (place?: string) => `See the ${place ? `${place.split(",")[0]} ` : ""}project`;

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — answer-first centered text on the left (7/12); the bare estimate form (the page's ONE EstimateForm) in the right
          5/12 from lg, so the form is above the fold on desktop (V5.3, audit 10 UX-H2), and after the hero text on phones.
          The real job photo that used to sit here leads the "Our work" section below. */}
      <section className="page-head page-head--photo">
        <HeroPhoto img={SERVICE_HERO[s.slug]} />
        <div className="container-x py-8 md:py-10 grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1-long text-navy"><Typeset text={c.h1} /></h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[34em] mx-auto">{c.summary}</p>
            {/* .dot-list-wrap (globals.css): centered; stacked below sm, one dotted line from sm. A registration line
                (once lib/site.ts holds the numbers) makes the row too long to share one line (it needs <= ~64 characters
                at 640px), so the list then stacks at every width. */}
            <ul className={`dot-list-wrap mt-4 text-sm text-muted${`Owner-led · Founded in ${site.founded} in Northborough, MA · ${credentials}`.length > 64 ? " dot-list-wrap--stack" : ""}`}>
              <li>Owner-led</li>{" "}
              <li>Founded in {site.founded} in Northborough, MA</li>{" "}
              {credentials && <li>{credentials}</li>}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
              {/* On desktop the form is right beside this text, so the jump link is for phones only. */}
              <a href="#estimate" className="btn btn-primary w-full sm:w-auto lg:hidden">Get a free estimate</a>
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
            </div>
            <p className="mt-5 text-[13px] text-muted">Updated <time dateTime={s.updated}>{updated}</time></p>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      {/* ON THIS PAGE */}
      <nav aria-label="On this page" className="flow-root bg-paper border-b border-line">
        <div className="container-x">
          {/* One scrolling row at every width (§4.23): the right edge fades over 3rem and pr-12 lets the last tab clear the
              fade. py-1.5/-my-1.5 (and md:pl-1.5/-ml-1.5) give the 5px focus ring room inside the scroll box, which clips on
              both axes; scroll-pr-14 makes a tab reached with Tab scroll fully clear of the fade, not just into it.
              Chromium does not scroll a tab that is already partly in view when it takes focus, so while a tab has keyboard
              focus the fade is dropped (has-[a:focus-visible]) and a tab sitting in the fade reads in full with its ring.
              .scroll-row-center: centered while the row fits, starts at the left edge once it scrolls. From md the scroll box
              runs into both 2rem gutters (-mx-8 px-8, a 2rem fade inside the right gutter), so its content box is exactly the
              container and a row that fits is centered on the page axis (no pr-12 offset). */}
          <ul role="list" className="scroll-row-center flex gap-7 overflow-x-auto no-scrollbar -mx-5 pl-5 pr-12 scroll-pl-5 scroll-pr-14 py-1.5 -my-1.5 md:-mx-8 md:px-8 md:scroll-px-10 [mask-image:linear-gradient(90deg,#000_calc(100%-3rem),transparent)] md:[mask-image:linear-gradient(90deg,#000_calc(100%-2rem),transparent)] has-[a:focus-visible]:[mask-image:none]">
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
          {/* 4 to 6 features (lib/services.ts): .grid-center centres a short last row, so no hub leaves an empty cell;
              four features run as one row of four from lg (2 × 2 from sm). */}
          <ul role="list" className={`mt-5 check-list grid-center sm:[--cols:2] ${s.features.length === 4 ? "lg:[--cols:4]" : "lg:[--cols:3]"}`}>
            {s.features.map((f) => (
              <li key={f} className="py-3 border-t border-line text-ink">{f}</li>
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
            <p className="mt-5 text-muted max-w-[38em] mx-auto">Every photo here is from a Waterfront Construction job, captioned with what it shows and, where the job&apos;s town is recorded, where it was taken.</p>
            {hero && (
              /* sizes follow the rendered box (12-col grid, 32px gaps, 1136px content from 1200px): landscape spans 8
                 (747px; about 60vw from md), portrait spans 5 (455px; about 37vw from md). */
              <figure className="mt-10 md:mt-14 md:grid md:grid-cols-12 md:gap-x-8">
                <div className={`relative overflow-hidden bg-well ${heroPortrait ? "md:col-span-5 aspect-[4/5]" : "md:col-span-8 aspect-[3/2]"}`}>
                  <Image src={hero.src} alt={hero.alt} fill quality={60} sizes={heroPortrait ? "(max-width: 768px) 100vw, (min-width: 1200px) 455px, 38vw" : "(max-width: 768px) 100vw, (min-width: 1200px) 747px, 62vw"} className="object-cover" />
                </div>
                {/* The caption takes the rest of the row (4 cols beside a landscape photo, 7 beside a portrait one), so its
                    centered text sits in the middle of the free space; the measure stays short. */}
                <figcaption className={`${heroPortrait ? "md:col-span-7" : "md:col-span-4"} md:self-end mt-4 md:mt-0 mx-auto max-w-[28em]`}>
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
              /* Media spans 7 of 12 columns: 650px from 1200px, about 52-54vw from md, full width below md. */
              <div key={p.slug} className="mt-14 card-ed group md:grid md:grid-cols-12 md:gap-x-8">
                <div className="media md:col-span-7 [aspect-ratio:3/2]">
                  <Image src={im.src} alt={im.alt} fill quality={60} sizes="(max-width: 640px) 100vw, (max-width: 767px) 94vw, (min-width: 1200px) 650px, 55vw" className="object-cover" />
                </div>
                <div className="md:col-span-5 self-center">
                  <h3 className="mt-5 md:mt-0"><Link href={`/projects/${p.slug}`}>{p.title}</Link></h3>{" "}
                  <p className="body">{p.blurb}</p>{" "}
                  <span className="mt-3 link-arrow text-sm"><ArrowLabel text="Read the case study" /></span>{" "}
                </div>
              </div>
            ))}
            {cards.length > 1 && (
              <ul role="list" className="mt-14 grid-center sm:[--cols:2] lg:[--cols:3] gap-y-12">
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
            <CtaRow className="mt-12" />
          </div>
        </section>
      )}

      {/* HUB-SPECIFIC MODULES (materials tables, code basics, …) */}
      {c.sections.map((x) => (
        <section key={x.id} id={x.id} aria-labelledby={`${x.id}-h`} className={`section-doc ${surface(x.id)}`}>
          <div className="container-x">
            <h2 id={`${x.id}-h`} className={h2w}>{x.h2}</h2>
            {x.intro?.map((p, k) => <p key={k} className={`mt-5 ${prose}`}>{p}</p>)}
            {x.table && <DataTable t={x.table} />}
            {x.bullets && (
              <ul className="mt-6 dash-list space-y-3 text-ink max-w-[38em] mx-auto">
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
              <p className={`mt-3 text-[13px] text-muted ${note}`}>
                Source: <a href={SOURCES.cvv.url} className="link">{SOURCES.cvv.label}</a>. {CVV_CREDIT}
              </p>
            </>
          )}
          <h3 className="mt-12 text-h3 text-navy">What moves the price</h3>
          <ul className="mt-5 dash-list grid-center sm:[--cols:2] gap-y-3 text-ink">
            {c.cost.drivers.map((d) => <li key={d}>{d}</li>)}
          </ul>
          {costGuides.length > 0 && (
            <p className={`mt-8 text-ink ${note}`}>
              More detail:{" "}
              {costGuides.map((g, i) => (
                <span key={g.slug}>{i > 0 && " · "}<Link href={`/blog/${g.slug}`} className="link">{g.title}</Link></span>
              ))}
            </p>
          )}
          <CtaRow className="mt-10" />
        </div>
      </section>

      {/* PERMITS & RULES — MA table, NH note */}
      <section id="permits" aria-labelledby="permits-h" className={`section-doc ${surface("permits")}`}>
        <div className="container-x">
          <span className="eyebrow">Permits &amp; rules</span>
          <h2 id="permits-h" className={head}>Permits, inspections and rules in Massachusetts</h2>
          <p className={`mt-5 ${prose}`}>{c.permits.intro}</p>
          <DataTable t={c.permits.table} />
          {/* Centered callout: a navy rule above (a left rule cannot frame centered text). */}
          <div className="mt-8 mx-auto max-w-[38em] border-t border-navy pt-6">
            <h3 className="text-h3s text-navy">In New Hampshire</h3>
            <p className="mt-2 text-ink">{c.permits.nh}</p>
          </div>
        </div>
      </section>

      {/* MID-PAGE ESTIMATE — the bare form again (second, lazy instance), in its turn of the surface alternation */}
      <FormBand tone={surface("form") === "bg-stone" ? "stone" : "paper"} />

      {/* LEAD-SAFE — stated as rules; never a company certification claim. The full rule list lives in ONE canonical
          section (exterior-painting hub, LEAD_SAFE_HREF); other hubs give their service-specific rule and link there (V3.10). */}
      {c.leadSafe && (
        <section id="lead-safe" aria-labelledby="lead-safe-h" className={`section-doc ${surface("lead-safe")}`}>
          <div className="container-x">
            <h2 id="lead-safe-h" className={h2w}>Homes built before 1978: lead-safe rules</h2>
            <p className={`mt-5 ${prose}`}>{c.leadSafe.intro}</p>
            {c.leadSafe.full ? (
              <>
                <ul className="mt-6 dash-list space-y-3 text-ink max-w-[38em] mx-auto">
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
          <p className={`mt-5 ${prose} text-balance`}>{s.timeline}</p>
          <DataTable
            steps
            t={{
              caption: `Steps in a typical ${c.noun}`,
              head: ["Step", "What happens"],
              rows: c.process.steps.map((p, i) => [`${i + 1}. ${p.step}`, p.detail]),
            }}
          />
          <CtaRow className="mt-10" />
        </div>
      </section>

      {/* CLIENT FEEDBACK — real testimonials, verbatim, shared with permission; no stars, no Review markup */}
      {quotes.length > 0 && (
        <section id="clients" aria-labelledby="clients-h" className={`section-doc ${surface("clients")}`}>
          <div className="container-x">
            <h2 id="clients-h" className={h2w}>What clients said about this kind of work</h2>
            {quotes.length === 1 ? (
              quotes.map((t) => (
                <figure key={t.name} className="mt-10 md:mt-14">
                  <blockquote className="font-display text-quote text-navy max-w-[40ch] mx-auto">&ldquo;{t.text}&rdquo;</blockquote>
                  <figcaption className="mt-6 text-sm text-muted">
                    <ul className="dot-list-wrap"><li><span className="font-semibold text-ink">{t.name}</span>, {t.town}</li>{" "}<li>{t.date}</li></ul>{" "}
                  </figcaption>
                </figure>
              ))
            ) : (
              /* One column per quote (2 or 3), so the row stays centered; the attribution stacks until lg, where the columns
                 are wide enough for "Name, Town · Date" on one line (a wrapped line must never start with the dot). */
              <div className={`mt-10 md:mt-14 grid gap-y-12 ${quotes.length === 2 ? "md:grid-cols-2 md:max-w-[52rem] md:mx-auto" : "md:grid-cols-3 md:-mx-8"}`}>
                {quotes.map((t) => (
                  <figure key={t.name} className="flex flex-col md:px-8 md:border-l md:first:border-l-0 border-line">
                    <blockquote className="font-display text-[1.375rem] md:text-2xl leading-[1.4] text-navy">&ldquo;{t.text}&rdquo;</blockquote>
                    <figcaption className="mt-auto pt-6">
                      <ul className="dot-list-wrap dot-list-wrap--stack-lg pt-4 border-t border-line text-[13px] text-muted"><li><span className="text-sm font-semibold text-ink">{t.name}</span>, {t.town}</li>{" "}<li>{t.date}</li></ul>{" "}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
            <p className={`mt-10 text-sm text-muted ${note} text-balance`}>
              Shared with permission by our clients. <a href={site.gbp} className="link">Read our Google reviews</a> or <Link href="/reviews" className="link">see all client feedback</Link>.
            </p>
          </div>
        </section>
      )}

      {/* FAQ — service-specific, answer-first; FAQPage markup mirrors this text verbatim */}
      <section id="faq" aria-labelledby="faq-h" className={`section-doc ${surface("faq")}`}>
        <div className="container-x">
          <div className="max-w-[40rem] mx-auto">
            <span className="eyebrow">FAQ</span>
            <h2 id="faq-h" className={`mt-4 ${h2}`}>{s.name} questions, answered</h2>
            <p className="mt-5 text-muted">Have a different question? Call <a href={site.phoneHref} className="link tel">{site.phone}</a> or <a href="#estimate" className="link">send us your project details</a>.</p>
          </div>
          <div className="faq-list mt-10 max-w-[48rem] mx-auto">
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
                    <span className="block mt-2 mx-auto text-[15px] text-muted max-w-[34em]">{g.excerpt}</span>
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
                  {/* Centered row: the icon sits right before the service name; the blurb is centered under them. */}
                  <Link href={`/services/${o.slug}`} className="group block py-5">
                    <span className="inline-flex items-center gap-2.5 max-w-full">
                      <ServiceIcon slug={o.slug} className="w-5 h-5 text-navy" />
                      <span className="font-medium text-ink group-hover:underline underline-offset-4">{o.short}</span>
                    </span>
                    <span className="block mt-1 mx-auto max-w-[34em] text-sm text-muted">{o.blurb}</span>
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
            <ul role="list" className="mt-10 md:mt-14 rule-list grid md:grid-cols-2 gap-x-12 md:border-t-0 md:[&>li:nth-child(-n+2)]:border-t md:[&>li:nth-child(-n+2)]:border-line md:[&>li:last-child:nth-child(odd)]:col-span-2">
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
          {/* list-inside: the number sits at the start of each centered line, never stranded in a left gutter. */}
          <ol className={`mt-6 list-decimal list-inside text-sm text-muted space-y-1.5 ${note}`}>
            {c.sources.map((src) => (
              <li key={src.url}><a href={src.url} className="link">{src.label}</a></li>
            ))}
          </ol>
          <p className={`mt-4 text-[13px] text-muted ${note}`}>Code and permit details are general: your town&apos;s building department has the final word on what applies to your project.</p>
          <p className={`mt-6 text-sm text-muted ${note}`}>
            Published by Waterfront Construction Inc, an owner-led general contractor based in Northborough, Massachusetts.{" "}
            <Link href={OWNER_PAGE} className="link">{site.owner}</Link> has {site.experience}+ years of hands-on construction experience and founded the company in {site.founded}.
            {c.reviewedOn && <> Reviewed by {site.owner} on <time dateTime={c.reviewedOn} className="whitespace-nowrap">{fmtDate(c.reviewedOn)}</time>.</>}
            {" "}Updated <time dateTime={s.updated} className="whitespace-nowrap">{updated}</time>.
          </p>
        </div>
      </section>

      {/* CTA — the page's one navy band */}
      <section className="section bg-navy text-white on-dark">
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em] mx-auto">Planning a {c.noun}?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[34em] mx-auto text-balance">Get a free, itemized estimate from Waterfront Construction Inc. Call <span className="tel">{site.phone}</span> or use the estimate form on this page.</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
            <a href="#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</a>
            <a href={site.phoneHref} className="btn btn-on-dark w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{site.phone}</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
