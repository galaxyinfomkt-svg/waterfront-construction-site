import { site } from "@/lib/site";
import { PhoneIcon } from "./chrome-icons";

/** A mid-page call to action: "Get a free estimate" (jumps to the hero form via EstimateJumps) beside a call
 *  button. onDark for navy bands. className for spacing only (e.g. "mt-10"). */
export default function CtaRow({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  return (
    // data-cta-row: repeated template chrome, left out of the town-page similarity measure (scripts/check-town-pages.mjs).
    <div data-cta-row className={`flex flex-col sm:flex-row gap-3 ${className}`.trim()}>
      <a href="#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</a>
      <a href={site.phoneHref} className={`btn ${onDark ? "btn-on-dark" : "btn-secondary"} w-full sm:w-auto`}>
        <PhoneIcon /><span>Call <span className="tel">{site.phone}</span></span>
      </a>
    </div>
  );
}
