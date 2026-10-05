// All permanent (308) redirects, imported by next.config.ts. Keep every old URL that was ever
// public pointing at its current home in ONE hop (no chains).
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
      rules.push(r(`/images/projects/${oldMedia}-:n.webp`, `/images/projects/${newMedia}-:n.webp`));
      rules.push(r(`/videos/${oldMedia}-:n.mp4`, `/videos/${newMedia}-:n.mp4`));
    }
  }
  return rules;
}
