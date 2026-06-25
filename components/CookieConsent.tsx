"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem("wf-cookie")) setShow(true); } catch { /* ignore */ }
  }, []);
  const choose = (v: "accepted" | "declined") => {
    try { localStorage.setItem("wf-cookie", v); } catch { /* ignore */ }
    setShow(false);
  };
  if (!show) return null;
  return (
    <div className="fixed z-[60] left-4 right-4 bottom-[68px] md:bottom-5 md:left-5 md:right-auto md:max-w-sm">
      <div className="card p-5 shadow-card border-t-4 border-t-green">
        <p className="text-sm text-ink/75">
          We use cookies to improve your experience and analyze site traffic. See our{" "}
          <Link href="/privacy" className="text-blue font-semibold underline">Privacy Policy</Link>.
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => choose("accepted")} className="btn btn-green text-sm flex-1">Accept</button>
          <button type="button" onClick={() => choose("declined")} className="btn btn-navy text-sm flex-1">Decline</button>
        </div>
      </div>
    </div>
  );
}
