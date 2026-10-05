// scripts/check-claims.mjs — fail the build if unprovable claims reappear in any rendered page,
// JSON-LD, llms.txt or sitemap. Run after `next build`.
import fs from "node:fs";
import path from "node:path";

const ROOT = ".next/server/app";
const BANNED = [
  /regularly serve/i,
  /has served [A-Z][\w .'-]+ (and the surrounding communities )?since/i,
  /based right in nearby/i,
  /not an out-of-town outfit/i,
  /getting to [A-Z][\w .'-]+ is quick/i,
  /earned repeat business and referrals across/i,
  /built its reputation on across/i,
  /full MA licensing/i,
  /\b(100|150|200)\+ (MetroWest )?towns/i,
  /5-star reputation/i,
  /projects near [A-Z]/,
  /how much does (decks|painting|siding) cost/i,
  /residential and commercial/i,
];
// Self-claims of licensure are allowed only once the HIC # is set in lib/site.ts.
const hicSet = /hic:\s*"\d+"/.test(fs.readFileSync("lib/site.ts", "utf8"));
if (!hicSet) BANNED.push(/\b(licensed (&amp;|&|and) insured|we('| a)re (fully )?licensed|is a licensed|100% licensed)\b/i); // HTML encodes & as &amp;

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : /\.(html|body|rsc)$/.test(e.name) ? [path.join(d, e.name)] : []);
let bad = 0;
for (const f of walk(ROOT)) {
  const txt = fs.readFileSync(f, "utf8");
  for (const re of BANNED) {
    const m = txt.match(re);
    if (m) { bad++; if (bad <= 50) console.error(`✗ ${f}: "${m[0]}"`); }
  }
}
if (bad) { console.error(`check-claims: ${bad} banned claim(s) found`); process.exit(1); }
console.log("check-claims: OK");
