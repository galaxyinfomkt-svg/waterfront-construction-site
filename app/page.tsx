import Image from "next/image";
import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";
import { services, stats, testimonials, cities, site } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <Image src="/images/hero.jpg" alt="Beautifully remodeled home" fill priority className="object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative container-x py-20 md:py-28 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div className="text-white reveal">
            <span className="eyebrow text-cyan">★★★★★ Trusted in MetroWest since {site.founded}</span>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05]">
              Renovations that add real value to the home you <span className="text-grad">already love</span>
            </h1>
            <p className="mt-5 text-lg text-white/85 max-w-xl">
              Kitchens, baths, additions, siding & full remodels for homeowners across Northborough and Greater Worcester — licensed, insured, and finished to the last detail.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate →</Link>
              <a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              <span>✓ Licensed & insured</span>
              <span>✓ Foundation to finish</span>
              <span>✓ Owner-led, on schedule</span>
            </div>
          </div>

          <div className="card p-6 md:p-7 reveal">
            <h2 className="text-xl font-bold text-navy">Request your free estimate</h2>
            <p className="text-sm text-ink/60 mt-1 mb-4">Tell us about your project — we reply within 1 business day.</p>
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-navy text-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="py-7 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-cyan">{s.value}</div>
              <div className="text-xs md:text-sm text-white/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">What we do</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Full-service home remodeling & construction</h2>
            <p className="mt-3 text-ink/65">One trusted local team for every project — interior to exterior, small repairs to full additions.</p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 9).map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`}
                className="group card overflow-hidden hover:-translate-y-1.5 transition">
                <div className="relative h-44 overflow-hidden">
                  <Image src={s.image} alt={s.short} fill className="object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                  <span className="absolute top-3 left-3 text-2xl bg-white/90 rounded-lg w-10 h-10 grid place-items-center">{s.icon}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-navy">{s.name}</h3>
                  <p className="text-sm text-ink/65 mt-1.5 line-clamp-2">{s.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue group-hover:gap-2 transition-all">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 bg-sand">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-card">
            <Image src="/images/remodel.jpg" alt="Quality craftsmanship" fill className="object-cover" />
          </div>
          <div>
            <span className="eyebrow">Why Waterfront</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Built better, the way it should be</h2>
            <p className="mt-4 text-ink/70">With {site.experience}+ years of hands-on experience, owner Ernando Nunes is on every job — so you get craftsmanship, clear communication, and a finish that lasts.</p>
            <div className="mt-7 grid sm:grid-cols-2 gap-5">
              {[
                ["👷", "Owner on every job", "Direct, accountable, hands-on management from start to finish."],
                ["🛡️", "Licensed & insured", "Full MA licensing and insurance — your home is protected."],
                ["⏱️", "On time, on budget", "Clear timelines and honest pricing, with no surprises."],
                ["⭐", "Finish-obsessed", "We sweat the details most contractors skip."],
              ].map(([icon, t, d]) => (
                <div key={t} className="flex gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-bold text-navy">{t}</h3>
                    <p className="text-sm text-ink/65 mt-0.5">{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/about" className="btn btn-navy mt-8">More about us →</Link>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Simple process</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">From first call to final walkthrough</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {[
              ["01", "Free estimate", "We visit, listen, and give you a clear, honest quote."],
              ["02", "Design & plan", "We lock scope, materials, timeline and permits."],
              ["03", "We build", "Clean, on-schedule work with a single point of contact."],
              ["04", "Final walkthrough", "We don't finish until you're 100% happy."],
            ].map(([n, t, d]) => (
              <div key={n} className="relative card p-6">
                <div className="text-4xl font-extrabold text-sand">{n}</div>
                <h3 className="font-bold text-navy text-lg mt-1">{t}</h3>
                <p className="text-sm text-ink/65 mt-1.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-navy text-white">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-cyan">Homeowners love us</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">Real results, real neighbors</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-cyan text-lg">★★★★★</div>
                <p className="mt-3 text-white/85 text-[15px] leading-relaxed">“{t.text}”</p>
                <div className="mt-4 font-bold">{t.name}</div>
                <div className="text-sm text-white/60">{t.town}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE AREA */}
      <section className="py-20">
        <div className="container-x text-center">
          <span className="eyebrow">Proudly local</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Serving Northborough & 30 miles around</h2>
          <p className="mt-3 text-ink/65 max-w-2xl mx-auto">Based in Northborough, we build across MetroWest and Worcester County.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
            {cities.map((c) => (
              <span key={c} className="px-3.5 py-1.5 rounded-full bg-sand text-sm font-medium text-navy">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <Image src="/images/cta.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-brand-grad/95" style={{ opacity: 0.92 }} />
        <div className="relative container-x py-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to start your project?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Get a free, no-obligation estimate today. We reply within one business day.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-white text-base">Get a Free Estimate</Link>
            <a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
