import Link from "next/link";
import { Fragment } from "react";
import EstimateForm from "@/components/EstimateForm";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, MailIcon, PinIcon, ClockIcon, ArrowLabel } from "@/components/chrome-icons";
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
// The GHL form sits bare in the hero, beside the H1 (<EstimateForm />: id="estimate" + data-estimate-form, the
// hook EstimateLink targets, V5.1), so every "Free estimate" link on the site lands on it. No card, heading or
// note around it, and no mid-page copy on this page: the hero form is the page.
// The old Google Maps iframe (a town pin, undisclosed third party) is replaced by our own SVG map. The
// address (displayAddress, honoring site.showStreet) is labelled neutrally: whether clients can visit it is
// owner input, so the page never says "Visit".

const H1_NAME = "Waterfront Construction";
const H1 = `Contact ${H1_NAME}`;
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

/** Renders a copy string with the phone number (.tel) and the hours kept on one line each (a centered line must not
 *  break at the en dash of "7am–6pm"); the text content is unchanged. */
function WithTel({ text }: { text: string }) {
  const hours = (s: string) => s.split(site.hours).map((h, j) => (j === 0 ? h : <Fragment key={j}><span className="whitespace-nowrap">{site.hours}</span>{h}</Fragment>));
  const parts = text.split(site.phone);
  return <>{parts.map((p, i) => (i === 0 ? hours(p) : <Fragment key={i}><span className="tel">{site.phone}</span>{hours(p)}</Fragment>))}</>;
}

// Contact rows, centered: the icon sits left of its label (one inline-flex eyebrow line), the value centered below.
const row = "flex flex-col items-center py-4 border-b border-line";
const rowLabel = "eyebrow inline-flex items-center gap-2";
const rowIcon = "w-4 h-4 text-muted";
const rowValue = "block mt-1 text-[17px] font-medium text-ink text-balance";

export default function ContactPage() {
  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — centered text on the left (7/12); the bare estimate form in the right 5/12 from lg, right after the
          hero text on phones (UX-H2). */}
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 text-navy">Contact <span className="md:whitespace-nowrap">{H1_NAME}</span></h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[34em] mx-auto"><WithTel text={LEAD} /></p>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      <section className="section">
        <div className="container-x grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-14 items-start">
          <div>
            <h2 className="text-h2-doc text-navy">Talk to us directly</h2>
            <p className="mt-4 text-muted max-w-[38em] mx-auto">{site.name} is owner-led. Call, email, or send the form.</p>
            <address className="not-italic mt-8 border-t border-line">
              <a href={site.phoneHref} className={`${row} group`}>
                <span className={rowLabel}><PhoneIcon className={rowIcon} />Phone</span>
                <span className={`${rowValue} tel group-hover:underline underline-offset-4`}>{site.phone}</span>
              </a>
              <a href={site.emailHref} className={`${row} group`}>
                <span className={rowLabel}><MailIcon className={rowIcon} />Email</span>
                <span className={`${rowValue} max-w-full [overflow-wrap:anywhere] group-hover:underline underline-offset-4`}>{site.email}</span>
              </a>
              <div className={row}>
                <span className={rowLabel}><PinIcon className={rowIcon} />Business address</span>
                <span className={rowValue}>{displayAddress}</span>
              </div>
              <div className={row}>
                <span className={rowLabel}><ClockIcon className={rowIcon} />Hours</span>
                <span className={rowValue}>{site.hours}</span>
              </div>
            </address>
            {credentials && <p className="mt-5 text-[15px] font-medium text-ink">{credentials}</p>}
            <p className="mt-5 text-muted max-w-[38em] mx-auto">
              {`Based in ${serviceArea.base}, we take projects across ${serviceArea.short}.`}{" "}
              <Link href="/service-areas" className="link">See every town we serve</Link>
            </p>
          </div>

          <div>
            <h2 className="text-h2-doc text-navy">What happens next</h2>
            {/* Numerals read 01 02 03; the leading zero is CSS content, so the step text stays "1 2 3" as before.
                Centered: the numeral over its step. */}
            <ol className="mt-6 border-b border-line">
              {[
                "We call you back to talk through the project.",
                "We look at the job and give you a free, itemized estimate.",
                "Before work starts, the scope, price and schedule are confirmed in a written contract.",
              ].map((t, i) => (
                <li key={t} className="flex flex-col items-center gap-1.5 border-t border-line py-4">
                  <span aria-hidden="true" className="eyebrow tnum before:content-['0']">{i + 1}</span>
                  <span className="text-ink max-w-[34em]">{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section bg-stone" aria-labelledby="contact-faq-h">
        <div className="container-x">
          <div className="max-w-[40rem] mx-auto">
            <h2 id="contact-faq-h" className="text-h2 text-navy">Before you call</h2>
            <p className="mt-5 text-muted max-w-[38em] mx-auto">Quick answers to common questions. More on our <Link href="/faq" className="link">FAQ page</Link>.</p>
          </div>
          <div className="mt-12 max-w-[48rem] mx-auto"><FaqList items={contactFaqs} /></div>
        </div>
      </section>

      <section className="section" aria-labelledby="map-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-x-12 gap-y-10 items-center">
          <figure className="min-w-0 border-y border-line py-4">
            <ServiceAreaMap documented={new Set(documentedTowns().map((p) => citySlug(p.city)))} />
          </figure>
          <div>
            <h2 id="map-h" className="text-h2 text-navy">Where we work</h2>
            <p className="mt-5 text-muted max-w-[38em] mx-auto">Each dot is a town we serve; rings are 10 miles apart around our Northborough base. Green dots mark towns where our work is documented on this site.</p>
            <ul className="mt-6">
              <li><Link href="/service-areas" className="link-arrow"><ArrowLabel text="Every town we serve, by county" /></Link></li>
              <li><a href={site.gbp} target="_blank" rel="noopener" className="link-arrow"><ArrowLabel text="Our Google Business Profile" external /></a></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
