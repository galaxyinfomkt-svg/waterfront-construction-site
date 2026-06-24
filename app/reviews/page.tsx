import Link from "next/link";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Testimonials — What Homeowners Say in Northborough, MA",
  description: "Hear from homeowners across Northborough & MetroWest about Waterfront Construction — kitchens, baths, siding, decks & additions. Get your free estimate today.",
  path: "/reviews",
});

const reviews = [
  { name: "Karen M.", town: "Shrewsbury, MA", date: "May 2026", text: "Ernando's crew remodeled our kitchen and a bathroom. Clean, on schedule, and the finish work is flawless. We get compliments constantly." },
  { name: "Dave R.", town: "Westborough, MA", date: "Apr 2026", text: "New siding and windows completely transformed the house. Professional from the estimate to the final walkthrough — highly recommend." },
  { name: "Priya S.", town: "Northborough, MA", date: "Apr 2026", text: "They built our deck and a small addition. Great communication the whole way. Exactly what you want in a contractor." },
  { name: "Tom & Lisa B.", town: "Marlborough, MA", date: "Mar 2026", text: "Full first-floor remodel. The team treated our home like their own and the quality is outstanding. Worth every penny." },
  { name: "Rafael C.", town: "Hudson, MA", date: "Feb 2026", text: "Honest pricing and no surprises. Our bathroom looks like it belongs in a magazine. Will definitely hire again." },
  { name: "Susan D.", town: "Framingham, MA", date: "Jan 2026", text: "From the first phone call they were responsive and professional. The kitchen came out beautiful and on budget." },
];

export default function ReviewsPage() {
  return (
    <>
      <section className="bg-brand-grad text-white">
        <div className="container-x py-16 md:py-20 text-center">
          <span className="eyebrow text-cyan">Homeowners love us</span>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold">What homeowners say</h1>
          <p className="mt-4 text-white/85 text-lg max-w-2xl mx-auto">Real feedback from our remodeling &amp; construction clients across MetroWest &amp; Worcester County.</p>
          <div className="mt-7">
            <a href="/contact" className="btn btn-white">Get a Free Estimate →</a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <div className="container-x grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="card p-6 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="text-cyan text-lg">★★★★★</div>
                <span className="text-xs text-ink/45">{r.date}</span>
              </div>
              <p className="mt-3 text-ink/75 leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3 pt-4 border-t border-sand">
                <span className="w-10 h-10 rounded-full bg-brand-grad text-white grid place-items-center font-bold">{r.name[0]}</span>
                <div><div className="font-bold text-navy text-sm">{r.name}</div><div className="text-xs text-ink/55">{r.town}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container-x">
          <div className="rounded-3xl bg-navy text-white p-10 md:p-14 text-center relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-extrabold">Join our happy homeowners</h2>
            <p className="mt-3 text-white/85 max-w-xl mx-auto">Get a free estimate and find out why MetroWest families trust Waterfront Construction.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate</Link>
              <a href={site.phoneHref} className="btn btn-white text-base">📞 {site.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
