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
  /how much does (decks|painting|siding) cost/i, // the old templated "How much does {service} cost" (ungrammatical)
  // Captions the photos do not show (spec §2.1): the Lynnfield entry door's material is unknown; HA16 has no new dormers.
  /\bwood(en)? entry door\b/i,
  /new (second-floor )?dormers/i,
  // The combined service names of the six-service site, as page/service names ("… in {place}").
  /(Kitchen &(amp;)? Bath(room)? Remodeling|Window &(amp;)? Door Replacement|Home Additions &(amp;)? Remodeling|Interior &(amp;)? Exterior Painting) in /,
  /residential and commercial/i,
];
// Self-claims of licensure are allowed only once the HIC # is set in lib/site.ts.
const hicSet = /hic:\s*"\d+"/.test(fs.readFileSync(path.join(REPO, "lib/site.ts"), "utf8"));
if (!hicSet) {
  BANNED.push(/\b(licensed (&amp;|&|and) insured|we('| a)re (fully )?licensed|is a licensed|100% licensed|fully licensed|licensed contractor)\b/i); // HTML encodes & as &amp;
  BANNED.push(/\b(is|are) registered (with|as) (the )?(a )?Massachusetts Home Improvement/i);
  BANNED.push(/\binsured (&amp;|&|and) licensed\b/i, /\blicensed, insured\b/i, /\ba licensed (MA |Massachusetts )?(home improvement )?contractor\b/i);
}

// On the scaled pages (service×town pages and city hubs) no "How much does {service} cost" question at all: a cost
// Q&A stamped on every town is the templated pattern the audit removed (spec §10.3). The hubs keep their own,
// hand-written cost questions ("How much does interior painting cost in Massachusetts?"), which are allowed there.
const SCALED_BANNED = [/how much does (decks|painting|interior painting|exterior painting|siding|a door|door installation|home remodeling|a whole-home remodel) cost/i];
const scaledPage = (rel) => /^(services\/[a-z0-9-]+|service-areas)\/[a-z0-9-]+(\.html|\.rsc|\.segments\/.*)$/.test(rel);

// No Cost vs. Value figures on the services that have no approved benchmark (spec §3, §10.3): hub and town pages.
const NO_CVV_SERVICES = ["door-installation", "home-additions", "home-remodeling", "interior-painting", "exterior-painting"];
const NO_CVV = [/\$\d{1,3},\d{3}/, /recoup/i];
const noCvvPage = (rel) => new RegExp(`^services/(${NO_CVV_SERVICES.join("|")})(\\.html$|/[^/]+\\.html$)`).test(rel);
const mainOf = (h) => { const m = h.split("<main")[1]; return m ? m.slice(m.indexOf(">") + 1).split("</main>")[0] : ""; };

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : /\.(html|body|rsc)$/.test(e.name) ? [path.join(d, e.name)] : []);
let bad = 0, noCvvPages = 0;
const scanned = walk(ROOT);
if (!scanned.some((f) => f.endsWith(".html"))) { console.error(`check-claims: no built pages found in ${ROOT}`); process.exit(1); }
for (const f of scanned) {
  const txt = fs.readFileSync(f, "utf8");
  for (const re of BANNED) {
    const m = txt.match(re);
    if (m) { bad++; if (bad <= 50) console.error(`✗ ${f}: "${m[0]}"`); }
  }
  const rel = path.relative(ROOT, f).split(path.sep).join("/");
  if (scaledPage(rel)) for (const re of SCALED_BANNED) {
    const m = txt.match(re);
    if (m) { bad++; if (bad <= 50) console.error(`✗ ${f}: templated cost question on a scaled page: "${m[0]}"`); }
  }
  if (rel.endsWith(".html") && noCvvPage(rel)) {
    noCvvPages++;
    const main = mainOf(txt).replace(/<script[\s\S]*?<\/script>/g, " ");
    for (const re of NO_CVV) {
      const m = main.match(re);
      if (m) { bad++; if (bad <= 50) console.error(`✗ ${f}: Cost vs. Value figure on a service without one: "${m[0]}"`); }
    }
  }
}
if (noCvvPages < NO_CVV_SERVICES.length) { console.error(`check-claims: only ${noCvvPages} pages of ${NO_CVV_SERVICES.join(", ")} found`); bad++; }
if (bad) { console.error(`check-claims: ${bad} banned claim(s) found`); process.exit(1); }
console.log(`check-claims: OK (${scanned.length} files; no Cost vs. Value figures on ${noCvvPages} pages of the five services without one)`);
