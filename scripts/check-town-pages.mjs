// Usage: node scripts/check-town-pages.mjs [.next/server/app]   (run after `next build`)
// Fails (exit 1) when the service×town pages or the city hubs regress toward doorway / scaled-content patterns.
//
// Gates (binding numbers; never loosen one without the lead's sign-off):
//   G1  each service, its town pages:            avg 5-gram Jaccard < 0.40, p90 < 0.50, all distinct after the town swap
//   G2  same town, across services (45 pairs/town): overall avg < 0.50, p90 < 0.60, every service-pair class avg < 0.60
//   G3  city hubs (/service-areas/<town>):       avg < 0.40, p90 < 0.50, all distinct after the town swap
//       (+ the masked-number metric: digits and compass points masked; informational only)
//   G4  each city hub vs each of its service×town children: max < 0.45
//   G5  <title> and meta description unique across every indexable page
//   G6  ≥ 8 internal inlinks (from the built HTML) for every service×town page and every city hub
//   G7  forbidden per-town claims (FORBIDDEN, NH_FORBIDDEN) on the town pages and the city hubs
// Counts come from the build itself: every service directory must hold the same set of towns as the city hubs.
import fs from "node:fs";
import path from "node:path";

const APP = process.argv[2] || ".next/server/app";
// Floors from the binding spec (10 services; 193 cities and towns + 7 villages + Devens = 201 places).
// They only catch a build that lost pages; the exact sets are compared against each other below.
const MIN_SERVICES = 10;
const MIN_PLACES = 201;

const dec = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
// Repeated template chrome inside <main> (the mid-page estimate band and the CTA rows, marked data-form-band /
// data-cta-row) is identical on every page of the site, like the header and footer, so it is left out of the measure.
// The lazy regexes assume no nested <section> inside the band and no nested <div> inside a CTA row (true today).
const chrome = (m) => m.replace(/<section[^>]*\sdata-form-band[^>]*>[\s\S]*?<\/section>/g, " ").replace(/<div[^>]*\sdata-cta-row[^>]*>[\s\S]*?<\/div>/g, " ");
const main = (h) => { let m = h.split("<main")[1] || ""; m = chrome(m.slice(m.indexOf(">") + 1).split("</main>")[0]); return dec(m.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(); };
const meta = (h, re) => dec((h.match(re) || [])[1] || "");
const sh = (t) => { const w = t.toLowerCase().replace(/[^a-z0-9$%&' ]+/g, " ").split(/\s+/).filter(Boolean); const s = new Set(); for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(" ")); return s; };
const jac = (a, b) => { let i = 0; const [x, y] = a.size < b.size ? [a, b] : [b, a]; for (const v of x) if (y.has(v)) i++; return i / (a.size + b.size - i || 1); };
const stats = (vals) => { const v = [...vals].sort((a, b) => a - b); return { n: v.length, avg: v.reduce((a, b) => a + b, 0) / (v.length || 1), p90: v[Math.floor(v.length * 0.9)] ?? 0, max: v.at(-1) ?? 0 }; };
const f3 = (x) => x.toFixed(3);
const FORBIDDEN = [/served [A-Z][\w .'-]+ (?:and the surrounding communities )?since 20\d\d/, /regularly serve/i, /is quick for us/i, /referrals across/i, /projects near /i, /chooses us/i, /close to [A-Z][\w .'-]+ for fast service/];
const NH_FORBIDDEN = [/Full MA licensing/i, /in Massachusetts\?/, /licensed Massachusetts Home Improvement Contractor/i];
const NOINDEX = /<meta name="robots" content="[^"]*noindex/;
const errors = [];

if (!fs.existsSync(path.join(APP, "services"))) { console.log(`No built pages in ${APP}/services — wrong path or missing build.`); process.exit(1); }
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".html") ? [path.join(d, e.name)] : []));
const urlOf = (f) => "/" + path.relative(APP, f).split(path.sep).join("/").replace(/\.html$/, "").replace(/^index$/, "");
const htmlFiles = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^[a-z0-9-]+\.html$/.test(f)).sort() : []);

// ---------- one pass over every built page: inlinks (G6) and titles/descriptions (G5) ----------
const inlinks = new Map(), titles = new Map(), descs = new Map();
for (const f of walk(APP)) {
  const h = fs.readFileSync(f, "utf8");
  const from = urlOf(f);
  const targets = new Set([...h.matchAll(/href="(\/services\/[a-z0-9-]+\/[a-z0-9-]+|\/service-areas\/[a-z0-9-]+)"/g)].map((x) => x[1]));
  for (const t of targets) if (t !== from) inlinks.set(t, (inlinks.get(t) || 0) + 1);
  if (NOINDEX.test(h) || /^\/_/.test(from)) continue; // 404, thank-you, Next's error shell
  const title = meta(h, /<title>([^<]*)<\/title>/), desc = meta(h, /<meta name="description" content="([^"]*)"/);
  titles.set(title, [...(titles.get(title) || []), from]);
  if (desc) descs.set(desc, [...(descs.get(desc) || []), from]);
  else errors.push(`${from}: no meta description`);
}

// ---------- read one page of a set ----------
function readPage(file, url, slug) {
  const h = fs.readFileSync(file, "utf8");
  const h1 = dec((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ""])[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  if (!/ in .+$/.test(h1)) errors.push(`${url}: H1 "${h1}" does not end with " in {place}"`);
  const town = h1.replace(/^.* in /, "").replace(/ \([^)]*\)/, "").replace(/, (MA|NH)$/, "");
  const text = main(h);
  for (const re of FORBIDDEN) if (re.test(text)) errors.push(`${url}: forbidden claim ${re}`);
  if (slug.endsWith("-nh")) for (const re of NH_FORBIDDEN) if (re.test(text)) errors.push(`${url}: MA-only claim on NH page ${re}`);
  if ((inlinks.get(url) || 0) < 8) errors.push(`${url}: only ${inlinks.get(url) || 0} internal inlinks (<8)`);
  const swapped = text.split(town).join(" TOWN ").replace(/\b(Massachusetts|New Hampshire)\b/g, "STATE").replace(/\b(MA|NH)\b/g, "ST");
  return { url, slug, set: sh(swapped), key: swapped };
}
/** Pairwise Jaccard of a set of pages: { avg, p90, max, distinct }. */
function similarity(pages) {
  const vals = [];
  for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) vals.push(jac(pages[i].set, pages[j].set));
  return { ...stats(vals), distinct: new Set(pages.map((p) => p.key)).size };
}

// ---------- the service×town pages (G1) ----------
const servicesDir = path.join(APP, "services");
const SVC = fs.readdirSync(servicesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^[a-z0-9-]+$/.test(d.name) && fs.existsSync(path.join(servicesDir, `${d.name}.html`)))
  .map((d) => d.name).sort();
const HUB_DIR = path.join(APP, "service-areas");
const HUB_SLUGS = htmlFiles(HUB_DIR).map((f) => f.replace(/\.html$/, ""));
if (SVC.length < MIN_SERVICES) errors.push(`only ${SVC.length} service directories with a hub (expected ≥ ${MIN_SERVICES})`);
if (HUB_SLUGS.length < MIN_PLACES) errors.push(`only ${HUB_SLUGS.length} city hubs in service-areas/ (expected ≥ ${MIN_PLACES})`);

const byService = new Map(); // svc → pages
const byTown = new Map(); // town slug → Map(svc → page)
for (const s of SVC) {
  const slugs = htmlFiles(path.join(servicesDir, s)).map((f) => f.replace(/\.html$/, ""));
  const missing = HUB_SLUGS.filter((t) => !slugs.includes(t)), extra = slugs.filter((t) => !HUB_SLUGS.includes(t));
  if (missing.length) errors.push(`${s}: no town page for ${missing.length} city hub(s), e.g. ${missing.slice(0, 3).join(", ")}`);
  if (extra.length) errors.push(`${s}: ${extra.length} town page(s) without a city hub, e.g. ${extra.slice(0, 3).join(", ")}`);
  const pages = slugs.map((slug) => readPage(path.join(servicesDir, s, `${slug}.html`), `/services/${s}/${slug}`, slug));
  byService.set(s, pages);
  for (const p of pages) { if (!byTown.has(p.slug)) byTown.set(p.slug, new Map()); byTown.get(p.slug).set(s, p); }
  if (pages.length < 2) continue;
  const r = similarity(pages);
  console.log(`G1 ${s.padEnd(22)} pages ${pages.length} avgJ ${f3(r.avg)} p90 ${f3(r.p90)} max ${f3(r.max)} distinct-after-swap ${r.distinct}`);
  if (r.avg >= 0.4) errors.push(`G1 ${s}: avg 5-gram Jaccard ${f3(r.avg)} ≥ 0.40`);
  if (r.p90 >= 0.5) errors.push(`G1 ${s}: p90 Jaccard ${f3(r.p90)} ≥ 0.50`);
  if (r.distinct < pages.length) errors.push(`G1 ${s}: ${pages.length - r.distinct} pages identical to a sibling after swapping the town name`);
}

// ---------- G2: same town, across services ----------
{
  const all = [], cls = new Map(), worst = [];
  for (const [town, m] of byTown) {
    const svcs = [...m.keys()];
    for (let i = 0; i < svcs.length; i++) for (let j = i + 1; j < svcs.length; j++) {
      const v = jac(m.get(svcs[i]).set, m.get(svcs[j]).set);
      all.push(v);
      const k = `${svcs[i]}|${svcs[j]}`;
      cls.set(k, [...(cls.get(k) || []), v]);
      worst.push({ v, town, a: svcs[i], b: svcs[j] });
    }
  }
  const r = stats(all);
  const classAvg = new Map([...cls].map(([k, v]) => [k, stats(v).avg]));
  console.log(`\nG2 same town, cross-service: ${r.n} pairs over ${byTown.size} towns, avg ${f3(r.avg)} p90 ${f3(r.p90)} max ${f3(r.max)}`);
  const short = (s) => s.split("-").map((w) => w[0]).join("").padStart(4);
  console.log(`     ${SVC.map(short).join(" ")}   (class avg; ${SVC.map((s) => `${short(s).trim()}=${s}`).join(", ")})`);
  for (const a of SVC) console.log(`${short(a)} ${SVC.map((b) => (a === b ? "  — " : (() => { const v = classAvg.get(`${a}|${b}`) ?? classAvg.get(`${b}|${a}`); return v === undefined ? "   ." : v.toFixed(2).slice(1).padStart(4); })())).join(" ")}`);
  console.log("worst pairs:", worst.sort((x, y) => y.v - x.v).slice(0, 5).map((w) => `${w.town} ${w.a}×${w.b} ${f3(w.v)}`).join("; "));
  if (r.avg >= 0.5) errors.push(`G2 cross-service avg Jaccard ${f3(r.avg)} ≥ 0.50`);
  if (r.p90 >= 0.6) errors.push(`G2 cross-service p90 Jaccard ${f3(r.p90)} ≥ 0.60`);
  for (const [k, v] of classAvg) if (v >= 0.6) errors.push(`G2 service pair ${k.replace("|", " × ")}: class avg ${f3(v)} ≥ 0.60`);
}

// ---------- G3 / G7: city hubs ----------
const hubs = HUB_SLUGS.map((slug) => readPage(path.join(HUB_DIR, `${slug}.html`), `/service-areas/${slug}`, slug));
if (hubs.length >= 2) {
  const r = similarity(hubs);
  console.log(`\nG3 city hubs ${hubs.length} avgJ ${f3(r.avg)} p90 ${f3(r.p90)} max ${f3(r.max)} distinct-after-swap ${r.distinct}`);
  if (r.avg >= 0.4) errors.push(`G3 city hubs: avg 5-gram Jaccard ${f3(r.avg)} ≥ 0.40`);
  if (r.p90 >= 0.5) errors.push(`G3 city hubs: p90 Jaccard ${f3(r.p90)} ≥ 0.50`);
  if (r.distinct < hubs.length) errors.push(`G3 city hubs: ${hubs.length - r.distinct} hubs identical to a sibling after swapping the town name`);
  // Informational: the same measure with every number and compass point masked (how much is template + data only).
  const DIRS = /\b(north|south|east|west|northeast|northwest|southeast|southwest|n|s|e|w|ne|nw|se|sw|nne|ene|ese|sse|ssw|wsw|wnw|nnw)\b/gi;
  const masked = hubs.map((p) => ({ set: sh(p.key.replace(/\d+(?:[.,]\d+)*/g, " NUM ").replace(DIRS, " DIR ")), key: "" }));
  const mr = similarity(masked);
  console.log(`G3 masked-number metric (informational): avg ${f3(mr.avg)} p90 ${f3(mr.p90)} max ${f3(mr.max)}`);
}

// ---------- G4: each city hub vs its own service×town pages ----------
{
  let max = 0, at = "";
  for (const hub of hubs) for (const [s, child] of byTown.get(hub.slug) || []) {
    const v = jac(hub.set, child.set);
    if (v > max) { max = v; at = `${hub.url} × /services/${s}/${hub.slug}`; }
    if (v >= 0.45) errors.push(`G4 ${hub.url} vs /services/${s}/${hub.slug}: Jaccard ${f3(v)} ≥ 0.45`);
  }
  console.log(`G4 city hub vs its children: max ${f3(max)} (${at || "no pairs"})`);
}

// ---------- G5 ----------
for (const [t, u] of titles) if (u.length > 1) errors.push(`G5 duplicate <title> "${t}" on ${u.length} pages: ${u.slice(0, 3).join(", ")}`);
for (const [, u] of descs) if (u.length > 1) errors.push(`G5 duplicate meta description on ${u.length} pages: ${u.slice(0, 3).join(", ")}`);
console.log(`G5 ${titles.size} titles / ${descs.size} descriptions across the indexable pages`);

if (!SVC.length) errors.push("No service×town pages found — wrong path or missing build.");
console.log(`\n${errors.length} problem(s)`); for (const e of errors.slice(0, 40)) console.log(" -", e);
if (errors.length > 40) console.log(` … and ${errors.length - 40} more`);
process.exit(errors.length ? 1 : 0);
