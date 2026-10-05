import type { Metadata } from "next";
import Link from "next/link";
import { PhoneIcon } from "@/components/chrome-icons";
import { site, services } from "@/lib/site";

// 404. Next.js adds `noindex` itself; no canonical, no JSON-LD (audit 01 M3, 06 ST-L2, 08 §5.14).
// Mistyped town URLs are the likeliest 404s here, so the page offers the town directory first.
export const metadata: Metadata = { title: "Page Not Found", description: "The page you requested does not exist." };

export default function NotFound() {
  return (
    <section className="bg-brand-grad text-white">
      <div className="container-x py-20 md:py-28 text-center">
        <p aria-hidden="true" className="text-7xl md:text-8xl font-extrabold text-cyan">404</p>
        <h1 className="mt-4 text-3xl md:text-5xl font-extrabold">This page took a wrong turn</h1>
        <p className="mt-4 text-white/90 text-lg max-w-xl mx-auto">The page you&apos;re looking for doesn&apos;t exist or has moved. Looking for your town? Every town we serve is listed on our service areas page.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/service-areas" className="btn btn-white text-base">Find your town</Link>
          <Link href="/" className="btn btn-outline text-base">Back to home</Link>
          <Link href="/contact" className="btn btn-outline text-base">Contact us</Link>
          <a href={site.phoneHref} className="btn btn-green text-base"><PhoneIcon /> {site.phone}</a>
        </div>
        <nav aria-label="Our services" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="inline-flex items-center min-h-11 px-4 rounded-full bg-white/10 border border-white/25 text-sm font-semibold hover:bg-white/20 transition">{s.short}</Link>
              </li>
            ))}
            <li><Link href="/gallery" className="inline-flex items-center min-h-11 px-4 rounded-full bg-white/10 border border-white/25 text-sm font-semibold hover:bg-white/20 transition">Projects</Link></li>
          </ul>
        </nav>
      </div>
    </section>
  );
}
