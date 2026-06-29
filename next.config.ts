import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [68, 75],
    minimumCacheTTL: 2678400, // 31 days
  },
  async redirects() {
    const merged: [string, string][] = [
      ["kitchen-remodeling", "kitchen-bathroom-remodeling"],
      ["bathroom-remodeling", "kitchen-bathroom-remodeling"],
      ["home-additions", "home-additions-remodeling"],
      ["home-remodeling", "home-additions-remodeling"],
    ];
    const removed = ["trim-and-carpentry", "repairs"];

    const rules = [];
    for (const [from, to] of merged) {
      rules.push({ source: `/services/${from}`, destination: `/services/${to}`, permanent: true });
      rules.push({ source: `/services/${from}/:city`, destination: `/services/${to}/:city`, permanent: true });
    }
    for (const from of removed) {
      rules.push({ source: `/services/${from}`, destination: "/services", permanent: true });
      rules.push({ source: `/services/${from}/:city`, destination: "/services", permanent: true });
    }
    // Financing page removed — owner does not offer financing.
    rules.push({ source: "/financing", destination: "/contact", permanent: true });
    return rules;
  },
};

export default nextConfig;
