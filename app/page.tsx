import Image from "next/image";
import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";
import Reveal from "@/components/Reveal";
import Gallery from "@/components/Gallery";
import JsonLd from "@/components/JsonLd";
import { services, stats, testimonials, cities, site } from "@/lib/site";
import { faqs } from "@/lib/faq";
import { posts } from "@/lib/posts";

const gallery = [
  "/images/kitchen.jpg", "/images/home-exterior.jpg", "/images/bathroom.jpg",
  "/images/deck.jpg", "/images/remodel.jpg", "/images/siding.jpg",
];

export default function Home() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <JsonLd data={faqLd} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/hero.jpg" alt="Beautifully remodeled home" fill priority className="object-cover kenburns" />
        </div>
        <div className="absolute inset-0 hero-overlay" />
        <div className="blob bg-green w-72 h-72 -top-12 -left-10 spin-slow" />
        <div className="blob bg-cyan w-80 h-80 -bottom-16 right-0" />
        <div className="relative container-x py-20 md:py-28 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div className="text-white reveal">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm backdrop-blur">
              <span className="text-cyan">★★★★★</span><span className="text-white/90">Trusted in MetroWest since {site.founded}</span>
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl lg:text-[68px] font-extrabold leading-[1.02]">
              Renovations that add real value to the home you <span className="text-grad">already love</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-xl">
              Kitchens, baths, additions, siding & full remodels for homeowners across Northborough and Greater Worcester — licensed, insured, finished to the last detail.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate →</Link>
              <a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85 font-medium">
              <span>✓ Licensed & insured</span><span>✓ Foundation to finish</span><span>✓ Owner-led & on schedule</span>
            </div>
          </div>
          <div className="card p-6 md:p-7 reveal-2 border-t-4 border-t-green">
            <h2 className="text-xl font-bold text-navy">Get your free estimate</h2>
            <p className="text-sm text-ink/60 mt-1 mb-4">Tell us about your project — we reply within 1 business day.</p>
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-animated text-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-4 py-5 text-center text-sm font-bold">
          <div>🛡️ Licensed & Insured</div><div>🏗️ 15+ Years Experience</div>
          <div>💬 Free, Fast Estimates</div><div>📍 30+ Towns Served</div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-navy text-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="py-9 text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-cyan">{s.value}</div>
                <div className="text-xs md:text-sm text-white/70 mt-1">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-tint-blue">
        <div className="container-x">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow">What we do</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Full-service remodeling & construction</h2>
              <p className="mt-3 text-ink/65 text-lg">One trusted local team for every project — interior to exterior, small repairs to full additions.</p>
            </div>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 9).map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 90}>
                <Link href={`/services/${s.slug}`} className="group card overflow-hidden hover:-translate-y-2 hover:shadow-card transition block h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image src={s.image} alt={s.short} fill className="object-cover zoomimg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
                    <span className="absolute top-3 left-3 text-2xl bg-white/95 rounded-xl w-11 h-11 grid place-items-center shadow">{s.icon}</span>
                    <h3 className="absolute bottom-3 left-4 right-4 font-bold text-xl text-white">{s.name}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-ink/65 line-clamp-2">{s.blurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue group-hover:gap-2 transition-all">Learn more →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center"><Link href="/services" className="btn btn-navy text-base">View all services →</Link></div>
        </div>
      </section>

      {/* CTA BAND 1 */}
      <section className="relative overflow-hidden">
        <Image src="/images/cta.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-brand-grad" style={{ opacity: 0.93 }} />
        <div className="relative container-x py-14 flex flex-col md:flex-row items-center justify-between gap-6 text-white text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Planning a project? Let&apos;s talk.</h2>
            <p className="text-white/85 mt-1">Free, no-obligation estimate — reply within one business day.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="btn btn-white text-base">Get a Free Estimate</Link>
            <a href={site.phoneHref} className="btn btn-green text-base bob">📞 {site.phone}</a>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 bg-tint-green">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="relative h-[440px] rounded-3xl overflow-hidden shadow-card">
              <Image src="/images/remodel.jpg" alt="Quality craftsmanship" fill className="object-cover" />
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 rounded-2xl p-4 flex items-center gap-3 shadow">
                <span className="text-3xl">👷</span>
                <div><div className="font-extrabold text-navy">Owner on every job</div><div className="text-sm text-ink/60">Ernando Nunes · {site.experience}+ years</div></div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="eyebrow">Why Waterfront</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Built better, the way it should be</h2>
              <p className="mt-4 text-ink/70 text-lg">You get craftsmanship, clear communication, and a finish that lasts — because the owner manages every project personally.</p>
              <div className="mt-7 grid sm:grid-cols-2 gap-4">
                {[
                  ["🛡️", "Licensed & insured", "Full MA licensing — your home is protected.", "bg-blue/10 text-blue"],
                  ["⏱️", "On time, on budget", "Clear timelines, honest pricing, no surprises.", "bg-green/10 text-green"],
                  ["⭐", "Finish-obsessed", "We sweat the details most contractors skip.", "bg-cyan/15 text-blue"],
                  ["🤝", "Local & accountable", "Real people, real references in your town.", "bg-navy/10 text-navy"],
                ].map(([icon, t, d, chip]) => (
                  <div key={t as string} className="flex gap-3">
                    <span className={`shrink-0 w-11 h-11 rounded-xl grid place-items-center text-xl ${chip}`}>{icon}</span>
                    <div><h3 className="font-bold text-navy">{t}</h3><p className="text-sm text-ink/65 mt-0.5">{d}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3"><Link href="/about" className="btn btn-navy">About us →</Link><Link href="/contact" className="btn btn-green">Free estimate</Link></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-20 bg-navy text-white">
        <div className="container-x">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow text-cyan">Our work</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">Recent projects across MetroWest</h2>
              <p className="mt-3 text-white/70 text-lg">Real homes, real transformations — from kitchens to full exteriors.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="mt-12"><Gallery images={gallery} /></div>
            <p className="mt-4 text-center text-white/60 text-sm">🔍 Click any photo to view it larger</p>
          </Reveal>
          <div className="mt-10 text-center"><a href={site.instagram} target="_blank" rel="noopener" className="btn btn-white">See more on Instagram →</a></div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 bg-tint-cyan">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Simple process</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">From first call to final walkthrough</h2>
          </div></Reveal>
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {[
              ["01", "Free estimate", "We visit, listen, and give you a clear, honest quote.", "from-blue to-blue-500"],
              ["02", "Design & plan", "We lock scope, materials, timeline and permits.", "from-cyan to-blue"],
              ["03", "We build", "Clean, on-schedule work with one point of contact.", "from-green to-green-600"],
              ["04", "Walkthrough", "We don't finish until you're 100% happy.", "from-navy to-navy-700"],
            ].map(([n, t, d, grad], i) => (
              <Reveal key={n} delay={i * 90}>
                <div className="relative card p-6 h-full overflow-hidden">
                  <div className={`absolute -top-6 -right-4 text-7xl font-extrabold bg-gradient-to-br ${grad} bg-clip-text text-transparent opacity-20`}>{n}</div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} text-white grid place-items-center font-extrabold`}>{n}</div>
                  <h3 className="font-bold text-navy text-lg mt-3">{t}</h3>
                  <p className="text-sm text-ink/65 mt-1.5">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-brand-grad text-white">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-cyan">Homeowners love us</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">Real results, real neighbors</h2>
          </div></Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur h-full">
                  <div className="text-cyan text-xl">★★★★★</div>
                  <p className="mt-3 text-white/90 text-[15px] leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 font-bold">{t.name}</div>
                  <div className="text-sm text-white/65">{t.town}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / AEO */}
      <section className="py-20 bg-tint-green">
        <div className="container-x grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-start">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow">Good to know</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Frequently asked questions</h2>
              <p className="mt-3 text-ink/65">Still have a question? We&apos;re happy to help.</p>
              <div className="mt-5 flex flex-col gap-3">
                <a href={site.phoneHref} className="btn btn-green">📞 Call {site.phone}</a>
                <Link href="/contact" className="btn btn-navy">Ask us anything →</Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="divide-y divide-sand">
              {faqs.map((f) => (
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

      {/* SERVICE AREA */}
      <section className="py-20">
        <div className="container-x text-center">
          <Reveal>
            <span className="eyebrow">Proudly local</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Serving Northborough & 30 miles around</h2>
            <p className="mt-3 text-ink/65 max-w-2xl mx-auto text-lg">Based in Northborough, we build across MetroWest and Worcester County.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
              {cities.map((c) => (
                <span key={c} className="px-4 py-2 rounded-full bg-gradient-to-r from-sand to-white border border-sand text-sm font-semibold text-navy hover:from-blue hover:to-blue-500 hover:text-white transition cursor-default">{c}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* BLOG */}
      <section className="py-20 bg-tint-blue">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Tips &amp; ideas</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">From the blog</h2>
                <p className="mt-2 text-ink/65 text-lg">Practical advice for homeowners thinking about a project.</p>
              </div>
              <Link href="/blog" className="btn btn-navy">View all posts →</Link>
            </div>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-7">
            {posts.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link href={`/blog/${p.slug}`} className="group card overflow-hidden pop block h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image src={p.image} alt={p.title} fill className="object-cover zoomimg" />
                    <span className="absolute top-3 left-3 bg-grad-green text-white text-xs font-bold px-3 py-1 rounded-full">{p.category}</span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-blue font-semibold uppercase tracking-wider">{p.date} · {p.read}</span>
                    <h3 className="font-bold text-lg text-navy mt-1.5 leading-snug">{p.title}</h3>
                    <p className="text-sm text-ink/65 mt-2 line-clamp-2">{p.excerpt}</p>
                    <span className="mt-3 inline-block text-sm font-bold text-blue group-hover:gap-2 transition">Read more →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-navy">
        <Image src="/images/home-exterior.jpg" alt="" fill className="object-cover opacity-25" />
        <div className="relative container-x py-20 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-extrabold">Ready to start your project?</h2>
          <p className="mt-4 text-white/85 text-lg max-w-xl mx-auto">Get a free, no-obligation estimate today. We reply within one business day.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-green text-base">Get My Free Estimate</Link>
            <a href={site.phoneHref} className="btn btn-white text-base">📞 {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
