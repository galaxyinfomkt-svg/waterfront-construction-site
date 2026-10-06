"use client";
// The only client-side parts of the site chrome (audit 07 T08, 01 M1): the header (menu state) and the
// "Free estimate" links that scroll to the on-page form. Everything else (top bar, footer, floating call
// button) is server-rendered in chrome.tsx.
// Data arrives as small props, so lib/site.ts (towns, FAQs, testimonials) is never bundled for the browser.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PhoneIcon, ChevronDownIcon, MenuIcon, XIcon, ArrowLabel } from "./chrome-icons";
import Typeset from "./Typeset";
import ServiceIcon from "@/app/services/_components/ServiceIcon";

export type HeaderNavItem = { label: string; href: string };
export type HeaderService = { slug: string; name: string };
/** Services split into the two SERVICE_GROUPS columns (lib/services.ts), in D10 order: outside, then inside. */
export type HeaderServiceGroup = { label: string; items: HeaderService[] };

/** The on-page estimate form: the section that wraps <LeadForm /> carries data-estimate-form (and
 *  id="estimate"). A bare #estimate is only a fallback, and never a heading, so an article heading can
 *  never hijack the "Free estimate" links (V5.1). */
function estimateTarget(): HTMLElement | null {
  const marked = document.querySelector<HTMLElement>("[data-estimate-form]");
  if (marked) return marked;
  const el = document.getElementById("estimate");
  return el && !/^H[1-6]$/.test(el.tagName) ? el : null;
}

/** Scrolls so the whole estimate form is on screen. Normally the form top lands under the sticky header
 *  (html scroll-padding-top). When the form is taller than the space left between the header and the bottom
 *  edge or the floating call button ([data-float-call], short viewports such as 390x664 or a 1366x768 laptop's
 *  657px), the form's bottom is lined up just above that button instead, so the submit button is never covered,
 *  while the form's top still stays below the header. */
function jumpToEstimate(el: HTMLElement, animate = true) {
  // Stop any smooth scroll still running (e.g. a second tap mid-animation) so the rects below match scrollY.
  window.scrollTo({ top: window.scrollY, behavior: "instant" });
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const float = document.querySelector<HTMLElement>("[data-float-call]");
  const floatTop = float && getComputedStyle(float).display !== "none" ? float.getBoundingClientRect().top : window.innerHeight;
  const bottom = Math.min(window.innerHeight, floatTop) - 8;
  const card = el.getBoundingClientRect();
  const form = (el.querySelector("iframe") ?? el).getBoundingClientRect();
  let delta = card.top - pad;
  if (form.bottom - delta > bottom) delta = Math.min(form.bottom - bottom, form.top - pad);
  // Smooth only for short trips: a deep CTA (e.g. 11,000px down on a phone) lands instantly instead of a long blur.
  const smooth = animate && Math.abs(delta) < 2.5 * window.innerHeight && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: window.scrollY + delta, behavior: smooth ? "smooth" : "instant" });
  const hash = `#${el.id || "estimate"}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
}

const bottomOf = (el: HTMLElement | null) => (el ? Math.round(el.getBoundingClientRect().bottom) : 0);

const isCurrent = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

export function HeaderClient({ nav, groups, phone, phoneHref, brand }: {
  nav: HeaderNavItem[]; groups: HeaderServiceGroup[]; phone: string; phoneHref: string; brand: string;
}) {
  const services = groups.flatMap((g) => g.items);
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const svcRef = useRef<HTMLDivElement>(null);
  const svcLinkRef = useRef<HTMLAnchorElement>(null);
  // Services dropdown dismissed with Escape (WCAG 2.2 SC 1.4.13, V5.7). It stays closed until the pointer
  // leaves the group or focus moves out of it; then hover / focus opens it again as usual.
  const [svcDismissed, setSvcDismissed] = useState(false);
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const g = svcRef.current;
      if (!g) return;
      const focused = g.contains(document.activeElement);
      if (!focused && !g.matches(":hover")) return;
      setSvcDismissed(true);
      if (focused) svcLinkRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // While the mobile menu is open: Escape closes it, the page behind does not scroll, and the
  // floating call button is hidden so it cannot cover the menu's own items (audit 10 UX-M1).
  // The panel is fixed right under the header's bottom edge (menuTop), and that edge moves: at the top of the page the
  // navy top bar (TopBar, every width, not sticky) sits above the header, so the panel starts at 36 + 72px; once the
  // bar has scrolled away the sticky header is at 0 and the panel starts at 72px. menuTop is measured on open and
  // follows the header if the page still moves underneath (iOS rubber-banding, rotation, resize).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
    };
    const onMove = () => setMenuTop(bottomOf(headerRef.current));
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    document.documentElement.classList.add("menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  const toggle = () => {
    setMenuTop(bottomOf(headerRef.current));
    setOpen((v) => !v);
  };
  const close = () => setOpen(false);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="container-x flex h-[72px] md:h-20 items-center justify-between gap-5">
        <Link href="/" className="flex items-center shrink-0" aria-label={`${brand}, home`}>
          {/* Eager but low priority: React does not preload it, so it never competes with the page's hero image (07 T07). */}
          <Image src="/logo-header.png" alt={brand} width={497} height={349} sizes="96px" loading="eager" fetchPriority="low" className="h-12 lg:h-14 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden lg:flex items-center gap-5 xl:gap-7 text-[14px] xl:text-[14.5px]">
          {nav.map((n) =>
            n.href === "/services" ? (
              // Opens on hover AND on keyboard focus (focus-within), so the service links are reachable by Tab (01 M4);
              // Escape closes it and returns focus to "Services" (V5.7).
              <div key={n.href} ref={svcRef} className="relative group/svc"
                onMouseLeave={() => setSvcDismissed(false)}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSvcDismissed(false); }}>
                <Link ref={svcLinkRef} href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined} className="navlink -mx-1.5 px-1.5 rounded-control">
                  {n.label}<ChevronDownIcon className={`w-3 h-3 text-muted transition-transform duration-150 ${svcDismissed ? "" : "group-hover/svc:rotate-180 group-focus-within/svc:rotate-180"}`} />
                </Link>
                <div className={`absolute -left-5 top-full pt-4 opacity-0 invisible transition-[opacity,visibility] duration-150 ${svcDismissed ? "" : "group-hover/svc:opacity-100 group-hover/svc:visible group-focus-within/svc:opacity-100 group-focus-within/svc:visible"}`}>
                  {/* 2 x 5: one column per group (eyebrow + 5 links). Each column is its own list, so Tab runs down the
                      outside column, then the inside one. "All services" spans both columns below. */}
                  <div className="w-[36rem] bg-white border border-line rounded-panel shadow-pop p-2">
                    <div className="grid grid-cols-2 gap-x-2">
                      {groups.map((g) => (
                        <div key={g.label}>
                          <p aria-hidden="true" className="eyebrow px-3 pt-2 pb-1 text-start">{g.label}</p>
                          <ul>
                            {g.items.map((s) => (
                              <li key={s.slug}>
                                <Link href={`/services/${s.slug}`} aria-current={isCurrent(pathname, `/services/${s.slug}`) ? "page" : undefined}
                                  className="flex items-center gap-3 min-h-11 px-3 rounded-control text-[14.5px] text-start text-ink/80 hover:bg-stone hover:text-navy aria-[current=page]:text-navy">
                                  <ServiceIcon slug={s.slug} className="w-5 h-5 shrink-0 text-muted" /><span><Typeset text={s.name} /></span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-1 border-t border-line"><Link href="/services" className="link-arrow px-3 text-sm"><ArrowLabel text="All services" /></Link></div>
                  </div>
                </div>
              </div>
            ) : (
              <Link key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined} className="navlink -mx-1.5 px-1.5 rounded-control">{n.label}</Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-5 shrink-0">
          <a href={phoneHref} className="inline-flex items-center gap-2 min-h-11 text-[15px] font-medium text-navy tel hover:underline underline-offset-4">
            <PhoneIcon className="w-4 h-4" />{phone}
          </a>
          <EstimateLink className="btn btn-primary px-5 xl:px-6">Free estimate</EstimateLink>
        </div>

        <button ref={toggleRef} type="button" onClick={toggle} aria-expanded={open} aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"} className="lg:hidden w-12 h-12 -mr-3 grid place-items-center text-navy">
          {open ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        // Fixed below the header and scrollable on its own, so every item is reachable even on
        // 360x640 phones (the old menu was taller than the screen and could not scroll).
        <nav id="mobile-menu" aria-label="Main" style={{ top: menuTop }}
          className="lg:hidden fixed inset-x-0 bottom-0 z-[60] overflow-y-auto overscroll-contain bg-white">
          <div className="container-x pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] flex flex-col">
            {nav.map((n) =>
              n.href === "/services" ? (
                <div key={n.href} className="border-b border-line">
                  <Link href={n.href} onClick={close} aria-current={isCurrent(pathname, n.href) ? "page" : undefined} className="flex items-center min-h-12 text-[17px] font-medium text-ink aria-[current=page]:text-navy aria-[current=page]:underline aria-[current=page]:decoration-1 aria-[current=page]:underline-offset-[.55em]">Services</Link>
                  {/* One column on phones; from sm two columns filled top to bottom (outside, then inside), so the
                      groups stay together and the Tab order runs column by column. */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-5 sm:grid-flow-col sm:gap-x-8 pb-3">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/services/${s.slug}`} onClick={close} aria-current={isCurrent(pathname, `/services/${s.slug}`) ? "page" : undefined}
                          className="flex items-center gap-3 min-h-11 pl-1 text-[15px] text-ink/80 aria-[current=page]:text-navy aria-[current=page]:underline aria-[current=page]:decoration-1 aria-[current=page]:underline-offset-[.55em]">
                          <ServiceIcon slug={s.slug} className="w-5 h-5 shrink-0 text-muted" />{s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link key={n.href} href={n.href} onClick={close} aria-current={isCurrent(pathname, n.href) ? "page" : undefined}
                  className="flex items-center min-h-12 text-[17px] font-medium text-ink border-b border-line aria-[current=page]:text-navy aria-[current=page]:underline aria-[current=page]:decoration-1 aria-[current=page]:underline-offset-[.55em]">{n.label}</Link>
              )
            )}
            <a href={phoneHref} className="btn btn-secondary w-full mt-6"><PhoneIcon /><span>Call <span className="tel">{phone}</span></span></a>
            <EstimateLink onDone={close} className="btn btn-primary w-full mt-3">Get a free estimate</EstimateLink>
          </div>
        </nav>
      )}
    </header>
  );
}

/** "Free estimate" link: scrolls to the estimate form when this page has one ([data-estimate-form]),
 *  otherwise opens /contact#estimate. Modifier-clicks still open a new tab (onNavigate). Audit 10 UX-H2, V5.1. */
export function EstimateLink({ className = "", children, onDone }: { className?: string; children: ReactNode; onDone?: () => void }) {
  return (
    <Link
      href="/contact#estimate"
      className={className}
      onNavigate={(e) => {
        onDone?.();
        const el = estimateTarget();
        if (!el) return;
        e.preventDefault();
        jumpToEstimate(el);
      }}
    >
      {children}
    </Link>
  );
}

/** Plain in-page "#estimate" links (hero and body CTAs on home, hubs and town pages) get the same
 *  fit-the-whole-form scroll as EstimateLink. Arriving with #estimate in the URL (e.g. /contact#estimate
 *  from a page without a form) re-aligns once the page has laid out. Modifier-clicks are left alone. */
export function EstimateJumps() {
  const pathname = usePathname();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!(e.target instanceof Element) || !e.target.closest('a[href="#estimate"]')) return;
      const el = estimateTarget();
      if (!el) return;
      e.preventDefault();
      jumpToEstimate(el);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    if (location.hash !== "#estimate") return;
    const t = window.setTimeout(() => {
      const el = estimateTarget();
      if (el) jumpToEstimate(el, false);
    }, 80);
    return () => window.clearTimeout(t);
  }, [pathname]);
  return null;
}
