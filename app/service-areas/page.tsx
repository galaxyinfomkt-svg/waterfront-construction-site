import Link from "next/link";
import Reveal from "@/components/Reveal";
import { cities, citySlug, services, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";

export const metadata = pageMeta({
  title: "Service Areas — Northborough & MetroWest, MA",
  description: "Waterfront Construction serves Northborough and 30+ towns across MetroWest and Worcester County, MA. Find remodeling & construction services in your town.",
  path: "/service-areas",
});

const flagship = "kitchen-bathroom-remodeling";

export default function ServiceAreasPage() {
  return (
    <>
      <JsonLd data={graph([breadcrumb([{ name: "Home", path: "/" }, { name: "Service Areas", path: "/service-areas" }])])} />
      <section className="mesh text-white">
        <div className="container-x py-16 md:py-20 text-center">
          <span className="eyebrow text-cyan">Proudly local</span>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold">Service areas</h1>
          <p className="mt-4 text-white/85 text-lg max-w-2xl mx-auto">Based in Northborough, we build and remodel across MetroWest and Worcester County — within about a 30-mile radius.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy text-center">Towns we serve</h2>
            <p className="text-center text-ink/60 mt-2 mb-8">Click your town for local remodeling &amp; construction services.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cities.map((c) => (
              <Link key={c} href={`/services/${flagship}/${citySlug(c)}`}
                className="card gborder p-4 flex items-center justify-between hover:-translate-y-1 transition">
                <span className="font-bold text-navy">{c}, MA</span>
                <span className="text-blue">→</span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-center text-ink/55 text-sm">…and many more nearby towns across MetroWest &amp; Worcester County. Don&apos;t see yours? Just ask.</p>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <div className="container-x text-center">
          <Reveal>
            <span className="eyebrow justify-center">What we build</span>
            <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-navy">Services in every town</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {services.map((s) => (
                <Link key={s.slug} href={`/services/${s.slug}`} className="px-4 py-2 rounded-full bg-white border border-sand text-sm font-semibold text-navy hover:bg-grad-green hover:text-white transition">{s.name}</Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/contact" className="btn btn-green">Get a Free Estimate</Link><a href={site.phoneHref} className="btn btn-navy">📞 {site.phone}</a></div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
