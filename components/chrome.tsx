// Site chrome. Server components (no client JS) except the pieces imported from chrome-client.tsx:
// the header's menu and the scroll-to-form estimate links (audit 07 T08, 01 M1). Footer year is rendered on the server, so it can never mismatch on hydration.
import Link from "next/link";
import Image from "next/image";
import { site, nav, services, serviceArea } from "@/lib/site";
import { credentialLine, hasHic, hasCsl } from "@/lib/credentials";
import { displayAddress } from "@/lib/address";
import { HeaderClient, EstimateJumps } from "./chrome-client";
import { PhoneIcon, MailIcon, FacebookIcon, InstagramIcon, ArrowLabel } from "./chrome-icons";

// Registration/license numbers render only once the owner supplies them — never a placeholder.
const credentials = hasHic || hasCsl ? credentialLine({ insured: false }) : "";

export function TopBar() {
  return (
    // Solid navy at EVERY width (owner's request: phone and email in a blue bar on phones too). White 13px text at 14.6:1.
    // Not sticky: it scrolls away with the page and only the white header stays (html scroll-padding-top clears the header
    // alone). Below md: phone and email in one centered row, tagline hidden; under 360px the row may wrap into two
    // centered lines (each link keeps a 36px tap row). Below sm the side padding, the gap between the two links and the
    // icon gaps are trimmed so phone + email (~325px) still share one line at 360px. From md: contacts left, tagline
    // right, as before.
    <div role="region" aria-label="Contact details" className="bg-navy text-white text-[13px]">
      <div className="container-x max-sm:px-4 flex flex-wrap md:flex-nowrap min-h-9 items-center justify-center md:justify-between gap-x-6">
        <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5">
          <a href={site.phoneHref} className="inline-flex items-center gap-1.5 sm:gap-2 min-h-9 font-medium tel hover:underline underline-offset-4">
            <PhoneIcon className="w-3.5 h-3.5" /><span>{site.phone}</span>
          </a>
          <a href={site.emailHref} className="inline-flex items-center gap-1.5 sm:gap-2 min-h-9 hover:underline underline-offset-4">
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
      {/* Floating call button, bottom-LEFT at every width and always visible (hidden only while the mobile menu or a
          dialog is open, see html.menu-open in globals.css). The bottom-right corner belongs to the LeadConnector chat
          bubble (ChatWidget), so nothing of ours goes there. data-float-call is read by jumpToEstimate (chrome-client). */}
      {/* A landmark (nav "Quick contact"), so axe "region" is satisfied; the 2px paper halo keeps the circle reading as a
          floating layer where it passes over running text (1024-1279, phones). */}
      <nav aria-label="Quick contact" data-float-call className="fixed z-50 left-4 bottom-[max(1rem,env(safe-area-inset-bottom))] lg:left-6 lg:bottom-6">
        <a href={site.phoneHref} aria-label={`Call ${site.phone}`} className="grid place-items-center w-14 h-14 rounded-full bg-navy text-white shadow-pop ring-2 ring-paper hover:bg-navy-deep">
          <PhoneIcon className="w-6 h-6" />
        </a>
      </nav>
      <EstimateJumps />
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
    // Light footer (stone), centered like every page (text-center; flex rows justify-center). pb-28 at every width keeps
    // the legal row clear of the floating call button (bottom-left) and the chat bubble (bottom-right).
    <footer className="bg-stone text-ink text-center border-t border-line pt-[72px] pb-28">
      {/* Two columns until xl: at lg (1024) four columns leave the Contact column ~190px, which breaks the email
          and wraps every service name. From xl each column is ≥230px. */}
      <div className="container-x grid gap-12 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label={`${site.name}, home`} className="inline-block">
            <Image src="/logo-header.png" alt={site.name} width={497} height={349} sizes="92px" className="h-14 w-auto" />
          </Link>
          <p className="mt-5 mx-auto text-sm text-muted max-w-[34ch]">
            Owner-led home remodeling contractor based in Northborough, MA, since {site.founded}. From the foundation to the final finish.
          </p>
          <div className="mt-5 flex justify-center gap-3">
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
          <p className="mx-auto max-w-[34ch] text-[14.5px] text-muted">
            Based in {serviceArea.base}. We take projects across {serviceArea.short}.
          </p>
          {/* The only break allowed is after the colon: "every town we serve" + arrow stays on one line. */}
          <Link href="/service-areas" className="link-arrow mt-2"><span>Service areas:{" "}<span className="whitespace-nowrap"><ArrowLabel text="every town we serve" /></span></span></Link>
        </div>
      </div>

      <nav aria-label="Site" className="container-x mt-14">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 border-t border-line pt-6">
          {footerLinks.map((l) => (
            <li key={l.href}><Link href={l.href} className="inline-block py-1.5 text-[14.5px] text-ink hover:underline underline-offset-4">{l.label}</Link></li>
          ))}
        </ul>
      </nav>

      <div className="container-x">
        <div className="mt-6 pt-6 border-t border-line text-[13px] text-muted flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <span>© {year} {site.name}. All rights reserved.</span>
          {credentials && <span>{credentials}</span>}
          <span>Website by <a href="https://galaxyinfo.us" target="_blank" rel="nofollow noopener" className="text-ink underline underline-offset-4">galaxyinfo.us</a></span>
        </div>
      </div>
    </footer>
  );
}
