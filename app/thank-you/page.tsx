import Link from "next/link";
import { site, services } from "@/lib/site";

export const metadata = { title: "Thank You", robots: { index: false, follow: true } };

export default function ThankYouPage() {
  return (
    <section className="mesh text-white">
      <div className="container-x py-24 md:py-32 text-center">
        <div className="text-6xl">✅</div>
        <h1 className="mt-4 text-3xl md:text-5xl font-extrabold">Thank you — we got your request</h1>
        <p className="mt-4 text-white/85 text-lg max-w-xl mx-auto">A member of our team will reach out within one business day to schedule your free estimate. Need a faster answer? Call us now.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={site.phoneHref} className="btn btn-green text-base">📞 {site.phone}</a>
          <Link href="/" className="btn btn-white text-base">Back to home</Link>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
          {services.slice(0, 6).map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="px-4 py-2 rounded-full glass text-sm font-semibold hover:-translate-y-1 transition">{s.name}</Link>
          ))}
        </div>
      </div>
    </section>
  );
}
