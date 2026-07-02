import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { projects, getProject, projectImages } from "@/lib/projects";
import { site } from "@/lib/site";
import { SITE_URL } from "@/lib/seo";
import { pageMeta } from "@/lib/seo";
import { graph, breadcrumb, BUSINESS_ID } from "@/lib/schema";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return pageMeta({
    title: `${p.category} in ${p.location} — Project`,
    description: `${p.blurb} See real photos and video from Waterfront Construction, a licensed, insured contractor serving ${p.location} and MetroWest.`,
    path: `/projects/${p.slug}`,
    image: p.cover,
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const others = projects.filter((x) => x.slug !== p.slug);

  const ld = graph([
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Gallery", path: "/gallery" },
      { name: p.shortTitle, path: `/projects/${p.slug}` },
    ]),
    {
      "@type": "ImageGallery",
      name: p.title,
      description: p.blurb,
      url: `${SITE_URL}/projects/${p.slug}`,
      image: projectImages(p).slice(0, 12).map((src) => `${SITE_URL}${src}`),
      about: { "@id": BUSINESS_ID },
      locationCreated: { "@type": "Place", name: p.location },
    },
  ]);

  return (
    <>
      <JsonLd data={ld} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <Image src={p.cover} alt={`${p.category} in ${p.location} by Waterfront Construction`} fill priority quality={70} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative container-x py-20 md:py-24 text-white">
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-cyan">Home</Link><span>›</span>
            <Link href="/gallery" className="hover:text-cyan">Gallery</Link><span>›</span>
            <span className="text-white">{p.shortTitle}</span>
          </div>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-1.5 text-sm backdrop-blur">📍 {p.location} · {p.category}</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold max-w-3xl">{p.title}</h1>
          <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl">{p.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-green text-base">Start Your Project →</Link>
            <a href={site.phoneHref} className="btn btn-outline text-base">📞 {site.phone}</a>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-14">
        <div className="container-x max-w-3xl">
          <Reveal>
            <span className="eyebrow">Project overview</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">{p.category} in {p.location}</h2>
            {p.body.map((para, i) => <p key={i} className="mt-4 text-ink/75 text-lg leading-relaxed">{para}</p>)}
          </Reveal>
        </div>
      </section>

      {/* PHOTOS */}
      {(p.photos.length > 0 || p.stages?.length) && (
        <section className="py-14 bg-navy text-white">
          <div className="container-x">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto">
                <span className="eyebrow text-cyan">Photos</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">The project in photos</h2>
                <p className="mt-3 text-white/70">Click any photo to view it larger.</p>
              </div>
            </Reveal>
            {p.stages ? (
              p.stages.map((st) => (
                <Reveal key={st.label}>
                  <h3 className="mt-10 mb-5 text-center text-sm font-bold text-cyan uppercase tracking-[0.2em]">{st.label}</h3>
                  <Gallery images={st.photos} alt={`${p.category} in ${p.location} — ${st.label}`} />
                </Reveal>
              ))
            ) : (
              <Reveal><div className="mt-10"><Gallery images={p.photos} alt={`${p.category} in ${p.location} by Waterfront Construction`} /></div></Reveal>
            )}
          </div>
        </section>
      )}

      {/* VIDEOS */}
      {p.videos.length > 0 && (
        <section className="py-14">
          <div className="container-x">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto">
                <span className="eyebrow">Video walkthrough</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-navy">See the project in motion</h2>
                <p className="mt-3 text-ink/65">Tap play on any clip.</p>
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {p.videos.map((v, i) => (
                <Reveal key={v.src} delay={(i % 3) * 80}>
                  <video
                    controls
                    muted
                    playsInline
                    preload="none"
                    poster={v.poster}
                    className="w-full aspect-[9/16] rounded-xl bg-navy object-cover shadow-card"
                  >
                    <source src={v.src} type="video/mp4" />
                  </video>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy">
        <Image src={p.cover} alt="" fill className="object-cover opacity-25" />
        <div className="relative container-x py-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold">Want results like this on your home?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">Get a free, no-obligation estimate. We reply within one business day.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-green text-base">Get a Free Estimate</Link>
            <a href={site.phoneHref} className="btn btn-white text-base">📞 {site.phone}</a>
          </div>
        </div>
      </section>

      {/* OTHER PROJECTS */}
      {others.length > 0 && (
        <section className="py-14 bg-tint-blue">
          <div className="container-x">
            <h2 className="text-2xl font-extrabold text-navy mb-6">More projects</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {others.map((o) => (
                <Link key={o.slug} href={`/projects/${o.slug}`} className="group card overflow-hidden pop block">
                  <div className="relative h-52"><Image src={o.cover} alt={o.title} fill className="object-cover zoomimg" /></div>
                  <div className="p-5">
                    <span className="text-xs text-blue font-semibold uppercase tracking-wider">📍 {o.location}</span>
                    <h3 className="font-bold text-navy text-lg mt-1">{o.shortTitle}</h3>
                    <span className="text-sm text-blue font-semibold">View project →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
