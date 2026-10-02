import Script from "next/script";

// LeadConnector (GoHighLevel) form — the embed code exactly as GHL provides it.
export default function LeadForm() {
  return (
    <>
      <iframe
        src="https://api.leadconnectorhq.com/widget/form/FOO7PLSeOm8T3qpx0pE9"
        style={{ width: "100%", height: "100%", border: "none", borderRadius: "3px" }}
        id="inline-FOO7PLSeOm8T3qpx0pE9"
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Form 0"
        data-height="473"
        data-layout-iframe-id="inline-FOO7PLSeOm8T3qpx0pE9"
        data-form-id="FOO7PLSeOm8T3qpx0pE9"
        title="Form 0"
      />
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
