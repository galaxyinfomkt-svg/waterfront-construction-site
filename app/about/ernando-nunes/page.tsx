import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon, ArrowLabel } from "@/components/chrome-icons";
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
const UPDATED = PUBLISHED; // bump only on a substantive edit of this profile
const updatedLabel = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(UPDATED));

const NAME = site.owner;
// ONE role string everywhere (V2.3): <title>, og/twitter title, the visible role line, ProfilePage.name and the
// Person.jobTitle all come from lib/schema.ts ownerNode().jobTitle ("Owner & Lead Builder").
const ROLE = String(ownerNode().jobTitle);
const LEAD = `${NAME} is the owner of ${site.name}, a home remodeling contractor based in Northborough, Massachusetts. He founded the company in ${site.founded} and has ${site.experience}+ years of hands-on construction experience.`;

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

// Facts dl (§4.28): each dt/dd pair on its own hairline row.
const FACT = "grid sm:grid-cols-[10rem_1fr] lg:grid-cols-[13rem_1fr] gap-x-6 gap-y-1 py-3.5 border-b border-line";
const FACT_DD = "text-[15.5px] text-ink";
// Projects grid: rows of four, then rows of three (7 case studies = 4 + 3, design spec §6 Owner).
const projectSpan = (i: number, n: number) => (i < (n % 3 === 1 ? 4 : n % 3 === 2 ? 8 : 0) ? "lg:col-span-3" : "lg:col-span-4");

export default function OwnerPage() {
  const guides = posts.slice(0, 12);
  return (
    <>
      <JsonLd data={ld} />

      <section className="page-head" data-cta-zone>
        <div className="container-x pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="max-w-[46rem]">
            <Breadcrumbs items={crumbs} />
            <div className="mt-5 grid md:grid-cols-[auto_1fr] gap-8 items-center">
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
            <p className="mt-6 text-lead text-ink/80 max-w-[36em]">{LEAD}</p>
            <p className="mt-5 text-[13px] text-muted">Profile updated <time dateTime={UPDATED}>{updatedLabel}</time></p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="profile-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 items-start">
          <div>
            <h2 id="profile-h" className="text-h2 text-navy">Profile</h2>
            <dl className="mt-8 border-t border-line">
              <div className={FACT}><dt className="eyebrow pt-0.5">Name</dt><dd className={FACT_DD}>{NAME}</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Role</dt><dd className={FACT_DD}>{ROLE}</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Company</dt><dd className={FACT_DD}><Link href="/about" className="link">{site.name}</Link></dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Founded the company</dt><dd className={FACT_DD}>{site.founded}, in Northborough, MA</dd></div>
              <div className={FACT}><dt className="eyebrow pt-0.5">Experience</dt><dd className={FACT_DD}>{site.experience}+ years of hands-on residential construction experience</dd></div>
              {hasCsl && (<div className={FACT}><dt className="eyebrow pt-0.5">License</dt><dd className={FACT_DD}>Massachusetts Construction Supervisor License {site.csl}</dd></div>)}
              <div className={FACT}><dt className="eyebrow pt-0.5">Based in</dt><dd className={FACT_DD}>Northborough, Massachusetts (Worcester County)</dd></div>
              <div className={FACT}>
                <dt className="eyebrow pt-0.5">Phone</dt>
                <dd className={FACT_DD}><a href={site.phoneHref} className="link tel">{site.phone}</a></dd>
              </div>
              <div className={FACT}>
                <dt className="eyebrow pt-0.5">Email</dt>
                <dd className={`${FACT_DD} [overflow-wrap:anywhere]`}><a href={site.emailHref} className="link">{site.email}</a></dd>
              </div>
            </dl>
            {site.ownerProfiles.length > 0 && (
              <div className="mt-10">
                <h3 className="text-h3s text-navy">Find {NAME} online</h3>
                <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-1">
                  {site.ownerProfiles.map((href) => (
                    <li key={href}><a href={href} target="_blank" rel="noopener" className="link-arrow"><ArrowLabel text={new URL(href).hostname.replace(/^www\./, "")} external /></a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-h2 text-navy">The company he leads</h2>
            <p className="mt-8 text-lead text-ink/80 max-w-[36em]">
              {`${site.name} has completed ${site.projectsCompleted}+ projects in ${site.townsWithProjects}+ towns in Massachusetts and southern New Hampshire. It is owner-led, and every project starts with a free, itemized estimate.`}
            </p>
            <h3 className="mt-10 text-h3s text-navy">Services</h3>
            <ul className="mt-4 rule-list grid sm:grid-cols-2 gap-x-8 sm:border-t-0 sm:[&>li:nth-child(-n+2)]:border-t sm:[&>li:nth-child(-n+2)]:border-line">
              {services.map((s) => (
                <li key={s.slug}><Link href={`/services/${s.slug}`} className="link-nav flex items-center min-h-12 py-2">{s.short}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-stone" aria-labelledby="projects-h">
        <div className="container-x">
          <div className="section-head">
            <h2 id="projects-h" className="text-h2 text-navy">Projects documented on this site</h2>
            <p>{`${projects.length} case studies documented with our own photos and site videos.`}</p>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
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

      {guides.length > 0 && (
        <section className="section" aria-labelledby="guides-h">
          <div className="container-x">
            <h2 id="guides-h" className="text-h2 text-navy">Homeowner guides on our blog</h2>
            <ul className="mt-10 rule-list max-w-[48rem]">
              {guides.map((g) => (
                <li key={g.slug}><Link href={`/blog/${g.slug}`} className="link-nav block py-3.5 text-[17px]">{g.title}</Link></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section bg-navy text-white on-dark" data-cta-zone>
        <div className="container-x">
          <h2 className="text-h2 text-white max-w-[18em]">Talk to us about your project</h2>
          <p className="mt-5 text-lead text-white/80 max-w-[36em]">Free, no-obligation estimates. {site.hours}.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/contact#estimate" className="btn btn-primary w-full sm:w-auto">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-on-dark tel w-full sm:w-auto"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
