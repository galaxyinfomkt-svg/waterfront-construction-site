import type { MetadataRoute } from "next";
import { services, allCities, citySlug } from "@/lib/site";
import { posts } from "@/lib/posts";

const base = "https://waterfront-site.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = ["", "/services", "/about", "/reviews", "/blog", "/contact"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = services.flatMap((s) =>
    allCities.map((c) => ({
      url: `${base}/services/${s.slug}/${citySlug(c)}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...servicePages, ...cityPages, ...blogPages];
}
