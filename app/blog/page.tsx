import Image from "next/image";
import Link from "next/link";
import { posts } from "@/lib/posts";

export const metadata = { title: "Blog | Home Remodeling Tips | Waterfront Construction", description: "Remodeling tips, project ideas and homeowner guides from a licensed MetroWest contractor." };

export default function BlogPage() {
  return (
    <>
      <section className="bg-brand-grad text-white">
        <div className="container-x py-16 md:py-20">
          <span className="eyebrow text-cyan">Tips & ideas</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold">The Waterfront blog</h1>
          <p className="mt-4 text-white/85 text-lg max-w-2xl">Practical advice for homeowners — remodeling ideas, project planning, and how to protect and grow your home's value.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-x grid md:grid-cols-3 gap-7">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group card overflow-hidden hover:-translate-y-1.5 transition">
              <div className="relative h-48"><Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition duration-500" /></div>
              <div className="p-5">
                <span className="text-xs text-blue font-semibold uppercase tracking-wider">{p.date}</span>
                <h2 className="font-bold text-lg text-navy mt-1.5 leading-snug">{p.title}</h2>
                <p className="text-sm text-ink/65 mt-2 line-clamp-3">{p.excerpt}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-blue">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
