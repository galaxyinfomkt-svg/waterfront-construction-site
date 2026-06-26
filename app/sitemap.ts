import type { MetadataRoute } from "next";
import { services, cities, citySlug } from "@/lib/site";
import { posts } from "@/lib/posts";

const base = "https://waterfrontconstructionma.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = ["", "/services", "/gallery", "/service-areas", "/financing", "/about", "/reviews", "/blog", "/contact", "/privacy", "/terms"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    images: [`${base}${s.image}`],
  }));

  // Only indexable target cities in the sitemap (secondary cities are noindex)
  const cityPages: MetadataRoute.Sitemap = services.flatMap((s) =>
    cities.map((c) => ({
      url: `${base}/services/${s.slug}/${citySlug(c)}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: [`${base}${s.image}`],
    }))
  );

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
    images: [`${base}${p.image}`],
  }));

  return [...staticPages, ...servicePages, ...cityPages, ...blogPages];
}
