import { SITE_URL } from "@/lib/seo";
import { site, services } from "@/lib/site";
import { posts, CATEGORIES } from "@/lib/posts";
import { projects, mediaCount } from "@/lib/projects";
import { faqGroups } from "@/lib/faq";
import { ENTITY, NAME_NOTE, keyFacts, serviceAreaLines, testimonialsLine, lastUpdated, link, day, textResponse } from "./content";

// /llms.txt — a short, link-first map of the site for AI tools (https://llmstxt.org): H1, a blockquote
// summary, then sections of links with one-line notes. The long form is /llms-full.txt.
// Generated from the page data at build time (see ./content.ts for the rules).

export const dynamic = "force-static";

export function GET() {
  const L: string[] = [
    `# ${site.name}`,
    "",
    `> ${ENTITY}`,
    "",
    NAME_NOTE,
    "",
    `Every fact below is published on the linked pages of ${SITE_URL}. Last updated: ${lastUpdated()}.`,
    "",
    "## Key facts",
    ...keyFacts(),
    "",
    "## Service area",
    ...serviceAreaLines(),
    "",
    "## Services",
    ...services.map((s) => `- ${link(s.short, `/services/${s.slug}`)}: ${s.blurb} ${s.timeline}`),
    `- ${link("All six services", "/services")}`,
    "",
    "## Project case studies",
    ...projects.map((p) => `- ${link(p.title, `/projects/${p.slug}`)}: ${p.location}; ${mediaCount(p)}. ${p.blurb}`),
    `- ${link("All projects, with photos by category", "/gallery")}`,
    "",
    ...CATEGORIES.flatMap((cat) => {
      const inCat = posts.filter((p) => p.category === cat.name);
      return inCat.length
        ? [`## ${cat.name}`, ...inCat.map((p) => `- ${link(p.title, `/blog/${p.slug}`)}: ${p.excerpt} (updated ${day(p.modified)})`), ""]
        : [];
    }),
    "## Questions homeowners ask before hiring",
    ...faqGroups.flatMap((g) => g.items.map((f) => `- ${link(f.q, `/faq#${f.id}`)}`)),
    "",
    "## Company, reviews and contact",
    `- ${link("About the company", "/about")}`,
    `- ${link(`${site.owner}, owner`, "/about/ernando-nunes")}`,
    `- ${link("Client testimonials", "/reviews")}: ${testimonialsLine()}`,
    `- ${link("Google Business Profile", site.gbp)}: our public Google reviews`,
    `- ${link("Contact and free estimate", "/contact")}: ${site.phone}, ${site.email}, ${site.hours}`,
    `- ${link("Facebook", site.facebook)}`,
    `- ${link("Instagram", site.instagram)}`,
    "",
    "## Optional",
    `- ${link("Full text version", "/llms-full.txt")}: service details, answers to common questions, guide summaries and case-study notes in one file`,
    `- ${link("Sitemap index", "/sitemap.xml")}`,
    `- ${link("Privacy policy", "/privacy")}`,
    `- ${link("Terms of use", "/terms")}`,
    "",
  ];
  return textResponse(L.join("\n"));
}
