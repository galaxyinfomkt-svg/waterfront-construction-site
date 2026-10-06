// Site chrome. Server components (no client JS) except the pieces imported from chrome-client.tsx:
// the header's menu, the desktop floating call button and the scroll-to-form estimate link
// (audit 07 T08, 01 M1). Footer year is rendered on the server, so it can never mismatch on hydration.
import Link from "next/link";
import Image from "next/image";
import { site, nav, services, serviceArea } from "@/lib/site";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import { displayAddress } from "@/lib/address";
import { HeaderClient, FloatingCall, EstimateLink, EstimateJumps } from "./chrome-client";
import { PhoneIcon, MailIcon, FileTextIcon, FacebookIcon, InstagramIcon, ArrowLabel } from "./chrome-icons";

// Registration/license numbers render only once the owner supplies them — never a placeholder.
const credentials = hasHic || hasCsl ? credentialLine({ insured: false }) : "";

export function TopBar() {
  return (
    // Solid navy, md+ only (phones get the fixed call/estimate bar instead). White 13px text at 14.6:1.
    <div role="region" aria-label="Contact details" className="hidden md:block bg-navy text-white text-[13px]">
      <div className="container-x flex h-9 items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <a href={site.phoneHref} className="inline-flex items-center gap-2 min-h-9 font-medium tel hover:underline underline-offset-4">
            <PhoneIcon className="w-3.5 h-3.5" /><span>{site.phone}</span>
          </a>
          <a href={site.emailHref} className="hidden sm:inline-flex items-center gap-2 min-h-9 hover:underline underline-offset-4">
            <MailIcon className="w-3.5 h-3.5" /><span>{site.email}</span>
          </a>
        </div>
        <p className="hidden md:block text-white/80 truncate">
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
      <EstimateJumps />
      {/* Mobile bottom bar (hidden while the mobile menu is open, see html.menu-open in globals.css) */}
      <nav aria-label="Quick contact" className="mobile-cta-bar lg:hidden fixed bottom-0 inset-x-0 z-50 grid grid-cols-2 bg-navy border-t border-white/14 pb-[env(safe-area-inset-bottom)]">
        <a href={site.phoneHref} className="flex items-center justify-center gap-2 min-h-14 text-[15px] font-semibold text-white bg-navy"><PhoneIcon className="w-5 h-5" /> Call now</a>
        <EstimateLink className="flex items-center justify-center gap-2 min-h-14 text-[15px] font-semibold text-white bg-green hover:bg-green-hover"><FileTextIcon className="w-5 h-5" />Free estimate</EstimateLink>
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
  const link = "block py-1.5 text-[14.5px] text-ink hover:underline underline-offset-4";
  const social = "w-11 h-11 rounded-full border border-line-strong text-navy grid place-items-center hover:bg-navy hover:text-white hover:border-navy transition-colors";
  return (
    // Light footer (stone). pb-28 below lg keeps the legal row clear of the fixed mobile call/estimate bar.
    <footer className="bg-stone text-ink border-t border-line pt-[72px] pb-28 lg:pb-12">
      {/* Two columns until xl: at lg (1024) four columns leave the Contact column ~190px, which breaks the email
          and wraps every service name. From xl each column is ≥230px. */}
      <div className="container-x grid gap-12 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label={`${site.name}, home`} className="inline-block">
            <Image src="/logo-header.png" alt={site.name} width={497} height={349} sizes="92px" className="h-14 w-auto" />
          </Link>
          <p className="mt-5 text-sm text-muted max-w-[34ch]">
            Owner-led home remodeling contractor based in Northborough, MA, since {site.founded}. From the foundation to the final finish.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={site.facebook} target="_blank" rel="noopener" aria-label="Waterfront Construction on Facebook" className={social}>
              <FacebookIcon className="w-[18px] h-[18px]" />
            </a>
            <a href={site.instagram} target="_blank" rel="noopener" aria-label="Waterfront Construction on Instagram" className={social}>
              <InstagramIcon className="w-[18px] h-[18px]" />
            </a>
          </div>
        </div>

        {/* Footer column labels are <p>, not headings, so they never break a page's heading outline (10 L1). */}
        <nav aria-label="Services">
          <p className="eyebrow mb-4">Services</p>
          <ul className="-mt-1.5">
            {services.map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className={link}>{s.short}</Link></li>
            ))}
            <li><Link href="/services" className="link-arrow"><ArrowLabel text="All services" /></Link></li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-4">Contact</p>
          <address className="not-italic text-[14.5px] text-ink/80 space-y-2">
            <p className="font-semibold text-ink">{site.name}</p>
            <p>{displayAddress}</p>
            <p><a href={site.phoneHref} className="tel inline-block py-1 font-medium text-ink hover:underline underline-offset-4">{site.phone}</a></p>
            <p><a href={site.emailHref} className="inline-block py-1 text-ink [overflow-wrap:anywhere] hover:underline underline-offset-4">{site.email}</a></p>
            <p>Hours: {site.hours}</p>
          </address>
        </div>

        <div>
          <p className="eyebrow mb-4">Service area</p>
          <p className="text-[14.5px] text-muted">
            Based in {serviceArea.base}. We take projects across {serviceArea.short}.
          </p>
          <Link href="/service-areas" className="link-arrow mt-2 [text-wrap:balance]"><ArrowLabel text="Service areas: every town we serve" /></Link>
        </div>
      </div>

      <nav aria-label="Site" className="container-x mt-14">
        <ul className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-6">
          {footerLinks.map((l) => (
            <li key={l.href}><Link href={l.href} className="inline-block py-1.5 text-[14.5px] text-ink hover:underline underline-offset-4">{l.label}</Link></li>
          ))}
        </ul>
      </nav>

      <div className="container-x">
        <div className="mt-6 pt-6 border-t border-line text-[13px] text-muted flex flex-col sm:flex-row justify-between gap-2">
          <span>© {year} {site.name}. All rights reserved.</span>
          {credentials && <span>{credentials}</span>}
          <span>Website by <a href="https://galaxyinfo.us" target="_blank" rel="nofollow noopener" className="text-ink underline underline-offset-4">galaxyinfo.us</a></span>
        </div>
      </div>
    </footer>
  );
}
