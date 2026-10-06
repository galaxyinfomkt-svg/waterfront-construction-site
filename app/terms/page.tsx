import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import { EstimateLink } from "@/components/chrome-client";
import { PhoneIcon } from "@/components/chrome-icons";
import { site } from "@/lib/site";
import { hasHic } from "@/lib/credentials";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, type Crumb } from "@/lib/schema";
import { SOURCES } from "@/lib/service-content";

// Terms of use (audit 06 ST-M4): no blanket "photos may be representative" disclaimer and no claim to own
// third-party content; adds the written-contract and governing-law clauses. Have counsel review.

// First published (git) and last SUBSTANTIVE edit; the visible "Last updated" line uses the same constant.
const PUBLISHED = "2026-06-25T20:22:21-03:00";
const UPDATED = "2026-10-05T10:00:09-04:00";
const updatedLabel = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(UPDATED));

const DESCRIPTION = `Terms for using the ${site.name} website: web estimates are not quotes, each project has its own written agreement, and MA law applies.`;

export const metadata = pageMeta({ title: "Terms of Use", description: DESCRIPTION, path: "/terms" });

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "Terms of Use", path: "/terms" }];

const ld = pageGraph([
  webPageNode({ path: "/terms", name: "Terms of Use", description: DESCRIPTION, datePublished: PUBLISHED, dateModified: UPDATED }),
  breadcrumbNode(crumbs),
]);

export default function TermsPage() {
  return (
    <>
      <JsonLd data={ld} />
      {/* HERO — centered title on the left (7/12); the bare estimate form (the page's ONE EstimateForm) in the right
          5/12 from lg, after the title on phones. The terms text below stays left-aligned (.prose), as a centered column. */}
      <section className="page-head">
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-5 text-h1 text-navy">Terms of Use</h1>
            <p className="mt-5 text-[13px] text-muted">Last updated: <time dateTime={UPDATED}>{updatedLabel}</time></p>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      <section className="section-doc bg-paper">
        <div className="container-x">
          <div className="prose">
            <p className="lead">By using this website you agree to the following terms. Please read them carefully.</p>

            <h2>Use of this website</h2>
            <p>This site gives general information about {site.name} and our services. You agree to use it lawfully and not to attempt to disrupt, damage or gain unauthorized access to the site or its systems.</p>

            <h2>Estimates and general information</h2>
            <p>Cost figures, timelines and examples on this site are general information, not a quote. Published cost benchmarks are regional averages from the source named next to them, not our prices. Your project&apos;s scope, price and schedule are set in a written estimate or contract for your home.</p>

            <h2>Your project agreement</h2>
            <p>Every project is governed by its own written agreement, which controls over anything on this website. In Massachusetts, home improvement contracts over $1,000 must be in writing and include the information required by state law{hasHic ? `, including our registration number, #${site.hic}` : ""} (<a href={SOURCES.contract.url} target="_blank" rel="noopener" className="link">Mass.gov: home improvement contract requirements</a>).</p>

            <h2>Photos</h2>
            <p>Photos presented as our projects come from jobs we completed. Where a project&apos;s town is shown, it is the town where the work was done; when the town was not recorded, we say so. Decorative images that are not of our work are never presented as our projects.</p>

            <h2>No warranty for website content</h2>
            <p>We work to keep the information on this site accurate and current, but it is provided &ldquo;as is,&rdquo; without warranties of any kind. We are not liable for loss arising from reliance on the website&apos;s content. This section is about the website only; it does not change the terms of any agreement for your project.</p>

          </div>
        </div>
      </section>

      {/* MID-PAGE ESTIMATE — the bare form again (second, lazy instance), stone between the two paper halves of the text */}
      <FormBand tone="stone" doc />

      <section className="section-doc bg-paper">
        <div className="container-x">
          <div className="prose [&>h2:first-child]:mt-0">
            <h2>Intellectual property</h2>
            <p>Text, branding and project photos on this site belong to {site.name} unless otherwise noted, and may not be copied or reused without permission. Third-party images, logos and trademarks belong to their owners.</p>

            <h2>Third-party links and services</h2>
            <p>This site links to and uses third-party services, such as Google, Facebook, Instagram and our form and chat provider. We are not responsible for the content or practices of third-party sites and services.</p>

            <h2>Governing law</h2>
            <p>These terms are governed by the laws of the Commonwealth of Massachusetts.</p>

            <h2>Changes</h2>
            <p>We may update these terms. The &ldquo;Last updated&rdquo; date above shows when they last changed, and continued use of the site means you accept the updated terms.</p>

            <h2>Contact</h2>
            <p>Questions? Call <a href={site.phoneHref} className="link tel">{site.phone}</a> or email <a href={site.emailHref} className="link">{site.email}</a>.</p>
            <p className="text-sm text-muted">These terms are provided for general information and are not legal advice.</p>
          </div>
          {/* CTA row (as <CtaRow />): the estimate link jumps to the hero form; the call button beside it. */}
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-secondary w-full sm:w-auto">
              <PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
