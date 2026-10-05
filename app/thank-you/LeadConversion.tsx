"use client";
import { useEffect } from "react";

// Fires the GA4 `generate_lead` event once per browser session when a visitor reaches /thank-you
// (the GHL form posts inside a cross-origin iframe, so this redirect page is the only place a lead can be
// counted; audit 01 M6, 06 ST-L1). Mounted only when NEXT_PUBLIC_GA_ID is set. Queue-safe: it pushes to
// dataLayer even if gtag.js (afterInteractive) has not loaded yet. Mark generate_lead as a key event in GA4.
export default function LeadConversion() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("wf-lead")) return;
      sessionStorage.setItem("wf-lead", "1");
    } catch {
      /* storage unavailable: still count the lead */
    }
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    const gtag = w.gtag || function gtag() {
      // gtag's queue format is the arguments object itself
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
    gtag("event", "generate_lead", { form: "ghl-estimate", page_location: window.location.href });
  }, []);
  return null;
}
