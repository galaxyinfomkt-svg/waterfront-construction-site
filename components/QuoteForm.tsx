"use client";
import { useState } from "react";
import { services } from "@/lib/site";

export default function QuoteForm({ dark = false }: { dark?: boolean }) {
  const [sent, setSent] = useState(false);
  const labelCls = dark ? "text-white/80" : "text-ink/70";
  const inputCls =
    "w-full rounded-lg border border-sand bg-white px-3.5 py-2.5 text-ink text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";

  if (sent) {
    return (
      <div className="rounded-xl bg-green/10 border border-green/30 p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="text-lg font-bold text-navy">Thank you!</h3>
        <p className="text-sm text-ink/70 mt-1">We received your request and will reach out within 1 business day for your free estimate.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      className="grid gap-3"
    >
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
      <button type="submit" className="btn btn-green w-full text-base mt-1">Get My Free Estimate →</button>
      <p className={`text-[11px] text-center ${dark ? "text-white/55" : "text-ink/50"}`}>No obligation · We reply within 1 business day</p>
    </form>
  );
}
