"use client";
import { useEffect, useState } from "react";

// LeadConnector chat widget — the heavy third-party script (~170 KB) loads ONLY on the
// visitor's first real interaction (scroll / tap / click / key). Passive page loads stay
// light and fast; the chat bubble appears the moment someone engages.
export default function ChatWidget() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      setLoad(true);
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "scroll", "mousemove"];
    events.forEach((e) => window.addEventListener(e, trigger, { once: true, passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
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
