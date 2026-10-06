import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, PlusIcon, ArrowLabel } from "@/components/chrome-icons";
import Typeset from "@/components/Typeset";
import { services, allCities, citySlug, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, townServiceNode, breadcrumbNode, imageNode, placeNode, pageUrl } from "@/lib/schema";
import { townCopy } from "@/lib/town-copy";

// Service x town pages: 6 services x 198 places, all prerendered. Every string comes from
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

const block = "mt-12 border-t border-line pt-12"; // body blocks are separated by a hairline

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
      <section className="page-head">
        <div className="container-x py-8 md:py-10 grid gap-8 lg:gap-12 lg:grid-cols-[1.15fr_.85fr] lg:grid-rows-[auto_1fr] lg:items-start">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <Breadcrumbs items={k.crumbs} />
            <h1 className="mt-5 text-h1-long text-navy"><Typeset text={k.h1} /></h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[36em]">{k.summary}</p>
            {k.heroNote && (
              <p className="mt-4 text-ink/80 max-w-[36em]">
                {k.heroNote.text}{" "}
                <Link href={k.heroNote.href} className="link"><ArrowLabel text={k.heroNote.label} /></Link>
              </p>
            )}{" "}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {/* On desktop the form is right beside this text, so the jump link is for phones and tablets only. */}
              <a href="#estimate" className="btn btn-primary w-full sm:w-auto lg:hidden">{k.cta.estimate}</a>
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{k.cta.phone}</span></a>
            </div>{" "}
            <ul className="dot-list eyebrow mt-6">
              {k.trust.map((t) => <li key={t}>{t} </li>)}
            </ul>
          </div>

          {/* Estimate contract: id="estimate" + data-estimate-form on the section that wraps <LeadForm />; no scroll-mt-*
              (html scroll-padding-top already clears the sticky header, V5.2); not sticky, it sits in the hero. Compact
              card header; on viewports too short for the whole card, the "Free estimate" jump (jumpToEstimate in
              chrome-client.tsx) lines the form's bottom up above the phone's bottom bar instead. */}
          <section id="estimate" data-estimate-form aria-labelledby="estimate-h" className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 bg-white text-ink border border-line rounded-panel p-4 sm:p-5">
            <h2 id="estimate-h" className="font-display text-2xl leading-[1.15] text-navy">{k.estimate.heading}</h2>
            <p className="mt-2 text-sm text-muted">
              {k.estimate.note} <a href={site.phoneHref} className="font-medium text-navy underline underline-offset-4 tel">{k.cta.phone}</a>.
            </p>
            <div className="mt-4"><LeadForm /></div>
          </section>

          {k.quote && (
            <figure className="min-w-0 lg:col-start-1 lg:row-start-2 border-t border-line pt-6">
              <blockquote className="font-display text-[1.375rem] leading-[1.4] text-navy [text-indent:-0.42em] max-w-[36em]">“{k.quote.text}”</blockquote>
              <figcaption className="mt-3 text-[13px] text-muted">
                — {k.quote.cite}. {k.quote.disclosure}{" "}
                <a href={site.gbp} target="_blank" rel="noopener noreferrer" className="link">{k.quote.reviewsLabel}</a>
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* BODY — one column: facts, proof, rules, questions, then the nearby / sibling-service link blocks */}
      <section className="section-doc bg-paper">
        <div className="container-x">
          <div className="max-w-[46rem]">
            {/* AT A GLANCE */}
            <h2 className="text-h2-doc text-navy">{k.glanceHeading}</h2>
            <dl className="mt-8 grid sm:grid-cols-2 gap-x-8">
              {k.facts.map((f) => (
                <div key={f.dt} className="border-t border-line pt-4 pb-6">
                  <dt className="eyebrow">{f.dt}</dt>
                  <dd className="mt-2 text-base text-ink">
                    {f.href ? <a href={f.href} target="_blank" rel="noopener noreferrer" className="link">{f.dd}</a> : f.dd}
                  </dd>
                </div>
              ))}
            </dl>

            {/* PROOF — real case studies with their true town and distance; on same-town pages the first card carries
                the page's lead photo (k.heroImage) */}
            <h2 className={`${block} text-h2-doc text-navy`}>{k.proof.heading}</h2>
            {k.proof.cards.length > 0 && (
              <div className={`mt-8 grid gap-x-8 gap-y-12 ${k.proof.cards.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {k.proof.cards.map((card) => {
                  const wide = k.proof.cards.length === 1;
                  return (
                    <div key={card.href} className={`card-ed group ${wide ? "md:grid md:grid-cols-12 md:gap-x-8" : ""}`}>
                      {card.img && (
                        <div className={`media ${wide ? "md:col-span-7 [aspect-ratio:3/2]" : ""}`}>
                          <Image src={card.img} alt={card.alt ?? ""} fill quality={60} sizes="(min-width: 896px) 430px, (min-width: 640px) 50vw, 100vw" className="object-cover" style={card.pos ? { objectPosition: card.pos } : undefined} />
                        </div>
                      )}
                      <div className={wide && card.img ? "md:col-span-5 self-center" : wide ? "md:col-span-12" : ""}>
                        <h3 className={`mt-5 ${wide && card.img ? "md:mt-0" : ""}`}><Link href={card.href}>{card.title}</Link></h3>{" "}
                        <p className="body">{card.caption}</p>{" "}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {k.proof.also.length > 0 && (
              <ul className="mt-6">
                {k.proof.also.map((a) => (
                  <li key={a.href}><Link href={a.href} className="link-arrow"><ArrowLabel text={a.label} /></Link>{" "}</li>
                ))}
              </ul>
            )}
            <p className="mt-8 text-sm font-semibold text-ink">{k.proof.caseStudiesLabel}</p>{" "}
            {k.proof.caseStudies.length > 0 && (
              <ul className="mt-3 rule-list text-[15px]">
                {k.proof.caseStudies.map((x) => (
                  <li key={x.href} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-3">
                    <span><Link href={x.href} className="link">{x.label}</Link></span>{" "}
                    <span className="text-sm text-muted tnum whitespace-nowrap">{x.meta}</span>{" "}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-8 text-sm font-semibold"><Link href="/reviews" className="link">{k.proof.reviewsLabel}</Link></p>{" "}
            {k.proof.reviewTowns.length > 0 && (
              <ul className="mt-3 rule-list text-[15px] text-ink">
                {k.proof.reviewTowns.map((x) => (
                  <li key={x.label} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-3">
                    <span>{x.label}</span>{" "}
                    <span className="text-sm text-muted tnum whitespace-nowrap">{x.meta}</span>{" "}
                  </li>
                ))}
              </ul>
            )}

            {/* PERMITS AND RULES — state x service rule; the permit authority is this place's */}
            <h2 className={`${block} text-h2-doc text-navy`}>{k.rulesHeading}</h2>
            <p className="mt-5 text-prose text-ink/80">{k.rules}</p>

            {/* SCOPE — details, costs and timelines live on the service hub */}
            <p className="mt-10 font-semibold text-ink">{k.scopeLabel}</p>{" "}
            <ul className="mt-4 check-list grid sm:grid-cols-2 gap-x-8">
              {k.scope.map((x) => (
                <li key={x} className="py-3 border-t border-line text-ink before:top-[calc(.75rem+.3em)]">{x} </li>
              ))}
            </ul>
            <p className="mt-6"><Link href={k.hubLink.href} className="link-arrow"><ArrowLabel text={k.hubLink.label} /></Link></p>{" "}
            {k.guideLinks.map((g) => (
              <p key={g.href} className="mt-1"><Link href={g.href} className="link-arrow"><ArrowLabel text={g.label} /></Link>{" "}</p>
            ))}

            {/* QUESTIONS — only ones specific to this place; visible text only, no FAQPage markup (V4.1) */}
            {k.faqs.length > 0 && (
              <>
                <h2 className={`${block} text-h2-doc text-navy`}>{k.faqHeading}</h2>
                <div className="mt-6 faq-list">
                  {k.faqs.map((f) => (
                    <details key={f.q} className="faq-row group">
                      <summary><span className="faq-q">{f.q}</span>{" "}<PlusIcon className="faq-icon" /></summary>
                      <div className="faq-a"><p>{f.a}</p></div>
                    </details>
                  ))}
                </div>
              </>
            )}

            {/* NEARBY — the 8 true nearest places, same service ("Town, ST" anchors + distance from this place) */}
            <nav aria-labelledby="nearby-h" className={block}>
              <h2 id="nearby-h" className="text-h2-doc text-navy">{k.nearbyHeading}</h2>
              <ul className="mt-6 rule-list grid sm:grid-cols-2 gap-x-8 sm:border-t-0 sm:[&>li:nth-child(-n+2)]:border-t sm:[&>li:nth-child(-n+2)]:border-line">
                {k.nearby.map((n) => (
                  <li key={n.href} className="flex min-h-11 items-center justify-between gap-3 py-2">
                    <Link href={n.href} className="link-nav">{n.label}</Link>{" "}
                    <span className="text-sm text-muted tnum whitespace-nowrap">{n.meta}</span>{" "}
                  </li>
                ))}
              </ul>
            </nav>

            {/* OTHER SERVICES IN THIS PLACE */}
            <nav aria-labelledby="other-h" className={block}>
              <h2 id="other-h" className="text-h2-doc text-navy">{k.otherHeading}</h2>{" "}
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {k.otherServices.map((o) => (
                  <li key={o.href}><Link href={o.href} className="chip">{o.label}</Link>{" "}</li>
                ))}
              </ul>
            </nav>

            <p className="mt-12 text-[13px] text-muted">
              {k.footnote} {k.updated.label} <time dateTime={k.updated.iso}>{k.updated.date}</time>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
