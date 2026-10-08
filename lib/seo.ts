import type { Metadata } from "next";

export const SITE_URL = "https://waterfrontconstructionma.com";
export const SITE_NAME = "Waterfront Construction";
export const OG_IMAGE = { url: `${SITE_URL}/og.jpg`, width: 1200, height: 630, alt: "Waterfront Construction — owner-led general contractor in Northborough, MA" };

export type OgImage = { url: string; width: number; height: number; alt: string };

type MetaArgs = {
  title: string;
  description: string;
  path: string;
  image?: OgImage; // must carry its TRUE pixel size (use ogFor() for site images)
  absoluteTitle?: boolean;
  noindex?: boolean;
  article?: { published: string; modified: string; section?: string; tags?: string[] };
};

const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);

export function pageMeta({ title, description, path, image = OG_IMAGE, absoluteTitle = false, noindex = false, article }: MetaArgs): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  // The brand suffix is added only when the whole title still fits ~60 chars; otherwise Google would
  // truncate it anyway, so the page's own keywords keep the visible space.
  const withBrand = `${title} | ${SITE_NAME}`;
  if (!absoluteTitle && withBrand.length > 60) absoluteTitle = true;
  const fullTitle = absoluteTitle ? title : withBrand;
  const img = { ...image, url: abs(image.url) };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [img],
      ...(article
        ? { type: "article", publishedTime: article.published, modifiedTime: article.modified, authors: [`${SITE_URL}/about`], section: article.section, tags: article.tags }
        : { type: "website" }),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [{ url: img.url, alt: img.alt }] },
  };
}

// Pre-cropped 1200×630 social images generated from real site photos (public/og/*.jpg).
export function ogFor(slug: string, alt: string): OgImage {
  return { url: `${SITE_URL}/og/${slug}.jpg`, width: 1200, height: 630, alt };
}
