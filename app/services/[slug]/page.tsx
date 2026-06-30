import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { services, galleryImages, allCities, citySlug, site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { graph, breadcrumb, serviceSchema, faqSchema } from "@/lib/schema";
import { commonFaqs, dedupeFaqs } from "@/lib/faq";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return {};
  return pageMeta({
    title: `${s.name} in Northborough, MA`,
    description: `Professional ${s.name.toLowerCase()} in Northborough & MetroWest, MA. Licensed, insured & free estimates — call ${site.phone}.`,
    path: `/services/${s.slug}`,
    image: s.image,
  });
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== slug).slice(0, 3);
  const gallery = [s.image, ...galleryImages.filter((g) => g !== s.image)].slice(0, 6);
  const allFaqs = dedupeFaqs([...s.faqs, ...commonFaqs(s.name)]);
  const ld = graph([
    breadcrumb([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.name, path: `/services/${s.slug}` }]),
    serviceSchema(s),
    faqSchema(allFaqs),
  ]);

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <Image src={s.image} alt={s.short} fill priority quality={55} className="object-cover kenburns" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="blob bg-green w-72 h-72 -top-12 -left-10 spin-slow" />
        <div className="relative container-x py-20 md:py-24 text-white">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-cyan">Home</Link><span>›</span>
            <Link href="/services" className="hover:text-cyan">Services</Link><span>›</span>
            <span className="text-white">{s.name}</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-4xl bg-white/95 rounded-2xl w-16 h-16 grid place-items-center shadow">{s.icon}</span>
            <h1 className="text-4xl md:text-6xl font-extrabold max-w-3xl">{s.short}</h1>
          </div>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl">{s.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate →</Link>
            <a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a>
          </div>
        </div>
      </section>

      {/* INTRO + SIDEBAR */}
      <section className="py-16">
        <div className="container-x grid lg:grid-cols-[1.5fr_.9fr] gap-12">
          <div>
            <Reveal>
              <span className="eyebrow">Professional {s.name.toLowerCase()}</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Quality {s.name.toLowerCase()} you can count on</h2>
              {s.long.map((p, i) => <p key={i} className="mt-4 text-ink/75 text-lg leading-relaxed">{p}</p>)}
            </Reveal>

            <Reveal>
              <h3 className="mt-10 text-2xl font-extrabold text-navy">What&apos;s included</h3>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 card p-4 pop">
                    <span className="text-green text-lg leading-none mt-0.5">✓</span>
                    <span className="font-medium text-navy text-[15px]">{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside>
            <div className="card p-6 sticky top-32 border-t-4 border-t-green">
              <h3 className="text-lg font-bold text-navy">Free {s.name} estimate</h3>
              <p className="text-sm text-ink/60 mt-1 mb-4">Tell us about your project — we reply within 1 business day.</p>
              <LeadForm height={560} />
            </div>
          </aside>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-16 bg-navy text-white">
        <div className="container-x">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow text-cyan">Our work</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">Recent {s.name.toLowerCase()} projects</h2>
              <p className="mt-3 text-white/70">A look at the quality and craftsmanship we bring to every job.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="mt-10"><Gallery images={gallery} /></div>
            <p className="mt-4 text-center text-white/60 text-sm">🔍 Click any photo to view it larger</p>
          </Reveal>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16 bg-tint-green">
        <div className="container-x">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow">Why homeowners choose us</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">The Waterfront difference</h2>
            </div>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              ["👷", "Owner-led", "Ernando is on every job — accountable from start to finish."],
              ["🛡️", "Licensed & insured", "Full MA licensing and insurance protect your home."],
              ["⏱️", "On time, on budget", "A clear schedule and honest, itemized pricing."],
              ["⭐", "Built to last", "Quality materials and a finish we're proud to sign."],
            ].map(([icon, t, d], i) => (
              <Reveal key={t} delay={i * 80}>
                <div className="card p-6 h-full pop">
                  <span className="w-12 h-12 rounded-xl bg-grad-green text-white grid place-items-center text-xl">{icon}</span>
                  <h3 className="font-bold text-navy mt-3">{t}</h3>
                  <p className="text-sm text-ink/65 mt-1">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-16">
        <div className="container-x">
          <Reveal><h2 className="text-3xl md:text-4xl font-extrabold text-navy text-center">How your project works</h2></Reveal>
          <div className="mt-10 grid md:grid-cols-4 gap-6">
            {[
              ["01", "Free estimate", "We visit, listen, and give you a clear, honest quote."],
              ["02", "Plan & materials", "We lock scope, materials, timeline and permits."],
              ["03", "We build", "Clean, on-schedule work with one point of contact."],
              ["04", "Walkthrough", "We don't finish until you're 100% happy."],
            ].map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 80}>
                <div className="relative card p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-grad-sunset text-white grid place-items-center font-extrabold">{n}</div>
                  <h3 className="font-bold text-navy text-lg mt-3">{t}</h3>
                  <p className="text-sm text-ink/65 mt-1.5">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ (AEO) */}
      <section className="py-16 bg-tint-blue">
        <div className="container-x grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-start">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <span className="eyebrow">Good to know</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">{s.name} FAQs</h2>
              <p className="mt-3 text-ink/65">Have a different question? We&apos;re happy to help.</p>
              <a href={site.phoneHref} className="btn btn-green mt-5">📞 Call {site.phone}</a>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div>
              {allFaqs.map((f) => (
                <details key={f.q} className="group bg-white rounded-xl mb-3 p-5 shadow-[0_6px_20px_-14px_rgba(20,20,43,.4)] open:shadow-card">
                  <summary className="flex justify-between items-center cursor-pointer font-bold text-navy text-lg list-none">
                    {f.q}<span className="ml-4 text-blue text-2xl group-open:rotate-45 transition shrink-0">+</span>
                  </summary>
                  <p className="mt-3 text-ink/70 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy">
        <Image src={s.image} alt="" fill quality={55} className="object-cover opacity-25" />
        <div className="relative container-x py-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready for your {s.name.toLowerCase()} project?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Get a free, no-obligation estimate today. We reply within one business day.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate</Link>
            <a href={site.phoneHref} className="btn btn-white text-base">📞 {site.phone}</a>
          </div>
        </div>
      </section>

      {/* AREAS WE SERVE */}
      <section className="py-16">
        <div className="container-x">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow">Areas we serve</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">{s.name} across MetroWest &amp; Worcester County</h2>
              <p className="mt-3 text-ink/65">Based in Northborough, we provide {s.name.toLowerCase()} to 100+ towns nearby. Find yours:</p>
            </div>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2.5 justify-center max-w-5xl mx-auto">
            {allCities.map((c) => (
              <Link key={c} href={`/services/${s.slug}/${citySlug(c)}`}
                className="px-4 py-2 rounded-full bg-sand text-sm font-semibold text-navy hover:bg-grad-green hover:text-white transition">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="py-14 bg-tint-green">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold text-navy mb-6">Explore other services</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {others.map((o) => (
              <Link key={o.slug} href={`/services/${o.slug}`} className="group card overflow-hidden pop block">
                <div className="relative h-36"><Image src={o.image} alt={o.short} fill quality={60} className="object-cover zoomimg" /></div>
                <div className="p-4"><h3 className="font-bold text-navy">{o.name}</h3><span className="text-sm text-blue font-semibold">Learn more →</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
