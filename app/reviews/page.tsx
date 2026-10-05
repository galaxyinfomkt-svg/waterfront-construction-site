import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon } from "@/components/chrome-icons";
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

      <section className="bg-brand-grad text-white" data-cta-zone>
        <div className="container-x py-12 md:py-16">
          <Breadcrumbs items={crumbs} />
          <span className="mt-6 eyebrow text-cyan">Client testimonials</span>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold">{H1}</h1>
          <p className="mt-4 text-white/90 text-lg max-w-2xl leading-relaxed">{LEAD}</p>
          <p className="mt-2 text-white/90 font-semibold">{DISCLOSURE}</p>
          <p className="mt-4 text-white/85 max-w-2xl">To read our public reviews, or to leave one, visit our Google Business Profile.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={site.gbp} target="_blank" rel="noopener" className="btn btn-white">Read our Google reviews</a>
            <a href={site.googleReview} target="_blank" rel="noopener" className="btn btn-outline">Leave a Google review</a>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-sand" aria-labelledby="list-h">
        <div className="container-x">
          <h2 id="list-h" className="sr-only">Testimonials</h2>
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => {
              const city = cityOf(t.town);
              const svcs = servicesOf(t.name);
              const iso = isoMonth(t.date);
              return (
                <li key={`${t.name}-${t.date}`} id={testimonialAnchor(t.name)}>
                  <figure className="card p-6 h-full flex flex-col">
                    <blockquote className="flex-1 text-ink/85 leading-relaxed"><p>&ldquo;{t.text}&rdquo;</p></blockquote>
                    <figcaption className="mt-4 pt-4 border-t border-sand text-sm">
                      <span className="block font-bold text-navy">{t.name}</span>
                      <span className="block text-ink/75">
                        {t.town} · {iso ? <time dateTime={iso}>{t.date}</time> : t.date} · Shared with permission
                      </span>
                      {city && svcs.length > 0 && (
                        <span className="mt-2 block">
                          {svcs.map((s, i) => (
                            <span key={s.slug}>
                              {i > 0 ? " · " : ""}
                              <Link href={`/services/${s.slug}/${citySlug(city)}`} className="font-semibold text-blue underline underline-offset-2 hover:text-navy">{`${s.short} in ${cityLabel(city)}`}</Link>
                            </span>
                          ))}
                        </span>
                      )}
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-sm text-ink/75 max-w-3xl">
            These testimonials are reproduced word for word. See our{" "}
            <Link href="/gallery" className="font-semibold text-blue underline underline-offset-2">project case studies</Link> for photos from our job sites.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="container-x">
          <div className="rounded-3xl bg-navy text-white p-8 md:p-14 text-center" data-cta-zone>
            <h2 className="text-3xl md:text-4xl font-extrabold">Worked with us?</h2>
            <p className="mt-3 text-white/85 max-w-xl mx-auto">A Google review helps other homeowners decide. Planning a project of your own? Estimates are free.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href={site.googleReview} target="_blank" rel="noopener" className="btn btn-green text-base">Leave a Google review</a>
              <Link href="/contact#estimate" className="btn btn-white text-base">Get a free estimate</Link>
              <a href={site.phoneHref} className="btn btn-white text-base"><PhoneIcon /> {site.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
