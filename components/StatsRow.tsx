// The confirmed company numbers (lib/site.ts `stats`), static, no count-up. One hairline grid on paper:
// numerals in the display serif, labels below in muted 13px (design spec §4.11), centered in each cell. Server component.
// Callers pass the finished label strings, so the visible words stay exactly what each page renders today.
export default function StatsRow({ items, label, className = "" }: { items: { value: string; label: string }[]; label: string; className?: string }) {
  return (
    <section aria-label={label} className={`pt-14 md:pt-20 ${className}`}>
      <div className="container-x">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border-y border-line">
          {items.map((s) => (
            // dt first in the DOM (term, then value); flex-col-reverse draws the numeral on top, top-aligned.
            <div key={s.label} className="bg-paper px-4 md:px-8 py-8 md:py-10 flex flex-col-reverse justify-end items-center text-center">
              <dt className="mt-3 text-[13px] leading-snug text-muted max-w-[22ch]">{s.label}</dt>
              <dd className="font-display text-stat text-navy tnum">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
