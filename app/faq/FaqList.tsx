import Link from "next/link";
import type { FaqEntry } from "@/lib/faq";

// Renders FAQ entries from lib/faq.ts. The answer string is rendered as ONE text node, exactly as it
// appears in the FAQPage JSON-LD (check-jsonld R09); related links and sources follow it.
// `collapsible` = native <details> (answers stay in the HTML); otherwise every answer is shown.

function Extras({ f, dark = false }: { f: FaqEntry; dark?: boolean }) {
  const linkCls = dark ? "text-cyan hover:text-white" : "text-blue hover:text-navy";
  return (
    <>
      {f.links && f.links.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
          {f.links.map((l) => (
            <li key={l.href}>
              {l.external ? (
                <a href={l.href} target="_blank" rel="noopener" className={`inline-block py-1 underline underline-offset-2 ${linkCls}`}>{l.label}</a>
              ) : (
                <Link href={l.href} className={`inline-block py-1 underline underline-offset-2 ${linkCls}`}>{l.label}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {f.sources && f.sources.length > 0 && (
        <p className={`mt-2 text-xs ${dark ? "text-white/75" : "text-ink/70"}`}>
          {f.sources.length > 1 ? "Sources: " : "Source: "}
          {f.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 ? " · " : ""}
              <a href={s.url} target="_blank" rel="noopener" className="underline underline-offset-2">{s.label}</a>
            </span>
          ))}
        </p>
      )}
    </>
  );
}

export default function FaqList({ items, collapsible = true, idPrefix = "" }: { items: FaqEntry[]; collapsible?: boolean; idPrefix?: string }) {
  if (!collapsible) {
    return (
      <div className="space-y-4">
        {items.map((f) => (
          <article key={f.id} id={`${idPrefix}${f.id}`} className="rounded-2xl bg-white p-5 md:p-6 shadow-soft ring-1 ring-black/5">
            <h3 className="text-lg md:text-xl font-bold text-navy leading-snug">{f.q}</h3>
            <p className="mt-2 text-ink/85 leading-relaxed">{f.a}</p>
            <Extras f={f} />
          </article>
        ))}
      </div>
    );
  }
  return (
    <div>
      {items.map((f) => (
        <details key={f.id} id={`${idPrefix}${f.id}`} className="group bg-white rounded-xl mb-3 shadow-[0_6px_20px_-14px_rgba(20,20,43,.4)] open:shadow-card">
          <summary className="flex justify-between items-center gap-4 cursor-pointer list-none p-5 min-h-12">
            <h3 className="font-bold text-navy text-lg leading-snug">{f.q}</h3>
            <span aria-hidden="true" className="text-blue text-2xl leading-none group-open:rotate-45 transition shrink-0">+</span>
          </summary>
          <div className="px-5 pb-5 -mt-1">
            <p className="text-ink/80 leading-relaxed">{f.a}</p>
            <Extras f={f} />
          </div>
        </details>
      ))}
    </div>
  );
}
