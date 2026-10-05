// JSON-LD conformance check for the built site (run after `next build`).
// Usage: node scripts/check-jsonld.mjs [.next/server/app]
// Exits 1 if any rule fails. Rules mirror audit 08-schema.md §5.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] || ".next/server/app";
const SITE = "https://waterfrontconstructionma.com";
const NOINDEX = /<meta name="robots" content="noindex/; // noindex / error pages: expect NO JSON-LD
const BANNED_TYPES = new Set(["Review", "AggregateRating", "HowTo", "HowToStep", "SiteNavigationElement"]);
const NH_FORBIDDEN = /(Massachusetts Home Improvement|permit in Massachusetts|cost in Massachusetts|MA licens)/i;
const ISO_TZ = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;

const walk = (d, out = []) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith(".html")) out.push(p);
  }
  return out;
};
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
const norm = (s) => String(s).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();

const fails = {}; const fail = (rule, page, msg) => ((fails[rule] ??= []).push(`${page}: ${msg}`));
let pages = 0;

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file);
  const html = fs.readFileSync(file, "utf8");
  const raw = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (NOINDEX.test(html) || /_global-error\.html$/.test(rel)) { if (raw.length) fail("R00-noindex-has-jsonld", rel, `${raw.length} block(s)`); continue; }
  pages++;
  const canonRaw = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const canon = canonRaw === SITE ? `${SITE}/` : canonRaw; // JSON-LD uses the slash form for the home URL
  if (raw.length !== 1) fail("R01-one-graph-per-page", rel, `${raw.length} JSON-LD blocks`);
  if (raw.some((r) => r.includes("<"))) fail("R02-unescaped-lt", rel, "raw '<' inside JSON-LD");
  let nodes = [];
  for (const r of raw) {
    try { const j = JSON.parse(r); nodes.push(...(j["@graph"] || [j])); } catch (e) { fail("R03-parse", rel, e.message); }
  }
  const types = (n) => [].concat(n["@type"] || []);
  const all = []; const visit = (n) => { if (n && typeof n === "object") { if (n["@type"]) all.push(n); Object.values(n).forEach((v) => Array.isArray(v) ? v.forEach(visit) : visit(v)); } };
  nodes.forEach(visit);
  const ids = new Map(); for (const n of all) if (n["@id"] && Object.keys(n).length > 1) ids.set(n["@id"], n);
  // R04: banned types
  for (const n of all) for (const t of types(n)) if (BANNED_TYPES.has(t)) fail("R04-banned-type", rel, t);
  // R05: every {"@id"} reference resolves inside the page graph
  const refs = []; const findRefs = (v) => { if (Array.isArray(v)) v.forEach(findRefs); else if (v && typeof v === "object") { if (v["@id"] && Object.keys(v).length === 1) refs.push(v["@id"]); else Object.values(v).forEach(findRefs); } };
  nodes.forEach(findRefs);
  for (const r of refs) if (!ids.has(r)) fail("R05-dangling-ref", rel, r);
  // R06: exactly one business node with the canonical @id; single type GeneralContractor
  const biz = all.filter((n) => n["@id"] === `${SITE}/#business` && Object.keys(n).length > 1);
  if (biz.length !== 1) fail("R06-business-node", rel, `${biz.length} business nodes`);
  for (const b of biz) if (JSON.stringify(b["@type"]) !== '"GeneralContractor"') fail("R06-business-type", rel, JSON.stringify(b["@type"]));
  // R07: a WebPage-family node whose @id is canonical#webpage and url == canonical
  const wp = all.find((n) => n["@id"] === `${canon}#webpage`);
  if (!wp) fail("R07-webpage", rel, `no node @id=${canon}#webpage`);
  else {
    if (wp.url !== canon) fail("R07-webpage-url", rel, `${wp.url} != ${canon}`);
    if (!wp.isPartOf || wp.isPartOf["@id"] !== `${SITE}/#website`) fail("R07-webpage-isPartOf", rel, "isPartOf != #website");
  }
  // R08: BreadcrumbList on every page except home; last item == canonical; names visible
  const bc = all.find((n) => types(n).includes("BreadcrumbList"));
  const isHome = canon === `${SITE}/`;
  if (!bc && !isHome) fail("R08-breadcrumb-missing", rel, "no BreadcrumbList");
  if (bc) {
    const items = bc.itemListElement || [];
    items.forEach((it, i) => { if (it.position !== i + 1) fail("R08-breadcrumb-position", rel, `pos ${it.position} at ${i}`); });
    const last = items[items.length - 1];
    if (last && last.item && last.item !== canon) fail("R08-breadcrumb-last", rel, `${last.item} != ${canon}`);
    const t = norm(text(html));
    for (const it of items) if (!t.includes(norm(it.name))) fail("R08-breadcrumb-name-not-visible", rel, it.name);
  }
  // R09: FAQPage Q&A must be visible verbatim
  for (const f of all.filter((n) => types(n).includes("FAQPage"))) {
    const t = norm(text(html));
    for (const q of f.mainEntity || []) {
      if (!t.includes(norm(q.name))) fail("R09-faq-q-not-visible", rel, q.name);
      if (!t.includes(norm(q.acceptedAnswer?.text || ""))) fail("R09-faq-a-not-visible", rel, q.name);
    }
  }
  // R10: NH pages carry no MA-only legal/permit/cost claims in JSON-LD
  if (/-nh\.html$/.test(rel) && NH_FORBIDDEN.test(raw.join(" "))) fail("R10-nh-ma-claim", rel, (raw.join(" ").match(NH_FORBIDDEN) || [])[0]);
  // R11: dates carry a time zone (or are date-only)
  for (const n of all) for (const k of ["datePublished", "dateModified", "uploadDate", "dateCreated"]) if (n[k] && !ISO_TZ.test(n[k])) fail("R11-date-format", rel, `${k}=${n[k]}`);
  // R12: VideoObject required props
  for (const v of all.filter((n) => types(n).includes("VideoObject"))) for (const k of ["name", "thumbnailUrl", "uploadDate", "contentUrl", "duration"]) if (!v[k]) fail("R12-video-prop", rel, `${v.name || "?"} missing ${k}`);
  // R13: BlogPosting author resolves to a Person with name+url
  for (const a of all.filter((n) => types(n).includes("BlogPosting"))) {
    const au = a.author && (a.author["@id"] ? ids.get(a.author["@id"]) : a.author);
    if (!au || !au.name || !au.url) fail("R13-author", rel, "author without name/url");
    if (!a.datePublished || !a.dateModified) fail("R13-dates", rel, "missing datePublished/dateModified");
  }
  // R14: no placeholder / empty credential values leak
  if (/"identifier":""|"(identifier|value)":"(TBD|XXX|000000|123456)"/i.test(raw.join(""))) fail("R14-placeholder", rel, "empty/placeholder credential");
  // R15: Service.areaServed must be structured (not a flat "Town, ST" string or GeoCircle)
  for (const s of all.filter((n) => types(n).includes("Service") && n.provider)) { // full Service definitions only
    const a = [].concat(s.areaServed || []);
    if (!a.length) fail("R15-service-area", rel, "Service without areaServed");
    for (const p of a) if (typeof p === "string" || types(p).includes("GeoCircle") || ((types(p).includes("City") || types(p).includes("AdministrativeArea") || types(p).includes("Place")) && !p.containedInPlace)) fail("R15-service-area", rel, JSON.stringify(p).slice(0, 80));
  }
}

const ruleNames = Object.keys(fails).sort();
console.log(`Checked ${pages} indexable pages.`);
if (!ruleNames.length) { console.log("All JSON-LD rules pass."); process.exit(0); }
for (const r of ruleNames) {
  const uniq = new Set(fails[r].map((x) => x.split(": ")[0]));
  console.log(`\n${r}: ${fails[r].length} failure(s) on ${uniq.size} page(s)`);
  fails[r].slice(0, 4).forEach((x) => console.log("  - " + x));
}
process.exit(1);
