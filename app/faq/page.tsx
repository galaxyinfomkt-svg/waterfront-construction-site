import Link from "next/link";
import { Fragment } from "react";
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

/** Renders a copy string with the phone number kept on one line (.tel); the text content is unchanged. */
function WithTel({ text }: { text: string }) {
  const parts = text.split(site.phone);
  return <>{parts.map((p, i) => (i === 0 ? p : <Fragment key={i}><span className="tel">{site.phone}</span>{p}</Fragment>))}</>;
}

export default function FaqPage() {
  return (
    <>
      <JsonLd data={ld} />

      <section className="page-head" data-cta-zone>
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="max-w-[46rem]">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 text-navy text-balance">{H1}</h1>
            <p className="mt-5 text-lead text-ink/80 max-w-[36em]"><WithTel text={LEAD} /></p>
            <p className="mt-5 text-[13px] text-muted">Updated <time dateTime={UPDATED}>{updatedLabel}</time></p>
          </div>
          <nav aria-label="FAQ topics" className="mt-8">
            {/* Below sm the chips scroll in one row that fades out at the right edge (pr-12 + mask, as the hub in-page nav),
                so a cut chip always reads as "more"; py-1.5/-my-1.5 keep the focus ring inside the scroll box. */}
            <ul className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 pl-5 pr-12 scroll-px-5 py-1.5 -my-1.5 [mask-image:linear-gradient(90deg,#000_calc(100%-3rem),transparent)] sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0 sm:[mask-image:none]">
              {faqGroups.map((g) => (
                <li key={g.id} className="shrink-0"><a href={`#topic-${g.id}`} className="chip">{g.title}</a></li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="section">
        <div className="container-x">
          <div className="max-w-[48rem]">
            {faqGroups.map((g, i) => (
              <section key={g.id} id={`topic-${g.id}`} aria-labelledby={`topic-${g.id}-h`} className={i > 0 ? "mt-8 md:mt-10 border-t border-line pt-14 md:pt-20" : undefined}>
                <h2 id={`topic-${g.id}-h`} className="text-h2-doc text-navy">{g.title}</h2>
                <div className="mt-8 [&_article:first-child]:border-t-0 [&_article:first-child]:pt-0">{/* the topic rule alone marks a topic break */}<FaqList items={g.items} collapsible={false} /></div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <section className="section bg-navy text-white on-dark" data-cta-zone>
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em]">Have another question?</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]"><WithTel text={`Call ${site.phone} (${site.hours}) or send the estimate form. Estimates are free.`} /></p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/contact#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-on-dark tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
