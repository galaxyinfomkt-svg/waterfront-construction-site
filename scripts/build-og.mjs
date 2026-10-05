// Builds the 1200×630 Open Graph images in public/og/ from REAL site photos, plus the
// default brand card public/og.jpg. Run after changing photos: node scripts/build-og.mjs
import sharp from "sharp";
import fs from "node:fs";

const W = 1200, H = 630;
fs.mkdirSync("public/og", { recursive: true });

// slug → source photo (real Waterfront Construction project photos only)
const crops = {
  "service-siding": "public/images/projects/home-addition-exterior-lynnfield-ma-19.webp",
  "service-kitchen-bathroom-remodeling": "public/images/projects/kitchen-remodel-mansfield-ma-01.webp",
  "service-decks": "public/images/projects/deck-salem-nh-02.webp",
  "service-windows-and-doors": "public/images/projects/home-addition-exterior-lynnfield-ma-18.webp",
  "service-home-additions-remodeling": "public/images/projects/home-addition-exterior-lynnfield-ma-12.webp",
  "project-kitchen-remodel-mansfield-ma": "public/images/projects/kitchen-remodel-mansfield-ma-01.webp",
  "project-bathroom-remodels": "public/images/projects/bathroom-remodels-03.webp",
  "project-pool-deck-salem-nh": "public/images/projects/deck-salem-nh-06.webp",
  "project-home-addition-needham-ma": "public/images/projects/home-addition-needham-ma-07.webp",
  "project-home-addition-exterior-lynnfield-ma": "public/images/projects/home-addition-exterior-lynnfield-ma-12.webp",
  "project-home-addition-lynnfield-ma": "public/images/projects/home-addition-lynnfield-ma-06.webp",
  "project-exterior-remodel-siding-deck": "public/images/projects/exterior-remodel-siding-deck-ma-01.webp",
};

for (const [slug, src] of Object.entries(crops)) {
  if (!fs.existsSync(src)) { console.warn("missing", src); continue; }
  await sharp(src).resize(W, H, { fit: "cover", position: "centre" }).jpeg({ quality: 82, mozjpeg: true }).toFile(`public/og/${slug}.jpg`);
  console.log("og", slug);
}

// Default brand card (text kept in sync with lib/site.ts serviceArea.short by hand)
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
    <text x="420" y="282" font-size="31" fill="#d6e6f5">Remodeling Contractor · Northborough, MA</text>
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
