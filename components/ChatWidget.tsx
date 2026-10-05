"use client";
import { useEffect, useState } from "react";

// LeadConnector chat widget — the heavy third-party script (~170 KB) loads after the page has
// finished loading and the main thread is idle (+4 s), so it never competes with the first paint or
// with the visitor's first tap/scroll (INP). A keyboard/pointer press still loads it early.
export default function ChatWidget() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    let done = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const trigger = () => {
      if (done) return;
      done = true;
      setLoad(true);
    };
    const idle = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      const later = () => { timer = setTimeout(trigger, 4000); };
      if (ric) ric(later); else later();
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    window.addEventListener("pointerdown", trigger, { once: true, passive: true });
    window.addEventListener("keydown", trigger, { once: true });
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("load", idle);
      window.removeEventListener("pointerdown", trigger);
      window.removeEventListener("keydown", trigger);
    };
  }, []);

  useEffect(() => {
    if (!load || document.getElementById("lc-chat-widget")) return;
    const s = document.createElement("script");
    s.id = "lc-chat-widget";
    s.src = "https://widgets.leadconnectorhq.com/loader.js";
    s.async = true;
    s.setAttribute("data-resources-url", "https://widgets.leadconnectorhq.com/chat-widget/loader.js");
    s.setAttribute("data-widget-id", "6a431cb055ef5e64137e412f");
    document.body.appendChild(s);
  }, [load]);

  return null;
}
