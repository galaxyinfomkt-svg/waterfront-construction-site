import type { ReactNode } from "react";

// CSS-only scroll reveal (see .r-up in globals.css). Transform only — content is never transparent,
// so text is fully readable at every scroll position, with or without JS (audit 10 UX-H1).
// Use it on short headings and cards, not on long text blocks, forms or link lists.
export default function Reveal({ children, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return <div className={`r-up ${className}`}>{children}</div>;
}
