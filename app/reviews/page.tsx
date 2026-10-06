import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, ArrowLabel } from "@/components/chrome-icons";
import { site, testimonials, allCities, citySlug, cityLabel } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, type Crumb } from "@/lib/schema";
import { allContent } from "@/lib/service-content";
import { testimonialAnchor } from "../service-areas/areas";

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

export default function ReviewsPage() {
  return (
    <>
      <JsonLd data={ld} />

      <section className="page-head" data-cta-zone>
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="max-w-[46rem]">
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
        </div>
      </section>

      <section className="section" aria-labelledby="list-h">
        <div className="container-x">
          <h2 id="list-h" className="sr-only">Testimonials</h2>
          {/* Each card is a 3-row subgrid (quote, name + meta, links), so names line up across the two columns. */}
          <ul className="grid lg:grid-cols-2 gap-x-12 gap-y-14">
            {testimonials.map((t) => {
              const city = cityOf(t.town);
              const svcs = servicesOf(t.name);
              const iso = isoMonth(t.date);
              return (
                <li key={`${t.name}-${t.date}`} id={testimonialAnchor(t.name)} className="grid grid-rows-subgrid row-span-3 gap-y-0 border-t border-line pt-8">
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
            })}
          </ul>
          <p className="mt-14 text-sm text-muted max-w-[60ch]">
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
            <Link href="/contact#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-on-dark tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
