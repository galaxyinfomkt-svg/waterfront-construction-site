import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QuoteForm from "@/components/QuoteForm";
import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { services, allCities, cities, citySlug, galleryImages, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { graph, breadcrumb, serviceSchema, faqSchema } from "@/lib/schema";

export function generateStaticParams() {
  const params: { slug: string; city: string }[] = [];
  for (const s of services) for (const c of allCities) params.push({ slug: s.slug, city: citySlug(c) });
  return params;
}

function resolve(slug: string, city: string) {
  const s = services.find((x) => x.slug === slug);
  const cityName = allCities.find((c) => citySlug(c) === city);
  return { s, cityName };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; city: string }> }) {
  const { slug, city } = await params;
  const { s, cityName } = resolve(slug, city);
  if (!s || !cityName) return {};
  return pageMeta({
    title: `${s.name} in ${cityName}, MA`,
    description: `Looking for ${s.name.toLowerCase()} in ${cityName}, MA? Waterfront Construction is a licensed, insured contractor serving ${cityName} from our Northborough base. ★ 5.0 rated · Free estimates — call ${site.phone}.`,
    path: `/services/${s.slug}/${city}`,
    image: s.image,
    noindex: !cities.includes(cityName),
  });
}

export default async function ServiceCityPage({ params }: { params: Promise<{ slug: string; city: string }> }) {
  const { slug, city } = await params;
  const { s, cityName } = resolve(slug, city);
  if (!s || !cityName) notFound();

  const nearby = allCities.filter((c) => c !== cityName).slice(0, 14);
  const gallery = [s.image, ...galleryImages.filter((g) => g !== s.image)].slice(0, 6);

  const introVariants = [
    `Looking for reliable ${s.name.toLowerCase()} in ${cityName}, Massachusetts? Waterfront Construction has served ${cityName} and the surrounding MetroWest and Worcester County area since ${site.founded}. Based right in nearby Northborough, we're a licensed, insured local team — not an out-of-town outfit — so ${cityName} homeowners get fast response, honest pricing, and craftsmanship that lasts.`,
    `Need ${s.name.toLowerCase()} in ${cityName}, MA? As a Northborough-based, licensed and insured contractor, Waterfront Construction brings ${site.experience}+ years of hands-on experience to ${cityName} homes. From the first estimate to the final walkthrough you work directly with the owner — clear communication, fair pricing, and a finish built to last New England winters.`,
    `Waterfront Construction is a trusted ${s.name.toLowerCase()} contractor serving ${cityName}, Massachusetts and the wider Worcester County and MetroWest region. Working from our Northborough base, we're fully licensed, insured and owner-led — known for treating every ${cityName} home like our own: on time, on budget, and done right the first time.`,
  ];
  const intro = introVariants[Array.from(cityName).reduce((a, c) => a + c.charCodeAt(0), 0) % introVariants.length];

  const faqs = [
    { q: `Do you provide ${s.name.toLowerCase()} in ${cityName}, MA?`, a: `Yes — ${cityName} is right in our service area. We're based in Northborough and regularly serve ${cityName} homeowners with professional ${s.name.toLowerCase()}. Call ${site.phone} for a free estimate.` },
    ...s.faqs.slice(0, 2),
  ];
  const ld = graph([
    breadcrumb([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.name, path: `/services/${s.slug}` }, { name: cityName, path: `/services/${s.slug}/${city}` }]),
    serviceSchema(s, cityName),
    faqSchema(faqs),
  ]);

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <Image src={s.image} alt={`${s.short} in ${cityName}, MA`} fill priority className="object-cover kenburns" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="blob bg-cyan w-72 h-72 -top-12 -right-10 spin-slow" />
        <div className="relative container-x py-20 md:py-24 text-white">
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-cyan">Home</Link><span>›</span>
            <Link href="/services" className="hover:text-cyan">Services</Link><span>›</span>
            <Link href={`/services/${s.slug}`} className="hover:text-cyan">{s.name}</Link><span>›</span>
            <span className="text-white">{cityName}</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl bg-white/95 rounded-2xl w-14 h-14 grid place-items-center shadow">{s.icon}</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold max-w-3xl">{s.short} in {cityName}, MA</h1>
          </div>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl">Trusted, licensed {s.name.toLowerCase()} for {cityName} homeowners — from our Northborough base. {s.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-green text-base">Free {cityName} Estimate →</Link>
            <a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85 font-medium">
            <span>✓ Licensed &amp; insured</span><span>✓ Serving {cityName} &amp; nearby</span><span>✓ Free estimates</span>
          </div>
        </div>
      </section>

      {/* INTRO + SIDEBAR */}
      <section className="py-16">
        <div className="container-x grid lg:grid-cols-[1.5fr_.9fr] gap-12">
          <div>
            <Reveal>
              <span className="eyebrow">{s.name} · {cityName}, MA</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Your local {s.name.toLowerCase()} contractor in {cityName}</h2>
              <p className="mt-4 text-ink/75 text-lg leading-relaxed">{intro}</p>
              {s.long.map((p, i) => <p key={i} className="mt-4 text-ink/70 text-[17px] leading-relaxed">{p}</p>)}

              <h3 className="mt-10 text-2xl font-extrabold text-navy">What&apos;s included</h3>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 card p-4 pop"><span className="text-green text-lg leading-none mt-0.5">✓</span><span className="font-medium text-navy text-[15px]">{f}</span></li>
                ))}
              </ul>
            </Reveal>
          </div>
          <aside>
            <div className="card p-6 sticky top-32 border-t-4 border-t-green">
              <h3 className="text-lg font-bold text-navy">Free {s.name} estimate in {cityName}</h3>
              <p className="text-sm text-ink/60 mt-1 mb-4">Tell us about your project — we reply within 1 business day.</p>
              <QuoteForm />
            </div>
          </aside>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-16 bg-navy text-white">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-cyan">Our work</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">Recent {s.name.toLowerCase()} projects near {cityName}</h2>
          </div></Reveal>
          <Reveal><div className="mt-10"><Gallery images={gallery} /></div><p className="mt-4 text-center text-white/60 text-sm">🔍 Click any photo to view it larger</p></Reveal>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16 bg-tint-green">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto"><span className="eyebrow">Why {cityName} chooses us</span><h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">The Waterfront difference</h2></div></Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[["📍", "Local to you", `Based in Northborough — close to ${cityName} for fast service.`], ["🛡️", "Licensed & insured", "Full MA licensing and insurance protect your home."], ["⏱️", "On time, on budget", "A clear schedule and honest, itemized pricing."], ["⭐", "Built to last", "Quality materials and a finish we're proud to sign."]].map(([icon, t, d], i) => (
              <Reveal key={t} delay={i * 80}><div className="card p-6 h-full pop"><span className="w-12 h-12 rounded-xl bg-grad-green text-white grid place-items-center text-xl">{icon}</span><h3 className="font-bold text-navy mt-3">{t}</h3><p className="text-sm text-ink/65 mt-1">{d}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ (AEO) */}
      <section className="py-16 bg-tint-blue">
        <div className="container-x grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-start">
          <Reveal><div className="lg:sticky lg:top-32">
            <span className="eyebrow">Good to know</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">{s.name} in {cityName} — FAQs</h2>
            <a href={site.phoneHref} className="btn btn-green mt-5">📞 Call {site.phone}</a>
          </div></Reveal>
          <Reveal delay={100}><div>
            {faqs.map((f) => (
              <details key={f.q} className="group bg-white rounded-xl mb-3 p-5 shadow-[0_6px_20px_-14px_rgba(20,20,43,.4)] open:shadow-card">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-navy text-lg list-none">{f.q}<span className="ml-4 text-blue text-2xl group-open:rotate-45 transition shrink-0">+</span></summary>
                <p className="mt-3 text-ink/70 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div></Reveal>
        </div>
      </section>

      {/* NEARBY AREAS */}
      <section className="py-14">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold text-navy">{s.name} in nearby towns</h2>
          <p className="text-ink/60 mt-1 mb-5">We also provide {s.name.toLowerCase()} across the region from our Northborough base:</p>
          <div className="flex flex-wrap gap-2.5">
            {nearby.map((c) => (
              <Link key={c} href={`/services/${s.slug}/${citySlug(c)}`} className="px-4 py-2 rounded-full bg-sand text-sm font-semibold text-navy hover:bg-grad-green hover:text-white transition">{s.name} in {c}</Link>
            ))}
            <Link href={`/services/${s.slug}`} className="px-4 py-2 rounded-full bg-navy text-white text-sm font-semibold">All {s.name} →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy">
        <Image src={s.image} alt="" fill className="object-cover opacity-25" />
        <div className="relative container-x py-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">Need {s.name.toLowerCase()} in {cityName}, MA?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Get a free, no-obligation estimate today. We reply within one business day.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/contact" className="btn btn-green text-base">Get a Free Estimate</Link><a href={site.phoneHref} className="btn btn-white text-base">📞 {site.phone}</a></div>
        </div>
      </section>
    </>
  );
}
