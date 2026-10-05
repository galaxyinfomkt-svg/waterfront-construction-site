import Link from "next/link";
import type { Crumb } from "@/lib/schema";

// Visible breadcrumb trail. Pass the SAME array to breadcrumbNode() so the JSON-LD
// BreadcrumbList and the visible trail can never diverge.
export default function Breadcrumbs({ items, light = true, className = "" }: { items: Crumb[]; light?: boolean; className?: string }) {
  const base = light ? "text-white/80" : "text-ink/70";
  const hover = light ? "hover:text-cyan" : "hover:text-blue";
  const current = light ? "text-white" : "text-navy";
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${base} ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">›</span>}
              {last ? (
                <span aria-current="page" className={current}>{it.name}</span>
              ) : (
                <Link href={it.path} className={hover}>{it.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
