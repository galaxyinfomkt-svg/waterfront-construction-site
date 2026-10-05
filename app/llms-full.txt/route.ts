import { SITE_URL } from "@/lib/seo";
import { site, services, testimonials } from "@/lib/site";
import { posts, CATEGORIES } from "@/lib/posts";
import { projects, mediaCount } from "@/lib/projects";
import { faqGroups } from "@/lib/faq";
import { getContent, CVV_CREDIT, CVV_LABEL, SOURCES, usd } from "@/lib/service-content";
import { ENTITY, NAME_NOTE, keyFacts, serviceAreaLines, lastUpdated, link, absLinks, day, abs, textResponse } from "@/app/llms.txt/content";

// /llms-full.txt — the long form of /llms.txt (audit 09 AEO-M1, optional): the text that the service hubs,
// the FAQ, the case studies and the guides publish, in one Markdown file. It is built from the same data
// modules as those pages, so every sentence here is also visible on the linked page. The 1,188
// service×town pages are not copied; their URL pattern is given instead. Target size: under 100 KB.

export const dynamic = "force-static";

const sources = (list: { label: string; url: string }[]) => (list.length ? [`Sources: ${list.map((s) => link(s.label, s.url)).join("; ")}`] : []);

function serviceSection(s: (typeof services)[number]): string[] {
  const c = getContent(s.slug);
  const path = `/services/${s.slug}`;
  const guides = c ? posts.filter((p) => c.cost.guides.includes(p.slug) || c.guides.includes(p.slug)) : [];
  return [
    `### ${s.short}`,
    `Page: ${abs(path)} (updated ${day(s.updated)})`,
    "",
    c?.summary ?? s.blurb,
    "",
    "What's included:",
    ...s.features.map((f) => `- ${f}`),
    "",
    `Typical timeline: ${s.timeline}`,
    ...(c
      ? [
          "",
          `Cost: ${absLinks(c.cost.answer, path)}`,
          ...(c.cost.benchmark?.length
            ? [
                `Regional benchmark (Remodeling 2025 Cost vs. Value report, ${CVV_LABEL}; averages for standard projects, not our prices):`,
                ...c.cost.benchmark.map((b) => `- ${b.project}: ${usd(b.jobCost)} average job cost, ${b.recouped}% recouped at resale. Scope: ${b.scope}.`),
                `Source: ${link(SOURCES.cvv.label, SOURCES.cvv.url)}. ${CVV_CREDIT}`,
              ]
            : []),
          "",
          `Permit in Massachusetts: ${c.permitShort}`,
          `New Hampshire: ${c.permits.nh}`,
          "",
          "Questions and answers:",
          ...c.faqs.flatMap((f) => [`- Q: ${f.q}`, `  A: ${absLinks(f.a, path)}${f.more ? ` More: ${link(f.more.label, f.more.href.startsWith("#") ? `${path}${f.more.href}` : f.more.href)}` : ""}`]),
          ...(guides.length ? ["", `Guides: ${guides.map((p) => link(p.title, `/blog/${p.slug}`)).join("; ")}`] : []),
          ...(c.sources.length ? ["", ...sources(c.sources)] : []),
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
    `Page: ${abs(`/blog/${p.slug}`)} · By ${site.owner}, owner · Published ${day(p.published)} · Updated ${day(p.modified)}`,
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
    `Documented jobs with photos from the job, town level only. All of them: ${abs("/gallery")}.`,
    "",
    ...projects.flatMap(projectSection),
    "## Guides",
    `Written by ${site.owner}. Cost figures in these guides are regional averages from the cited reports, not quotes.`,
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
