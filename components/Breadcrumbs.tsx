import Link from "next/link";
import type { Crumb } from "@/lib/schema";
import { ChevronRightIcon } from "./chrome-icons";

// Visible breadcrumb trail. Pass the SAME array to breadcrumbNode() so the JSON-LD
// BreadcrumbList and the visible trail can never diverge.
// One variant only (every page header is a light surface now); `light` stays in the type so callers compile.
export default function Breadcrumbs({ items, light = true, className = "" }: { items: Crumb[]; light?: boolean; className?: string }) {
  void light;
  return (
    <nav aria-label="Breadcrumb" className={`text-[13px] text-muted ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            // The chevron closes each parent crumb instead of opening the next one, so a wrapped line never
            // starts with a bare separator. Below sm the current crumb claims the rest of the line (min 8rem)
            // and ellipsizes there, so a long title does not cost an extra line above the H1.
            last ? (
              <li key={it.path} className="inline-flex items-center min-w-0 flex-[1_1_8rem] sm:flex-initial">
                <span aria-current="page" className="text-ink truncate max-w-full">{it.name}</span>
              </li>
            ) : (
              <li key={it.path} className="inline-flex items-center gap-2 min-w-0">
                <Link href={it.path} className="inline-block py-1 hover:text-ink hover:underline underline-offset-4">{it.name}</Link>
                <ChevronRightIcon className="w-3 h-3 shrink-0 text-muted" />
              </li>
            )
          );
        })}
      </ol>
    </nav>
  );
}
