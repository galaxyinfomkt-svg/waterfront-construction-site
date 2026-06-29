"use client";
import { useEffect, useState } from "react";

// Real lead-capture form (LeadConnector / GoHighLevel) — submissions go to the CRM.
// The heavy third-party iframe (reCAPTCHA, pixels, ~1.5 MB) is deferred so it never
// competes with the initial render: it loads instantly on the visitor's first
// interaction (scroll/tap/click), or ~3s after load for fully passive visitors.
export default function LeadForm({ height = 540 }: { height?: number }) {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      setLoad(true);
    };

    // Load instantly on first interaction (engaged visitors don't wait)…
    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "scroll"];
    events.forEach((e) => window.addEventListener(e, trigger, { once: true, passive: true }));

    // …or after ~3s for passive visitors — keeps the form out of the initial load window.
    const t = window.setTimeout(trigger, 3000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
      clearTimeout(t);
    };
  }, []);

  return (
    <div style={{ minHeight: height }}>
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
