#!/usr/bin/env node
// scripts/indexnow.mjs — tell IndexNow (Bing, and through Bing ChatGPT search and Copilot; also Yandex,
// Seznam, Naver) which URLs changed, so they are recrawled soon instead of whenever the crawler gets to them.
// Google does not use IndexNow; it relies on the sitemap and Search Console (audit 07 T10, 09 AEO-H8).
//
// Run it by hand AFTER a production deploy is live, never during a build:
//   node scripts/indexnow.mjs --since=2026-10-05   URLs whose sitemap <lastmod> is on or after that date
//   node scripts/indexnow.mjs --all                every URL in the sitemaps (once, after a big rewrite)
//   node scripts/indexnow.mjs /faq /services/decks specific pages (paths or full URLs)
//   node scripts/indexnow.mjs --town-pages        every current service×town page, indexed or not, so Bing recrawls
//                                                  the ones lib/index-policy.ts set to noindex and drops them (run once
//                                                  after the policy changes). Can be combined with --all.
//   node scripts/indexnow.mjs --legacy             the retired service URLs that now answer with a 308, so Bing
//                                                  recrawls them and moves them to their new pages: every old hub
//                                                  and every old service×town page of the `split` slugs in
//                                                  lib/redirects.ts, with the town slugs read from the city-hub
//                                                  sitemap (/sitemap/areas.xml). Can be combined with --all.
// Options:
//   --dry-run            list what would be sent; send nothing
//   --sitemap=<url>      read the sitemaps from somewhere else, e.g. http://localhost:3000/sitemap.xml after
//                        `npm run build && npm start` (the URLs submitted are still the production ones)
//   --skip-key-check     do not check that the key file is live before submitting
// Key: the single public/<32 hex characters>.txt file (served at https://<host>/<key>.txt), or INDEXNOW_KEY.
//
// Responses: 200 OK · 202 accepted, key still being validated · 400 bad request · 403 key not valid or key
// file not found · 422 URLs not on this host, or key and file do not match · 429 too many requests (wait).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://waterfrontconstructionma.com"; // = SITE_URL in lib/seo.ts
const HOST = new URL(SITE).host;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10000; // IndexNow maximum per request
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return undefined;
  return args[i].includes("=") ? args[i].slice(args[i].indexOf("=") + 1) : args[i + 1];
};
const fail = (msg) => {
  console.error(`indexnow: ${msg}`);
  process.exit(1);
};

if (flag("help") || flag("h") || !args.length) {
  const lines = fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1);
  const header = lines.slice(0, lines.findIndex((l) => !l.startsWith("//")));
  console.log(header.map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(args.length ? 0 : 1);
}
// Never from a build step: the new pages must be live before search engines are told to fetch them.
if (process.env.VERCEL || process.env.NEXT_PHASE || /build/.test(process.env.npm_lifecycle_event ?? "")) {
  fail("refusing to run inside a build. Run it after the production deploy is live.");
}

// ---------- key ----------
function readKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY.trim();
  const files = fs.readdirSync(path.join(ROOT, "public")).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (files.length !== 1) fail(`expected exactly one public/<32 hex>.txt key file, found ${files.length}. Set INDEXNOW_KEY instead.`);
  const key = fs.readFileSync(path.join(ROOT, "public", files[0]), "utf8").trim();
  if (`${key}.txt` !== files[0]) fail(`public/${files[0]} must contain exactly its own name (without .txt).`);
  return key;
}
const KEY = readKey();
if (!/^[0-9a-zA-Z-]{8,128}$/.test(KEY)) fail("the key must be 8–128 characters: letters, digits or dashes.");
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

// ---------- URLs ----------
async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": "waterfront-indexnow-script" } });
  if (!res.ok) fail(`GET ${url} returned ${res.status}`);
  return res.text();
}
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim();
const tag = (xml, name) => xml.match(new RegExp(`<${name}>([^<]+)</${name}>`))?.[1];

/** Every <url> of the sitemap (following a sitemap index) as { loc, lastmod }. */
async function sitemapEntries(sitemapUrl) {
  const from = new URL(sitemapUrl).origin;
  const local = (u) => (from === SITE ? u : u.replace(SITE, from)); // fetch children from the same place
  const xml = await get(sitemapUrl);
  if (/<sitemapindex[\s>]/.test(xml)) {
    const children = [...xml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)].map((m) => decode(tag(m[1], "loc") ?? ""));
    const lists = await Promise.all(children.filter(Boolean).map((c) => sitemapEntries(local(c))));
    return lists.flat();
  }
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({ loc: decode(tag(m[1], "loc") ?? ""), lastmod: decode(tag(m[1], "lastmod") ?? "") })).filter((e) => e.loc);
}

/** The old slugs of the `split` table in lib/redirects.ts (read as data; the file is TypeScript). */
function legacySlugs() {
  const src = fs.readFileSync(path.join(ROOT, "lib/redirects.ts"), "utf8");
  const block = src.match(/const split[^=]*=\s*\[([\s\S]*?)\n\];/)?.[1];
  const slugs = block ? [...block.matchAll(/^\s*\[\s*"([a-z0-9-]+)"\s*,/gm)].map((m) => m[1]) : [];
  if (!slugs.length) fail("could not read the `split` table from lib/redirects.ts.");
  return slugs;
}
/** The retired service URLs: /services/<old> and /services/<old>/<town> for every town with a city hub. */
async function legacyUrls() {
  const index = option("sitemap") ?? `${SITE}/sitemap.xml`;
  const areas = index.replace(/\/sitemap\.xml$/, "/sitemap/areas.xml");
  const towns = (await sitemapEntries(areas)).map((e) => e.loc.match(/\/service-areas\/([a-z0-9-]+)$/)?.[1]).filter(Boolean);
  if (!towns.length) fail(`no city hubs found in ${areas}.`);
  return legacySlugs().flatMap((slug) => [`${SITE}/services/${slug}`, ...towns.map((t) => `${SITE}/services/${slug}/${t}`)]);
}

/** Every current service×town URL (indexed or noindex): the services come from the towns-<slug> child sitemaps
 *  listed in the index, the towns from the city-hub sitemap (all 201 hubs stay indexed). */
async function townPageUrls() {
  const index = option("sitemap") ?? `${SITE}/sitemap.xml`;
  const xml = await get(index);
  const slugs = [...xml.matchAll(/\/sitemap\/towns-([a-z0-9-]+)\.xml/g)].map((m) => m[1]);
  const towns = (await sitemapEntries(index.replace(/\/sitemap\.xml$/, "/sitemap/areas.xml"))).map((e) => e.loc.match(/\/service-areas\/([a-z0-9-]+)$/)?.[1]).filter(Boolean);
  if (!slugs.length || !towns.length) fail(`could not read the services or the city hubs from ${index}.`);
  return slugs.flatMap((slug) => towns.map((t) => `${SITE}/services/${slug}/${t}`));
}

async function selectUrls() {
  const explicit = args.filter((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.match(/^--(since|sitemap)$/));
  if (explicit.length) return explicit.map((a) => (a.startsWith("http") ? a : `${SITE}${a.startsWith("/") ? "" : "/"}${a}`));
  const all = flag("all");
  const since = option("since");
  const legacy = [...(flag("legacy") ? await legacyUrls() : []), ...(flag("town-pages") ? await townPageUrls() : [])];
  if (!all && !since) {
    if (legacy.length) return legacy;
    fail("say which URLs to send: --since=YYYY-MM-DD, --all, --legacy, --town-pages, or a list of paths. See --help.");
  }
  if (since && !/^\d{4}-\d{2}-\d{2}$/.test(since)) fail(`--since must be a date like 2026-10-05, got "${since}".`);
  const entries = await sitemapEntries(option("sitemap") ?? `${SITE}/sitemap.xml`);
  if (!entries.length) fail("the sitemap has no URLs.");
  const chosen = all ? entries : entries.filter((e) => e.lastmod && e.lastmod.slice(0, 10) >= since);
  const undated = since ? entries.filter((e) => !e.lastmod).length : 0;
  if (undated) console.warn(`indexnow: ${undated} sitemap URL(s) have no <lastmod> and were skipped (use --all to include them).`);
  return [...chosen.map((e) => e.loc), ...legacy];
}

// ---------- submit ----------
const urls = [...new Set(await selectUrls())];
const offHost = urls.filter((u) => new URL(u).host !== HOST);
if (offHost.length) fail(`these URLs are not on ${HOST}: ${offHost.slice(0, 5).join(", ")}${offHost.length > 5 ? " …" : ""}`);
if (!urls.length) {
  console.log("indexnow: nothing changed in that period; nothing to send.");
  process.exit(0);
}
console.log(`indexnow: ${urls.length} URL(s) for ${HOST} (key file ${KEY_LOCATION})`);

if (flag("dry-run")) {
  for (const u of urls) console.log(`  ${u}`);
  console.log("indexnow: dry run, nothing sent.");
  process.exit(0);
}

if (!flag("skip-key-check")) {
  const res = await fetch(KEY_LOCATION).catch((e) => fail(`could not fetch ${KEY_LOCATION}: ${e.message}`));
  const body = res.ok ? (await res.text()).trim() : "";
  if (body !== KEY) fail(`${KEY_LOCATION} is not live yet (status ${res.status}). Deploy first, then run this again.`);
}

const MEANING = { 200: "OK", 202: "accepted (key validation pending)", 400: "bad request", 403: "key not valid or key file not found", 422: "URLs not on this host, or key mismatch", 429: "too many requests; try again later" };
let failed = false;
for (let i = 0; i < urls.length; i += BATCH) {
  const urlList = urls.slice(i, i + BATCH);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  console.log(`indexnow: ${res.status} ${MEANING[res.status] ?? res.statusText} for ${urlList.length} URL(s)`);
  if (res.status >= 300) {
    failed = true;
    const text = await res.text().catch(() => "");
    if (text) console.error(text.slice(0, 500));
  }
}
process.exit(failed ? 1 : 0);
