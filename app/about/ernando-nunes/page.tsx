import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PhoneIcon } from "@/components/chrome-icons";
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
  title: `${NAME}, ${ROLE}`,
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

export default function OwnerPage() {
  const guides = posts.slice(0, 12);
  return (
    <>
      <JsonLd data={ld} />

      <section className="bg-brand-grad text-white" data-cta-zone>
        <div className="container-x py-14 md:py-20">
          <Breadcrumbs items={crumbs} />
          <div className="mt-6 grid md:grid-cols-[auto_1fr] gap-8 items-center">
            {site.ownerPhoto && (
              <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden ring-4 ring-white/30">
                <Image src={site.ownerPhoto} alt={`${NAME}, owner of ${site.name}`} fill sizes="208px" quality={60} className="object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold">{NAME}</h1>
              <p className="mt-2 text-lg md:text-xl font-semibold text-cyan">{ROLE}, {site.name}</p>
            </div>
          </div>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed">{LEAD}</p>
          <p className="mt-4 text-sm text-white/80">Profile updated <time dateTime={UPDATED}>{updatedLabel}</time></p>
        </div>
      </section>

      <section className="py-16 md:py-20" aria-labelledby="profile-h">
        <div className="container-x grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div>
            <h2 id="profile-h" className="text-3xl md:text-4xl font-extrabold text-navy">Profile</h2>
            <dl className="mt-6 grid sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-2.5 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5 text-[15px]">
              <dt className="font-bold text-navy">Name</dt><dd className="text-ink/85">{NAME}</dd>
              <dt className="font-bold text-navy">Role</dt><dd className="text-ink/85">{ROLE}</dd>
              <dt className="font-bold text-navy">Company</dt><dd className="text-ink/85"><Link href="/about" className="font-semibold text-blue underline underline-offset-2">{site.name}</Link></dd>
              <dt className="font-bold text-navy">Founded the company</dt><dd className="text-ink/85">{site.founded}, in Northborough, MA</dd>
              <dt className="font-bold text-navy">Experience</dt><dd className="text-ink/85">{site.experience}+ years of hands-on residential construction experience</dd>
              {hasCsl && (<><dt className="font-bold text-navy">License</dt><dd className="text-ink/85">Massachusetts Construction Supervisor License {site.csl}</dd></>)}
              <dt className="font-bold text-navy">Based in</dt><dd className="text-ink/85">Northborough, Massachusetts (Worcester County)</dd>
              <dt className="font-bold text-navy">Phone</dt>
              <dd className="text-ink/85"><a href={site.phoneHref} className="font-semibold text-blue underline underline-offset-2">{site.phone}</a></dd>
              <dt className="font-bold text-navy">Email</dt>
              <dd className="text-ink/85 [overflow-wrap:anywhere]"><a href={site.emailHref} className="text-blue underline underline-offset-2">{site.email}</a></dd>
            </dl>
            {site.ownerProfiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-navy">Find {NAME} online</h3>
                <ul className="mt-2 flex flex-wrap gap-3 text-sm">
                  {site.ownerProfiles.map((href) => (
                    <li key={href}><a href={href} target="_blank" rel="noopener" className="font-semibold text-blue underline underline-offset-2">{new URL(href).hostname.replace(/^www\./, "")}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy">The company he leads</h2>
            <p className="mt-4 text-ink/85 text-lg leading-relaxed">
              {`${site.name} has completed ${site.projectsCompleted}+ projects in ${site.townsWithProjects}+ towns in Massachusetts and southern New Hampshire. It is owner-led, and every project starts with a free, itemized estimate.`}
            </p>
            <h3 className="mt-6 font-bold text-navy">Services</h3>
            <ul className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {services.map((s) => (
                <li key={s.slug}><Link href={`/services/${s.slug}`} className="inline-block py-1.5 font-semibold text-blue underline underline-offset-2">{s.short}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-tint-blue" aria-labelledby="projects-h">
        <div className="container-x">
          <h2 id="projects-h" className="text-3xl md:text-4xl font-extrabold text-navy">Projects documented on this site</h2>
          <p className="mt-3 text-ink/80 max-w-2xl">{`${projects.length} case studies documented with our own photos and site videos.`}</p>
          <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => {
              const img = projectCardImage(p);
              return (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className="group card overflow-hidden pop block h-full">
                    <span className="relative block h-48 overflow-hidden">
                      <Image src={img.src} alt={img.alt} fill quality={60} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover zoomimg" />
                    </span>
                    <span className="block p-5">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-blue">{p.location}</span>
                      <span className="block mt-1 font-bold text-navy leading-tight">{p.title}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {guides.length > 0 && (
        <section className="py-16 md:py-20" aria-labelledby="guides-h">
          <div className="container-x">
            <h2 id="guides-h" className="text-3xl md:text-4xl font-extrabold text-navy">Homeowner guides on our blog</h2>
            <ul className="mt-6 grid md:grid-cols-2 gap-x-8 gap-y-2">
              {guides.map((g) => (
                <li key={g.slug}><Link href={`/blog/${g.slug}`} className="inline-block py-1.5 font-semibold text-blue underline underline-offset-2 hover:text-navy">{g.title}</Link></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-brand-grad text-white" data-cta-zone>
        <div className="container-x py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold">Talk to us about your project</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Free, no-obligation estimates. {site.hours}.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact#estimate" className="btn btn-white text-base">Get a free estimate</Link>
            <a href={site.phoneHref} className="btn btn-green text-base"><PhoneIcon /> {site.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
