import type { Metadata } from "next";
import Link from "next/link";
import { PhoneIcon, ArrowLabel } from "@/components/chrome-icons";
import { site, services } from "@/lib/site";
import EstimateForm from "@/components/EstimateForm";

// 404. Next.js adds `noindex` itself; no canonical, no JSON-LD (audit 01 M3, 06 ST-L2, 08 §5.14).
// Mistyped town URLs are the likeliest 404s here, so the page offers the town directory first. From lg the text
// moves to the left 7/12 (left-aligned, one left edge) and the bare estimate form (the page's ONE EstimateForm)
// takes the right 5/12; below lg the text stays centred and the form follows it. No mid-page band here.
export const metadata: Metadata = { title: "Page Not Found", description: "The page you requested does not exist." };

export default function NotFound() {
  return (
    <section className="page-head">
      <div className="container-x py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-14">
        <div className="lg:col-span-7 min-w-0 text-center lg:text-left">
          {/* Decorative ghost numeral (aria-hidden, WCAG 1.4.3 "pure decoration"). The navy/10 tint is painted as a
              solid background clipped to the glyphs, so contrast checkers report it for review instead of failing it. */}
          <p aria-hidden="true" className="font-display text-[clamp(6rem,18vw,12rem)] leading-none bg-navy/10 bg-clip-text text-transparent">404</p>
          <h1 className="mt-4 text-h1 text-navy">This page took a wrong turn</h1>
          <p className="mt-5 text-lead text-muted max-w-[36em] mx-auto lg:mx-0">The page you&apos;re looking for doesn&apos;t exist or has moved. Looking for your town? Every town we serve is listed on our service areas page.</p>
          <div className="mt-8 flex flex-col items-center lg:items-start gap-3">
            <Link href="/service-areas" className="btn btn-secondary">Find your town</Link>
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6">
              <Link href="/" className="link-arrow"><ArrowLabel text="Back to home" /></Link>
              <Link href="/contact" className="link-arrow"><ArrowLabel text="Contact us" /></Link>
              <a href={site.phoneHref} className="link-arrow tel"><PhoneIcon className="w-4 h-4" /> {site.phone}</a>
            </div>
          </div>
          <nav aria-label="Our services" className="mt-10">
            <ul className="flex flex-wrap justify-center lg:justify-start gap-2.5 sm:max-w-2xl sm:mx-auto lg:mx-0">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="chip">{s.short}</Link>
                </li>
              ))}
              <li><Link href="/gallery" className="chip">Projects</Link></li>
            </ul>
          </nav>
        </div>
        <EstimateForm className="lg:col-span-5 self-start min-w-0" />
      </div>
    </section>
  );
}
