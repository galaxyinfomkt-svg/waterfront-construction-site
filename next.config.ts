import { redirectRules } from "./lib/redirects";
import type { NextConfig } from "next";

// ---------- response headers (audit 07 T12, T11; 09 AEO-H8) ----------
// Hygiene only (none of these is a ranking factor), chosen so nothing on the site can break:
// - Deliberately NOT set: Content-Security-Policy and X-Frame-Options. The LeadConnector (GHL) form iframe
//   and chat widget, Google Analytics and Microsoft Clarity all load third-party code; a CSP has to be
//   trialled as Content-Security-Policy-Report-Only first (see README → Security headers).
// - Not set: Strict-Transport-Security — Vercel already sends HSTS on its HTTPS domains.
// - Referrer-Policy repeats the browsers' default, so GA referral data and the GHL form are unaffected.
// - Permissions-Policy turns off camera, microphone and geolocation for the page and every iframe in it.
//   Nothing on the site uses them today; if a future GHL widget feature needs one, remove it from the list.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

// Static media in /public otherwise go out with "max-age=0". Long browser caching saves repeat downloads;
// a file whose content changes must get a NEW file name, or returning visitors keep the old one.
const cacheFor = (seconds: number) => [{ key: "Cache-Control", value: `public, max-age=${seconds}, stale-while-revalidate=86400` }];
const DAY = 86400;

const nextConfig: NextConfig = {
  poweredByHeader: false, // drop "X-Powered-By: Next.js"
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [55, 60, 75],
    minimumCacheTTL: 2678400, // 31 days
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Project photos and videos: file names change when the content does → 30 days.
      { source: "/images/:path*", headers: cacheFor(30 * DAY) },
      { source: "/videos/:path*", headers: cacheFor(30 * DAY) },
      // Social cards are regenerated in place by `npm run og` → 1 day.
      { source: "/og/:path*", headers: cacheFor(DAY) },
      { source: "/og.jpg", headers: cacheFor(DAY) },
      // The IndexNow key file (public/<32 hex>.txt) is for Bing/IndexNow only; keep it out of search results.
      { source: "/:key([0-9a-f]{32}).txt", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      // *.vercel.app copies of the site (production alias, previews) must never be indexed: only the custom
      // domain is canonical. Vercel adds this to preview deployments itself; this also covers the production
      // alias in case Deployment Protection is ever turned off.
      { source: "/:path*", has: [{ type: "host", value: ".*\\.vercel\\.app" }], headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
  async redirects() {
    return redirectRules();
  },
};

export default nextConfig;
