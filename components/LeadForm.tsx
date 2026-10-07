import Script from "next/script";

// LeadConnector (GoHighLevel) form — the embed code exactly as GHL provides it, placed bare on the page
// surface (no card, background or padding around it).
// instance 1 (default): the hero form, loaded eagerly. Exactly one per page (inside <EstimateForm />). `lazy` makes it
// load on approach instead, for a page whose estimate form sits below the hero (home): the form's ~3.6 MB of third-party
// requests then no longer compete with the hero photo (LCP).
// instance 2: the mid-page copy (<FormBand />). Its own id, so no duplicate ids, and loading="lazy" so it
// never competes with the hero form; every other attribute is identical to GHL's embed.
// next/script dedupes form_embed.js by src, so the script loads once per page.
const FORM_ID = "FOO7PLSeOm8T3qpx0pE9";

export default function LeadForm({ instance = 1, lazy = false }: { instance?: 1 | 2; lazy?: boolean }) {
  const iframeId = instance === 2 ? `inline-${FORM_ID}-2` : `inline-${FORM_ID}`;
  return (
    <>
      <iframe
        src={`https://api.leadconnectorhq.com/widget/form/${FORM_ID}`}
        style={{ width: "100%", height: "100%", border: "none", borderRadius: "3px" }}
        id={iframeId}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Form 0"
        data-height="473"
        data-layout-iframe-id={iframeId}
        data-form-id={FORM_ID}
        title="Form 0"
        {...(instance === 2 || lazy ? { loading: "lazy" as const } : {})}
      />
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
