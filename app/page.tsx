import Image from "next/image";
import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import FilterGallery, { type GalleryItem } from "@/components/FilterGallery";
import JsonLd from "@/components/JsonLd";
import { services, testimonials, cities, site } from "@/lib/site";
import { faqs } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";
import { graph, faqSchema } from "@/lib/schema";

export const metadata = pageMeta({
  title: "Remodeling & Construction Contractor in Northborough, MA | Waterfront Construction",
  description: "Top-rated home remodeling & construction in Northborough & MetroWest, MA. Kitchens, baths, siding, additions, decks & full remodels. ★ 5.0 rated · Licensed & insured · Free estimates.",
  path: "/",
  absoluteTitle: true,
});

const galleryItems: GalleryItem[] = [
  { src: "/images/kitchen.jpg", cat: "Kitchens", label: "Custom kitchen remodel" },
  { src: "/images/remodel.jpg", cat: "Kitchens", label: "Open-concept renovation" },
  { src: "/images/bathroom.jpg", cat: "Bathrooms", label: "Spa-style bathroom" },
  { src: "/images/home-exterior.jpg", cat: "Siding", label: "Full exterior siding" },
  { src: "/images/siding.jpg", cat: "Siding", label: "Fiber-cement install" },
  { src: "/images/windows.jpg", cat: "Siding", label: "Windows & trim" },
  { src: "/images/deck.jpg", cat: "Decks", label: "Composite deck build" },
  { src: "/images/addition.jpg", cat: "Additions", label: "Second-story addition" },
  { src: "/images/painting.jpg", cat: "Painting", label: "Exterior repaint" },
  { src: "/images/kitchen.jpg", cat: "Bathrooms", label: "Tile & vanity" },
];

const tableRows = [
  ["Kitchen Remodeling", "3–6 weeks", "Cabinets, counters, backsplash, lighting, flooring"],
  ["Bathroom Remodeling", "2–3 weeks", "Tile, shower, vanity, fixtures, waterproofing"],
  ["Siding", "1–2 weeks", "Tear-off, house wrap, siding, trim, soffit & fascia"],
  ["Decks", "1–2 weeks", "Design, permits, framing, decking, railings, stairs"],
  ["Home Additions", "2–4 months", "Design, foundation, framing, roof, full finish"],
  ["Painting", "2–5 days", "Prep, prime, premium interior/exterior finish"],
];

export default function Home() {
  return (
    <>
      <JsonLd data={graph([faqSchema(faqs)])} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <Image src="/images/hero.jpg" alt="Beautifully remodeled home" fill priority className="object-cover kenburns" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="blob bg-cyan w-80 h-80 top-10 -right-10 spin-slow" />
        <div className="relative container-x py-16 md:py-24 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div className="text-white reveal">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm backdrop-blur"><span className="text-cyan">★★★★★</span>5.0 Rating</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green/20 border border-green/40 px-4 py-1.5 text-sm backdrop-blur">🛡️ Licensed &amp; Insured</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm backdrop-blur">📍 Since {site.founded}</span>
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl lg:text-[66px] font-extrabold leading-[1.02]">
              Renovations that add real value to the home you <span className="text-grad">already love</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-xl">
              Kitchens, baths, additions, siding &amp; full remodels for homeowners across Northborough and Greater Worcester — built right, from foundation to the last detail.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate →</Link>
              <a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85 font-medium">
              <span>✓ Free estimates</span><span>✓ On time, on budget</span><span>✓ Owner-led projects</span>
            </div>
          </div>
          <div className="card p-6 md:p-7 reveal-2 border-t-4 border-t-green">
            <h2 className="text-xl font-bold text-navy">Get your free estimate</h2>
            <p className="text-sm text-ink/60 mt-1 mb-4">Tell us about your project — we reply within 1 business day.</p>
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* STATS COUNTERS */}
      <section className="bg-navy text-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[
            { e: 15, s: "+", l: "Years of experience" },
            { e: 500, s: "+", l: "Projects completed" },
            { e: 5, s: ".0★", l: "Average rating", d: 0 },
            { e: 30, s: "+", l: "Towns served" },
          ].map((c, i) => (
            <Reveal key={c.l} delay={i * 70}>
              <div className="py-9 text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-cyan"><Counter end={c.e} suffix={c.s} decimals={c.d ?? 0} /></div>
                <div className="text-xs md:text-sm text-white/70 mt-1">{c.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRUSTED ON */}
      <section className="bg-white border-b border-sand">
        <div className="container-x py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-navy/70 font-semibold text-sm">
          <span className="text-ink/45">Trusted &amp; verified on:</span>
          <span className="inline-flex items-center gap-1.5">🔵 Google <span className="text-cyan">★★★★★</span></span>
          <a href={site.facebook} target="_blank" rel="noopener" className="hover:text-blue">👍 Facebook</a>
          <a href={site.instagram} target="_blank" rel="noopener" className="hover:text-blue">📸 Instagram</a>
          <span>🏗️ BuildZoom</span>
          <span>✅ MA Licensed Contractor</span>
        </div>
      </section>

      {/* ABOUT + OWNER */}
      <section className="py-20 bg-tint-blue">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="relative">
              <div className="relative h-[460px] rounded-3xl overflow-hidden shadow-card">
                <Image src="/images/about.jpg" alt="Waterfront Construction owner on site" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-3 md:right-6 bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-grad-green text-white grid place-items-center text-xl">👷</span>
                <div><div className="font-extrabold text-navy leading-tight">Ernando Nunes</div><div className="text-sm text-ink/60">Owner · Trusted Contractor</div></div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="eyebrow">About Waterfront Construction</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">A local builder you can actually trust</h2>
              <p className="mt-4 text-ink/75 text-lg">Founded in {site.founded} and led by owner Ernando Nunes — with over {site.experience} years of hands-on construction experience — Waterfront Construction builds and renovates homes across Central Massachusetts, from the foundation to the final finish.</p>
              <p className="mt-3 text-ink/70">We treat your home like our own: clear communication, honest pricing, and a finish we&apos;re proud to put our name on. The owner is personally involved in every project — no call centers, no runaround.</p>
              <div className="mt-7 grid grid-cols-3 gap-4">
                {[["100%", "Licensed & insured"], ["1-on-1", "Owner-led"], ["30+", "Towns served"]].map(([n, l]) => (
                  <div key={l} className="bg-white rounded-xl p-4 text-center shadow-soft">
                    <div className="text-2xl font-extrabold text-blue">{n}</div><div className="text-xs text-ink/60 mt-1">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex gap-3"><Link href="/about" className="btn btn-navy">More about us →</Link><Link href="/contact" className="btn btn-green">Free estimate</Link></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20">
        <div className="container-x">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow">What we do</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Full-service remodeling &amp; construction</h2>
              <p className="mt-3 text-ink/65 text-lg">One trusted local team for every project — interior to exterior, small repairs to full additions.</p>
            </div>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 9).map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 80}>
                <div className="group card overflow-hidden pop h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <Image src={s.image} alt={s.short} fill className="object-cover zoomimg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
                    <span className="absolute top-3 left-3 text-2xl bg-white/95 rounded-xl w-11 h-11 grid place-items-center shadow">{s.icon}</span>
                    <h3 className="absolute bottom-3 left-4 right-4 font-bold text-xl text-white">{s.name}</h3>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-sm text-ink/65 line-clamp-2">{s.blurb}</p>
                    <div className="mt-4 flex gap-2 pt-2">
                      <Link href={`/services/${s.slug}`} className="btn btn-navy text-xs px-4 py-2.5 flex-1">Learn more</Link>
                      <Link href="/contact" className="btn btn-grad text-xs px-4 py-2.5 flex-1">Free quote</Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center"><Link href="/services" className="btn btn-navy text-base">View all services →</Link></div>
        </div>
      </section>

      {/* WHY CHOOSE US — 6 cards */}
      <section className="py-20 bg-navy text-white relative overflow-hidden">
        <div className="blob bg-blue w-96 h-96 -top-20 -left-20" />
        <div className="container-x relative">
          <Reveal><div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-cyan">Why choose Waterfront</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">Six reasons homeowners trust us</h2>
          </div></Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ["🛡️", "Licensed & insured", "Full MA licensing and insurance — your home and project are protected."],
              ["⭐", "5-star reputation", "Homeowners across MetroWest rave about our quality and communication."],
              ["🧱", "Premium materials", "We build with quality products that hold up to New England weather."],
              ["⏱️", "On time, on budget", "A clear schedule and honest, itemized pricing — no surprises."],
              ["✨", "Craftsmanship first", "We sweat the details most contractors skip. The finish shows it."],
              ["📞", "Responsive service", "Real people who answer the phone and show up when we say we will."],
            ].map(([icon, t, d], i) => (
              <Reveal key={t} delay={(i % 3) * 80}>
                <div className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur h-full hover:bg-white/15 transition">
                  <span className="w-12 h-12 rounded-xl bg-grad-green grid place-items-center text-xl">{icon}</span>
                  <h3 className="font-bold text-lg mt-3">{t}</h3>
                  <p className="text-sm text-white/75 mt-1.5">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center"><Link href="/contact" className="btn btn-green text-base">Get a Free Estimate</Link></div>
        </div>
      </section>

      {/* SPECIALTY DEEP-DIVE 1 */}
      <section className="py-20">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <Reveal><div className="relative h-[400px] rounded-3xl overflow-hidden shadow-card group">
            <Image src="/images/kitchen.jpg" alt="Kitchen and bath remodeling" fill className="object-cover zoomimg" />
          </div></Reveal>
          <Reveal delay={120}><div>
            <span className="eyebrow">Kitchens &amp; bathrooms</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">The rooms that sell your home — done right</h2>
            <p className="mt-4 text-ink/70 text-lg">Kitchens and baths are where homeowners get the biggest payback and the most daily joy. We manage the whole project — design, cabinets, tile, counters, plumbing and electrical — so it&apos;s seamless and stress-free.</p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2.5">
              {["Custom cabinets & islands", "Tile & walk-in showers", "Counters & backsplash", "Lighting & layout design"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-navy font-medium"><span className="text-green">✓</span>{f}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3"><Link href="/services/kitchen-remodeling" className="btn btn-navy">Kitchen remodeling →</Link><Link href="/services/bathroom-remodeling" className="btn btn-grad">Bathrooms →</Link></div>
          </div></Reveal>
        </div>
      </section>

      {/* SPECIALTY DEEP-DIVE 2 (reversed) */}
      <section className="py-20 bg-tint-green">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <Reveal delay={120} className="lg:order-2"><div className="relative h-[400px] rounded-3xl overflow-hidden shadow-card group">
            <Image src="/images/home-exterior.jpg" alt="Siding and home additions" fill className="object-cover zoomimg" />
          </div></Reveal>
          <Reveal className="lg:order-1"><div>
            <span className="eyebrow">Exteriors &amp; additions</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">More space, more curb appeal, more value</h2>
            <p className="mt-4 text-ink/70 text-lg">From fresh siding and energy-efficient windows to decks and full home additions, we transform the outside of your home and add the room your family needs — all matched seamlessly to your existing house.</p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2.5">
              {["Siding & exterior trim", "Windows & doors", "Custom decks", "Room & second-story additions"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-navy font-medium"><span className="text-green">✓</span>{f}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3"><Link href="/services/siding" className="btn btn-navy">Siding →</Link><Link href="/services/home-additions" className="btn btn-grad">Additions →</Link></div>
          </div></Reveal>
        </div>
      </section>

      {/* FILTER GALLERY */}
      <section className="py-20">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Our work</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Recent projects across MetroWest</h2>
            <p className="mt-3 text-ink/65 text-lg">Filter by project type — click any photo to view it larger.</p>
          </div></Reveal>
          <Reveal><div className="mt-10"><FilterGallery items={galleryItems} categories={["Kitchens", "Bathrooms", "Siding", "Decks", "Additions", "Painting"]} /></div></Reveal>
          <div className="mt-10 text-center"><a href={site.instagram} target="_blank" rel="noopener" className="btn btn-navy">See more on Instagram →</a></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-tint-blue">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Simple process</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">How your project works</h2>
          </div></Reveal>
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {[
              ["01", "Free estimate", "We visit, listen, and give you a clear, honest quote."],
              ["02", "Plan & design", "We lock scope, materials, timeline and permits."],
              ["03", "We build", "Clean, on-schedule work with one point of contact."],
              ["04", "Walkthrough", "We don't finish until you're 100% happy."],
            ].map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 80}>
                <div className="relative card p-6 h-full overflow-hidden">
                  <div className="absolute -top-5 -right-3 text-7xl font-extrabold text-grad opacity-20">{n}</div>
                  <div className="w-12 h-12 rounded-xl bg-grad-sunset text-white grid place-items-center font-extrabold">{n}</div>
                  <h3 className="font-bold text-navy text-lg mt-3">{t}</h3>
                  <p className="text-sm text-ink/65 mt-1.5">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES TABLE */}
      <section className="py-20">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">At a glance</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Services, timelines &amp; what&apos;s included</h2>
          </div></Reveal>
          <Reveal><div className="mt-10 overflow-hidden rounded-2xl border border-sand shadow-soft">
            <table className="w-full text-left">
              <thead><tr className="bg-navy text-white text-sm">
                <th className="p-4 font-bold">Service</th><th className="p-4 font-bold">Typical timeline</th><th className="p-4 font-bold hidden sm:table-cell">What&apos;s included</th>
              </tr></thead>
              <tbody>
                {tableRows.map((r, i) => (
                  <tr key={r[0]} className={i % 2 ? "bg-sand/40" : "bg-white"}>
                    <td className="p-4 font-bold text-navy">{r[0]}</td>
                    <td className="p-4 text-blue font-semibold whitespace-nowrap">{r[1]}</td>
                    <td className="p-4 text-ink/65 text-sm hidden sm:table-cell">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></Reveal>
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
                  <div className="text-5xl leading-none text-cyan/50 font-serif">&ldquo;</div>
                  <p className="-mt-3 text-white/90 text-[15px] leading-relaxed">{t.text}</p>
                  <div className="mt-4 flex items-center gap-3 pt-4 border-t border-white/15">
                    <span className="w-10 h-10 rounded-full bg-white/20 grid place-items-center font-bold">{t.name[0]}</span>
                    <div><div className="font-bold">{t.name}</div><div className="text-sm text-white/65">{t.town}</div></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center"><Link href="/reviews" className="btn btn-white text-base">Read all reviews →</Link></div>
        </div>
      </section>

      {/* FAQ / AEO */}
      <section className="py-20 bg-tint-blue">
        <div className="container-x grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-start">
          <Reveal>
            <div className="lg:sticky lg:top-32">
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
            <div>
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
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Serving Northborough &amp; 30 miles around</h2>
            <p className="mt-3 text-ink/65 max-w-2xl mx-auto text-lg">Based in Northborough, we build across MetroWest and Worcester County.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
              {cities.map((c) => (
                <span key={c} className="px-4 py-2 rounded-full bg-gradient-to-r from-sand to-white border border-sand text-sm font-semibold text-navy hover:from-blue hover:to-blue-500 hover:text-white transition cursor-default">{c}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-navy">
        <Image src="/images/cta.jpg" alt="" fill className="object-cover opacity-25" />
        <div className="relative container-x py-20 text-center text-white">
          <h2 className="text-3xl md:text-6xl font-extrabold">Let&apos;s build something great</h2>
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
