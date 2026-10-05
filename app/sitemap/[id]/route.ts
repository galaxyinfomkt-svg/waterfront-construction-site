import { sitemapIds, sitemapEntries, urlsetXml, xmlResponse } from "../entries";

// /sitemap/{id}.xml — one child sitemap of the index at /sitemap.xml (see ../entries.ts for the rules).
// Prerendered at build time for every id; any other id is a 404.

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return sitemapIds().map((id) => ({ id: `${id}.xml` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entries = id.endsWith(".xml") ? sitemapEntries(id.slice(0, -4)) : undefined;
  if (!entries) return new Response("Not found", { status: 404 });
  return xmlResponse(urlsetXml(entries));
}
