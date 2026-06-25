"use client";
import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function Analytics() {
  const [consent, setConsent] = useState(false);

  // Load analytics only after the visitor accepts cookies (GDPR/LGPD-friendly).
  useEffect(() => {
    const check = () => {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConsent(localStorage.getItem("wf-cookie") === "accepted");
      } catch { /* ignore */ }
    };
    check();
    window.addEventListener("wf-consent", check);
    return () => window.removeEventListener("wf-consent", check);
  }, []);

  // Conversion tracking — fires only when gtag is present (i.e. after consent).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const a = el?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (!w.gtag) return;
      if (href.startsWith("tel:")) w.gtag("event", "phone_click", { event_category: "contact" });
      else if (href.startsWith("mailto:")) w.gtag("event", "email_click", { event_category: "contact" });
      else if (href === "/contact" || href.endsWith("/contact")) w.gtag("event", "quote_click", { event_category: "lead" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!consent) return null;
  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
        </>
      )}
      {CLARITY_ID && (
        <Script id="clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}</Script>
      )}
    </>
  );
}
