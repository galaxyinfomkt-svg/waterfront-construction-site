// scripts/check-claims.mjs — fail the build if unprovable claims reappear in any rendered page,
// JSON-LD, llms.txt or sitemap. Run after `next build`.
import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "node:url";
const ROOT = process.argv[2] ?? ".next/server/app";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
const hicSet = /hic:\s*"\d+"/.test(fs.readFileSync(path.join(REPO, "lib/site.ts"), "utf8"));
if (!hicSet) {
  BANNED.push(/\b(licensed (&amp;|&|and) insured|we('| a)re (fully )?licensed|is a licensed|100% licensed|fully licensed|licensed contractor)\b/i); // HTML encodes & as &amp;
  BANNED.push(/\b(is|are) registered (with|as) (the )?(a )?Massachusetts Home Improvement/i);
  BANNED.push(/\binsured (&amp;|&|and) licensed\b/i, /\blicensed, insured\b/i, /\ba licensed (MA |Massachusetts )?(home improvement )?contractor\b/i);
}

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : /\.(html|body|rsc)$/.test(e.name) ? [path.join(d, e.name)] : []);
let bad = 0;
const scanned = walk(ROOT);
if (!scanned.some((f) => f.endsWith(".html"))) { console.error(`check-claims: no built pages found in ${ROOT}`); process.exit(1); }
for (const f of scanned) {
  const txt = fs.readFileSync(f, "utf8");
  for (const re of BANNED) {
    const m = txt.match(re);
    if (m) { bad++; if (bad <= 50) console.error(`✗ ${f}: "${m[0]}"`); }
  }
}
if (bad) { console.error(`check-claims: ${bad} banned claim(s) found`); process.exit(1); }
console.log("check-claims: OK");
