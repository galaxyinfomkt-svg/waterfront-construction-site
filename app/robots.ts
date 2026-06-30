import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Explicitly welcome search + answer/generative engines (GEO 2026):
  // Google AI Overviews, ChatGPT, Perplexity, Claude, Apple, etc.
  const aiBots = [
    "GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User",
    "ClaudeBot", "Claude-User", "Claude-SearchBot", "Google-Extended", "Applebot-Extended",
    "Bingbot", "Amazonbot", "CCBot", "Meta-ExternalAgent",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: "https://waterfrontconstructionma.com/sitemap.xml",
    host: "https://waterfrontconstructionma.com",
  };
}
