import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, ArrowLabel } from "@/components/chrome-icons";
import { site, testimonials, allCities, citySlug, cityLabel } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, type Crumb } from "@/lib/schema";
import { allContent } from "@/lib/service-content";
import { testimonialAnchor } from "../service-areas/areas";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
import { EstimateLink } from "@/components/chrome-client";

// /reviews — real client testimonials, published with their permission (owner decision 1).
// Never add Review / AggregateRating markup here or on the business node: self-serving reviews are not
// eligible (Google, since 2019) and owner decision 1 forbids it. Testimonials are visible text only.
// No star glyphs: no client gave a rating that we can source (audit 06 ST-H2, 01 C3, 09 AEO-M2).

const towns = [...new Set(testimonials.map((t) => t.town.replace(/, (MA|NH)$/, "")))];
const stateOfAll = [...new Set(testimonials.map((t) => t.town.slice(-2)))];
const townList = `${towns.slice(0, -1).join(", ")} and ${towns[towns.length - 1]}, ${stateOfAll.length === 1 ? stateOfAll[0] : ""}`.replace(/, $/, "");

const H1 = "Client reviews & testimonials";
const LEAD = `Selected testimonials from ${site.name} clients in ${townList}, quoted exactly as they wrote them.`;
const DISCLOSURE = "Shared with permission by our clients.";

export const metadata = pageMeta({
  title: "Client Reviews & Testimonials",
  description: `Testimonials from clients in ${townList}, shared with permission, plus our Google reviews.`,
  path: "/reviews",
});

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Reviews", path: "/reviews" }];

const ld = pageGraph([webPageNode({ path: "/reviews", name: H1, description: LEAD }), breadcrumbNode(crumbs)]);

// Which services each testimonial is about — the same mapping the service pages use (lib/service-content.ts),
// taken from what each client wrote.
const servicesOf = (name: string) => allContent().filter(({ content }) => content.testimonials.includes(name)).map(({ service }) => service);
const cityOf = (town: string) => {
  const m = town.match(/^(.+), (MA|NH)$/);
  return m ? allCities.find((c) => c.n === m[1] && (c.s ?? "MA") === m[2]) : undefined;
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const isoMonth = (d: string) => {
  const m = d.match(/^([A-Za-z]{3})\w* (\d{4})$/);
  const i = m ? MONTHS.indexOf(m[1]) : -1;
  return m && i >= 0 ? `${m[2]}-${String(i + 1).padStart(2, "0")}` : undefined;
};

// One testimonial card: a 3-row subgrid (quote, name + meta, links), so names line up across the two columns.
function Testimonial({ t }: { t: (typeof testimonials)[number] }) {
  const city = cityOf(t.town);
  const svcs = servicesOf(t.name);
  const iso = isoMonth(t.date);
  return (
    <li id={testimonialAnchor(t.name)} className="grid grid-rows-subgrid row-span-3 gap-y-0 border-t border-line pt-8">
      <figure className="grid grid-rows-subgrid row-span-3 gap-y-0">
        <blockquote className="font-display text-[1.375rem] leading-[1.45] text-navy [text-indent:-0.42em]"><p>&ldquo;{t.text}&rdquo;</p></blockquote>
        <figcaption className="grid grid-rows-subgrid row-span-2 gap-y-0">
          <div className="mt-6">
            <span className="block text-[15px] font-semibold text-ink">{t.name}</span>
            <ul className="mt-1 dot-list text-[13px] text-muted">
              <li>{t.town}</li>
              <li>{iso ? <time dateTime={iso}>{t.date}</time> : t.date}</li>
              {/* Below sm this item takes its own line, so a wrapped line never starts with a separator dot. */}
              <li className="max-sm:basis-full max-sm:before:hidden"><span className="whitespace-nowrap">Shared with permission</span></li>
            </ul>
          </div>
          {city && svcs.length > 0 ? (
            <span className="mt-3 flex flex-col items-start gap-y-2">
              {svcs.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}/${citySlug(city)}`} className="link-arrow text-sm leading-snug"><ArrowLabel text={`${s.short} in ${cityLabel(city)}`} /></Link>
              ))}
            </span>
          ) : <span />}
        </figcaption>
      </figure>
    </li>
  );
}

// The list is read in rows of two (the lg grid). The first two rows come first, with a CTA row between them; the
// mid-page estimate band follows them, and the rest of the list after it. So the band sits about two screens below
// the hero form, and neither the CTA row nor the band touches the other or the closing navy band.
const ROW = 2;
const LIST = "grid lg:grid-cols-2 gap-x-12 gap-y-14";
const head = testimonials.slice(0, 2 * ROW);
const tail = testimonials.slice(2 * ROW);

export default function ReviewsPage() {
  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — text on the left (7/12); the bare estimate form (the page's ONE EstimateForm) in the right 5/12 from lg,
          after the hero text on phones. */}
      <section className="page-head" data-cta-zone>
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <p className="mt-6 eyebrow">Client testimonials</p>
            <h1 className="mt-5 text-h1 text-navy">{H1}</h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[36em]">{LEAD}</p>
            <p className="mt-3 text-[15px] text-muted">{DISCLOSURE}</p>
            <p className="mt-4 text-muted max-w-[36em]">To read our public reviews, or to leave one, visit our Google Business Profile.</p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1">
              <a href={site.gbp} target="_blank" rel="noopener" className="link-arrow"><ArrowLabel text="Read our Google reviews" external /></a>
              <a href={site.googleReview} target="_blank" rel="noopener" className="link-arrow"><ArrowLabel text="Leave a Google review" external /></a>
            </div>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      <section className="section" aria-labelledby="list-h">
        <div className="container-x">
          <h2 id="list-h" className="sr-only">Testimonials</h2>
          <ul className={LIST}>
            {head.slice(0, ROW).map((t) => <Testimonial key={`${t.name}-${t.date}`} t={t} />)}
          </ul>
          {head.length > ROW && (
            <>
              <CtaRow className="mt-14" />
              <ul className={`mt-14 ${LIST}`}>
                {head.slice(ROW).map((t) => <Testimonial key={`${t.name}-${t.date}`} t={t} />)}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* MID-PAGE ESTIMATE FORM — stone between the two paper runs of testimonials */}
      <FormBand tone="stone" />

      {/* The rest of the list. Labelled (no new visible or outline heading), so these cards are not read as part of
          the form band. */}
      <section className="section" aria-label="More testimonials">
        <div className="container-x">
          {tail.length > 0 && (
            <ul className={LIST}>
              {tail.map((t) => <Testimonial key={`${t.name}-${t.date}`} t={t} />)}
            </ul>
          )}
          <p className={`${tail.length > 0 ? "mt-14 " : ""}text-sm text-muted max-w-[60ch]`}>
            These testimonials are reproduced word for word. See our{" "}
            <Link href="/gallery" className="link">project case studies</Link>, documented with our own photos and site videos.
          </p>
        </div>
      </section>

      {/* Closing band: the page's one navy surface */}
      <section className="section bg-navy text-white on-dark" data-cta-zone>
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em]">Worked with us?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]">A Google review helps other homeowners decide. Planning a project of your own? Estimates are free.</p>
          <p className="mt-6"><a href={site.googleReview} target="_blank" rel="noopener" className="link-arrow"><ArrowLabel text="Leave a Google review" external /></a></p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-on-dark tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
