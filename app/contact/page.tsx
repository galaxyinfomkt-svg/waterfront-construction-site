import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, MailIcon, PinIcon, ClockIcon } from "@/components/chrome-icons";
import { site, serviceArea, citySlug } from "@/lib/site";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import { displayAddress } from "@/lib/address";
import { contactFaqs } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, BUSINESS_ID, type Crumb } from "@/lib/schema";
import FaqList from "../faq/FaqList";
import ServiceAreaMap from "../service-areas/ServiceAreaMap";
import { documentedTowns } from "../service-areas/areas";

// /contact — ContactPage + contactPoint (audit 06 ST-M1, 08 §5.11, 10 UX-H2).
// The GHL snippet (components/LeadForm.tsx) is untouched; it is framed by a labelled section with
// id="estimate" and data-estimate-form (the hook EstimateLink targets, V5.1) so every "Free estimate" link
// on the site lands on it; no scroll-margin (html scroll-padding-top already clears the header, V5.2).
// The old Google Maps iframe (a town pin, undisclosed third party) is replaced by our own SVG map. The
// address (displayAddress, honoring site.showStreet) is labelled neutrally: whether clients can visit it is
// owner input, so the page never says "Visit".

const H1 = "Contact Waterfront Construction";
const LEAD = `Free, no-obligation estimates. Call ${site.phone} (${site.hours}), email us, or send the form, and tell us the town and the type of project.`;

export const metadata = pageMeta({
  title: "Contact Us & Free Estimates",
  description: `Call ${site.phone} (${site.hours}) or send the form for a free, no-obligation remodeling estimate. Owner-led contractor based in Northborough, MA.`,
  path: "/contact",
});

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }];
const credentials = hasHic || hasCsl ? credentialLine({ insured: false }) : "";

const ld = pageGraph(
  [
    webPageNode({ path: "/contact", type: "ContactPage", name: H1, description: LEAD, mainEntity: { "@id": BUSINESS_ID } }),
    breadcrumbNode(crumbs),
  ],
  { business: "full", contactPoint: true },
);

const card = "flex items-center gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-black/5";
const iconBox = "shrink-0 rounded-xl w-12 h-12 grid place-items-center bg-sand text-navy";
const labelCls = "block text-xs text-ink/70 font-semibold uppercase tracking-wide";

export default function ContactPage() {
  return (
    <>
      <JsonLd data={ld} />

      <section className="bg-brand-grad text-white">
        <div className="container-x py-12 md:py-16">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold">{H1}</h1>
          <p className="mt-4 text-white/90 text-lg max-w-2xl leading-relaxed">{LEAD}</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x grid grid-cols-1 lg:grid-cols-[.9fr_1.1fr] gap-10 lg:gap-12 items-start">
          {/* Form first on phones (right after the hero), right column on desktop (UX-H2) */}
          <section id="estimate" data-estimate-form aria-labelledby="estimate-h" className="order-first lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 self-start rounded-2xl bg-white p-4 sm:p-6 shadow-card ring-1 ring-black/5">
            <h2 id="estimate-h" className="text-2xl font-extrabold text-navy">Request a free estimate</h2>
            <p className="mt-1 text-ink/75">Tell us the town, the type of project and a good time to call.</p>
            <div className="mt-3"><LeadForm /></div>
          </section>

          <div className="lg:col-start-1 lg:row-start-1">
            <h2 className="text-2xl font-extrabold text-navy">Talk to us directly</h2>
            <p className="text-ink/80 mt-2">{site.name} is owner-led. Call, email, or send the form.</p>
            <address className="not-italic mt-6 space-y-3">
              <a href={site.phoneHref} className={`${card} hover:ring-blue/40 transition`}>
                <span className={iconBox}><PhoneIcon className="w-5 h-5" /></span>
                <span><span className={labelCls}>Phone</span><span className="font-bold text-navy text-lg">{site.phone}</span></span>
              </a>
              <a href={site.emailHref} className={`${card} hover:ring-blue/40 transition`}>
                <span className={iconBox}><MailIcon className="w-5 h-5" /></span>
                <span className="min-w-0"><span className={labelCls}>Email</span><span className="font-bold text-navy break-all">{site.email}</span></span>
              </a>
              <div className={card}>
                <span className={iconBox}><PinIcon className="w-5 h-5" /></span>
                <span><span className={labelCls}>Business address</span><span className="font-bold text-navy">{displayAddress}</span></span>
              </div>
              <div className={card}>
                <span className={iconBox}><ClockIcon className="w-5 h-5" /></span>
                <span><span className={labelCls}>Hours</span><span className="font-bold text-navy">{site.hours}</span></span>
              </div>
            </address>
            {credentials && <p className="mt-4 font-semibold text-navy">{credentials}</p>}
            <p className="mt-6 text-ink/80">
              {`Based in ${serviceArea.base}, we take projects across ${serviceArea.short}.`}{" "}
              <Link href="/service-areas" className="font-semibold text-blue underline underline-offset-2">See every town we serve</Link>
            </p>
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <h2 className="text-2xl font-extrabold text-navy">What happens next</h2>
            <ol className="mt-4 space-y-3">
              {[
                "We call you back to talk through the project.",
                "We look at the job and give you a free, itemized estimate.",
                "Before work starts, the scope, price and schedule are confirmed in a written contract.",
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden="true" className="shrink-0 w-8 h-8 rounded-full bg-navy text-white grid place-items-center text-sm font-bold">{i + 1}</span>
                  <span className="pt-1 text-ink/85">{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-tint-green" aria-labelledby="contact-faq-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-[.8fr_1.2fr] gap-10 items-start">
          <div>
            <h2 id="contact-faq-h" className="text-2xl md:text-4xl font-extrabold text-navy">Before you call</h2>
            <p className="mt-3 text-ink/80">Quick answers to common questions. More on our <Link href="/faq" className="font-semibold text-blue underline underline-offset-2">FAQ page</Link>.</p>
          </div>
          <FaqList items={contactFaqs} />
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="map-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
          <figure className="min-w-0 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-black/5">
            <ServiceAreaMap documented={new Set(documentedTowns().map((p) => citySlug(p.city)))} />
          </figure>
          <div>
            <h2 id="map-h" className="text-2xl md:text-4xl font-extrabold text-navy">Where we work</h2>
            <p className="mt-3 text-ink/85">Each dot is a town we serve; rings are 10 miles apart around our Northborough base. Green dots mark towns where our work is documented on this site.</p>
            <ul className="mt-5 space-y-2 font-semibold">
              <li><Link href="/service-areas" className="text-blue underline underline-offset-2">Every town we serve, by county</Link></li>
              <li><a href={site.gbp} target="_blank" rel="noopener" className="text-blue underline underline-offset-2">Our Google Business Profile</a></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
