import LeadForm from "./LeadForm";

/** The page's estimate form: the bare GHL embed (no card, heading or note), in the hero (on the home page, in the
 *  estimate section right under the hero wave, loaded lazily).
 *  Exactly ONE per page — it owns id="estimate" and data-estimate-form, which every "Free estimate" link
 *  (EstimateLink, EstimateJumps, jumpToEstimate in chrome-client.tsx) targets. The mid-page copy is
 *  <FormBand /> and carries neither. */
export default function EstimateForm({ className = "", lazy = false }: { className?: string; lazy?: boolean }) {
  return (
    // Estimate contract: id="estimate" + data-estimate-form on the section that wraps <LeadForm />; no scroll-mt-*
    // (html scroll-padding-top already clears the sticky header, V5.2); not sticky, it sits in the hero. On viewports
    // too short for the whole form, the "Free estimate" jump (jumpToEstimate) lines the form's bottom up above the
    // floating call button instead.
    <section id="estimate" data-estimate-form aria-label="Free estimate form" className={className || undefined}>
      <LeadForm lazy={lazy} />
    </section>
  );
}
