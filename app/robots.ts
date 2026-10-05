import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { sitemapIds, childUrl } from "@/app/sitemap/entries";

// robots.txt (audit 07 T11, 09 AEO-M4). Search engines and AI answer engines are all welcome.
// - Under RFC 9309 a crawler obeys ONLY the most specific group that names it, and named groups do not
//   inherit the "*" group. Every group therefore gets the same RULE object: any Disallow added later must go
//   into RULE (never into one group only), or the named bots below would silently ignore it.
// - Never disallow a noindex URL (/thank-you, the 404): crawlers must fetch it to see the noindex.
// - OAI-SearchBot must stay allowed for ChatGPT search; Google-Extended (a control token, not a crawler)
//   governs grounding in Gemini. No Content-Signal or "noai" directives.
const RULE: { allow: string | string[]; disallow?: string | string[] } = { allow: "/" };

const NAMED_BOTS = [
  // search engines
  "Googlebot", "Bingbot", "Applebot", "DuckAssistBot",
  // AI search and assistants (answer-time fetches and their indexes)
  "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "Claude-SearchBot", "Claude-User",
  // AI training and product-use tokens
  "GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "Amazonbot", "Meta-ExternalAgent", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", ...RULE }, ...NAMED_BOTS.map((userAgent) => ({ userAgent, ...RULE }))],
    // The index first (the URL submitted to Search Console and Bing), then each child sitemap it lists.
    sitemap: [`${SITE_URL}/sitemap.xml`, ...sitemapIds().map(childUrl)],
  };
}
