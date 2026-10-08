import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, ArrowLabel } from "@/components/chrome-icons";
import EstimateForm from "@/components/EstimateForm";
import FormBand from "@/components/FormBand";
import CtaRow from "@/components/CtaRow";
import { EstimateLink } from "@/components/chrome-client";
import { site, services } from "@/lib/site";
import { projects } from "@/lib/projects";
import { posts } from "@/lib/posts";
import { hasCsl } from "@/lib/credentials";
import { pageMeta } from "@/lib/seo";
import { pageGraph, webPageNode, breadcrumbNode, ownerNode, OWNER_ID, OWNER_PAGE, type Crumb } from "@/lib/schema";
import { projectCardImage } from "@/lib/service-content";

// /about/ernando-nunes — the ONE owner entity page (ProfilePage, Person @id = OWNER_ID). It is the author /
// reviewer URL used by the blog and the founder of the business node (audit 08 §5.10, 09 AEO-H2, 04 B-03).
// Every statement is a fact from lib/site.ts or the documented projects. His trade history, languages,
// training and photo are owner input: they render only once supplied (site.ownerPhoto, site.csl,
// site.ownerProfiles) — never a stock photo or a placeholder.

const PUBLISHED = "2026-10-05T10:00:09-04:00"; // page created
const UPDATED = "2026-10-08T16:20:00-04:00"; // lead: general contractor (bump only on a substantive edit of this profile)
const updatedLabel = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(UPDATED));

const NAME = site.owner;
// ONE role string everywhere (V2.3): <title>, og/twitter title, the visible role line, ProfilePage.name and the
// Person.jobTitle all come from lib/schema.ts ownerNode().jobTitle ("Owner & Lead Builder").
const ROLE = String(ownerNode().jobTitle);
const LEAD = `${NAME} is the owner of ${site.name}, a general contractor based in Northborough, Massachusetts. He founded the company in ${site.founded} and has ${site.experience}+ years of hands-on construction experience.`;

export const metadata = pageMeta({
  title: `${NAME}, ${ROLE} | Waterfront Construction`, // keeps the company in the title (61 chars)
  absoluteTitle: true,
  description: `${NAME} founded ${site.name} in Northborough, MA, in ${site.founded} and has ${site.experience}+ years of hands-on construction experience.`,
  path: OWNER_PAGE,
});

const crumbs: Crumb[] = [{ name: "Home", path: "/" }, { name: "About", path: "/about" }, { name: NAME, path: OWNER_PAGE }];

const ld = pageGraph(
  [
    webPageNode({
      path: OWNER_PAGE, type: "ProfilePage", name: `${NAME}, ${ROLE}`, description: LEAD,
      about: { "@id": OWNER_ID }, mainEntity: { "@id": OWNER_ID }, datePublished: PUBLISHED, dateModified: UPDATED,
    }),
    breadcrumbNode(crumbs),
  ],
  { owner: true },
);


// Projects grid: rows of four, then rows of three (7 case studies = 4 + 3, design spec §6 Owner). A .grid-center row:
// each card sets its own --cols at lg, and a short row (2 per row from sm) is centered.
const projectSpan = (i: number, n: number) => (i < (n % 3 === 1 ? 4 : n % 3 === 2 ? 8 : 0) ? "lg:[--cols:4]" : "lg:[--cols:3]");

export default function OwnerPage() {
  const guides = posts.slice(0, 12);
  return (
    <>
      <JsonLd data={ld} />

      {/* HERO — centered text on the left (7/12), the portrait centered above the H1; the bare estimate form (the page's
          ONE EstimateForm) in the right 5/12 from lg, after the hero text on phones. */}
      <section className="page-head" data-cta-zone>
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-7 min-w-0">
            <Breadcrumbs items={crumbs} />
            <div className="mt-5 flex flex-col items-center gap-6">
              {site.ownerPhoto && (
                <div className="relative w-40 md:w-52 aspect-[4/5] overflow-hidden bg-well">
                  <Image src={site.ownerPhoto} alt={`${NAME}, owner of ${site.name}`} fill sizes="208px" quality={60} className="object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-h1 text-navy">{NAME}</h1>
                <p className="mt-4 eyebrow">{ROLE}, {site.name}</p>
              </div>
            </div>
            <p className="mt-6 text-lead text-ink/80 max-w-[34em] mx-auto">{LEAD}</p>
            <p className="mt-5 text-[13px] text-muted">Profile updated <time dateTime={UPDATED}>{updatedLabel}</time></p>
          </div>
          <EstimateForm className="lg:col-span-5 self-start min-w-0" />
        </div>
      </section>

      <section className="section" aria-labelledby="profile-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 items-start">
          <div>
            <h2 id="profile-h" className="text-h2 text-navy">Profile</h2>
            {/* .facts (globals.css): label over value, centered. */}
            <dl className="facts mt-8">
              <div><dt className="eyebrow">Name</dt><dd>{NAME}</dd></div>
              <div><dt className="eyebrow">Role</dt><dd>{ROLE}</dd></div>
              <div><dt className="eyebrow">Company</dt><dd><Link href="/about" className="link">{site.name}</Link></dd></div>
              <div><dt className="eyebrow">Founded the company</dt><dd>{site.founded}, in Northborough, MA</dd></div>
              <div><dt className="eyebrow">Experience</dt><dd>{site.experience}+ years of hands-on residential construction experience</dd></div>
              {hasCsl && (<div><dt className="eyebrow">License</dt><dd>Massachusetts Construction Supervisor License {site.csl}</dd></div>)}
              <div><dt className="eyebrow">Based in</dt><dd>Northborough, Massachusetts (Worcester County)</dd></div>
              <div>
                <dt className="eyebrow">Phone</dt>
                <dd><a href={site.phoneHref} className="link tel">{site.phone}</a></dd>
              </div>
              <div>
                <dt className="eyebrow">Email</dt>
                <dd className="[overflow-wrap:anywhere]"><a href={site.emailHref} className="link">{site.email}</a></dd>
              </div>
            </dl>
            {site.ownerProfiles.length > 0 && (
              <div className="mt-10">
                <h3 className="text-h3s text-navy">Find {NAME} online</h3>
                <ul className="mt-3 flex flex-wrap justify-center gap-x-8 gap-y-1">
                  {site.ownerProfiles.map((href) => (
                    <li key={href}><a href={href} target="_blank" rel="noopener" className="link-arrow"><ArrowLabel text={new URL(href).hostname.replace(/^www\./, "")} external /></a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-h2 text-navy">The company he leads</h2>
            <p className="mt-8 text-lead text-ink/80 max-w-[34em] mx-auto">
              {`${site.name} has completed ${site.projectsCompleted}+ projects in ${site.townsWithProjects}+ towns in Massachusetts and southern New Hampshire. It is owner-led, and every project starts with a free, itemized estimate.`}
            </p>
            <h3 className="mt-10 text-h3s text-navy">Services</h3>
            <ul className="mt-4 rule-list grid sm:grid-cols-2 gap-x-8 sm:border-t-0 sm:[&>li:nth-child(-n+2)]:border-t sm:[&>li:nth-child(-n+2)]:border-line">
              {services.map((s) => (
                <li key={s.slug}><Link href={`/services/${s.slug}`} className="link-nav flex items-center justify-center min-h-12 py-2">{s.short}</Link></li>
              ))}
            </ul>
            <CtaRow className="mt-10" />
          </div>
        </div>
      </section>

      <section className="section bg-stone" aria-labelledby="projects-h">
        <div className="container-x">
          <div className="section-head">
            <h2 id="projects-h" className="text-h2 text-navy">Projects documented on this site</h2>
            <p>{`${projects.length} case studies documented with our own photos and site videos.`}</p>
          </div>
          <ul className="grid-center sm:[--cols:2] gap-y-12">
            {projects.map((p, i) => {
              const img = projectCardImage(p);
              return (
                <li key={p.slug} className={`card-ed group ${projectSpan(i, projects.length)}`}>
                  <div className="media">
                    <Image src={img.src} alt={img.alt} fill quality={60} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <p className="meta"><span>{p.location}</span></p>
                  <h3 className="text-h3s"><Link href={`/projects/${p.slug}`}>{p.title}</Link></h3>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* MID-PAGE ESTIMATE FORM — paper between the stone case studies and the stone guides list */}
      <FormBand tone="paper" />

      {guides.length > 0 && (
        <section className="section bg-stone" aria-labelledby="guides-h">
          <div className="container-x">
            <h2 id="guides-h" className="text-h2 text-navy">Homeowner guides on our blog</h2>
            <ul className="mt-10 rule-list max-w-[48rem] mx-auto">
              {guides.map((g) => (
                <li key={g.slug}><Link href={`/blog/${g.slug}`} className="link-nav block py-3.5 text-[17px]">{g.title}</Link></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section bg-navy text-white on-dark" data-cta-zone>
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em] mx-auto text-balance">Talk to us about your project</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[34em] mx-auto">Free, no-obligation estimates. <span className="whitespace-nowrap">{site.hours}</span>.</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-3">
            <EstimateLink className="btn btn-primary w-full sm:w-auto">Get a free estimate</EstimateLink>
            <a href={site.phoneHref} className="btn btn-on-dark tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
