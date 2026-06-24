import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import { site, cities } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About Us — Owner-Led Builder in Northborough, MA",
  description: "Owner-led home remodeling & construction in Northborough, MA since 2017. Meet Ernando Nunes — 15+ years of experience, licensed, insured, serving 100+ MetroWest towns.",
  path: "/about",
});

const values = [
  ["🤝", "Honesty first", "Clear scope, itemized pricing, and straight answers — before, during, and after the job."],
  ["✨", "Craftsmanship", "We obsess over the details that make a finished space feel high-end."],
  ["⏱️", "Respect for your time", "We show up, communicate, and work to the schedule we promised."],
  ["🛡️", "Accountability", "Licensed, insured, and owner-led — you always know who's responsible."],
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy">
        <Image src="/images/about.jpg" alt="" fill className="object-cover opacity-30" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative container-x py-20 md:py-24 text-white">
          <div className="flex items-center gap-2 text-sm text-white/70"><Link href="/" className="hover:text-cyan">Home</Link><span>›</span><span className="text-white">About</span></div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold max-w-3xl">Building trust in Central Massachusetts since {site.founded}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl">Owner-led home remodeling and construction — from the foundation to the final finish.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/contact" className="btn btn-green text-base">Get a Free Estimate →</Link><a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a></div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-20">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="relative">
              <div className="relative h-[470px] rounded-3xl overflow-hidden shadow-card"><Image src="/images/about.jpg" alt="Ernando Nunes, owner" fill className="object-cover" /></div>
              <div className="absolute -bottom-5 left-5 bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-grad-green text-white grid place-items-center text-xl">👷</span>
                <div><div className="font-extrabold text-navy leading-tight">Ernando Nunes</div><div className="text-sm text-ink/60">Owner &amp; Lead Builder</div></div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="eyebrow">Our story</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">A builder who treats your home like his own</h2>
              <p className="mt-4 text-ink/75 text-lg">Waterfront Construction was founded in {site.founded} by Ernando Nunes, who brings over {site.experience} years of hands-on construction experience to every project. What started as a one-man commitment to doing things right has grown into a trusted local team serving homeowners across MetroWest and Worcester County.</p>
              <p className="mt-3 text-ink/70">We build and renovate residential and commercial spaces from the foundation to the final finish — kitchens, baths, additions, siding, decks, and full remodels. Because the owner is personally involved in every job, you get craftsmanship, accountability, and communication you can count on.</p>
              <div className="mt-7 flex gap-3"><Link href="/services" className="btn btn-navy">Our services →</Link><Link href="/reviews" className="btn btn-grad">Read reviews</Link></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-navy text-white">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[{ e: 15, s: "+", l: "Years experience" }, { e: 500, s: "+", l: "Projects completed" }, { e: 30, s: "+", l: "Towns served" }, { e: 100, s: "%", l: "Licensed & insured" }].map((c, i) => (
            <Reveal key={c.l} delay={i * 70}><div className="py-9 text-center"><div className="text-4xl md:text-5xl font-extrabold text-cyan"><Counter end={c.e} suffix={c.s} /></div><div className="text-xs md:text-sm text-white/70 mt-1">{c.l}</div></div></Reveal>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 bg-tint-blue">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto"><span className="eyebrow">What we stand for</span><h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">Our values</h2></div></Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(([icon, t, d], i) => (
              <Reveal key={t} delay={i * 80}><div className="card p-6 h-full pop"><span className="w-12 h-12 rounded-xl bg-grad-green text-white grid place-items-center text-xl">{icon}</span><h3 className="font-bold text-navy mt-3">{t}</h3><p className="text-sm text-ink/65 mt-1">{d}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AREAS */}
      <section className="py-20">
        <div className="container-x text-center">
          <Reveal>
            <span className="eyebrow">Proudly local</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">Where we work</h2>
            <p className="mt-3 text-ink/65 max-w-2xl mx-auto">Based in Northborough, serving 30+ towns across MetroWest &amp; Worcester County.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
              {cities.map((c) => <span key={c} className="px-4 py-2 rounded-full bg-sand text-sm font-semibold text-navy">{c}</span>)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-grad text-white">
        <div className="container-x py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold">Let&apos;s build something great</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Get a free, no-obligation estimate from a builder you can trust.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/contact" className="btn btn-white text-base">Get a Free Estimate</Link><a href={site.phoneHref} className="btn btn-green text-base">📞 {site.phone}</a></div>
        </div>
      </section>
    </>
  );
}
