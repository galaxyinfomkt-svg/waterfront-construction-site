import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon } from "@/components/chrome-icons";
import { services, allCities, citySlug, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, townServiceNode, breadcrumbNode, imageNode, placeNode, pageUrl } from "@/lib/schema";
import { townCopy } from "@/lib/town-copy";

// Service × town pages: 6 services × 198 places, all prerendered. Every string comes from
// townCopy() (lib/town-copy.ts), which builds the page only from verifiable data; keep the
// rendered order in sync with townPageText() there (the similarity check measures that text).
export const dynamicParams = false; // closed set: unknown towns 404 instead of rendering on demand

export function generateStaticParams() {
  return services.flatMap((s) => allCities.map((c) => ({ slug: s.slug, city: citySlug(c) })));
}

type Props = { params: Promise<{ slug: string; city: string }> };

function resolve(slug: string, city: string) {
  return { s: services.find((x) => x.slug === slug), c: allCities.find((x) => citySlug(x) === city) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, city } = await params;
  const { s, c } = resolve(slug, city);
  if (!s || !c) return {};
  const k = townCopy(s, c);
  return pageMeta({ title: k.title, absoluteTitle: k.titleIsAbsolute, description: k.description, path: k.path, image: k.og });
}

const H2 = "text-2xl md:text-3xl font-extrabold text-navy";
const Arrow = () => <span aria-hidden="true"> →</span>;

export default async function ServiceTownPage({ params }: Props) {
  const { slug, city } = await params;
  const { s, c } = resolve(slug, city);
  if (!s || !c) notFound();
  const k = townCopy(s, c);
  const url = pageUrl(k.path);

  // No FAQPage here (V4.1): most town Q&As are per town, so the same pair would be marked up on all 6 service
  // pages of that town. The questions stay on the page as visible text.
  const ld = pageGraph([
    webPageNode({
      path: k.path, name: k.h1, description: k.description,
      about: { "@id": `${url}#service` }, mainEntity: { "@id": `${url}#service` },
      primaryImage: k.heroImage?.src, dateModified: k.updated.iso,
      relatedLink: k.relatedLinks.map(pageUrl),
    }),
    townServiceNode(s, c, { h1: k.h1, summary: k.schemaSummary }),
    k.heroImage ? imageNode(k.heroImage.src, { caption: k.heroImage.caption, own: true, place: placeNode(c) }) : null,
    breadcrumbNode(k.crumbs),
  ]);

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — answer-first text on the left; the estimate card (the page's ONE LeadForm) in the right column, so the
          form is above the fold on desktop (V5.3, audit 10 UX-H2). On phones the card follows the summary and the call
          buttons, before the testimonial and the at-a-glance facts. The case-study photo leads the proof section. */}
      <section className="relative overflow-hidden bg-brand-grad text-white">
        <div className="container-x py-8 md:py-10 grid gap-8 lg:gap-12 lg:grid-cols-[1.15fr_.85fr] lg:grid-rows-[auto_1fr] lg:items-start">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <Breadcrumbs items={k.crumbs} />
            <h1 className="mt-4 text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold leading-tight">{k.h1}</h1>
            <p className="mt-5 text-base sm:text-lg text-white/90 leading-relaxed">{k.summary}</p>
            {k.heroNote && (
              <p className="mt-4 text-white/90">
                {k.heroNote.text}{" "}
                <Link href={k.heroNote.href} className="font-semibold underline underline-offset-2 hover:text-cyan">{k.heroNote.label}<Arrow /></Link>
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {/* On desktop the form is right beside this text, so the jump link is for phones and tablets only. */}
              <a href="#estimate" className="btn btn-green text-base lg:hidden">{k.cta.estimate}</a>
              <a href={site.phoneHref} className="btn btn-outline text-base"><PhoneIcon /> {k.cta.phone}</a>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-white">
              {k.trust.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>

          {/* Estimate contract: id="estimate" + data-estimate-form on the section that wraps <LeadForm />; no scroll-mt-*
              (html scroll-padding-top already clears the sticky header, V5.2); not sticky, it sits in the hero. Compact
              card header so the whole form fits after a "Free estimate" jump: 104px scroll-padding + ~76px card header
              + 473px form ≤ 657px (1366×768 laptop) and ≤ 664px (390×664 phone). */}
          <section id="estimate" data-estimate-form aria-labelledby="estimate-h" className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 rounded-2xl bg-white text-ink p-4 sm:p-5 lg:p-4 shadow-card ring-1 ring-black/5">
            <h2 id="estimate-h" className="text-xl font-extrabold text-navy">{k.estimate.heading}</h2>
            <p className="mt-1 text-sm text-ink/75">
              {k.estimate.note} <a href={site.phoneHref} className="font-bold text-navy underline underline-offset-2">{k.cta.phone}</a>.
            </p>
            <div className="mt-3 lg:mt-2"><LeadForm /></div>
          </section>

          {k.quote && (
            <figure className="min-w-0 lg:col-start-1 lg:row-start-2 rounded-2xl bg-white/10 ring-1 ring-white/25 p-5">
              <blockquote className="text-lg font-medium leading-relaxed">“{k.quote.text}”</blockquote>
              <figcaption className="mt-3 text-sm text-white">
                — {k.quote.cite}. {k.quote.disclosure}{" "}
                <a href={site.gbp} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-cyan">{k.quote.reviewsLabel}</a>
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* BODY — one column: facts, proof, rules, questions, then the nearby / sibling-service link blocks */}
      <section className="py-12 md:py-16">
        <div className="container-x max-w-4xl">
          {/* AT A GLANCE */}
          <h2 className={H2}>{k.glanceHeading}</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {k.facts.map((f) => (
              <div key={f.dt} className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                <dt className="text-sm text-ink/70">{f.dt}</dt>
                <dd className="mt-1 font-semibold text-navy">
                  {f.href ? <a href={f.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-blue">{f.dd}</a> : f.dd}
                </dd>
              </div>
            ))}
          </dl>

          {/* PROOF — real case studies with their true town and distance; on same-town pages the first card carries
              the page's lead photo (k.heroImage) */}
          <h2 className={`${H2} mt-12`}>{k.proof.heading}</h2>
          {k.proof.cards.length > 0 && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {k.proof.cards.map((card) => (
                <Link key={card.href} href={card.href} className="card group block overflow-hidden">
                  {card.img && (
                    <div className="relative aspect-[4/3] bg-sand">
                      <Image src={card.img} alt={card.alt ?? ""} fill quality={60} sizes="(min-width: 896px) 430px, (min-width: 640px) 50vw, 100vw" className="object-cover" style={card.pos ? { objectPosition: card.pos } : undefined} />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-navy group-hover:text-blue">{card.title}</h3>
                    <p className="mt-1 text-sm text-ink/70">{card.caption}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {k.proof.also.length > 0 && (
            <ul className="mt-4 space-y-2">
              {k.proof.also.map((a) => (
                <li key={a.href}><Link href={a.href} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{a.label}<Arrow /></Link></li>
              ))}
            </ul>
          )}
          <p className="mt-5 text-sm text-ink/80 leading-relaxed">
            <span className="font-semibold text-navy">{k.proof.caseStudiesLabel}</span>{" "}
            {k.proof.caseStudies.map((x, i) => (
              <span key={x.href}>{i > 0 && <span aria-hidden="true"> · </span>}<Link href={x.href} className="text-blue underline underline-offset-2 hover:text-navy">{x.label}</Link> {x.meta}</span>
            ))}
          </p>
          <p className="mt-2 text-sm text-ink/80 leading-relaxed">
            <Link href="/reviews" className="font-semibold text-navy underline underline-offset-2 hover:text-blue">{k.proof.reviewsLabel}</Link>{" "}
            {k.proof.reviewTowns.map((x, i) => (
              <span key={x.label}>{i > 0 && <span aria-hidden="true"> · </span>}{x.label} {x.meta}</span>
            ))}
          </p>

          {/* PERMITS AND RULES — state × service rule; the permit authority is this place's */}
          <h2 className={`${H2} mt-12`}>{k.rulesHeading}</h2>
          <p className="mt-4 text-[17px] text-ink/80 leading-relaxed">{k.rules}</p>

          {/* SCOPE — details, costs and timelines live on the service hub */}
          <p className="mt-8 font-semibold text-navy">{k.scopeLabel}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {k.scope.map((x) => (
              <li key={x} className="flex items-start gap-2 text-ink/80"><span aria-hidden="true" className="font-bold text-green">✓</span>{x}</li>
            ))}
          </ul>
          <p className="mt-4"><Link href={k.hubLink.href} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{k.hubLink.label}<Arrow /></Link></p>
          {k.guideLinks.map((g) => (
            <p key={g.href} className="mt-2"><Link href={g.href} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{g.label}<Arrow /></Link></p>
          ))}

          {/* QUESTIONS — only ones specific to this place; visible text only, no FAQPage markup (V4.1) */}
          {k.faqs.length > 0 && (
            <>
              <h2 className={`${H2} mt-12`}>{k.faqHeading}</h2>
              <div className="mt-5">
                {k.faqs.map((f) => (
                  <details key={f.q} className="group mb-3 rounded-xl bg-white p-5 ring-1 ring-black/5 open:shadow-card">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-navy [&::-webkit-details-marker]:hidden">
                      {f.q}<span aria-hidden="true" className="shrink-0 text-2xl text-blue transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-ink/80 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </>
          )}

          {/* NEARBY — the 8 true nearest places, same service ("Town, ST" anchors + distance from this place) */}
          <nav aria-labelledby="nearby-h" className="mt-12">
            <h2 id="nearby-h" className={H2}>{k.nearbyHeading}</h2>
            <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
              {k.nearby.map((n) => (
                <li key={n.href} className="flex min-h-11 items-center justify-between gap-3 border-b border-black/5">
                  <Link href={n.href} className="font-semibold text-blue hover:text-navy">{n.label}</Link>
                  <span className="text-sm text-ink/70">{n.meta}</span>
                </li>
              ))}
            </ul>
          </nav>

          {/* OTHER SERVICES IN THIS PLACE */}
          <nav aria-labelledby="other-h" className="mt-12">
            <h2 id="other-h" className={H2}>{k.otherHeading}</h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {k.otherServices.map((o) => (
                <li key={o.href}><Link href={o.href} className="inline-flex min-h-11 items-center rounded-full bg-sand px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-white">{o.label}</Link></li>
              ))}
            </ul>
          </nav>

          <p className="mt-12 text-xs text-ink/70">
            {k.footnote} {k.updated.label} <time dateTime={k.updated.iso}>{k.updated.date}</time>.
          </p>
        </div>
      </section>
    </>
  );
}
