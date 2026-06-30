import { site, services, cities } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";
import { posts } from "@/lib/posts";

export const dynamic = "force-static";

// llms.txt — a concise, curated summary for AI answer/generative engines (GEO).
// https://llmstxt.org
export function GET() {
  const body = `# Waterfront Construction Inc

> Licensed, insured, owner-led home remodeling and general contractor based in Northborough, Massachusetts, serving MetroWest and Worcester County since ${site.founded}. Free, no-obligation estimates.

## Key facts
- Business: Waterfront Construction Inc
- Owner / lead builder: Ernando Nunes (${site.experience}+ years of construction experience)
- Location: 44 Bearfoot Road, Northborough, MA 01532
- Phone: ${site.phone}
- Email: ${site.email}
- Hours: Monday–Saturday, 7am–6pm
- Status: Licensed & insured · in business since ${site.founded}
- Free, no-obligation, itemized estimates; reply within one business day.

## Services
${services.map((s) => `- [${s.name}](${SITE_URL}/services/${s.slug}): ${s.blurb}`).join("\n")}

## Service area
Based in Northborough, MA, serving homeowners within ~30 miles across MetroWest & Worcester County, including: ${cities.slice(0, 30).join(", ")}, and more.

## Resources
${posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`).join("\n")}

## Contact
- Free estimate: ${SITE_URL}/contact
- Call: ${site.phone}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
