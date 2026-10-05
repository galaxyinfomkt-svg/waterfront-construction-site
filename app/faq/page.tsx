import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon } from "@/components/chrome-icons";
import { site } from "@/lib/site";
import { faqGroups, allFaqs } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, faqNode, type Crumb } from "@/lib/schema";
import FaqList from "./FaqList";

// /faq — the pre-hire answer hub (audit 09 AEO-H6-a, AEO-M3). Since GBP Q&A was retired, engines answer
// "is this contractor registered / how much / do they work in my town" from website text. Every answer is
// a fact from lib/site.ts, lib/credentials.ts, computed data or a cited rule; questions that need owner
// input not yet supplied (warranty, deposit policy, payment methods, languages) are left out.

const PUBLISHED = "2026-10-05T10:00:09-04:00"; // page created
const UPDATED = PUBLISHED; // bump only on a substantive edit of the answers
const updatedLabel = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(UPDATED));

const H1 = "Questions to ask before you hire a remodeling contractor";
const LEAD = `Straight answers about ${site.name}: who we are, where we work, registration and insurance, permits, costs and timelines. If your question isn't here, call ${site.phone}.`;

export const metadata = pageMeta({
  title: "FAQ: Before You Hire a Remodeling Contractor",
  description: `Answers about ${site.name}: owner, service area, registration, insurance, permits, lead-safe rules, costs, financing and timelines.`,
  path: "/faq",
});

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }];

const ld = pageGraph([
  webPageNode({ path: "/faq", name: H1, description: LEAD, datePublished: PUBLISHED, dateModified: UPDATED }),
  breadcrumbNode(crumbs),
  faqNode("/faq", allFaqs),
]);

export default function FaqPage() {
  return (
    <>
      <JsonLd data={ld} />

      <section className="bg-brand-grad text-white" data-cta-zone>
        <div className="container-x py-12 md:py-16">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-5 text-4xl md:text-5xl font-extrabold max-w-4xl">{H1}</h1>
          <p className="mt-4 text-white/90 text-lg max-w-3xl leading-relaxed">{LEAD}</p>
          <p className="mt-3 text-sm text-white/80">Updated <time dateTime={UPDATED}>{updatedLabel}</time></p>
          <nav aria-label="FAQ topics" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {faqGroups.map((g) => (
                <li key={g.id}><a href={`#topic-${g.id}`} className="inline-flex items-center min-h-11 px-4 rounded-full bg-white/10 border border-white/25 text-sm font-semibold hover:bg-white/20">{g.title}</a></li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="py-12 md:py-16">
        <div className="container-x max-w-4xl space-y-14">
          {faqGroups.map((g) => (
            <section key={g.id} id={`topic-${g.id}`} aria-labelledby={`topic-${g.id}-h`}>
              <h2 id={`topic-${g.id}-h`} className="text-2xl md:text-3xl font-extrabold text-navy">{g.title}</h2>
              <div className="mt-5"><FaqList items={g.items} collapsible={false} /></div>
            </section>
          ))}
        </div>
      </div>

      <section className="mesh text-white" data-cta-zone>
        <div className="container-x py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold">Have another question?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">{`Call ${site.phone} (${site.hours}) or send the estimate form. Estimates are free.`}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact#estimate" className="btn btn-green text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-white text-base"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
