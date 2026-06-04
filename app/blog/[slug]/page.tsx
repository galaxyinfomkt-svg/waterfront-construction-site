import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "@/lib/posts";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.title} | Waterfront Construction`, description: p.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) notFound();

  return (
    <>
      <section className="relative">
        <Image src={p.image} alt={p.title} fill priority className="object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative container-x py-20 text-white">
          <Link href="/blog" className="text-cyan text-sm font-semibold">← Back to blog</Link>
          <span className="block mt-3 text-cyan text-sm font-semibold uppercase tracking-wider">{p.date}</span>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold max-w-3xl">{p.title}</h1>
        </div>
      </section>
      <article className="py-14">
        <div className="container-x max-w-3xl">
          {p.body.map((para, i) => (
            <p key={i} className="text-ink/80 text-[17px] leading-relaxed mb-5">{para}</p>
          ))}
          <div className="mt-8 card p-6 bg-sand text-center">
            <h3 className="text-xl font-bold text-navy">Ready to start your project?</h3>
            <p className="text-ink/65 mt-1">Get a free, no-obligation estimate today.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn btn-green">Free Estimate</Link>
              <a href={site.phoneHref} className="btn btn-navy">📞 {site.phone}</a>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
