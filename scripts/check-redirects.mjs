// Usage: node scripts/check-redirects.mjs [.next/server/app]   (run after `next build`)
// Checks the built redirect table (.next/routes-manifest.json, generated from lib/redirects.ts) against the built
// pages, so a redirect can never hide a live page, chain, loop, or land on a 404 (spec §8, §10.4). Exit 1 on failure.
//   1. No redirect source (":city" expanded over every built town slug) is a built page.
//   2. Single hop: no destination is itself a redirect source. Loop safety: no destination of the legacy split
//      rules lies under a slug that was ever a redirect SOURCE towards them (browsers may have cached those 308s),
//      and following the server from a simulated cached 308 never revisits a URL.
//   3. Each legacy pattern below exists with exactly the expected destination, and so does its "/" twin.
//   4. Every expanded destination is a built page (or a file in public/ for renamed media).
import fs from "node:fs";
import path from "node:path";

const APP = path.resolve(process.argv[2] || ".next/server/app");
const MANIFEST = path.resolve(APP, "../../routes-manifest.json");
const PUBLIC = path.resolve(process.cwd(), "public");

// The legacy service slugs (spec §8). [old slug, hub destination, town destination prefix]
const LEGACY = [
  ["windows-and-doors", "/services/window-replacement", "/services/window-replacement"],
  ["painting", "/services/exterior-painting", "/services/exterior-painting"],
  ["kitchen-bathroom-remodeling", "/services", "/service-areas"],
  ["home-additions-remodeling", "/services", "/service-areas"],
];
// Slugs that were redirect SOURCES towards the combined pages for months (merged, removed in this release):
// they are live pages again and no legacy rule may send anyone back to them.
const HISTORICAL_SOURCES = ["kitchen-remodeling", "bathroom-remodeling", "home-additions", "home-remodeling"];
const HISTORICAL_TARGET = { "kitchen-remodeling": "kitchen-bathroom-remodeling", "bathroom-remodeling": "kitchen-bathroom-remodeling", "home-additions": "home-additions-remodeling", "home-remodeling": "home-additions-remodeling" };

const errors = [];
const fail = (msg) => errors.push(msg);
if (!fs.existsSync(MANIFEST)) { console.error(`check-redirects: ${MANIFEST} not found — run next build first.`); process.exit(1); }
const rules = (JSON.parse(fs.readFileSync(MANIFEST, "utf8")).redirects || []).filter((r) => !r.internal);

// ---------- built pages ----------
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".html") ? [path.join(d, e.name)] : []));
const PAGES = new Set(walk(APP).map((f) => "/" + path.relative(APP, f).split(path.sep).join("/").replace(/\.html$/, "").replace(/^index$/, "")).filter((p) => !/^\/_/.test(p)));
const TOWNS = fs.readdirSync(path.join(APP, "service-areas")).filter((f) => /^[a-z0-9-]+\.html$/.test(f)).map((f) => f.replace(/\.html$/, "")).sort();
if (TOWNS.length < 2) fail(`only ${TOWNS.length} town slugs found in ${APP}/service-areas`);
const isBuilt = (p) => PAGES.has(p) || (/\.[a-z0-9]+$/.test(p) && fs.existsSync(path.join(PUBLIC, p)));

// ---------- patterns ----------
// The rules use only literal segments, ":name" (one segment) and ":name+" (one or more segments).
const GENERIC_SLASH = "/:path+/"; // strips a trailing slash from everything else; it never matches a page path
function compile(source) {
  if (!/^[A-Za-z0-9/._:+-]+$/.test(source)) throw new Error(`check-redirects: unsupported source pattern ${source}`);
  const names = [];
  const re = source.replace(/[.]/g, "\\.").replace(/:([a-z]+)(\+?)/gi, (_, n, plus) => { names.push(n); return plus ? "(.+?)" : "([^/]+)"; });
  return { names, re: new RegExp(`^${re}$`) };
}
const compiled = rules.map((r) => ({ ...r, ...compile(r.source) }));
/** The first rule that matches a path, as Next applies them (in order), with the destination filled in. */
function redirectOf(p) {
  for (const r of compiled) {
    const m = p.match(r.re);
    if (!m) continue;
    let dest = r.destination;
    r.names.forEach((n, i) => { dest = dest.replace(new RegExp(`:${n}\\+?`, "g"), m[i + 1]); });
    return { rule: r, dest };
  }
  return undefined;
}
/** A rule's concrete sources and destinations: ":city"-style params expanded over the built town slugs. */
function expand(r) {
  if (r.source === GENERIC_SLASH) return [];
  if (!r.names.length) return [{ from: r.source, to: r.destination }];
  return TOWNS.map((t) => { let from = r.source, to = r.destination; for (const n of r.names) { from = from.replace(new RegExp(`:${n}\\+?`, "g"), t); to = to.replace(new RegExp(`:${n}\\+?`, "g"), t); } return { from, to }; });
}

// ---------- 1, 2, 4 ----------
let expanded = 0;
for (const r of compiled) {
  for (const { from, to } of expand(r)) {
    expanded++;
    if (PAGES.has(from)) fail(`1 redirect source ${from} (rule ${r.source}) is a built page — the redirect would hide it`);
    const next = redirectOf(to.split("#")[0]);
    if (next) fail(`2 ${from} → ${to} chains: ${to} is itself redirected by ${next.rule.source} → ${next.dest}`);
    if (!isBuilt(to.split("#")[0])) fail(`4 ${from} → ${to}: the destination is not a built page`);
  }
}
const legacyRule = new RegExp(`^/services/(${LEGACY.map((l) => l[0]).join("|")})(/|$)`);
const historical = new RegExp(`^/services/(${HISTORICAL_SOURCES.join("|")})(/|$)`);
for (const r of compiled) if (legacyRule.test(r.source) && historical.test(r.destination)) fail(`2 loop risk: ${r.source} → ${r.destination} points back at a former redirect source`);
for (const r of compiled) for (const h of HISTORICAL_SOURCES) for (const p of [`/services/${h}`, `/services/${h}/${TOWNS[0]}`]) if (r.source !== GENERIC_SLASH && r.re.test(p)) fail(`1 ${p} is redirected by ${r.source}: it must be a live page`);

// ---------- 2: simulated cached 308s (old production: kitchen-remodeling → kitchen-bathroom-remodeling, …) ----------
const samples = [TOWNS[0], TOWNS.find((t) => t.endsWith("-nh")), "devens", "not-a-town"].filter(Boolean);
for (const h of HISTORICAL_SOURCES) for (const suffix of ["", ...samples.map((t) => `/${t}`)]) {
  const start = `/services/${h}${suffix}`;
  const seen = new Set([start]);
  let at = `/services/${HISTORICAL_TARGET[h]}${suffix}`; // the browser's cached hop
  for (let hop = 0; ; hop++) {
    if (seen.has(at)) { fail(`2 loop: ${start} (cached) → … → ${at} revisits a URL`); break; }
    seen.add(at);
    const n = redirectOf(at);
    if (!n) break;
    if (hop >= 5) { fail(`2 ${start}: more than 5 redirects`); break; }
    at = n.dest.split("#")[0];
  }
}

// ---------- 3: the legacy patterns, exactly ----------
const exact = (source, destination) => {
  const found = rules.filter((r) => r.source === source);
  if (found.length !== 1) fail(`3 expected one rule ${source}, found ${found.length}`);
  else if (found[0].destination !== destination) fail(`3 ${source} → ${found[0].destination}, expected ${destination}`);
  else if (found[0].statusCode !== 308 && found[0].permanent !== true) fail(`3 ${source} is not a permanent (308) redirect`);
};
for (const [from, hub, town] of LEGACY) {
  for (const twin of ["", "/"]) {
    exact(`/services/${from}${twin}`, hub);
    exact(`/services/${from}/:city${twin}`, `${town}/:city`);
  }
}
// and they resolve as intended for real paths (a town, an NH town and an unknown slug that lands on a 404)
for (const [from, hub, town] of LEGACY) for (const twin of ["", "/"]) {
  const h = redirectOf(`/services/${from}${twin}`);
  if (!h || h.dest !== hub) fail(`3 /services/${from}${twin} resolves to ${h?.dest}, expected ${hub}`);
  for (const t of samples) {
    const got = redirectOf(`/services/${from}/${t}${twin}`);
    if (!got || got.dest !== `${town}/${t}`) fail(`3 /services/${from}/${t}${twin} resolves to ${got?.dest}, expected ${town}/${t}`);
  }
}

console.log(`check-redirects: ${rules.length} rules, ${expanded} concrete redirects over ${TOWNS.length} town slugs, ${PAGES.size} built pages`);
if (errors.length) {
  console.error(`check-redirects: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 40)) console.error(" -", e);
  process.exit(1);
}
console.log("check-redirects: OK");
