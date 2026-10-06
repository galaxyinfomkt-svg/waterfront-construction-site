import { useId } from "react";
import { site } from "@/lib/site";
import LeadForm from "./LeadForm";
import { CheckIcon, PhoneIcon } from "./chrome-icons";

/** Mid-page estimate band: a short pitch on the left, the bare GHL form (second, lazy instance) on the right.
 *  NOT the page's estimate target (no id="estimate", no data-estimate-form): "Free estimate" links always go
 *  to the hero <EstimateForm />. tone picks the band surface; alternate it with the neighbouring sections.
 *  doc: the reference rhythm (section-doc, text-h2-doc) for article-like pages (blog posts, towns, FAQ, policies), so
 *  the band's heading never outranks the page's own H2s. data-form-band marks it as repeated template chrome
 *  (scripts/check-town-pages.mjs leaves it out of the town-page similarity measure, like header and footer). */
export default function FormBand({ tone = "stone", heading = "Tell us about your project", doc = false }: {
  tone?: "stone" | "paper"; heading?: string; doc?: boolean;
}) {
  const h = `form-band-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-h`;
  return (
    <section data-form-band aria-labelledby={h} className={`${doc ? "section-doc" : "section"} ${tone === "stone" ? "bg-stone" : "bg-paper"}`}>
      <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 items-start">
        <div className="lg:col-span-5">
          <p className="eyebrow">Free estimate</p>
          <h2 id={h} className={`mt-4 ${doc ? "text-h2-doc" : "text-h2"} text-navy text-balance`}>{heading}</h2>
          <p className="mt-5 text-lead text-muted max-w-[34em]">
            Free and no-obligation. Prefer to talk? Call <a href={site.phoneHref} className="link tel">{site.phone}</a> <span className="whitespace-nowrap">({site.hours})</span>.
          </p>
          <ul className="mt-6 space-y-2 text-[15px] text-ink">
            <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-navy" />Itemized estimates</li>
            <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-navy" />{site.projectsCompleted}+ projects completed</li>
            <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-navy" />Insured</li>
          </ul>
          {/* From lg only: on phones the inline tel link and the floating call button already cover calling, and the
              form moves up. */}
          <a href={site.phoneHref} className="btn btn-secondary hidden lg:inline-flex mt-8">
            <PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span>
          </a>
        </div>
        <div className="lg:col-span-7 min-w-0">
          <LeadForm instance={2} />
        </div>
      </div>
    </section>
  );
}
