import type { Metadata } from "next";

export const SITE_URL = "https://waterfront-site.vercel.app";
export const OG_IMAGE = `${SITE_URL}/images/hero.jpg`;
export const GEO = { lat: 42.3195, lng: -71.6412 }; // Northborough, MA

type MetaArgs = { title: string; description: string; path: string; image?: string; absoluteTitle?: boolean };

export function pageMeta({ title, description, path, image = OG_IMAGE, absoluteTitle = false }: MetaArgs): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: absoluteTitle ? title : `${title} | Waterfront Construction Inc`,
      description, url, siteName: "Waterfront Construction Inc",
      type: "website", locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: "Waterfront Construction Inc" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
