import type { ReactNode } from "react";

// CSS-only scroll reveal (see .r-up in globals.css). No client JS — keeps hydration light.
export default function Reveal({ children, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return <div className={`r-up ${className}`}>{children}</div>;
}
