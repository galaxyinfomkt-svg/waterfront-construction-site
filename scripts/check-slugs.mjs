// Usage: node scripts/check-slugs.mjs   (source check; no build needed)
// Guards the references TypeScript cannot see (spec §2.6, §10.5). Exit 1 on failure.
//   1. Every service in lib/services.ts (SERVICE_SLUGS) has its social card public/og/service-<slug>.jpg, a real
//      1200×630 JPEG, and the matching entry in lib/media-manifest.json.
//   2. No source file under app/, lib/, components/ or scripts/ still names a retired service slug:
//      windows-and-doors, kitchen-bathroom-remodeling, home-additions-remodeling, /services/painting or
//      "painting" as a service key.
//      Allowed: lib/redirects.ts (the 308s for those slugs), scripts/check-redirects.mjs (it tests those 308s),
//      this file, and the kept share-card entries "/og/service-<old>.jpg" in lib/media-manifest.json (old cards stay
//      on disk so cached shares still resolve, spec §9.4).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF = path.relative(ROOT, fileURLToPath(import.meta.url)).split(path.sep).join("/");
const errors = [];
const fail = (m) => errors.push(m);
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

// ---------- 1. social cards ----------
const slugBlock = (read("lib/services.ts").match(/export const SERVICE_SLUGS = \[([\s\S]*?)\]/) || [])[1];
const SLUGS = slugBlock ? [...slugBlock.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]) : [];
if (!SLUGS.length) fail("lib/services.ts: SERVICE_SLUGS not found");
const manifest = JSON.parse(read("lib/media-manifest.json"));
/** Width × height from a JPEG's SOF marker. */
function jpegSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) return undefined;
  for (let i = 2; i + 9 < b.length; ) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return undefined;
}
for (const slug of SLUGS) {
  const key = `/og/service-${slug}.jpg`;
  const file = path.join(ROOT, "public", key);
  if (!fs.existsSync(file)) { fail(`public${key} is missing (npm run og)`); continue; }
  const size = jpegSize(file);
  if (!size || size.w !== 1200 || size.h !== 630) fail(`public${key} is ${size ? `${size.w}×${size.h}` : "not a JPEG"}, expected 1200×630`);
  const m = manifest[key];
  if (!m) fail(`lib/media-manifest.json has no entry for ${key}`);
  else if (size && (m.w !== size.w || m.h !== size.h)) fail(`lib/media-manifest.json: ${key} is ${m.w}×${m.h}, the file is ${size.w}×${size.h}`);
}

// ---------- 2. retired slugs ----------
const RETIRED = [
  /windows-and-doors/,
  /kitchen-bathroom-remodeling/,
  /home-additions-remodeling/,
  /\/services\/painting(?![a-z0-9-])/,
  /["'`]painting["'`]\s*[:\],)]/, // "painting" as a key, an array item or an argument (a service slug)
  /\[\s*["'`]painting["'`]/,
];
// Unquoted keys and property accesses, matched on code only (comments stripped): prose may say "painting:".
const RETIRED_CODE = [
  /(^|[{,]\s*)painting\??\s*:/, // an unquoted object key: { painting: … }
  /[A-Za-z_$\]]\.painting\b/, // a property access: PATHS.painting
];
const codeOnly = (line) => line.replace(/^\s*(\*|\/\*|\/\/).*$/, "").replace(/(^|[^:"'`])\/\/.*$/, "$1").replace(/\/\*.*?\*\//g, "");
const ALLOWED_FILES = new Set(["lib/redirects.ts", "scripts/check-redirects.mjs", SELF]);
const KEPT_CARD = /^\s*"\/og\/service-[a-z0-9-]+\.jpg": \{\s*$/; // lib/media-manifest.json: old share cards stay
const walk = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => {
  const rel = `${d}/${e.name}`;
  if (e.isDirectory()) return e.name === "node_modules" || e.name.startsWith(".") ? [] : walk(rel);
  return /\.(ts|tsx|mjs|cjs|js|json|css|md)$/.test(e.name) ? [rel] : [];
});
let scanned = 0;
for (const rel of ["app", "lib", "components", "scripts"].filter((d) => fs.existsSync(path.join(ROOT, d))).flatMap(walk)) {
  if (ALLOWED_FILES.has(rel)) continue;
  scanned++;
  read(rel).split("\n").forEach((line, i) => {
    if (rel === "lib/media-manifest.json" && KEPT_CARD.test(line)) return;
    for (const re of RETIRED) {
      const m = line.match(re);
      if (m) fail(`${rel}:${i + 1}: retired service slug "${m[0]}"`);
    }
    if (/\.(ts|tsx|mjs|cjs|js)$/.test(rel)) for (const re of RETIRED_CODE) {
      const m = codeOnly(line).match(re);
      if (m) fail(`${rel}:${i + 1}: retired service slug "${m[0].trim()}"`);
    }
  });
}

console.log(`check-slugs: ${SLUGS.length} services, ${scanned} source files scanned`);
if (errors.length) {
  console.error(`check-slugs: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 40)) console.error(" -", e);
  process.exit(1);
}
console.log("check-slugs: OK");
