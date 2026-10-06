import Link from "next/link";
import type { FaqEntry } from "@/lib/faq";
import { PlusIcon } from "@/components/chrome-icons";
import { EstimateLink } from "@/components/chrome-client";

// Renders FAQ entries from lib/faq.ts. The answer string is rendered as ONE text node, exactly as it
// appears in the FAQPage JSON-LD (check-jsonld R09); related links and sources follow it.
// `collapsible` = native <details> (answers stay in the HTML); otherwise every answer is shown.

function Extras({ f }: { f: FaqEntry }) {
  return (
    <>
      {f.links && f.links.length > 0 && (
        <ul className="mt-3 space-y-0.5 text-sm font-medium">
          {f.links.map((l) => (
            <li key={l.href}>
              {l.external ? (
                <a href={l.href} target="_blank" rel="noopener" className="link inline-block py-1">{l.label}</a>
              ) : l.href === "/contact#estimate" ? (
                // Same link and markup as before, but it jumps to this page's own hero form when there is one.
                <EstimateLink className="link inline-block py-1">{l.label}</EstimateLink>
              ) : (
                <Link href={l.href} className="link inline-block py-1">{l.label}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {f.sources && f.sources.length > 0 && (
        // The label sits inside the first item and the link is inline (py-1.5 pads the hit area to ~27px without
        // moving lines), so a long source title wraps after its first words instead of stranding "Source:".
        // .dot-list-wrap--stack (globals.css): long source titles, so one centered source per line at every width (no dots,
        // so no line can start with a separator).
        <ul className="dot-list-wrap dot-list-wrap--stack mt-3 text-[13px] text-muted">
          {f.sources.map((s, i) => (
            <li key={s.url}>
              {i === 0 && (f.sources!.length > 1 ? "Sources: " : "Source: ")}
              <a href={s.url} target="_blank" rel="noopener" className="py-1.5 underline underline-offset-4 hover:text-ink">{s.label}</a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function FaqList({ items, collapsible = true, idPrefix = "" }: { items: FaqEntry[]; collapsible?: boolean; idPrefix?: string }) {
  if (!collapsible) {
    return (
      <div>
        {items.map((f) => (
          <article key={f.id} id={`${idPrefix}${f.id}`} className="border-t border-line py-8 md:py-10">
            <h3 className="mx-auto max-w-[24em] text-h3 text-navy">{f.q}</h3>
            <p className="mt-3 mx-auto text-prose text-ink max-w-[38em]">{f.a}</p>
            <Extras f={f} />
          </article>
        ))}
      </div>
    );
  }
  return (
    <div className="faq-list">
      {items.map((f) => (
        <details key={f.id} id={`${idPrefix}${f.id}`} className="faq-row group">
          <summary>
            <h3 className="faq-q">{f.q}</h3>
            <PlusIcon className="faq-icon" />
          </summary>
          <div className="faq-a">
            <p>{f.a}</p>
            <Extras f={f} />
          </div>
        </details>
      ))}
    </div>
  );
}
