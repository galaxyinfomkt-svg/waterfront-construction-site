import type { Metadata } from "next";
import Link from "next/link";
import { PhoneIcon, CheckIcon, ArrowLabel } from "@/components/chrome-icons";
import { site, services } from "@/lib/site";
import LeadConversion from "./LeadConversion";
import EstimateForm from "@/components/EstimateForm";

// /thank-you — where the GHL form redirects after a submission (set in GHL's form settings, not the
// embed code). noindex, no canonical/og:url (none is set in the root layout either) and no JSON-LD
// (audit 06 ST-L1, 08 §5.14). Counts the lead in GA4 when GA is configured.
export const metadata: Metadata = {
  title: "Thank You: Request Received",
  description: "We received your estimate request and will be in touch to set up your free estimate.",
  robots: { index: false, follow: true },
};

const GA = Boolean(process.env.NEXT_PUBLIC_GA_ID);

export default function ThankYouPage() {
  return (
    <section className="page-head" data-cta-zone>
      {GA && <LeadConversion />}
      {/* The owner wants the bare GHL form beside the H1 on every page, this one included. The text column is centered. */}
      <div className="container-x py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-12">
        <div className="lg:col-span-7">
          <span aria-hidden="true" className="mx-auto grid place-items-center w-14 h-14 rounded-full border border-navy text-navy"><CheckIcon className="w-6 h-6" /></span>
          <h1 className="mt-6 text-h1 text-navy">Thank you, we got your request</h1>
          <p className="mt-5 text-lead text-ink/80 max-w-[34em] mx-auto">We&apos;ll be in touch to talk through your project and set up your free estimate. Want to talk sooner? Call us during business hours, <span className="whitespace-nowrap">{site.hours}</span>.</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <a href={site.phoneHref} className="btn btn-navy tel"><PhoneIcon /> {site.phone}</a>
            <div className="flex flex-wrap justify-center gap-x-6">
              <Link href="/gallery" className="link-arrow"><ArrowLabel text="See our projects" /></Link>
              <Link href="/" className="link-arrow"><ArrowLabel text="Back to home" /></Link>
            </div>
          </div>
          <nav aria-label="Our services" className="mt-10">
            <ul className="flex flex-wrap justify-center gap-2.5">
              {services.map((s) => (
                <li key={s.slug}><Link href={`/services/${s.slug}`} className="chip">{s.short}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <EstimateForm className="lg:col-span-5 self-start min-w-0" />
      </div>
    </section>
  );
}
