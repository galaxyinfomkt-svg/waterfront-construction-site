import type { Metadata } from "next";
import Link from "next/link";
import { PhoneIcon, ArrowLabel } from "@/components/chrome-icons";
import { site, services } from "@/lib/site";

// 404. Next.js adds `noindex` itself; no canonical, no JSON-LD (audit 01 M3, 06 ST-L2, 08 §5.14).
// Mistyped town URLs are the likeliest 404s here, so the page offers the town directory first.
export const metadata: Metadata = { title: "Page Not Found", description: "The page you requested does not exist." };

export default function NotFound() {
  return (
    <section className="page-head">
      <div className="container-x py-20 md:py-28 text-center">
        {/* Decorative ghost numeral (aria-hidden, WCAG 1.4.3 "pure decoration"). The navy/10 tint is painted as a
            solid background clipped to the glyphs, so contrast checkers report it for review instead of failing it. */}
        <p aria-hidden="true" className="font-display text-[clamp(6rem,18vw,12rem)] leading-none bg-navy/10 bg-clip-text text-transparent">404</p>
        <h1 className="mt-4 text-h1 text-navy">This page took a wrong turn</h1>
        <p className="mt-5 text-lead text-muted max-w-[36em] mx-auto">The page you&apos;re looking for doesn&apos;t exist or has moved. Looking for your town? Every town we serve is listed on our service areas page.</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/service-areas" className="btn btn-secondary">Find your town</Link>
          <div className="flex flex-wrap justify-center gap-x-6">
            <Link href="/" className="link-arrow"><ArrowLabel text="Back to home" /></Link>
            <Link href="/contact" className="link-arrow"><ArrowLabel text="Contact us" /></Link>
            <a href={site.phoneHref} className="link-arrow tel"><PhoneIcon className="w-4 h-4" /> {site.phone}</a>
          </div>
        </div>
        <nav aria-label="Our services" className="mt-10">
          <ul className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 scroll-px-5 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0 sm:justify-center sm:max-w-2xl sm:mx-auto">
            {services.map((s) => (
              <li key={s.slug} className="shrink-0">
                <Link href={`/services/${s.slug}`} className="chip">{s.short}</Link>
              </li>
            ))}
            <li className="shrink-0"><Link href="/gallery" className="chip">Projects</Link></li>
          </ul>
        </nav>
      </div>
    </section>
  );
}
