"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { site, nav, cities, services } from "@/lib/site";

export function TopBar() {
  return (
    <div className="bg-navy text-white text-[13px]">
      <div className="container-x flex h-9 items-center justify-between">
        <div className="flex items-center gap-4">
          <a href={site.phoneHref} className="flex items-center gap-1.5 hover:text-cyan transition">
            <span>📞</span><span className="font-semibold">{site.phone}</span>
          </a>
          <a href={site.emailHref} className="hidden sm:flex items-center gap-1.5 hover:text-cyan transition">
            <span>✉️</span><span>{site.email}</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-white/70">{site.hours}</span>
          <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="hover:text-cyan transition">Facebook</a>
          <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="hover:text-cyan transition">Instagram</a>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`sticky top-0 z-50 transition ${solid ? "bg-white shadow-[0_6px_24px_-14px_rgba(20,20,43,.4)]" : "bg-white/95 backdrop-blur"}`}>
      <div className="container-x flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={site.name}>
          <Image src="/logo.png" alt={site.name} width={170} height={56} className="h-11 w-auto" priority />
        </Link>
        <nav className="hidden lg:flex items-center gap-8 font-semibold text-[15px] text-ink/80">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="link-underline hover:text-navy transition">{n.label}</Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <a href={site.phoneHref} className="font-bold text-navy">{site.phone}</a>
          <Link href="/contact" className="btn btn-green text-sm">Free Estimate</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-navy" aria-label="Menu">
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-sand bg-white">
          <div className="container-x py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="py-2.5 font-semibold text-ink/80 border-b border-sand">{n.label}</Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-green mt-3">Get a Free Estimate</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function FloatingCTA() {
  return (
    <>
      {/* Desktop floating call */}
      <a href={site.phoneHref}
        className="hidden md:flex fixed bottom-6 right-6 z-50 btn btn-green pulse text-base shadow-lg">
        📞 Call {site.phone}
      </a>
      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 grid grid-cols-2 gap-px bg-navy">
        <a href={site.phoneHref} className="py-3.5 text-center font-bold text-white">📞 Call Now</a>
        <Link href="/contact" className="py-3.5 text-center font-bold text-white bg-green">Free Estimate</Link>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white/80 pt-16 pb-28 md:pb-12">
      <div className="container-x grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl p-3 inline-block">
            <Image src="/logo.png" alt={site.name} width={170} height={56} className="h-11 w-auto" />
          </div>
          <p className="mt-4 text-sm leading-relaxed">Licensed home builder & remodeler serving Central Massachusetts since {site.founded}. From foundation to final finish.</p>
          <div className="mt-4 flex gap-3 text-sm">
            <a href={site.facebook} target="_blank" rel="noopener" className="hover:text-cyan">Facebook</a>
            <a href={site.instagram} target="_blank" rel="noopener" className="hover:text-cyan">Instagram</a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Services</h4>
          <ul className="space-y-1.5 text-sm">
            {services.slice(0, 7).map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className="hover:text-cyan">{s.name}</Link></li>
            ))}
            <li><Link href="/services" className="text-cyan font-semibold">All services →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li><a href={site.phoneHref} className="hover:text-cyan font-semibold">{site.phone}</a></li>
            <li><a href={site.emailHref} className="hover:text-cyan break-all">{site.email}</a></li>
            <li>{site.address}</li>
            <li className="text-white/60">{site.hours}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Service Area (30 mi)</h4>
          <p className="text-[13px] leading-relaxed">{cities.join(" · ")} & surrounding MetroWest / Worcester County.</p>
        </div>
      </div>
      <div className="container-x mt-10 pt-6 border-t border-white/15 text-xs text-white/55 flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
        <span>MA Home Improvement Contractor · Licensed & Insured</span>
      </div>
    </footer>
  );
}
