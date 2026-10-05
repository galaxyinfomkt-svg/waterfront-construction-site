// Site chrome. Server components (no client JS) except the pieces imported from chrome-client.tsx:
// the header's menu, the desktop floating call button and the scroll-to-form estimate link
// (audit 07 T08, 01 M1). Footer year is rendered on the server, so it can never mismatch on hydration.
import Link from "next/link";
import Image from "next/image";
import { site, nav, services, serviceArea } from "@/lib/site";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import { displayAddress } from "@/lib/address";
import { HeaderClient, FloatingCall, EstimateLink } from "./chrome-client";
import { PhoneIcon, MailIcon } from "./chrome-icons";

// Registration/license numbers render only once the owner supplies them — never a placeholder.
const credentials = hasHic || hasCsl ? credentialLine({ insured: false }) : "";

export function TopBar() {
  return (
    // Solid navy: white 13px text at 13.6:1 (the old animated gradient fell to 3.9:1 and repainted every frame; 10 M5, 07 T06).
    <div role="region" aria-label="Contact details" className="bg-navy text-white text-[13px]">
      <div className="container-x flex h-10 items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <a href={site.phoneHref} className="inline-flex items-center gap-1.5 py-2.5 -my-2.5 font-semibold hover:text-cyan">
            <PhoneIcon /><span>{site.phone}</span>
          </a>
          <a href={site.emailHref} className="hidden sm:inline-flex items-center gap-1.5 py-2.5 -my-2.5 hover:text-cyan">
            <MailIcon /><span>{site.email}</span>
          </a>
        </div>
        <p className="hidden md:block text-white/85 truncate">
          {credentials ? `${credentials} · ` : ""}Owner-led · Free estimates · {site.hours}
        </p>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <HeaderClient
      nav={nav}
      services={services.map((s) => ({ slug: s.slug, name: s.name, short: s.short }))}
      phone={site.phone}
      phoneHref={site.phoneHref}
      brand={site.name}
    />
  );
}

export function FloatingCTA() {
  return (
    <>
      <FloatingCall phone={site.phone} phoneHref={site.phoneHref} />
      {/* Mobile bottom bar (hidden while the mobile menu is open, see html.menu-open in globals.css) */}
      <nav aria-label="Quick contact" className="mobile-cta-bar md:hidden fixed bottom-0 inset-x-0 z-50 grid grid-cols-2 gap-px bg-white/10 pb-[env(safe-area-inset-bottom)]">
        <a href={site.phoneHref} className="flex items-center justify-center gap-2 min-h-14 font-bold text-white bg-navy"><PhoneIcon /> Call now</a>
        <EstimateLink className="flex items-center justify-center min-h-14 font-bold text-white bg-[#1f7a3a]">Free estimate</EstimateLink>
      </nav>
    </>
  );
}

const footerLinks = [
  { label: "Projects", href: "/gallery" },
  { label: "Service areas", href: "/service-areas" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
  { label: `Owner: ${site.owner}`, href: "/about/ernando-nunes" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
];

export function SiteFooter() {
  const year = new Date().getFullYear(); // server-rendered at build time
  return (
    <footer className="bg-navy text-white/85 pt-16 pb-28">
      <div className="container-x grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" aria-label={`${site.name}, home`} className="bg-white rounded-xl p-3 inline-block hover:opacity-90 transition">
            <Image src="/logo-header.png" alt={site.name} width={497} height={349} sizes="92px" className="h-16 w-auto" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed">
            Owner-led home remodeling contractor based in Northborough, MA, since {site.founded}. From the foundation to the final finish.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={site.facebook} target="_blank" rel="noopener" aria-label="Waterfront Construction on Facebook"
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-blue grid place-items-center transition">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg>
            </a>
            <a href={site.instagram} target="_blank" rel="noopener" aria-label="Waterfront Construction on Instagram"
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-blue grid place-items-center transition">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08Zm6.95-9.22a1.28 1.28 0 1 1-2.55 0 1.28 1.28 0 0 1 2.55 0Z"/></svg>
            </a>
          </div>
        </div>

        {/* Footer column labels are <p>, not headings, so they never break a page's heading outline (10 L1). */}
        <nav aria-label="Services">
          <p className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Services</p>
          <ul className="text-sm">
            {services.map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className="block py-1.5 hover:text-cyan">{s.short}</Link></li>
            ))}
            <li><Link href="/services" className="block py-1.5 text-cyan font-semibold hover:text-white">All services</Link></li>
          </ul>
        </nav>

        <div>
          <p className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Contact</p>
          <address className="not-italic text-sm space-y-2">
            <p className="font-semibold text-white">{site.name}</p>
            <p>{displayAddress}</p>
            <p><a href={site.phoneHref} className="hover:text-cyan font-semibold">{site.phone}</a></p>
            <p><a href={site.emailHref} className="hover:text-cyan break-all">{site.email}</a></p>
            <p>Hours: {site.hours}</p>
          </address>
        </div>

        <div>
          <p className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Service area</p>
          <p className="text-sm leading-relaxed">
            Based in {serviceArea.base}. We take projects across {serviceArea.short}.
          </p>
          <Link href="/service-areas" className="mt-3 inline-block py-1.5 text-cyan font-semibold text-sm hover:text-white">Service areas: every town we serve</Link>
        </div>
      </div>

      <nav aria-label="Site" className="container-x mt-10">
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
          {footerLinks.map((l) => (
            <li key={l.href}><Link href={l.href} className="inline-block py-1.5 hover:text-cyan">{l.label}</Link></li>
          ))}
        </ul>
      </nav>

      <div className="container-x mt-6 pt-6 border-t border-white/15 text-xs text-white/80 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2 text-center">
        <span>© {year} {site.name}. All rights reserved.</span>
        {credentials && <span>{credentials}</span>}
        <span>Website by <a href="https://galaxyinfo.us" target="_blank" rel="nofollow noopener" className="font-semibold text-cyan hover:text-white transition">galaxyinfo.us</a></span>
      </div>
    </footer>
  );
}
