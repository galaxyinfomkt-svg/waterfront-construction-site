// Usage: node scripts/check-layout.mjs [.next/server/app]   (run after `next build`)
// Layout and link rules on every built page (spec §10.6, §13.4). Exit 1 on failure.
//   - Every page has exactly one hero estimate form: one element id="estimate", and it carries data-estimate-form.
//   - One mid-page estimate band (data-form-band) on every page except /contact, the 404 and /thank-you (none there).
//   - At most 3 CTA rows (data-cta-row) on any page; service hubs, service×town pages and city hubs have 1–3.
//   - No href to a retired service slug, and every internal href resolves to a built page, a public file or a
//     single-hop redirect (from .next/routes-manifest.json) whose destination is built. A link with a #fragment to
//     another page must find that id on it.
import fs from "node:fs";
import path from "node:path";

const APP = path.resolve(process.argv[2] || ".next/server/app");
const MANIFEST = path.resolve(APP, "../../routes-manifest.json");
const PUBLIC = path.resolve(process.cwd(), "public");
const SITE = "https://waterfrontconstructionma.com";
const NO_BAND = new Set(["/contact", "/_not-found", "/thank-you"]);

const errors = [];
const fail = (m) => errors.push(m);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".html") ? [path.join(d, e.name)] : []));
const urlOf = (f) => "/" + path.relative(APP, f).split(path.sep).join("/").replace(/\.html$/, "").replace(/^index$/, "");
const files = walk(APP).filter((f) => !/^\/_global-error$/.test(urlOf(f)));
if (!files.length) { console.error(`check-layout: no built pages in ${APP}`); process.exit(1); }
const PAGES = new Map(files.map((f) => [urlOf(f), f]));

// ---------- redirects (the same table Next serves) ----------
const rules = fs.existsSync(MANIFEST) ? (JSON.parse(fs.readFileSync(MANIFEST, "utf8")).redirects || []).filter((r) => !r.internal) : [];
if (!rules.length) fail(`no redirects found in ${MANIFEST}`);
const compiled = rules.map((r) => {
  const names = [];
  const re = new RegExp(`^${r.source.replace(/[.]/g, "\\.").replace(/:([a-z]+)(\+?)/gi, (_, n, plus) => { names.push(n); return plus ? "(.+?)" : "([^/]+)"; })}$`);
  return { ...r, names, re };
});
// Retired service slugs = every /services/<slug> that is a redirect source (lib/redirects.ts), so this file never
// has to name them (scripts/check-slugs.mjs bans the old slugs in source).
const RETIRED_SLUGS = [...new Set(rules.map((r) => (r.source.match(/^\/services\/([a-z0-9-]+)$/) || [])[1]).filter(Boolean))];
const RETIRED = new RegExp(`^/services/(${RETIRED_SLUGS.join("|") || "(?!)"})(/|$)`);
function redirectOf(p) {
  for (const r of compiled) {
    const m = p.match(r.re);
    if (!m) continue;
    let dest = r.destination;
    r.names.forEach((n, i) => { dest = dest.replace(new RegExp(`:${n}\\+?`, "g"), m[i + 1]); });
    return dest;
  }
  return undefined;
}

// ---------- helpers ----------
const tags = (h, attr) => [...h.matchAll(new RegExp(`<[a-zA-Z][^>]*\\s${attr}(?:=|[\\s>/])[^>]*>`, "g"))].map((m) => m[0]);
const idCache = new Map();
const idsOf = (page) => {
  if (!idCache.has(page)) idCache.set(page, new Set([...fs.readFileSync(PAGES.get(page), "utf8").matchAll(/<[a-zA-Z][^>]*\sid="([^"]+)"/g)].map((m) => m[1])));
  return idCache.get(page);
};
const fileExists = (p) => fs.existsSync(path.join(PUBLIC, p)) || fs.existsSync(path.join(APP, `${p}.body`)) || fs.existsSync(path.join(APP, p.slice(1).replace(/\.xml$/, ".xml.body")));
/** "page" | "file" | "redirect" | undefined for an internal path (no query, no fragment). */
function resolve(p) {
  if (PAGES.has(p)) return "page";
  if (/\.[a-z0-9]+$/i.test(p) && fileExists(p)) return "file";
  const d = redirectOf(p);
  if (d && PAGES.has(d.split("#")[0]) && !redirectOf(d.split("#")[0])) return "redirect";
  return undefined;
}

// ---------- every page ----------
let hrefs = 0, viaRedirect = 0, scaled = 0, frags = 0;
const broken = new Map(); // target → pages linking to it
for (const [url, file] of PAGES) {
  const h = fs.readFileSync(file, "utf8");
  // forms and bands
  const est = [...h.matchAll(/<[a-zA-Z][^>]*\sid="estimate"[^>]*>/g)].map((x) => x[0]);
  const forms = tags(h, "data-estimate-form");
  if (est.length !== 1) fail(`${url}: ${est.length} elements with id="estimate" (expected exactly 1)`);
  else if (!/\sdata-estimate-form(=|[\s>/])/.test(est[0])) fail(`${url}: #estimate has no data-estimate-form`);
  if (forms.length !== 1) fail(`${url}: ${forms.length} data-estimate-form elements (expected exactly 1)`);
  const bands = tags(h, "data-form-band").length, ctas = tags(h, "data-cta-row").length;
  if (NO_BAND.has(url) ? bands !== 0 : bands !== 1) fail(`${url}: ${bands} data-form-band (expected ${NO_BAND.has(url) ? 0 : 1})`);
  const isScaled = /^\/services\/[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(url) || /^\/service-areas\/[a-z0-9-]+$/.test(url);
  if (isScaled) scaled++;
  if (ctas > 3 || (isScaled && ctas < 1)) fail(`${url}: ${ctas} data-cta-row (expected ${isScaled ? "1–3" : "at most 3"})`);
  // links
  for (const m of h.matchAll(/<a\s[^>]*href="([^"]+)"|<link\s[^>]*href="([^"]+)"/g)) {
    let href = (m[1] ?? m[2]).replace(/&amp;/g, "&");
    if (href.startsWith(SITE)) href = href.slice(SITE.length) || "/";
    if (/^#./.test(href)) { // same-page anchor (FAQ "more" links, the hero's estimate jump, the skip link)
      frags++;
      if (!idsOf(url).has(decodeURIComponent(href.slice(1)))) fail(`${url}: link ${href}: no such id on the page`);
      continue;
    }
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/_next/")) continue;
    hrefs++;
    const [pathPart, frag] = href.split("#");
    const p = pathPart.split("?")[0] || "/";
    if (RETIRED.test(p)) { fail(`${url}: link to a retired service slug ${href}`); continue; }
    const r = resolve(p);
    if (!r) { broken.set(p, [...(broken.get(p) || []), url]); continue; }
    if (r === "redirect") viaRedirect++;
    if (frag && r === "page" && p !== url && ++frags && !idsOf(p).has(decodeURIComponent(frag))) fail(`${url}: link ${href}: no id="${frag}" on ${p}`);
  }
}
for (const [p, from] of broken) fail(`broken internal link ${p} (no built page, file or single-hop redirect) on ${from.length} page(s), e.g. ${from.slice(0, 3).join(", ")}`);

console.log(`check-layout: ${PAGES.size} pages (${scaled} hubs, service×town pages and city hubs), ${hrefs} internal links and ${frags} #fragments checked, ${viaRedirect} through a redirect; ${RETIRED_SLUGS.length} retired service slugs`);
if (errors.length) {
  console.error(`check-layout: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 40)) console.error(" -", e);
  if (errors.length > 40) console.error(` … and ${errors.length - 40} more`);
  process.exit(1);
}
console.log("check-layout: OK");
