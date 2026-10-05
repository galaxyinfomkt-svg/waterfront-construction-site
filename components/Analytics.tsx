"use client";
import { useEffect } from "react";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/** True when the estimate CTA was clicked: the on-page form anchor or the contact page. */
const isEstimateHref = (href: string) => href.includes("#estimate") || /(^|\/)contact(\/|#|\?|$)/.test(href);

export default function Analytics() {
  // Click tracking — fires only when gtag is present (i.e. when GA is configured). The lead itself is
  // counted on /thank-you (generate_lead), because the GHL form posts inside a cross-origin iframe.
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (!w.gtag) return;
      if (href.startsWith("tel:")) w.gtag("event", "phone_click", { event_category: "contact" });
      else if (href.startsWith("mailto:")) w.gtag("event", "email_click", { event_category: "contact" });
      else if (isEstimateHref(href)) w.gtag("event", "quote_click", { event_category: "lead" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
        </>
      )}
      {/* Clarity (session replay) after load + idle, so it never competes with the first interaction (07 T16). */}
      {CLARITY_ID && (
        <Script id="clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}</Script>
      )}
    </>
  );
}
