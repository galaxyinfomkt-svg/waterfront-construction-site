import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, PlusIcon } from "@/components/chrome-icons";
import Typeset from "@/components/Typeset";
import { allCities, citySlug, cityLabel, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, imageNode, placeNode, pageUrl } from "@/lib/schema";
import { areaCopy } from "@/lib/area-copy";

// City hubs: one page per served place (201: cities and towns, villages and Devens), all prerendered (spec §5).
// Every string comes from areaCopy() (lib/area-copy.ts), built only from verifiable data; keep the rendered order in
// sync with areaPageText() there (the G3/G4 similarity check measures that text). The hub lists the place's ten
// service×town pages and carries the town-level content (distance and village/Devens/twin questions, case studies and
// reviews by distance) that is not repeated on those pages. Visible Q&As only: no FAQPage (D7), never Review markup.
export const dynamicParams = false; // closed set: unknown places 404 instead of rendering on demand

export function generateStaticParams() {
  return allCities.map((c) => ({ town: citySlug(c) }));
}

type Props = { params: Promise<{ town: string }> };

const resolve = (town: string) => allCities.find((x) => citySlug(x) === town);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { town } = await params;
  const c = resolve(town);
  if (!c) return {};
  const k = areaCopy(c);
  return pageMeta({ title: k.title, absoluteTitle: k.titleIsAbsolute, description: k.description, path: k.path, image: k.og });
}

const block = "mt-12 border-t border-line pt-12"; // body blocks are separated by a hairline
// Two-column rule list whose first row carries the top rule from sm (the same pattern as the service×town nearby list).
const twoColRules = "rule-list grid sm:grid-cols-2 gap-x-8 sm:border-t-0 sm:[&>li:nth-child(-n+2)]:border-t sm:[&>li:nth-child(-n+2)]:border-line";
// Item styles live on the list (child variants), not on every <li>: the hub repeats ~30 list items, and each class
// string would be written twice (HTML and the RSC payload), which kept the page over its 120 KB budget (spec §11).
// Label over value: the link on one line, the muted proof or distance line under it.
const stackItems = "*:flex *:flex-col *:items-center *:justify-center *:min-h-11 *:py-3 [&_a]:font-medium [&_span]:mt-0.5 [&_span]:text-sm [&_span]:text-muted [&_span]:tnum [&_span]:text-balance";
// Place and distance side by side, wrapping under each other when the cell is narrow.
const rowItems = "*:flex *:flex-wrap *:min-h-11 *:items-center *:justify-center *:gap-x-3 *:py-2 [&_span]:text-sm [&_span]:text-muted [&_span]:tnum [&_span]:whitespace-nowrap";

export default async function CityHubPage({ params }: Props) {
  const { town } = await params;
  const c = resolve(town);
  if (!c) notFound();
  const k = areaCopy(c);
  const CL = cityLabel(c);

  const ld = pageGraph([
    webPageNode({
      path: k.path, type: "CollectionPage", name: k.h1, description: k.description,
      mainEntity: {
        "@type": "ItemList", name: `Our services in ${CL}`, numberOfItems: k.services.length,
        itemListElement: k.services.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.label, url: pageUrl(s.href) })),
      },
      spatialCoverage: placeNode(c), primaryImage: k.sameTownPhoto?.src,
      dateModified: k.updated.iso, relatedLink: k.caseStudyLinks.map(pageUrl),
    }),
    k.sameTownPhoto ? imageNode(k.sameTownPhoto.src, { caption: k.sameTownPhoto.caption, own: true, place: placeNode(c) }) : null,
    breadcrumbNode(k.crumbs),
  ]);

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — answer-first centered text on the left (7/12); the bare estimate form (the page's ONE EstimateForm) in the
          right 5/12 from lg. On phones the form follows the summary and the call buttons, before the testimonial. */}
      <section className="page-head">
        <div className="container-x py-8 md:py-10 grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-12 lg:grid-rows-[auto_1fr]">
          <div className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <Breadcrumbs items={k.crumbs} />
            {/* Typeset keeps "Town, ST" on one line; a long hyphenated name (Manchester-by-the-Sea, MA) cannot fit one line
                at 360px, so it is left to break at its hyphens instead of overflowing. */}
            <h1 className="mt-5 text-h1-long text-navy">{CL.length <= 20 ? <Typeset text={k.h1} /> : k.h1}</h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[34em] mx-auto">{k.summary}</p>
            {k.heroNotes.map((n) => (
              <p key={n.text} className="mt-4 text-ink/80 max-w-[34em] mx-auto">
                {n.text}{" "}
                {n.links.map((l, i) => (
                  <span key={l.href}>{i > 0 ? " · " : ""}<Link prefetch={false} href={l.href} className="link">{l.label}</Link></span>
                ))}{" "}
              </p>
            ))}{" "}
            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
              {/* On desktop the form is right beside this text, so the jump link is for phones and tablets only. */}
              <a href="#estimate" className="btn btn-primary w-full sm:w-auto lg:hidden">{k.cta.estimate}</a>
              <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto"><PhoneIcon className="w-4 h-4" /> <span className="tel">{k.cta.phone}</span></a>
            </div>{" "}
            <ul className={`dot-list-wrap eyebrow mt-6${k.trust.join(" · ").length > 40 ? " dot-list-wrap--stack" : ""}`}>
              {k.trust.map((t) => <li key={t}>{t} </li>)}
            </ul>
          </div>

          <EstimateForm className="min-w-0 self-start lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2" />

          {k.quote && (
            <figure className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-2 border-t border-line pt-6">
              <blockquote className="font-display text-[1.375rem] leading-[1.4] text-navy max-w-[34em] mx-auto">“{k.quote.text}”</blockquote>
              <figcaption className="mt-3 mx-auto max-w-[40em] text-[13px] text-muted text-balance">
                — {k.quote.cite}. {k.quote.disclosure}{" "}
                <a href={site.gbp} target="_blank" rel="noopener noreferrer" className="link">{k.quote.reviewsLabel}</a>
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* BODY — one centered column (46rem): the ten services, the place at a glance and the nearest documented work
          (first half); the mid-page estimate band; then permits, questions and the nearby hubs (second half) */}
      <section className="section-doc bg-paper">
        <div className="container-x">
          <div className="max-w-[46rem] mx-auto">
            {/* SERVICES — the ten service×town pages, D10 order, 2 columns from sm (5 full rows); a muted proof line only
                where a located case study of that service exists */}
            <nav aria-labelledby="services-h">
              <h2 id="services-h" className="text-h2-doc text-navy">{k.servicesHeading}</h2>
              <ul className={`mt-8 ${twoColRules} ${stackItems}`}>
                {k.services.map((s) => (
                  <li key={s.slug}>
                    <Link prefetch={false} href={s.href} className="link-nav">{s.label}</Link>{" "}
                    {s.meta && <span>{s.meta}</span>}{" "}
                  </li>
                ))}
              </ul>
            </nav>
            <CtaRow className="mt-10" />

            {/* AT A GLANCE — label over value, centered (inherited), 1 / 2 columns */}
            <h2 className={`${block} text-h2-doc text-navy`}>{k.glanceHeading}</h2>
            <dl className="mt-8 grid sm:grid-cols-2 gap-x-8 *:border-t *:border-line *:pt-4 *:pb-6 [&_dd]:mt-2 [&_dd]:text-base [&_dd]:text-ink">
              {k.facts.map((f) => (
                <div key={f.dt}>
                  <dt className="eyebrow">{f.dt}</dt>
                  <dd>
                    {f.links ? (
                      f.links.map((l) => (
                        <span key={l.href} className="block"><a href={l.href} target="_blank" rel="noopener noreferrer" className="link inline-block py-1">{l.label}</a>{" "}</span>
                      ))
                    ) : f.href ? <a href={f.href} target="_blank" rel="noopener noreferrer" className="link">{f.dd}</a> : f.dd}
                  </dd>
                </div>
              ))}
            </dl>

            {/* DOCUMENTED WORK — the nearest case studies of any service, with their distance from this place; a photo
                only for a case study from this place (true caption and alt) */}
            <h2 className={`${block} text-h2-doc text-navy`}>{k.workHeading}</h2>
            {k.photoCards.length > 0 && (
              <div className={`mt-8 grid gap-x-8 gap-y-12 ${k.photoCards.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {k.photoCards.map((card) => {
                  const wide = k.photoCards.length === 1;
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
            {k.nearestWork.length > 0 && (
              <ul className={`${k.photoCards.length ? "mt-10" : "mt-8"} rule-list ${stackItems}`}>
                {k.nearestWork.map((x) => (
                  <li key={x.href}>
                    <Link prefetch={false} href={x.href} className="link-nav">{x.label}</Link>{" "}
                    <span>{x.meta}</span>{" "}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-8">
              {[
                { label: k.caseStudiesLabel, items: k.caseStudies },
                { label: k.reviewsLabel, items: k.reviews },
              ].filter((g) => g.items.length).map((g) => (
                <div key={g.label} className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{g.label}</p>{" "}
                  <ul className={`mt-3 rule-list text-[15px] ${rowItems}`}>
                    {g.items.map((x) => (
                      <li key={x.label}>
                        <Link prefetch={false} href={x.href} className="link-nav">{x.label}</Link>{" "}
                        <span>{x.meta}</span>{" "}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <CtaRow className="mt-10" />
          </div>
        </div>
      </section>

      {/* MID-PAGE ESTIMATE — the bare form again (second, lazy instance), stone between the two paper halves */}
      <FormBand doc />

      <section className="section-doc bg-paper">
        <div className="container-x">
          <div className="max-w-[46rem] mx-auto">
            {/* PERMITS AND RULES — this place's permit authority; verified state rules only (fact register, O10) */}
            <h2 className="text-h2-doc text-navy">{k.rulesHeading}</h2>
            <p className="mt-5 mx-auto max-w-[38em] text-prose text-ink/80">{k.rules}</p>

            {/* QUESTIONS — town-level, visible text only (no FAQPage, D7) */}
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

            {/* NEARBY — the 8 true nearest places, each linking its own city hub, with the distance from this place */}
            <nav aria-labelledby="nearby-h" className={block}>
              <h2 id="nearby-h" className="text-h2-doc text-navy">{k.nearbyHeading}</h2>
              <ul className={`mt-6 ${twoColRules} ${rowItems}`}>
                {k.nearby.map((n) => (
                  <li key={n.href}>
                    <Link prefetch={false} href={n.href} className="link-nav">{n.label}</Link>{" "}
                    <span>{n.meta}</span>{" "}
                  </li>
                ))}
              </ul>
            </nav>

            <p className="mt-12 mx-auto max-w-[40em] text-[13px] text-muted">
              {k.footnote} {k.updated.label} <time dateTime={k.updated.iso}>{k.updated.date}</time>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
