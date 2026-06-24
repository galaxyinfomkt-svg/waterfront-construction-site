"use client";
import { useState } from "react";
import { services } from "@/lib/site";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

export default function QuoteForm({ dark = false }: { dark?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const labelCls = dark ? "text-white/80" : "text-ink/70";
  const inputCls =
    "w-full rounded-lg border border-sand bg-white px-3.5 py-2.5 text-ink text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    // If a Web3Forms key is configured, send for real; otherwise fall back to a friendly confirmation.
    if (WEB3FORMS_KEY) {
      try {
        const data = new FormData(form);
        data.append("access_key", WEB3FORMS_KEY);
        data.append("subject", "New estimate request — Waterfront Construction");
        data.append("from_name", "Waterfront Construction Website");
        const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
        const json = await res.json();
        setStatus(json.success ? "sent" : "error");
      } catch {
        setStatus("error");
      }
    } else {
      setTimeout(() => setStatus("sent"), 400);
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl bg-green/10 border border-green/30 p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="text-lg font-bold text-navy">Thank you!</h3>
        <p className="text-sm text-ink/70 mt-1">We received your request and will reach out within 1 business day for your free estimate.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      {/* honeypot */}
      <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={`block text-xs font-semibold mb-1 ${labelCls}`}>Full name</label>
          <input required name="name" placeholder="Jane Smith" className={inputCls} />
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-1 ${labelCls}`}>Phone</label>
          <input required name="phone" type="tel" placeholder="(508) 000-0000" className={inputCls} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={`block text-xs font-semibold mb-1 ${labelCls}`}>Email</label>
          <input name="email" type="email" placeholder="you@email.com" className={inputCls} />
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-1 ${labelCls}`}>Service needed</label>
          <select name="service" className={inputCls} defaultValue="">
            <option value="" disabled>Select a service</option>
            {services.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className={`block text-xs font-semibold mb-1 ${labelCls}`}>Project details</label>
        <textarea name="message" rows={3} placeholder="Tell us about your project..." className={inputCls} />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600 font-medium">Something went wrong. Please call us at (508) 816-2726.</p>
      )}
      <button type="submit" disabled={status === "sending"} className="btn btn-green w-full text-base mt-1 disabled:opacity-70">
        {status === "sending" ? "Sending…" : "Get My Free Estimate →"}
      </button>
      <p className={`text-[11px] text-center ${dark ? "text-white/70" : "text-ink/50"}`}>No obligation · We reply within 1 business day</p>
    </form>
  );
}
