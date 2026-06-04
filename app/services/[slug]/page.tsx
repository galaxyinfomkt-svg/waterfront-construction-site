import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QuoteForm from "@/components/QuoteForm";
import { services, site } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return {};
  return { title: `${s.short} in Northborough, MA | Waterfront Construction`, description: s.blurb };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="relative">
        <Image src={s.image} alt={s.short} fill priority className="object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative container-x py-20 text-white">
          <Link href="/services" className="text-cyan text-sm font-semibold">← All services</Link>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold max-w-3xl">{s.short}</h1>
          <p className="mt-4 text-lg text-white/85 max-w-2xl">{s.blurb}</p>
          <Link href="/contact" className="btn btn-green mt-6">Get a Free Estimate →</Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid lg:grid-cols-[1.4fr_.9fr] gap-12">
          <div>
            <span className="eyebrow">What's included</span>
            <h2 className="mt-3 text-3xl font-extrabold text-navy">Quality {s.name.toLowerCase()} done right</h2>
            <p className="mt-4 text-ink/70">From the first estimate to the final walkthrough, you get a licensed, insured team that treats your home like its own. We handle materials, permits, and every detail — so the result looks great and lasts.</p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {s.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 card p-4">
                  <span className="text-green text-lg leading-none mt-0.5">✓</span>
                  <span className="font-medium text-navy text-[15px]">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid md:grid-cols-3 gap-4">
              {[["Free estimate", "Honest, detailed quote"], ["Clear timeline", "On schedule, no surprises"], ["Built to last", "Quality materials & finish"]].map(([t, d]) => (
                <div key={t} className="rounded-xl bg-sand p-5">
                  <h3 className="font-bold text-navy">{t}</h3>
                  <p className="text-sm text-ink/65 mt-1">{d}</p>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-navy">Free {s.name} estimate</h3>
              <p className="text-sm text-ink/60 mt-1 mb-4">We reply within 1 business day.</p>
              <QuoteForm />
            </div>
          </aside>
        </div>
      </section>

      <section className="py-14 bg-sand">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold text-navy mb-6">Explore other services</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {others.map((o) => (
              <Link key={o.slug} href={`/services/${o.slug}`} className="group card overflow-hidden hover:-translate-y-1.5 transition">
                <div className="relative h-36"><Image src={o.image} alt={o.short} fill className="object-cover group-hover:scale-105 transition duration-500" /></div>
                <div className="p-4"><h3 className="font-bold text-navy">{o.name}</h3><span className="text-sm text-blue font-semibold">Learn more →</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
