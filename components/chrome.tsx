"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { site, nav, cities, services } from "@/lib/site";

export function TopBar() {
  return (
    <div className="bg-animated text-white text-[13px]">
      <div className="container-x flex h-10 items-center justify-between">
        <div className="flex items-center gap-4">
          <a href={site.phoneHref} className="flex items-center gap-1.5 hover:text-cyan transition font-semibold">
            <span>📞</span><span>{site.phone}</span>
          </a>
          <a href={site.emailHref} className="hidden sm:flex items-center gap-1.5 hover:text-cyan transition">
            <span>✉️</span><span>{site.email}</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-0.5">⭐ 5.0 Rated · Licensed & Insured</span>
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
      <div className="container-x flex h-[96px] md:h-[104px] items-center justify-between gap-4">
        <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 shrink-0" aria-label={`${site.name} — back to top`}>
          <Image src="/logo.png" alt={site.name} width={300} height={100} className="h-16 md:h-[78px] lg:h-[54px] xl:h-[72px] w-auto" priority />
        </Link>
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 font-semibold text-[14px] xl:text-[15px] text-ink/80">
          {nav.map((n) =>
            n.label === "Services" ? (
              <div key={n.href} className="relative group/svc">
                <Link href={n.href} className="navpill font-semibold flex items-center gap-1">
                  {n.label}<span className="text-[10px] mt-0.5">▼</span>
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible translate-y-1 group-hover/svc:opacity-100 group-hover/svc:visible group-hover/svc:translate-y-0 transition-all duration-200">
                  <div className="w-72 card p-2 shadow-card">
                    {services.map((s) => (
                      <Link key={s.slug} href={`/services/${s.slug}`}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-sand text-[14px] text-ink/80 hover:text-navy">
                        <span className="text-base">{s.icon}</span>{s.short}
                      </Link>
                    ))}
                    <Link href="/services" className="block text-center mt-1 px-3 py-2 rounded-lg bg-sand text-blue font-bold text-sm">View all services →</Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link key={n.href} href={n.href} className="navpill font-semibold">{n.label}</Link>
            )
          )}
        </nav>
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a href={site.phoneHref} className="hidden xl:flex items-center gap-2 font-bold text-navy hover:text-blue transition whitespace-nowrap">
            <span className="w-9 h-9 rounded-full bg-grad-green text-white grid place-items-center text-sm">📞</span>{site.phone}
          </a>
          <Link href="/contact" className="btn btn-grad text-sm whitespace-nowrap">Free Estimate</Link>
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="lg:hidden p-2.5 -mr-2 text-navy" aria-label="Open menu">
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-navy transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>
      <div className="h-[3px] bg-grad-sunset" />
      {open && (
        <div className="lg:hidden border-t border-sand bg-white">
          <div className="container-x py-4 flex flex-col gap-1">
            {nav.map((n) =>
              n.label === "Services" ? (
                <div key={n.href} className="border-b border-sand py-1">
                  <Link href={n.href} onClick={() => setOpen(false)} className="block py-2 font-semibold text-navy">Services</Link>
                  <div className="grid grid-cols-2 gap-x-3 pb-2">
                    {services.map((s) => (
                      <Link key={s.slug} href={`/services/${s.slug}`} onClick={() => setOpen(false)}
                        className="py-1.5 text-sm text-ink/70 flex items-center gap-1.5"><span>{s.icon}</span>{s.name}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                  className="py-2.5 font-semibold text-ink/80 border-b border-sand">{n.label}</Link>
              )
            )}
            <a href={site.phoneHref} className="btn btn-navy mt-3">📞 {site.phone}</a>
            <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-green mt-2">Get a Free Estimate</Link>
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
        className="hidden md:flex fixed bottom-6 right-6 z-50 btn btn-green pulse text-base shadow-lg px-7 py-4">
        📞 Call {site.phone}
      </a>
      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 grid grid-cols-2 gap-px bg-white/10">
        <a href={site.phoneHref} className="py-4 text-center font-bold text-white bg-navy">📞 Call Now</a>
        <Link href="/contact" className="py-4 text-center font-bold text-white bg-[#1f7a3a]">Free Estimate</Link>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white/80 pt-16 pb-28 md:pb-12">
      <div className="container-x grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to home top" className="bg-white rounded-xl p-3 inline-block hover:opacity-90 transition">
            <Image src="/logo.png" alt={site.name} width={210} height={70} className="h-16 w-auto" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed">Licensed home builder & remodeler serving Central Massachusetts since {site.founded}. From foundation to final finish.</p>
          <div className="mt-5 flex gap-3">
            <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook"
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-blue grid place-items-center transition hover:-translate-y-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg>
            </a>
            <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram"
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-grad-green grid place-items-center transition hover:-translate-y-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08Zm6.95-9.22a1.28 1.28 0 1 1-2.55 0 1.28 1.28 0 0 1 2.55 0Z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Services</h3>
          <ul className="space-y-1.5 text-sm">
            {services.slice(0, 7).map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className="hover:text-cyan">{s.name}</Link></li>
            ))}
            <li><Link href="/services" className="text-cyan font-semibold">All services →</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li><a href={site.phoneHref} className="hover:text-cyan font-semibold">{site.phone}</a></li>
            <li><a href={site.emailHref} className="hover:text-cyan break-all">{site.email}</a></li>
            <li>{site.address}</li>
            <li className="text-white/60">{site.hours}</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Service Area (30 mi)</h3>
          <p className="text-[13px] leading-relaxed">{cities.join(" · ")} & surrounding MetroWest / Worcester County.</p>
        </div>
      </div>
      <div className="container-x mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        <Link href="/gallery" className="hover:text-cyan">Gallery</Link>
        <Link href="/financing" className="hover:text-cyan">Financing</Link>
        <Link href="/service-areas" className="hover:text-cyan">Service Areas</Link>
        <Link href="/blog" className="hover:text-cyan">Blog</Link>
        <Link href="/privacy" className="hover:text-cyan">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-cyan">Terms</Link>
      </div>
      <div className="container-x mt-6 pt-6 border-t border-white/15 text-xs text-white/75 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
        <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
        <span>MA Home Improvement Contractor · Licensed &amp; Insured</span>
        <span>Website by <a href="https://galaxyinfo.us" target="_blank" rel="noopener" className="font-semibold text-cyan hover:text-white transition">galaxyinfo.us</a></span>
      </div>
    </footer>
  );
}
