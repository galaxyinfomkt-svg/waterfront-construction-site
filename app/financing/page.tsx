import Link from "next/link";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Financing — Flexible Payment Options for Your Remodel",
  description: "Make your remodeling or construction project affordable with flexible financing options. Get a free estimate from Waterfront Construction in Northborough, MA.",
  path: "/financing",
});

const steps = [
  ["1", "Get your estimate", "We give you a clear, itemized quote for your project — free and no-obligation."],
  ["2", "Choose a plan", "Pick the financing option and monthly payment that fits your budget."],
  ["3", "Start your project", "Get approved fast and we begin building — enjoy now, pay over time."],
];

export default function FinancingPage() {
  return (
    <>
      <section className="mesh text-white">
        <div className="container-x py-16 md:py-24">
          <span className="eyebrow text-cyan">Affordable for every budget</span>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold max-w-3xl">Flexible financing for your project</h1>
          <p className="mt-4 text-white/85 text-lg max-w-2xl">Don&apos;t put off the home you want. With flexible financing, you can start your remodel now and spread the cost into comfortable monthly payments.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate →</Link>
            <a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x">
          <Reveal><div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Simple &amp; fast</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-navy">How financing works</h2>
          </div></Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 80}>
                <div className="card gborder p-7 h-full">
                  <div className="w-12 h-12 rounded-xl bg-grad-sunset text-white grid place-items-center font-extrabold text-lg">{n}</div>
                  <h3 className="font-bold text-navy text-lg mt-3">{t}</h3>
                  <p className="text-sm text-ink/65 mt-1.5">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-tint-green">
        <div className="container-x grid md:grid-cols-3 gap-6">
          {[["💳", "Low monthly payments", "Spread your investment into manageable monthly amounts."], ["⚡", "Fast, easy approval", "A quick application means you can get started without delay."], ["🏡", "Boost your home value", "Finance value-adding upgrades like kitchens, baths and additions."]].map(([icon, t, d], i) => (
            <Reveal key={t} delay={i * 80}><div className="card p-6 h-full pop"><span className="w-12 h-12 rounded-xl bg-grad-green text-white grid place-items-center text-xl">{icon}</span><h3 className="font-bold text-navy mt-3">{t}</h3><p className="text-sm text-ink/65 mt-1">{d}</p></div></Reveal>
          ))}
        </div>
      </section>

      <section className="mesh text-white">
        <div className="container-x py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to get started?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Request your free estimate and we&apos;ll walk you through the financing options available for your project.</p>
          <p className="mt-2 text-white/60 text-sm">Financing offered through third-party lending partners, subject to approval.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/contact" className="btn btn-green text-base">Get a Free Estimate</Link><a href={site.phoneHref} className="btn btn-white text-base">📞 {site.phone}</a></div>
        </div>
      </section>
    </>
  );
}
