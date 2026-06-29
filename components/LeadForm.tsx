"use client";
import { useEffect, useRef, useState } from "react";

// Real lead-capture form (LeadConnector / GoHighLevel) — submissions go to the CRM.
// The heavy third-party iframe (reCAPTCHA, pixels, ~1.5 MB) loads only AFTER the page
// has painted: on the visitor's first interaction, when it scrolls near, or once idle —
// so it never blocks the initial render / LCP. Users can also click to load it instantly.
export default function LeadForm({ height = 540 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      setLoad(true);
    };

    // 1) Load on the visitor's first interaction — keeps the critical render path clean.
    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "scroll"];
    events.forEach((e) => window.addEventListener(e, trigger, { once: true, passive: true }));

    // 2) After the page has painted/settled, set up viewport + idle loading as a fallback.
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    let io: IntersectionObserver | null = null;
    let t = 0;
    const start = () => {
      io = new IntersectionObserver(
        (entries) => { if (entries.some((en) => en.isIntersecting)) trigger(); },
        { rootMargin: "300px" }
      );
      io.observe(el);
      if (w.requestIdleCallback) w.requestIdleCallback(trigger, { timeout: 2500 });
      else t = window.setTimeout(trigger, 2000);
    };
    if (document.readyState === "complete") t = window.setTimeout(start, 1400);
    else window.addEventListener("load", () => { t = window.setTimeout(start, 1400); }, { once: true });

    return () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
      if (io) io.disconnect();
      if (t) clearTimeout(t);
    };
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
        <button
          type="button"
          onClick={() => setLoad(true)}
          className="grid w-full place-items-center rounded-lg bg-white border border-sand text-ink/50 text-sm hover:text-blue transition"
          style={{ height }}
          aria-label="Load the free estimate form"
        >
          Loading estimate form…
        </button>
      )}
    </div>
  );
}
