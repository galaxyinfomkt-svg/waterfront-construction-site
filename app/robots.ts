import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Search engines and AI answer engines are all welcome. Named groups don't inherit the
  // "*" group, so each bot gets an explicit allow (and nothing else is disallowed).
  const aiBots = [
    "Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "Perplexity-User",
    "Claude-SearchBot", "Claude-User", "ClaudeBot", "Applebot", "Applebot-Extended", "Google-Extended",
    "DuckAssistBot", "Amazonbot", "Meta-ExternalAgent", "CCBot",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
