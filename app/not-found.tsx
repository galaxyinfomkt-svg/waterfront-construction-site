import Link from "next/link";
import { site, services } from "@/lib/site";

export const metadata = { title: "Page Not Found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="bg-brand-grad text-white">
      <div className="container-x py-24 md:py-32 text-center">
        <div className="text-7xl md:text-8xl font-extrabold text-cyan/80">404</div>
        <h1 className="mt-4 text-3xl md:text-5xl font-extrabold">This page took a wrong turn</h1>
        <p className="mt-4 text-white/85 text-lg max-w-xl mx-auto">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-white text-base">Back to home</Link>
          <a href={site.phoneHref} className="btn btn-green text-base">📞 {site.phone}</a>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
          {services.slice(0, 6).map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold hover:bg-white/20 transition">
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
