import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "@/lib/posts";
import { site } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { graph, breadcrumb, articleSchema } from "@/lib/schema";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.excerpt, path: `/blog/${p.slug}`, image: `https://waterfrontconstructionma.com${p.image}` });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) notFound();
  const related = posts.filter((x) => x.slug !== slug).slice(0, 2);
  const ld = graph([
    breadcrumb([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: p.title, path: `/blog/${p.slug}` }]),
    articleSchema(p),
  ]);

  return (
    <>
      <JsonLd data={ld} />
      {/* HERO */}
      <section className="relative">
        <Image src={p.image} alt={p.title} fill priority className="object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative container-x py-20 md:py-24 text-white max-w-4xl">
          <Link href="/blog" className="text-cyan text-sm font-semibold">← Back to blog</Link>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="bg-green px-3 py-1 rounded-full font-bold">{p.category}</span>
            <span className="text-white/80">{p.date}</span>
            <span className="text-white/60">·</span>
            <span className="text-white/80">{p.read}</span>
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold leading-tight">{p.title}</h1>
        </div>
      </section>

      {/* BODY */}
      <article className="py-14">
        <div className="container-x grid lg:grid-cols-[1fr_300px] gap-12">
          <div className="max-w-3xl">
            <div className="prose">
              <p className="lead dropcap">{p.lead}</p>
              {p.sections.map((s, i) => (
                <div key={i}>
                  {s.h && <h2>{s.h}</h2>}
                  {s.p?.map((para, j) => <p key={j}>{para}</p>)}
                  {s.ul && <ul>{s.ul.map((li, j) => <li key={j}>{li}</li>)}</ul>}
                  {s.quote && <blockquote>{s.quote}</blockquote>}
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-brand-grad text-white p-7 text-center">
              <h3 className="text-2xl font-extrabold text-white">Ready to start your project?</h3>
              <p className="text-white/85 mt-1">Free, no-obligation estimate — we reply within one business day.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link href="/contact" className="btn btn-white">Get a Free Estimate</Link>
                <a href={site.phoneHref} className="btn btn-green">📞 {site.phone}</a>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="card p-6 sticky top-28">
              <div className="bg-white rounded-lg inline-block">
                <Image src="/logo-solid.png" alt={site.name} width={170} height={56} className="h-12 w-auto" />
              </div>
              <h3 className="font-extrabold text-navy mt-4 text-lg">Talk to a local builder</h3>
              <p className="text-sm text-ink/65 mt-1">Licensed & insured · serving Northborough & MetroWest.</p>
              <a href={site.phoneHref} className="btn btn-navy w-full mt-4">📞 {site.phone}</a>
              <Link href="/contact" className="btn btn-green w-full mt-2">Free Estimate</Link>
            </div>
          </aside>
        </div>
      </article>

      {/* RELATED */}
      <section className="py-14 bg-sand">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold text-navy mb-6">Keep reading</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="group card overflow-hidden hover:-translate-y-1.5 transition flex">
                <div className="relative w-32 shrink-0"><Image src={r.image} alt={r.title} fill className="object-cover" /></div>
                <div className="p-4">
                  <span className="text-xs font-bold text-blue uppercase">{r.category}</span>
                  <h3 className="font-bold text-navy leading-snug mt-1">{r.title}</h3>
                  <span className="text-sm text-blue font-semibold mt-1 inline-block">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
