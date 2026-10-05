import type { Metadata } from "next";
import Link from "next/link";
import { PhoneIcon, CheckIcon } from "@/components/chrome-icons";
import { site, services } from "@/lib/site";
import LeadConversion from "./LeadConversion";

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
    <section className="mesh text-white" data-cta-zone>
      {GA && <LeadConversion />}
      <div className="container-x py-20 md:py-28 text-center">
        <span aria-hidden="true" className="mx-auto w-16 h-16 rounded-full bg-[#1f7a3a] grid place-items-center"><CheckIcon className="w-8 h-8" /></span>
        <h1 className="mt-5 text-3xl md:text-5xl font-extrabold">Thank you, we got your request</h1>
        <p className="mt-4 text-white/90 text-lg max-w-xl mx-auto">We&apos;ll be in touch to talk through your project and set up your free estimate. Want to talk sooner? Call us during business hours, {site.hours}.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={site.phoneHref} className="btn btn-green text-base"><PhoneIcon /> {site.phone}</a>
          <Link href="/gallery" className="btn btn-white text-base">See our projects</Link>
          <Link href="/" className="btn btn-outline text-base">Back to home</Link>
        </div>
        <nav aria-label="Our services" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
            {services.map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className="inline-flex items-center min-h-11 px-4 rounded-full glass text-sm font-semibold">{s.short}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
