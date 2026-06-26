import Image from "next/image";
import Link from "next/link";
import { services, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Remodeling Services in Northborough, MA",
  description: "Remodeling & construction in Northborough & MetroWest, MA — kitchens, baths, siding, decks, additions & more. Licensed, insured, free estimates.",
  path: "/services",
});

function PageHero({ title, sub }: { title: string; sub: string }) {
  return (
    <section className="bg-brand-grad text-white">
      <div className="container-x py-16 md:py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold max-w-3xl">{title}</h1>
        <p className="mt-4 text-white/85 max-w-2xl text-lg">{sub}</p>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero title="Our remodeling & construction services" sub="One trusted local team for every project — from a single repair to a full home transformation." />
      <section className="py-16">
        <div className="container-x grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="group card overflow-hidden hover:-translate-y-1.5 transition">
              <div className="relative h-44">
                <Image src={s.image} alt={s.short} fill className="object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                <span className="absolute top-3 left-3 text-2xl bg-white/90 rounded-lg w-10 h-10 grid place-items-center">{s.icon}</span>
              </div>
              <div className="p-5">
                <h2 className="font-bold text-lg text-navy">{s.short}</h2>
                <p className="text-sm text-ink/65 mt-1.5 line-clamp-2">{s.blurb}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue">Learn more →</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="container-x mt-12 text-center">
          <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate</Link>
          <span className="block mt-3 text-ink/60 text-sm">or call <a href={site.phoneHref} className="font-bold text-navy">{site.phone}</a></span>
        </div>
      </section>
    </>
  );
}
