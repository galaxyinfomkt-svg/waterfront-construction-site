import { sitemapIds, sitemapEntries, indexXml, childUrl, newest, xmlResponse } from "@/app/sitemap/entries";

// /sitemap.xml — the sitemap index (audit 07 T02, study 01 §4.3): the one URL to submit in Google Search
// Console and Bing Webmaster Tools. It lists /sitemap/pages.xml, /sitemap/areas.xml (the city hubs) and one
// /sitemap/towns-{service}.xml per service, so each reports its own submitted/indexed counts. A child's <lastmod> is the newest <lastmod>
// inside it, so it moves only when a page in that child really changed. Rules: app/sitemap/entries.ts.

export const dynamic = "force-static";

export function GET() {
  const children = sitemapIds().map((id) => ({ loc: childUrl(id), lastmod: newest(sitemapEntries(id)!) }));
  return xmlResponse(indexXml(children));
}
