"use client";
import { useEffect, useState } from "react";

// LeadConnector chat widget — deferred so the heavy third-party script never blocks
// the initial render. Loads on the visitor's first interaction, or ~4s after load.
export default function ChatWidget() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      setLoad(true);
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "scroll"];
    events.forEach((e) => window.addEventListener(e, trigger, { once: true, passive: true }));
    const t = window.setTimeout(trigger, 4000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
      clearTimeout(t);
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
