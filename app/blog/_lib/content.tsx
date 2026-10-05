// Shared rendering helpers for /blog and /blog/[slug] (audit 04-blog.md §4.2).
import Image from "next/image";
import Link from "next/link";
import { testimonials } from "@/lib/site";
import type { Block, Figure, Post } from "@/lib/posts";
import MEDIA from "@/lib/media-manifest.json";

const DIMS = MEDIA as Record<string, { w: number; h: number }>;
export const dims = (src: string) => DIMS[src] ?? { w: 1500, h: 1125 };

// ---------- inline links: "[label](/path)" → <Link>, "[label](https://…)" → <a> ----------
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
export const plain = (s: string) => s.replace(LINK, "$1");

export function Rich({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const [all, label, href] = m;
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    out.push(
      href.startsWith("/") ? (
        <Link key={i} href={href}>{label}</Link>
      ) : (
        <a key={i} href={href} rel="noopener">{label}</a>
      ),
    );
    last = i + all.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

// ---------- dates: ISO with offset → "June 4, 2026" in Massachusetts time ----------
const FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" });
export const formatDate = (iso: string) => FMT.format(new Date(iso));
export const sameDay = (a: string, b: string) => formatDate(a) === formatDate(b);

// ---------- word count / read time (computed, never hand-written; audit B-17) ----------
const blockText = (b: Block): string[] => {
  if ("p" in b) return [b.p];
  if ("ul" in b) return b.ul;
  if ("ol" in b) return b.ol.flatMap((s) => [s.t, s.d]);
  if ("table" in b) return [b.table.caption, ...b.table.head, ...b.table.rows.flat(), b.table.note ?? ""];
  if ("figure" in b) return [b.figure.caption];
  if ("callout" in b) return [b.callout];
  if ("testimonial" in b) return [testimonials.find((t) => t.name === b.testimonial)?.text ?? ""];
  return [];
};
export function wordCount(p: Post): number {
  const text = [p.title, p.answer, p.photo.caption, ...p.sections.flatMap((s) => [s.h, ...s.blocks.flatMap(blockText)]), ...p.faqs.flatMap((f) => [f.q, f.a])]
    .map(plain)
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}
export const readTime = (p: Post) => `${Math.max(1, Math.round(wordCount(p) / 230))} min read`;

// ---------- figure: real project photo with a truthful caption ----------
export function PostFigure({ f, eager = false }: { f: Figure; eager?: boolean }) {
  const d = dims(f.src);
  const portrait = d.h > d.w;
  return (
    <figure className="post-figure">
      {f.aspect ? (
        <div className="relative w-full overflow-hidden rounded-xl bg-sand" style={{ aspectRatio: f.aspect }}>
          <Image src={f.src} alt={f.alt} fill quality={75} sizes="(min-width: 1024px) 768px, 92vw" className="object-cover object-top" loading={eager ? "eager" : "lazy"} />
        </div>
      ) : (
        <Image
          src={f.src}
          alt={f.alt}
          width={d.w}
          height={d.h}
          quality={75}
          sizes={portrait ? "(min-width: 768px) 360px, 92vw" : "(min-width: 1024px) 768px, 92vw"}
          className={`rounded-xl bg-sand ${portrait ? "mx-auto h-auto max-h-[640px] w-auto max-w-full" : "h-auto w-full"}`}
          loading={eager ? "eager" : "lazy"}
        />
      )}
      <figcaption>
        {f.caption}
        {f.href && (
          <>
            {" "}
            <Link href={f.href}>{f.hrefLabel ?? "See the project"} →</Link>
          </>
        )}
      </figcaption>
    </figure>
  );
}

// ---------- one content block ----------
export function PostBlock({ b }: { b: Block }) {
  if ("p" in b) return <p><Rich text={b.p} /></p>;
  if ("ul" in b) return <ul className={b.marker === "check" ? "check" : b.marker === "warn" ? "warn" : undefined}>{b.ul.map((li, i) => <li key={i}><Rich text={li} /></li>)}</ul>;
  if ("ol" in b)
    return (
      <ol className="steps">
        {b.ol.map((s, i) => (
          <li key={i}>
            <strong>{s.t}</strong> <Rich text={s.d} />
          </li>
        ))}
      </ol>
    );
  if ("table" in b) {
    const t = b.table;
    return (
      <div className="table-wrap">
        {t.head.length > 3 && <p className="table-hint">Scroll sideways to see the whole table.</p>}
        <table className={t.head.length > 3 ? "wide" : undefined}>
          <caption>{t.caption}</caption>
          <thead>
            <tr>{t.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (j === 0 ? <th key={j} scope="row"><Rich text={c} /></th> : <td key={j}><Rich text={c} /></td>))}
              </tr>
            ))}
          </tbody>
        </table>
        {t.note && <p className="table-note">{t.note}</p>}
      </div>
    );
  }
  if ("figure" in b) return <PostFigure f={b.figure} />;
  if ("callout" in b) return <p className="callout"><Rich text={b.callout} /></p>;
  if ("testimonial" in b) {
    const t = testimonials.find((x) => x.name === b.testimonial);
    if (!t) return null; // only real testimonials from lib/site.ts, verbatim
    return (
      <blockquote className="testimonial">
        <p>&ldquo;{t.text}&rdquo;</p>
        <footer>
          {t.name}, {t.town} ({t.date}). Shared with permission.
        </footer>
      </blockquote>
    );
  }
  return null;
}
