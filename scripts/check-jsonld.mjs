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

// R19: every site URL under /services or /service-areas in JSON-LD must be a built page (catches stale slugs).
const BUILT = new Set();
const SITE_PATH = new RegExp(`^${SITE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/(?:services|service-areas)(?:/[^#?"]*)?)(?:[#?].*)?$`);
const builtPath = (p) => BUILT.has(p.replace(/\/$/, "") || "/");

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
let pages = 0, hubsChecked = 0, servicesChecked = 0, urlsChecked = 0;
const faqSeen = {}; // R16: the same Q&A must not be marked up as FAQPage on more than one page

const FILES = walk(ROOT);
for (const f of FILES) BUILT.add("/" + path.relative(ROOT, f).split(path.sep).join("/").replace(/\.html$/, "").replace(/^index$/, ""));
// Services = the built hubs that have a directory of town pages (services/<svc>.html + services/<svc>/).
const SERVICE_SLUGS = fs.existsSync(path.join(ROOT, "services"))
  ? fs.readdirSync(path.join(ROOT, "services"), { withFileTypes: true }).filter((d) => d.isDirectory() && /^[a-z0-9-]+$/.test(d.name) && fs.existsSync(path.join(ROOT, "services", `${d.name}.html`))).map((d) => d.name)
  : [];

for (const file of FILES) {
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
      if (!q.name || !String(q.acceptedAnswer?.text || "").trim()) fail("R09-faq-empty", rel, q.name || "(no question)");
      const key = norm(q.name) + "||" + norm(q.acceptedAnswer?.text || "");
      (faqSeen[key] ??= []).push(rel);
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
  // R13: BlogPosting author resolves to a Person or the business (Organization) with name+url
  for (const a of all.filter((n) => types(n).includes("BlogPosting"))) {
    const au = a.author && (a.author["@id"] ? ids.get(a.author["@id"]) : a.author);
    if (!au || !au.name || !au.url) fail("R13-author", rel, "author without name/url");
    if (!a.datePublished || !a.dateModified) fail("R13-dates", rel, "missing datePublished/dateModified");
  }
  // R14: no placeholder / empty credential values leak
  if (/"identifier":""|"(identifier|value)":"(TBD|XXX|000000|123456)"/i.test(raw.join(""))) fail("R14-placeholder", rel, "empty/placeholder credential");
  // R17: a city hub is a CollectionPage whose mainEntity lists the town's service pages (and nothing else).
  const hubSlug = (rel.split(path.sep).join("/").match(/^service-areas\/([a-z0-9-]+)\.html$/) || [])[1];
  if (hubSlug) {
    hubsChecked++;
    const cp = all.find((n) => types(n).includes("CollectionPage") && n["@id"] === `${canon}#webpage`);
    const list = cp && cp.mainEntity;
    if (!cp) fail("R17-hub-collectionpage", rel, "no CollectionPage #webpage node");
    else if (!list || !types(list).includes("ItemList")) fail("R17-hub-itemlist", rel, "mainEntity is not an ItemList");
    else {
      const items = list.itemListElement || [];
      if (list.numberOfItems !== items.length || items.length !== SERVICE_SLUGS.length) fail("R17-hub-count", rel, `numberOfItems ${list.numberOfItems}, ${items.length} items, ${SERVICE_SLUGS.length} services built`);
      const seen = new Set();
      items.forEach((it, i) => {
        if (it.position !== i + 1 || !String(it.name || "").trim() || !it.url) fail("R17-hub-item", rel, `item ${i + 1}: needs {position, name, url}`);
        const m = String(it.url || "").match(new RegExp(`^${SITE}/services/([a-z0-9-]+)/([a-z0-9-]+)$`));
        if (!m || m[2] !== hubSlug || !fs.existsSync(path.join(ROOT, "services", m[1], `${m[2]}.html`))) fail("R17-hub-item-url", rel, `${it.url} is not a built service page of this town`);
        else seen.add(m[1]);
      });
      if (seen.size !== SERVICE_SLUGS.length) fail("R17-hub-item-url", rel, `${seen.size} distinct services listed, ${SERVICE_SLUGS.length} built`);
    }
    for (const n of all) for (const t of types(n)) if (t === "Service" || t === "FAQPage") fail("R17-hub-node", rel, `${t} node on a city hub`);
  }
  // R18: every full Service definition (one with a provider) names its serviceType.
  for (const s of all.filter((n) => types(n).includes("Service") && n.provider)) if (++servicesChecked && !String(s.serviceType || "").trim()) fail("R18-service-type", rel, `${s.name || s["@id"] || "Service"} without serviceType`);
  // R19: every /services/… or /service-areas/… URL anywhere in the graph is a built page.
  const urls = []; const findUrls = (v) => { if (typeof v === "string") { const m = v.match(SITE_PATH); if (m) urls.push(m[1]); } else if (Array.isArray(v)) v.forEach(findUrls); else if (v && typeof v === "object") Object.values(v).forEach(findUrls); };
  nodes.forEach(findUrls);
  for (const u of new Set(urls)) if (++urlsChecked && !builtPath(u)) fail("R19-stale-url", rel, `${SITE}${u} is not a built page`);
  // R15: Service.areaServed must be structured (not a flat "Town, ST" string or GeoCircle)
  for (const s of all.filter((n) => types(n).includes("Service") && n.provider)) { // full Service definitions only
    const a = [].concat(s.areaServed || []);
    if (!a.length) fail("R15-service-area", rel, "Service without areaServed");
    for (const p of a) if (typeof p === "string" || types(p).includes("GeoCircle") || ((types(p).includes("City") || types(p).includes("AdministrativeArea") || types(p).includes("Place")) && !p.containedInPlace)) fail("R15-service-area", rel, JSON.stringify(p).slice(0, 80));
  }
}

// R16: a Q&A marked up as FAQPage on several pages is duplicate structured data (verification V4.1)
for (const [k, list] of Object.entries(faqSeen)) if (list.length > 1) fail("R16-faq-duplicate", list[0], `"${k.split("||")[0].slice(0, 70)}" also on ${list.length - 1} other page(s), e.g. ${list[1]}`);

const ruleNames = Object.keys(fails).sort();
console.log(`Checked ${pages} indexable pages (R17: ${hubsChecked} city hubs; R18: ${servicesChecked} Service definitions; R19: ${urlsChecked} page-level /services and /service-areas URLs).`);
if (!pages) { console.log("No indexable pages found — wrong path or missing build."); process.exit(1); }
if (!ruleNames.length) { console.log("All JSON-LD rules pass."); process.exit(0); }
for (const r of ruleNames) {
  const uniq = new Set(fails[r].map((x) => x.split(": ")[0]));
  console.log(`\n${r}: ${fails[r].length} failure(s) on ${uniq.size} page(s)`);
  fails[r].slice(0, 4).forEach((x) => console.log("  - " + x));
}
process.exit(1);
