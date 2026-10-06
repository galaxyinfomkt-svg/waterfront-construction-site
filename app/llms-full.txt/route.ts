import { SITE_URL } from "@/lib/seo";
import { site, services, testimonials, serviceArea } from "@/lib/site";
import { posts, CATEGORIES } from "@/lib/posts";
import { projects, mediaCount } from "@/lib/projects";
import { faqGroups } from "@/lib/faq";
import { getContent, CVV_CREDIT, CVV_LABEL, SOURCES, usd } from "@/lib/service-content";
import { ENTITY, NAME_NOTE, keyFacts, serviceAreaLines, lastUpdated, link, absLinks, day, abs, textResponse } from "@/app/llms.txt/content";

// /llms-full.txt — the long form of /llms.txt (audit 09 AEO-M1, optional): the text that the service hubs,
// the FAQ, the case studies and the guides publish, in one Markdown file. It is built from the same data
// modules as those pages, so every sentence here is also visible on the linked page. One section per service
// hub. The service×town pages (one per service and place) and the city hubs are not copied; their URL patterns
// are given instead (serviceAreaLines). Target size: under 100 KB.

export const dynamic = "force-static";

const sources = (list: { label: string; url: string }[]) => (list.length ? [`Sources: ${list.map((s) => link(s.label, s.url)).join("; ")}`] : []);

/** FAQs per hub in this file: the full hubs ran the file past its 100 KB budget, so each hub section is trimmed to
 *  its summary, its "At a glance" box and its first FAQs (spec §9.2); every line is still visible on the hub. */
const HUB_FAQS = 5;

function serviceSection(s: (typeof services)[number]): string[] {
  const c = getContent(s.slug);
  const path = `/services/${s.slug}`;
  // The hub's "At a glance" box (app/services/[slug]/page.tsx `glance`; keep in step). The cost row names each
  // benchmark with its credit line, as the hub's cost section does, instead of pointing at a table "below".
  const glance = c
    ? [
        `- Typical timeline: ${s.timeline}`,
        `- Permit in Massachusetts: ${c.permitShort}`,
        c.cost.benchmark?.length
          ? `- Cost benchmark: ${c.cost.benchmark.map((b) => `${b.short}: ${usd(b.jobCost)}`).join(" · ")} (${CVV_LABEL}, Remodeling Cost vs. Value; averages for standard projects, not our prices). Source: ${link(SOURCES.cvv.label, SOURCES.cvv.url)}. ${CVV_CREDIT}`
          : `- Cost benchmark: Priced per project after a free site visit (what drives the cost: ${abs(`${path}#cost`)}).`,
        `- Where we work: ${serviceArea.short}, from our base in Northborough, MA.`,
      ]
    : [`- Typical timeline: ${s.timeline}`];
  return [
    `### ${s.short}`,
    `Page: ${abs(path)} (updated ${day(s.updated)})`,
    "",
    c?.summary ?? s.blurb,
    "",
    "At a glance:",
    ...glance,
    ...(c
      ? [
          "",
          `Questions and answers (the first ${HUB_FAQS} of ${c.faqs.length}; all of them, the cost drivers, permits and process are on the page):`,
          ...c.faqs.slice(0, HUB_FAQS).flatMap((f) => [`- Q: ${f.q}`, `  A: ${absLinks(f.a, path)}${f.more ? ` More: ${link(f.more.label, f.more.href.startsWith("#") ? `${path}${f.more.href}` : f.more.href)}` : ""}`]),
        ]
      : []),
    "",
  ];
}

function projectSection(p: (typeof projects)[number]): string[] {
  const hubs = p.services.map((slug) => services.find((s) => s.slug === slug)).filter((s): s is (typeof services)[number] => Boolean(s));
  const facts = [
    p.completed ? `Completed: ${p.completed}` : "",
    p.durationWeeks ? `Duration: about ${p.durationWeeks} weeks` : "",
    p.materials?.length ? `Materials: ${p.materials.join(", ")}` : "",
  ].filter(Boolean);
  return [
    `### ${p.title}`,
    `Page: ${abs(`/projects/${p.slug}`)} (updated ${day(p.updated)}) · Location: ${p.location} · ${mediaCount(p)}`,
    `Services: ${hubs.map((s) => link(s.short, `/services/${s.slug}`)).join("; ")}`,
    ...facts,
    "",
    p.blurb,
    "",
    `${p.scopeHeading}:`,
    ...p.scope.map((x) => `- ${x}`),
    ...(p.notes.length ? ["", "About these photos:", ...p.notes.map((x) => `- ${x}`)] : []),
    ...(p.videos.length ? ["", "Videos:", ...p.videos.map((v) => `- ${v.title}: ${v.description}`)] : []),
    "",
  ];
}

function guideSection(p: (typeof posts)[number]): string[] {
  return [
    `### ${p.title}`,
    // Same authorship as the post pages (byline, meta author, JSON-LD author = the business; V3.4).
    `Page: ${abs(`/blog/${p.slug}`)} · Published by ${site.name} on ${day(p.published)} · Updated ${day(p.modified)}`,
    "",
    absLinks(p.answer, `/blog/${p.slug}`),
    ...(p.faqs.length ? ["", "Questions and answers:", ...p.faqs.flatMap((f) => [`- Q: ${f.q}`, `  A: ${absLinks(f.a, `/blog/${p.slug}`)}`])] : []),
    ...(p.sources.length ? ["", ...sources(p.sources)] : []),
    "",
  ];
}

export function GET() {
  const L: string[] = [
    `# ${site.name}: full reference`,
    "",
    `> ${ENTITY}`,
    "",
    NAME_NOTE,
    "",
    `This is the long version of ${abs("/llms.txt")}. Every statement is published on the linked page of ${SITE_URL}. Last updated: ${lastUpdated()}.`,
    "",
    "## Key facts",
    ...keyFacts(),
    "",
    "## Service area",
    ...serviceAreaLines(),
    "",
    "## Services",
    "",
    ...services.flatMap(serviceSection),
    "## Questions homeowners ask before hiring",
    `These answers are published on ${abs("/faq")}.`,
    "",
    ...faqGroups.flatMap((g) => [
      `### ${g.title}`,
      ...g.items.flatMap((f) => [
        `- Q: ${f.q}`,
        `  A: ${f.a}`,
        ...(f.links?.length ? [`  Related: ${f.links.map((l) => link(l.label, l.href)).join("; ")}`] : []),
        ...(f.sources?.length ? [`  ${sources(f.sources)[0]}`] : []),
      ]),
      "",
    ]),
    "## Project case studies",
    // Wording matches the gallery: not every case study has photos taken during the work (V3.6).
    `${projects.length} case studies documented with our own photos and site videos, town level only. All of them: ${abs("/gallery")}.`,
    "",
    ...projects.flatMap(projectSection),
    "## Guides",
    `Published by ${site.name}. Cost figures in these guides are regional averages from the cited reports, not quotes.`,
    "",
    ...CATEGORIES.flatMap((cat) => posts.filter((p) => p.category === cat.name).flatMap(guideSection)),
    "## Client testimonials",
    `Shared with permission by our clients and quoted as written (${abs("/reviews")}). Public Google reviews: ${site.gbp}`,
    "",
    ...testimonials.map((t) => `- "${t.text}" — ${t.name}, ${t.town} (${t.date})`),
    "",
    "## Contact",
    `- Phone: ${site.phone} (${site.hours})`,
    `- Email: ${site.email}`,
    `- Free estimate: ${abs("/contact#estimate")}`,
    "",
  ];
  return textResponse(L.join("\n"));
}
