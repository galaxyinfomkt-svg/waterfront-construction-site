"use client";
import { useEffect, useRef, useState } from "react";

// Real lead-capture form (LeadConnector / GoHighLevel) — submissions go to the CRM.
// Lazy-mounted: the heavy third-party iframe loads only when it scrolls near the
// viewport, or once the browser is idle, so it never blocks initial page load (LCP).
export default function LeadForm({ height = 540 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const trigger = () => setLoad(true);

    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { trigger(); io.disconnect(); } },
      { rootMargin: "400px" }
    );
    io.observe(el);

    // Fallback so above-the-fold forms still appear without scrolling.
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(trigger, { timeout: 2500 }) : window.setTimeout(trigger, 1800);

    return () => { io.disconnect(); if (typeof idle === "number") clearTimeout(idle); };
  }, []);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {load ? (
        <iframe
          src="https://api.leadconnectorhq.com/widget/form/FOO7PLSeOm8T3qpx0pE9"
          id="inline-FOO7PLSeOm8T3qpx0pE9"
          title="Request a free estimate"
          loading="lazy"
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
      ) : (
        <div className="grid place-items-center rounded-lg bg-white border border-sand" style={{ height }} aria-hidden="true">
          <span className="text-ink/40 text-sm">Loading estimate form…</span>
        </div>
      )}
    </div>
  );
}
