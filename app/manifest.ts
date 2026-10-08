import type { MetadataRoute } from "next";
import { site, serviceArea } from "@/lib/site";

// Same entity wording as the rest of the site (audit 01 H2/M8). `display` is left at the default
// ("browser"): the site ships no 192/512 px or maskable icons, so it does not claim to be installable (07 T17).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.shortName,
    short_name: "Waterfront",
    description: `Owner-led general contractor in Northborough, MA, serving ${serviceArea.short}.`,
    id: "/",
    start_url: "/",
    lang: "en-US",
    background_color: "#ffffff",
    theme_color: "#24215a",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
