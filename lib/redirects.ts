// All permanent (308) redirects, imported by next.config.ts. Keep every old URL that was ever
// public pointing at its current home in ONE hop (no chains) — including its trailing-slash twin,
// because next.config.ts sets skipTrailingSlashRedirect and this file removes slashes itself.
import fs from "node:fs";
import path from "node:path";

type Rule = { source: string; destination: string; permanent: true };
const r = (source: string, destination: string): Rule => ({ source, destination, permanent: true });

const merged: [string, string][] = [
  ["kitchen-remodeling", "kitchen-bathroom-remodeling"],
  ["bathroom-remodeling", "kitchen-bathroom-remodeling"],
  ["home-additions", "home-additions-remodeling"],
  ["home-remodeling", "home-additions-remodeling"],
];
const removed = ["trim-and-carpentry", "repairs"];

// Case studies renamed to town level (no client street addresses) — owner decision Oct 2026.
// [old slug, new slug, old media prefix, new media prefix]
const projectRenames: [string, string, string | null, string | null][] = [
  ["home-addition-52-crest-road-lynnfield-ma", "home-addition-framing-lynnfield-ma", "home-addition-52-crest-road-lynnfield-ma", "home-addition-lynnfield-ma"],
  // Old production redirected /projects/home-addition-lynnfield-ma → …52-crest-road… for 3 months; browsers may
  // have cached that 308, so the case study lives at a slug that was never a redirect source (no loop).
  ["home-addition-lynnfield-ma", "home-addition-framing-lynnfield-ma", null, null],
  ["home-addition-highland-ave-lynnfield-ma", "home-addition-exterior-lynnfield-ma", "home-addition-highland-ave-lynnfield-ma", "home-addition-exterior-lynnfield-ma"],
  ["home-addition-129-falcon-st-needham-ma", "home-addition-needham-ma", null, null],
  ["bathroom-remodel-dedham-ma", "bathroom-remodels", "bathroom-remodel-dedham-ma", "bathroom-remodels"],
];

export function redirectRules(): Rule[] {
  const rules: Rule[] = [];
  for (const [from, to] of merged) {
    rules.push(r(`/services/${from}`, `/services/${to}`));
    rules.push(r(`/services/${from}/:city`, `/services/${to}/:city`));
  }
  for (const from of removed) {
    rules.push(r(`/services/${from}`, "/services"));
    rules.push(r(`/services/${from}/:city`, "/services"));
  }
  // Financing page removed — owner does not offer financing.
  rules.push(r("/financing", "/contact"));
  // There is no /projects index page; the case studies live on /gallery.
  rules.push(r("/projects", "/gallery"));
  for (const [oldSlug, newSlug, oldMedia, newMedia] of projectRenames) {
    rules.push(r(`/projects/${oldSlug}`, `/projects/${newSlug}`));
    if (oldMedia && newMedia) {
      // Only files that still exist under the new name; a deleted photo returns a plain 404 in one hop.
      for (const [dir, ext] of [["images/projects", ".webp"], ["videos", ".mp4"]] as const) {
        const abs = path.join(process.cwd(), "public", dir);
        const files = fs.existsSync(abs) ? fs.readdirSync(abs) : [];
        for (const f of files) {
          if (!f.startsWith(`${newMedia}-`) || !f.endsWith(ext)) continue;
          const n = f.slice(newMedia.length + 1, -ext.length);
          if (!/^\d{2}$/.test(n)) continue; // e.g. "-03"; skips other prefixes that share the start
          rules.push(r(`/${dir}/${oldMedia}-${n}${ext}`, `/${dir}/${f}`));
        }
      }
    }
  }
  // Trailing-slash twins of every legacy URL go straight to the final page, then a generic rule
  // strips the slash from everything else (replaces Next's built-in redirect, which would add a hop).
  for (const rule of [...rules]) if (!/\.[a-z0-9]+$/.test(rule.source)) rules.push(r(`${rule.source}/`, rule.destination));
  rules.push(r("/:path+/", "/:path+"));
  return rules;
}
