import QuoteForm from "@/components/QuoteForm";
import { site, cities } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact Us — Free Estimate in Northborough, MA",
  description: "Request a free, no-obligation remodeling & construction estimate in Northborough & MetroWest, MA. Call (508) 816-2726 — we reply within one business day.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="bg-brand-grad text-white">
        <div className="container-x py-16 md:py-20">
          <span className="eyebrow text-cyan">Let&apos;s talk</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">Get your free estimate</h1>
          <p className="mt-4 text-white/85 text-lg max-w-2xl">Tell us about your project and we&apos;ll get back to you within one business day. No pressure, no obligation.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid lg:grid-cols-[.9fr_1.1fr] gap-12">
          <div>
            <h2 className="text-2xl font-extrabold text-navy">Talk to a real person</h2>
            <p className="text-ink/65 mt-2">Owner-led service — call, email, or send the form and you&apos;ll hear back fast.</p>
            <div className="mt-8 space-y-4">
              <a href={site.phoneHref} className="flex items-center gap-4 card p-5 hover:-translate-y-1 transition">
                <span className="text-2xl bg-sand rounded-xl w-12 h-12 grid place-items-center">📞</span>
                <span><span className="block text-xs text-ink/50 font-semibold uppercase">Call</span><span className="font-bold text-navy text-lg">{site.phone}</span></span>
              </a>
              <a href={site.emailHref} className="flex items-center gap-4 card p-5 hover:-translate-y-1 transition">
                <span className="text-2xl bg-sand rounded-xl w-12 h-12 grid place-items-center">✉️</span>
                <span><span className="block text-xs text-ink/50 font-semibold uppercase">Email</span><span className="font-bold text-navy break-all">{site.email}</span></span>
              </a>
              <div className="flex items-center gap-4 card p-5">
                <span className="text-2xl bg-sand rounded-xl w-12 h-12 grid place-items-center">📍</span>
                <span><span className="block text-xs text-ink/50 font-semibold uppercase">Visit / Service area</span><span className="font-bold text-navy">{site.address}</span></span>
              </div>
              <div className="flex items-center gap-4 card p-5">
                <span className="text-2xl bg-sand rounded-xl w-12 h-12 grid place-items-center">🕑</span>
                <span><span className="block text-xs text-ink/50 font-semibold uppercase">Hours</span><span className="font-bold text-navy">{site.hours}</span></span>
              </div>
            </div>
            <p className="mt-6 text-sm text-ink/60">Proudly serving {cities.slice(0, 8).join(", ")} & all of MetroWest.</p>
          </div>

          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-bold text-navy">Request a free estimate</h2>
            <p className="text-sm text-ink/60 mt-1 mb-5">We reply within 1 business day.</p>
            <QuoteForm />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-x">
          <div className="rounded-2xl overflow-hidden shadow-soft border border-sand">
            <iframe
              title="Waterfront Construction service area — Northborough, MA"
              src="https://www.google.com/maps?q=Northborough,+MA+01532&output=embed"
              width="100%" height="380" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }} />
          </div>
        </div>
      </section>
    </>
  );
}
