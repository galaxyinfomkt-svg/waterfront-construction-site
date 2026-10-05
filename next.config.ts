import { redirectRules } from "./lib/redirects";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [55, 60, 75],
    minimumCacheTTL: 2678400, // 31 days
  },
  async redirects() {
    return redirectRules();
  },
};

export default nextConfig;
