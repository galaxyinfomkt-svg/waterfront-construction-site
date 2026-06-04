import Image from "next/image";
import Link from "next/link";
import { site, stats, cities } from "@/lib/site";

export const metadata = { title: "About | Waterfront Construction Inc", description: "Family-owned, licensed home builder serving Northborough, MA & MetroWest since 2017." };

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-grad text-white">
        <div className="container-x py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow text-cyan">Our story</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Local builders who treat your home like our own</h1>
            <p className="mt-4 text-white/85 text-lg">Founded in {site.founded} and based in Northborough, Waterfront Construction is led by owner Ernando Nunes, who brings {site.experience}+ years of hands-on building experience to every project.</p>
          </div>
          <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden shadow-card">
            <Image src="/images/about.jpg" alt="Our team at work" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-card order-2 lg:order-1">
            <Image src="/images/home-exterior.jpg" alt="Finished project" fill className="object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow">From foundation to finish</span>
            <h2 className="mt-3 text-3xl font-extrabold text-navy">A single, accountable team for the whole project</h2>
            <p className="mt-4 text-ink/70">We build and improve residential and commercial structures across MetroWest and Worcester County — kitchens, baths, additions, siding, decks, painting and full remodels. Because the owner is on every job, you always know who's responsible and what's next.</p>
            <p className="mt-3 text-ink/70">Our promise is simple: quality craftsmanship, clear communication, honest pricing, and a finish we're proud to put our name on.</p>
            <Link href="/contact" className="btn btn-green mt-6">Start your project →</Link>
          </div>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="py-8 text-center">
              <div className="text-4xl font-extrabold text-cyan">{s.value}</div>
              <div className="text-sm text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container-x text-center">
          <span className="eyebrow">Where we work</span>
          <h2 className="mt-3 text-3xl font-extrabold text-navy">Serving Northborough & 30 miles around</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
            {cities.map((c) => <span key={c} className="px-3.5 py-1.5 rounded-full bg-sand text-sm font-medium text-navy">{c}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}
