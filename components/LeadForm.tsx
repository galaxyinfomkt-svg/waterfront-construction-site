// Real lead-capture form (LeadConnector / GoHighLevel) — submissions go to the CRM.
// The iframe is rendered directly in the HTML so it always shows up, even before any
// JavaScript runs or the visitor interacts. Native `loading="lazy"` still keeps
// off-screen copies (service pages, contact page below the fold) out of the initial load.
export default function LeadForm({ height = 540 }: { height?: number }) {
  return (
    <div style={{ minHeight: height }} className="rounded-lg bg-white">
      <iframe
        src="https://api.leadconnectorhq.com/widget/form/FOO7PLSeOm8T3qpx0pE9"
        id="inline-FOO7PLSeOm8T3qpx0pE9"
        title="Request a free estimate"
        loading="lazy"
        className="block w-full rounded-lg border-0 bg-white"
        style={{ height, minHeight: height }}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-activation-type="alwaysActivated"
        data-deactivation-type="neverDeactivate"
        data-form-name="Form 0"
        data-height={height}
        data-layout-iframe-id="inline-FOO7PLSeOm8T3qpx0pE9"
        data-form-id="FOO7PLSeOm8T3qpx0pE9"
      />
    </div>
  );
}
