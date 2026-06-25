// Real lead-capture form (LeadConnector / GoHighLevel) — submissions go to the CRM.
// The resize/behavior script is loaded once in app/layout.tsx.
export default function LeadForm({ height = 540 }: { height?: number }) {
  return (
    <iframe
      src="https://api.leadconnectorhq.com/widget/form/FOO7PLSeOm8T3qpx0pE9"
      id="inline-FOO7PLSeOm8T3qpx0pE9"
      title="Request a free estimate"
      className="w-full rounded-lg border-0 bg-white"
      style={{ height }}
      data-layout="{'id':'INLINE'}"
      data-trigger-type="alwaysShow"
      data-activation-type="alwaysActivated"
      data-deactivation-type="neverDeactivate"
      data-form-name="Form 0"
      data-height="473"
      data-layout-iframe-id="inline-FOO7PLSeOm8T3qpx0pE9"
      data-form-id="FOO7PLSeOm8T3qpx0pE9"
    />
  );
}
