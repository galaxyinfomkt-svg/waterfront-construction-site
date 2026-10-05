// Usage: node scripts/check-town-pages.mjs [.next/server/app]   (run after `next build`)
// Fails (exit 1) when the service×town pages regress toward doorway / scaled-content patterns.
import fs from "node:fs";
import path from "node:path";
const APP = process.argv[2] || ".next/server/app";
const SVC = fs.readdirSync(path.join(APP, "services"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
const main = (h) => { let m = h.split("<main")[1] || ""; m = m.slice(m.indexOf(">") + 1).split("</main>")[0]; return dec(m.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(); };
const meta = (h, re) => dec((h.match(re) || [])[1] || "");
const sh = (t) => { const w = t.toLowerCase().replace(/[^a-z0-9$%&' ]+/g, " ").split(/\s+/).filter(Boolean); const s = new Set(); for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(" ")); return s; };
const jac = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };
const FORBIDDEN = [/served [A-Z][\w .'-]+ (?:and the surrounding communities )?since 20\d\d/, /regularly serve/i, /is quick for us/i, /referrals across/i, /projects near /i, /chooses us/i, /close to [A-Z][\w .'-]+ for fast service/];
const NH_FORBIDDEN = [/Full MA licensing/i, /in Massachusetts\?/, /licensed Massachusetts Home Improvement Contractor/i];
const errors = [], titles = new Map(), descs = new Map(), inlinks = new Map();
// inlinks from every built page
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".html") ? [path.join(d, e.name)] : []));
for (const f of walk(APP)) { const h = fs.readFileSync(f, "utf8"); const from = "/" + path.relative(APP, f).replace(/\.html$/, "").replace(/^index$/, ""); for (const m of new Set([...h.matchAll(/href="(\/services\/[a-z0-9-]+\/[a-z0-9-]+)"/g)].map((x) => x[1]))) if (m !== from) inlinks.set(m, (inlinks.get(m) || 0) + 1); }
for (const s of SVC) {
  const dir = path.join(APP, "services", s); if (!fs.existsSync(dir)) continue;
  const pages = fs.readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => {
    const slug = f.replace(/\.html$/, ""), h = fs.readFileSync(path.join(dir, f), "utf8"), url = `/services/${s}/${slug}`;
    const title = meta(h, /<title>([^<]*)<\/title>/), desc = meta(h, /<meta name="description" content="([^"]*)"/), h1 = dec((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ""])[1].replace(/<[^>]+>/g, ""));
    const town = h1.replace(/^.* in /, "").replace(/ \([^)]*\)/, "").replace(/, (MA|NH)$/, "");
    const text = main(h);
    for (const re of FORBIDDEN) if (re.test(text)) errors.push(`${url}: forbidden claim ${re}`);
    if (slug.endsWith("-nh")) for (const re of NH_FORBIDDEN) if (re.test(text)) errors.push(`${url}: MA-only claim on NH page ${re}`);
    titles.set(title, [...(titles.get(title) || []), url]); descs.set(desc, [...(descs.get(desc) || []), url]);
    if ((inlinks.get(url) || 0) < 8) errors.push(`${url}: only ${inlinks.get(url) || 0} internal inlinks (<8)`);
    const swapped = text.split(town).join(" TOWN ").replace(/\b(Massachusetts|New Hampshire)\b/g, "STATE").replace(/\b(MA|NH)\b/g, "ST");
    return { url, set: sh(swapped), key: swapped };
  });
  if (pages.length < 2) continue;
  const vals = []; for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) vals.push(jac(pages[i].set, pages[j].set));
  vals.sort((a, b) => a - b); const avg = vals.reduce((a, b) => a + b, 0) / vals.length, p90 = vals[Math.floor(vals.length * 0.9)];
  const distinct = new Set(pages.map((p) => p.key)).size;
  console.log(`${s.padEnd(28)} pages ${pages.length} avgJ ${avg.toFixed(3)} p90 ${p90.toFixed(3)} max ${vals.at(-1).toFixed(3)} distinct-after-swap ${distinct}`);
  if (avg >= 0.4) errors.push(`${s}: avg 5-gram Jaccard ${avg.toFixed(3)} ≥ 0.40`);
  if (p90 >= 0.5) errors.push(`${s}: p90 Jaccard ${p90.toFixed(3)} ≥ 0.50`);
  if (distinct < pages.length) errors.push(`${s}: ${pages.length - distinct} pages identical to a sibling after swapping the town name`);
}
for (const [t, u] of titles) if (u.length > 1) errors.push(`duplicate <title> "${t}" on ${u.join(", ")}`);
for (const [, u] of descs) if (u.length > 1) errors.push(`duplicate meta description on ${u.length} pages, e.g. ${u[0]}`);
console.log(`${errors.length} problem(s)`); for (const e of errors.slice(0, 40)) console.log(" -", e);
process.exit(errors.length ? 1 : 0);
