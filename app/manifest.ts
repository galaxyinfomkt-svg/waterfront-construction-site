import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Waterfront Construction Inc",
    short_name: "Waterfront",
    description: "Remodeling & construction in Northborough, MA & MetroWest.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#24215a",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
