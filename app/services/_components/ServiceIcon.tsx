// Inline SVG icons for the six services (V5.6): emoji glyphs vary by platform and some vanish on light tiles
// or are missing on Windows 10. Stroke icons follow the text color, so every tile sets a contrasting color. Always decorative: aria-hidden + focusable=false. Server- and client-safe (no hooks).
// Private folder (_components): not a route. Other templates (menu, home) may import it too.
import type { ReactNode } from "react";

type Props = { slug: string; className?: string };

const base = {
  "aria-hidden": true, focusable: false, fill: "none", stroke: "currentColor", strokeWidth: 1.5,
  strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24",
} as const;

const PATHS: Record<string, ReactNode> = {
  // House with lap-siding lines
  siding: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M5 13.5h14M5 16.75h14" />
    </>
  ),
  // Window with muntins and a sill
  "windows-and-doors": (
    <>
      <rect x="5" y="3" width="14" height="16" rx="1" />
      <path d="M12 3v16M5 11h14M3.5 21h17" />
    </>
  ),
  // Faucet over a basin
  "kitchen-bathroom-remodeling": (
    <>
      <path d="M8 11V7a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1" />
      <path d="M6 6.5h4" />
      <path d="M3 13h18v1a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6Z" />
    </>
  ),
  // Deck: railing, balusters, posts
  decks: (
    <>
      <path d="M2.5 8h19M2.5 14h19" />
      <path d="M4.5 8v12M19.5 8v12M8.5 8v6M12 8v6M15.5 8v6" />
    </>
  ),
  // House with an added wing
  "home-additions-remodeling": (
    <>
      <path d="M2.5 11 9 5.5l6.5 5.5" />
      <path d="M4.5 9.5V20h9" />
      <path d="M13.5 20v-6.5h8V20M13.5 13.5l4-3.5 4 3.5M1.5 20h21" />
    </>
  ),
  // Paint roller
  painting: (
    <>
      <rect x="3" y="3" width="15" height="6" rx="1.5" />
      <path d="M18 6h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-8v3" />
      <rect x="10.5" y="14" width="3" height="7" rx="1" />
    </>
  ),
};

export default function ServiceIcon({ slug, className = "w-6 h-6" }: Props) {
  const d = PATHS[slug];
  if (!d) return null;
  return <svg {...base} className={`icon ${className}`}>{d}</svg>;
}
