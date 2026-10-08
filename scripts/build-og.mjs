// Builds the 1200×630 Open Graph images in public/og/ from REAL site photos, plus the
// default brand card public/og.jpg. Run after changing photos: node scripts/build-og.mjs
// Pass name prefixes to rebuild only some images, e.g. `node scripts/build-og.mjs service-` (the brand card's
// name is "og-default"); the committed JPGs are not regenerated in CI.
import sharp from "sharp";
import fs from "node:fs";

const W = 1200, H = 630;
fs.mkdirSync("public/og", { recursive: true });
const only = process.argv.slice(2);
const wanted = (name) => only.length === 0 || only.some((p) => name.startsWith(p));

/** Resize to 1200 px wide, then cut the 630-px band at vertical focus y (0 = top band, 1 = bottom band). Most
 *  sources are portrait, so a centred cover crop would cut off the subject. y = "centre" (and a source wider than
 *  1.9:1) gives a centred cover crop. */
async function focusCrop(src, y, out) {
  if (y === "centre") {
    await sharp(src).resize(W, H, { fit: "cover", position: "centre" }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    return;
  }
  const { data, info } = await sharp(src).resize({ width: W }).toBuffer({ resolveWithObject: true });
  const img = sharp(data);
  const cut = info.height >= H
    ? img.extract({ left: 0, top: Math.round((info.height - H) * y), width: W, height: H })
    : img.resize(W, H, { fit: "cover", position: "centre" });
  await cut.jpeg({ quality: 82, mozjpeg: true }).toFile(out);
}

const P = "public/images/projects";

// SERVICE-OG — one card per service hub (lib/service-content.ts og.slug = `service-<slug>`, spec §9.4).
// Real Waterfront Construction photos only, each from that service's own gallery in lib/services.ts.
// The three old combined-slug cards (pre-split windows/doors, kitchen/bath and additions/remodeling hubs) stay
// committed in public/og/ so cached share cards still resolve, but are no longer built here.
const serviceCrops = {
  "service-siding": { src: `${P}/home-addition-exterior-lynnfield-ma-19.webp`, y: 0.33 },
  "service-window-replacement": { src: `${P}/home-addition-exterior-lynnfield-ma-13.webp`, y: 0.5 },
  "service-door-installation": { src: `${P}/home-addition-exterior-lynnfield-ma-14.webp`, y: 0.25 }, // door + sill band
  "service-decks": { src: `${P}/deck-salem-nh-02.webp`, y: "centre" },
  "service-kitchen-remodeling": { src: `${P}/kitchen-remodel-mansfield-ma-01.webp`, y: 0.5 },
  "service-bathroom-remodeling": { src: `${P}/bathroom-remodels-03.webp`, y: 0.3 }, // stays clear of the baked-in banner
  "service-home-additions": { src: `${P}/home-addition-exterior-lynnfield-ma-12.webp`, y: "centre" },
};
for (const [slug, { src, y }] of Object.entries(serviceCrops)) {
  if (!wanted(slug)) continue;
  if (!fs.existsSync(src)) { console.warn("missing", src); continue; }
  await focusCrop(src, y, `public/og/${slug}.jpg`);
  console.log("og", slug);
}

// Services with no real photo yet (owner items O4, O5, O14) get a typographic card, never a stock photo: the
// "Paper & Ink" plate motif — paper ground, a 1-px inset hairline frame, the service's `short` name (kept in sync
// with lib/services.ts by hand) in navy serif, and a two-line kicker. Fonts are whatever fontconfig resolves on
// the machine that builds the committed JPGs (DejaVu Serif here; Newsreader is a web font only).
const PAPER = "#FAF9F6", LINE = "#DEDAD2", NAVY = "#24215A", MUTED = "#5C5B63";
// One family per Pango font description (a comma list falls back to the default face). Type 1 fonts such as
// Bitstream Charter are not usable by Pango, so the serif is DejaVu Serif.
const SERIF = "DejaVu Serif", SANS = "Liberation Sans";
const plateCards = {
  "service-exterior-painting": "Exterior House Painting",
  "service-home-remodeling": "Whole-Home & Interior Remodeling",
  "service-interior-painting": "Interior Painting",
};
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
async function plateCard(title, out) {
  const INSET = 40;
  // Title: Pango wraps it inside the frame and centres each line; its rendered size places it exactly.
  const titleImg = await sharp({
    text: { text: `<span foreground="${NAVY}">${esc(title)}</span>`, font: `${SERIF} 92`, width: W - 2 * INSET - 100, align: "centre", spacing: -6, rgba: true, dpi: 72 },
  }).png().toBuffer({ resolveWithObject: true });
  const kicker = await sharp({
    text: {
      text: `<span foreground="${MUTED}" letter_spacing="${Math.round(0.16 * 24 * 1024)}">WATERFRONT CONSTRUCTION\nNORTHBOROUGH, MA</span>`,
      font: `${SANS} 24`, align: "centre", spacing: 10, rgba: true, dpi: 72,
    },
  }).png().toBuffer({ resolveWithObject: true });
  const RULE = 64, GAP = 44;
  const block = titleImg.info.height + GAP + 1 + GAP + kicker.info.height;
  const top = Math.round((H - block) / 2);
  const ruleY = top + titleImg.info.height + GAP;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect x="${INSET + 0.5}" y="${INSET + 0.5}" width="${W - 2 * INSET - 1}" height="${H - 2 * INSET - 1}" fill="none" stroke="${LINE}" stroke-width="1"/>
  <rect x="${(W - RULE) / 2}" y="${ruleY}" width="${RULE}" height="1" fill="${NAVY}"/>
</svg>`;
  await sharp(Buffer.from(svg))
    .composite([
      { input: titleImg.data, left: Math.round((W - titleImg.info.width) / 2), top },
      { input: kicker.data, left: Math.round((W - kicker.info.width) / 2), top: ruleY + 1 + GAP },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);
}
for (const [slug, title] of Object.entries(plateCards)) {
  if (!wanted(slug)) continue;
  await plateCard(title, `public/og/${slug}.jpg`);
  console.log("og", slug, "(typographic)");
}

// slug → source photo (real Waterfront Construction project photos only)
const crops = {
  "project-kitchen-remodel-mansfield-ma": "public/images/projects/kitchen-remodel-mansfield-ma-01.webp",
  "project-bathroom-remodels": "public/images/projects/bathroom-remodels-03.webp",
  "project-pool-deck-salem-nh": "public/images/projects/deck-salem-nh-06.webp",
  "project-home-addition-needham-ma": "public/images/projects/home-addition-needham-ma-05.webp",
  "project-home-addition-exterior-lynnfield-ma": "public/images/projects/home-addition-exterior-lynnfield-ma-12.webp",
  "project-home-addition-framing-lynnfield-ma": "public/images/projects/home-addition-lynnfield-ma-06.webp",
  "project-exterior-remodel-siding-deck": "public/images/projects/exterior-remodel-siding-deck-ma-01.webp",
};

for (const [slug, src] of Object.entries(crops)) {
  if (!wanted(slug)) continue;
  if (!fs.existsSync(src)) { console.warn("missing", src); continue; }
  await sharp(src).resize(W, H, { fit: "cover", position: "centre" }).jpeg({ quality: 82, mozjpeg: true }).toFile(`public/og/${slug}.jpg`);
  console.log("og", slug);
}

// BLOG-OG-START — blog posts (owned by the blog; lib/posts.ts uses ogFor(`blog-${slug}`)). Real project photos only.
// y = vertical focus of the 1200-px-wide resized photo: 0 = top band, 1 = bottom band. Most sources are portrait,
// so a centred crop would cut off the subject; bathroom-remodels-03 keeps y low to stay clear of its baked-in banner.
const blogCrops = {
  "blog-kitchen-remodel-cost-massachusetts": { src: `${P}/kitchen-remodel-mansfield-ma-01.webp`, y: 0.5 },
  "blog-bathroom-remodel-cost-massachusetts": { src: `${P}/bathroom-remodels-03.webp`, y: 0.3 },
  "blog-home-addition-cost-massachusetts": { src: `${P}/home-addition-needham-ma-05.webp`, y: 0.3 },
  "blog-siding-replacement-cost-massachusetts": { src: `${P}/home-addition-exterior-lynnfield-ma-17.webp`, y: 0.35 },
  "blog-5-remodels-that-add-the-most-home-value": { src: `${P}/kitchen-remodel-mansfield-ma-06.webp`, y: 0.5 },
  "blog-signs-its-time-to-replace-your-siding": { src: `${P}/home-addition-exterior-lynnfield-ma-05.webp`, y: 0.4 },
  "blog-how-to-choose-a-contractor-in-massachusetts": { src: `${P}/home-addition-exterior-lynnfield-ma-03.webp`, y: 0.4 },
  "blog-signs-you-need-new-windows": { src: `${P}/home-addition-exterior-lynnfield-ma-13.webp`, y: 0.5 },
  "blog-vinyl-vs-fiber-cement-siding": { src: `${P}/home-addition-exterior-lynnfield-ma-19.webp`, y: 0.33 },
  "blog-do-you-need-a-permit-to-remodel-massachusetts": { src: `${P}/home-addition-needham-ma-progress-05.webp`, y: 0.35 },
  "blog-window-replacement-cost-massachusetts": { src: `${P}/home-addition-exterior-lynnfield-ma-18.webp`, y: 0.5 },
  "blog-deck-cost-massachusetts": { src: `${P}/deck-salem-nh-02.webp`, y: 0.6 },
};
for (const [slug, { src, y }] of Object.entries(blogCrops)) {
  if (!wanted(slug)) continue;
  if (!fs.existsSync(src)) { console.warn("missing", src); continue; }
  await focusCrop(src, y, `public/og/${slug}.jpg`);
  console.log("og", slug);
}
// BLOG-OG-END

// Default brand card (text kept in sync with lib/site.ts serviceArea.short by hand)
if (wanted("og-default")) {
  const logo = await sharp("public/logo-header.png").resize({ width: 220 }).toBuffer();
  const lm = await sharp(logo).metadata();
  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#24215a"/><stop offset="1" stop-color="#2a7aa8"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="90" y="175" width="280" height="280" rx="28" fill="#ffffff"/>
  <rect y="${H - 12}" width="${W}" height="12" fill="#1f7a3a"/>
  <g font-family="Liberation Sans, DejaVu Sans, Arial, sans-serif" fill="#ffffff">
    <text x="420" y="232" font-size="60" font-weight="700">Waterfront Construction</text>
    <text x="420" y="282" font-size="31" fill="#d6e6f5">General Contractor · Northborough, MA</text>
    <rect x="420" y="306" width="250" height="50" rx="25" fill="#1f7a3a"/>
    <text x="545" y="339" font-size="23" font-weight="700" text-anchor="middle">Free Estimates</text>
    <text x="420" y="402" font-size="27">Kitchens · Baths · Additions · Decks · Siding · Windows</text>
    <text x="420" y="442" font-size="22" fill="#c4d8ea">Central &amp; Eastern Massachusetts · Southern New Hampshire</text>
    <text x="420" y="490" font-size="30" font-weight="700" fill="#8fd3f4">(508) 816-2726</text>
  </g>
</svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: Math.round(90 + (280 - lm.width) / 2), top: Math.round(175 + (280 - lm.height) / 2) }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile("public/og.jpg");
  console.log("og default");
}
